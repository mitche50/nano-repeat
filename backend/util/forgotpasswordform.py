from fastapi import FastAPI
from pydantic import BaseModel


class ForgotPasswordForm(BaseModel):
    email: str

    class Config:
        schema_extra = {
            "example": {
                'email': 'johndoe@gmail.com'
            }
        }