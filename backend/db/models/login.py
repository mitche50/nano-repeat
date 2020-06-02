from datetime import datetime
from tortoise.models import Model
from tortoise import fields
from tortoise.contrib.pydantic import pydantic_model_creator
from db.db_mixin import TimestampMixin
from util.validation import validate_email
import re
import logging



class Login(Model, TimestampMixin):
    """Login information for a specific User ID"""
    id = fields.UUIDField(pk=True)
    user = fields.ForeignKeyField('db.User', related_name="login_user")
    email: str = fields.CharField(max_length=60, unique=True)
    hash_pass: str = fields.CharField(max_length=255, null=True)
    email_confirmed: bool = fields.BooleanField(default=False)
    email_confirmation_sent = fields.DatetimeField(null=True, auto_now_add=True)
    email_confirmed_ts = fields.DatetimeField(null=True)


    class Meta:
        table = 'login'

    
    def __str__(self):
        return self.email


    async def set_email(self, email: str):
        """Update the user's email"""
        update_fields = []
        if not validate_email(email):
            return None
        if self.email != email:
            self.email = email
            update_fields.append('email')
        else:
            return None
        if len(update_fields) > 0:
            await self.save(update_fields=update_fields)
        return self
    

    async def set_confirmed(self):
        """Update the user's login to confirmed"""
        update_fields = []
        if not self.email_confirmed:
            self.email_confirmed = True
            self.email_confirmed_ts = datetime.now()
            update_fields.append('email_confirmed')
            update_fields.append('email_confirmed_ts')
        if len(update_fields) > 0:
            await self.save(update_fields=update_fields)
        return self


    async def set_password(self, hash_pass):
        """Hash password and save the update"""
        try:
            update_fields = ['hash_pass']
            self.hash_pass = hash_pass
            await self.save(update_fields=update_fields)
        except Exception as e:
            logger = logging.getLogger("nr_log")
            logger.info("Error setting new password: ", e)
            return False
        return True


Login_Pydantic = pydantic_model_creator(Login, name="Login")