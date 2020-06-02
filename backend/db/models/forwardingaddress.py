from tortoise.models import Model
from tortoise import fields
from tortoise.contrib.pydantic import pydantic_model_creator
from db.db_mixin import TimestampMixin

class ForwardingAddress(Model, TimestampMixin):
    """User's associated forwarding address"""
    user = fields.ForeignKeyField('db.User', related_name="forwarding_user", unique=True)
    address: str = fields.CharField(max_length=65)

    class Meta:
        table = 'forwardingaddress'

    def __str__(self):
        return (f"Forwarding address {self.address}")


ForwardingAddress_Pydantic = pydantic_model_creator(ForwardingAddress, name="ForwardingAddress")