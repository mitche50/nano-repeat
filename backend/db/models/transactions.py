from tortoise.models import Model
from tortoise import fields
from tortoise.contrib.pydantic import pydantic_model_creator

class Transactions(Model):
    """
    Identified transactions from registered accounts
    """
    sender: str = fields.CharField(max_length=65)
    receiver: str = fields.CharField(max_length=65)
    amount: str = fields.CharField(max_length=1000)
    tx_hash: str = fields.CharField(max_length=64, unique=True)
    created_at = fields.DatetimeField(null=True, auto_now_add=True)

    class Meta:
        table = 'transactions'

    def __str__(self):
        return (f"From: {self.sender}\n"
                f"To: {self.receiver}\n"
                f"Amount: {self.amount}\n"
                f"hash: {self.tx_hash}\n"
                f"timestamp: {self.created_at}")


Transactions_Pydantic = pydantic_model_creator(Transactions, name="Transactions")