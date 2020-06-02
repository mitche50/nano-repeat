from tortoise import fields
from tortoise.models import Model
from tortoise.contrib.pydantic import pydantic_model_creator
from db.db_mixin import TimestampMixin
from db.models.login import Login
from db.models.subscriptions import Subscriptions
from db.models.forwardingaddress import ForwardingAddress

import os
import re
import sys
from datetime import datetime, timedelta

PACKAGE_PARENT = '..'
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

from util.validation import validate_checksum_xrb
from util.security import hash_password
from nano.nano_utils import create_account


class User(Model, TimestampMixin):
    """User specific information"""
    id = fields.UUIDField(pk=True)
    first_name: str = fields.CharField(max_length=50)
    last_name: str = fields.CharField(max_length=50)
    phone_number: str = fields.CharField(max_length=50, null=True)

    class Meta:
        table = 'user'


    def __str__(self):
        return f"{self.first_name} {self.last_name}"


    async def create_login(self, email: str, password: str, email_confirmed: bool = False):
        """Creates a new login for the associated user"""
        check_email = await Login.filter(email=email).first()
        if check_email is None:
            hash_pass = hash_password(password)
            login = Login(user_id=self.id, email=email, hash_pass=hash_pass, email_confirmed=email_confirmed)
            await login.save()
            return login
        else:
            return False


    async def get_login(self):
        """Returns the login information for the associated user, returns None if no login info is stored"""
        return await Login.filter(login_user_id=self.id).first()


    async def create_subscription(self, subscriber_id: str, subscriber_email: str, cost: str, currency: str, period: int):
        """Create a new subscription for the associated merchant"""
        payment_address = await create_account()
        expiration_date = datetime.now() + timedelta(days=1)
        subscription = Subscriptions(
            merchant_id=self.id, 
            subscriber_id=subscriber_id, 
            subscriber_email=subscriber_email,
            payment_address=payment_address,
            cost=cost,
            currency=currency,
            period=period,
            expiration_date=expiration_date
            )
        await subscription.save()
        return {
            'subscription_id': subscription.subscription_id,
            'payment_address': payment_address,
            'expiration_date': expiration_date
        }


    async def get_subscriptions(self):
        """Returns the subscription information for the associated user, returns None if no subscriptions exist"""
        return await Subscriptions.filter(subscription_user_id = self.id).all()


    async def get_forwarding_address(self):
        """Returns the address the user has set to forward payments to, returns None if no address is set"""
        return await ForwardingAddress.filter(forwarding_user_id = self.id).first()


    async def set_forwarding_address(self, new_address: str = None):
        """Set or update the forwarding address for a user"""
        if new_address is not None and validate_checksum_xrb(new_address):
            old_address = await ForwardingAddress.filter(user_id = self.id).first()
            if old_address is None:
                forwarding_address = ForwardingAddress(
                    user_id=self.id,
                    address=new_address
                )
                await forwarding_address.save()
                return forwarding_address
            elif old_address.address != new_address:
                old_address.address = new_address
                await old_address.save(update_fields=['address'])
            else:
                return None
            return old_address
        else:
            return None


    async def set_name(self, first_name: str, last_name: str):
        """Update the user's first name and last name"""
        update_fields = []
        if self.first_name != first_name:
            self.first_name = first_name.strip().title()
            update_fields.append('first_name')
        if self.last_name != last_name:
            self.last_name = last_name.strip().title()
            update_fields.append('last_name')
        if len(update_fields) > 0:
            await self.save(update_fields=update_fields)
        else:
            return None
        return self


    async def set_phone_number(self, phone_number: str):
        """Update a user's phone number"""
        update_fields = []
        regex = '(?:\+?(\d{1})?-?\(?(\d{3})\)?[\s-\.]?)?(\d{3})[\s-\.]?(\d{4})[\s-\.]?'
        if re.search(regex, phone_number):
            self.phone_number = phone_number
            update_fields.append('phone_number')
        else:
            return None
        if len(update_fields) > 0:
            await self.save(update_fields=update_fields)
        return self


User_Pydantic = pydantic_model_creator(User, name="User")
