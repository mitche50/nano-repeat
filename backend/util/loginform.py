from fastapi import FastAPI
from pydantic import BaseModel


class LoginForm(BaseModel):
    email: str = None
    username: str = None
    password: str = None

    class Config:
        schema_extra = {
            "example": {
                'email': 'johndoe@gmail.com',
                'password': 'averysecurepassword'
            }
        }