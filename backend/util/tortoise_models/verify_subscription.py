from pydantic import BaseModel

class VerifySubscription(BaseModel):
    subscription_id: str