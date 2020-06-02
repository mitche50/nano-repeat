from fastapi import FastAPI
from pydantic import BaseModel


class ConfirmTokenModel(BaseModel):
    token: str

    class Config:
        schema_extra = {
            "example": {
                'token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Im1pdGNoZTUwQGdtYWlsLmNvbSIsImV4cCI6MTU4ODc5NjQ0Nn0.Gkg8WJhGChnSFaElWZOBysyX3cTbnfXKChWFujAdE9o'
            }
        }