from decimal import Decimal
from datetime import datetime, timedelta

import re

from tortoise.models import Model
from tortoise import fields
from tortoise.contrib.pydantic import pydantic_model_creator
from db.db_mixin import TimestampMixin

class Subscriptions(Model, TimestampMixin):
    """User's associated subscriptions"""
    subscription_id: str = fields.UUIDField(pk=True)
    merchant: fields.ForeignKeyRelation = fields.ForeignKeyField('db.User', related_name="merchant")
    subscriber_id: str = fields.CharField(max_length=100)
    payment_address: str = fields.CharField(max_length=65)
    cost: str = fields.CharField(max_length=200)
    currency: str = fields.CharField(max_length=100)
    period: int = fields.IntField()
    expiration_date: datetime = fields.DatetimeField()


    class Meta:
        table = 'subscriptions'


    def __str__(self):
        return (f"Subscription for {self.cost} {self.currency} is due {self.expiration_date}")


    async def set_email(self, email: str):
        """Update the customer's email"""
        update_fields = []
        regex = '^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$'
        if not re.search(regex, email):
            return None
        if self.subscriber_email != email:
            self.subscriber_email = email
            update_fields.append('subscriber_email')
        else:
            return None
        if len(update_fields) > 0:
            await self.save(update_fields=update_fields)
        return self

    async def set_cost(self, cost: str):
        """Update the cost associated with the subscription"""
        update_fields = []
        try:
            float(cost)
        except ValueError:
            return None
        if self.cost != cost:
            self.cost = cost
            update_fields.append('cost')
        else:
            return None
        if len(update_fields) > 0:
            await self.save(update_fields=update_fields)

        return self
    

    async def set_period(self, period: int):
        """Update the period associated with the subscription"""
        update_fields = []
        if self.period != period:
            self.period = period
            update_fields.append('period')
        else:
            return None
        if len(update_fields) > 0:
            await self.save(update_fields=update_fields)
        
        return self
    

    async def mark_paid(self):
        """Increase expiration date due to payment"""
        update_fields = ['expiration_date']
        if datetime.now() >= self.expiration_date:
            new_expiration = datetime.now() + timedelta(days=self.period)
        else:
            new_expiration = self.expiration_date + timedelta(days=self.period)
        
        self.expiration_date = new_expiration
        try:
            await self.save(update_fields=update_fields)
        except:
            return None

        return True
        


    async def set_subscriber_id(self, subscriber_id: str):
        """Update the subscriber ID associated with the subscription"""
        update_fields = []
        if self.subscriber_id != subscriber_id:
            self.subscriber_id = subscriber_id
            update_fields.append('subscriber_id')
        else:
            return None
        if len(update_fields) > 0:
            await self.save(update_fields=update_fields)
        
        return self


Subscriptions_Pydantic = pydantic_model_creator(Subscriptions, name="Subscriptions")
SubscriptionsIn_Pydantic = pydantic_model_creator(
    Subscriptions, 
    name="SubscriptionsIn", 
    exclude=['subscription_id', 'merchant', 'payment_address', 'expiration_date', 'created_at', 'modified_at']
)
SubscriptionId_Pydantic = pydantic_model_creator(
    Subscriptions,
    name="SubscriptionsDelete",
    exclude=['merchant', 'subscriber_id', 'cost', 'currency', 'period', 'payment_address', 'expiration_date', 'created_at', 'modified_at']
)