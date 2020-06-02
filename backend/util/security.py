from datetime import datetime, timedelta

import hashlib
import os
import sys
import binascii
import logging

import jwt
from jwt import PyJWTError
from itsdangerous import URLSafeTimedSerializer
from dotenv import load_dotenv
from fastapi import HTTPException, status, Depends
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from db.models.login import Login
from util.tortoise_models.token import Token, TokenData

load_dotenv()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

SECRET_KEY = os.getenv("NR_JWT_SECRET")
ALGORITHM = os.getenv("NR_JWT_ALGO")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("NR_JWT_TOKEN_EXPIRATION_MINUTES"))




def create_access_token(data, override_expire: int = None):
    """Generate a JWT token for user validation"""
    to_encode = data.copy()
    # Removed to make tokens client secret for API usage
    # access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # elif access_token_expires:
    #     expire = datetime.utcnow() + access_token_expires
    # else:
    #     expire = datetime.utcnow() + timedelta(minutes=15)

    if override_expire:
        expire = datetime.utcnow() + timedelta(minutes=override_expire)
        to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_access_token(token: str = Depends(oauth2_scheme)):
    """Validates the provided access token is valid"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("email")
        if username is None:
            raise JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"error":"The provided token is not valid."},
                headers={"WWW-Authenticate": "Bearer"},
            )
        token_data = TokenData(username=username)
    except PyJWTError as e:
        return None
    return token_data.username


def hash_password(password):
    """Hash a password for storing."""
    salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')
    pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), 
                                salt, 100000)
    pwdhash = binascii.hexlify(pwdhash)
    return (salt + pwdhash).decode('ascii')
 

def verify_password(stored_password, provided_password):
    """Verify a stored password against one provided by user"""
    salt = stored_password[:64]
    stored_password = stored_password[64:]
    pwdhash = hashlib.pbkdf2_hmac('sha512', 
                                  provided_password.encode('utf-8'), 
                                  salt.encode('ascii'), 
                                  100000)
    pwdhash = binascii.hexlify(pwdhash).decode('ascii')
    return pwdhash == stored_password
