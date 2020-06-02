from fastapi import FastAPI
from pydantic import BaseModel


class SignUpForm(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str = None
    forwarding_address: str = None

    class Config:
        schema_extra = {
            "example": {
                'first_name': 'John',
                'last_name': 'Doe',
                'email': 'johndoe@gmail.com',
                'password': 'averysecurepassword',
                'forwarding_address': 'nano_111pwbptkp6rj6ki3ybmjg4ppg64o9s676frokpydkwrntrnqqfqf84w5kon'
            }
        }