from pydantic import BaseModel

class UpdateSubscription(BaseModel):
    subscription_id: str
    subscriber_id: str = None
    cost: str = None
    period: int = None