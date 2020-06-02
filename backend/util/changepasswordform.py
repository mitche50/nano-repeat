from fastapi import FastAPI
from pydantic import BaseModel


class ChangePasswordForm(BaseModel):
    token: str
    new_password: str


    class Config:
        schema_extra = {
            "example": {
                'token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Im1pdGNoZTUwQGdtYWlsLmNvbSIsImV4cCI6MTU4ODg4MDI5NX0.StT6L3ilq5iU8jSQ-P-eU2S73mJ5d_HwyiIVhE-1hxI',
                'password': 'asupersecurepassword'
            }
        }