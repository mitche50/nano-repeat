import os
import json
import logging
import asyncio

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status, Body, Response
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from logging.handlers import TimedRotatingFileHandler
from typing import List
from db.db_config import DBConfig
from db.models.user import User_Pydantic, User
from db.models.login import Login_Pydantic, Login
from db.models.forwardingaddress import ForwardingAddress
from db.models.transactions import Transactions_Pydantic, Transactions
from db.models.subscriptions import Subscriptions_Pydantic, Subscriptions, SubscriptionId_Pydantic, SubscriptionsIn_Pydantic
from util.signupform import SignUpForm
from util.loginform import LoginForm
from util.forgotpasswordform import ForgotPasswordForm
from util.changepasswordform import ChangePasswordForm
from util.confirmtokenmodel import ConfirmTokenModel
from google.oauth2 import id_token
from google.auth.transport import requests
from oauth2client import client
from util.tortoise_models.token import Token
from util.tortoise_models.update_subscription import UpdateSubscription
from util.tortoise_models.verify_subscription import VerifySubscription
from util.security import hash_password, verify_password, verify_access_token, create_access_token
from util.nremail import send_confirm_email_template, send_forgot_password_template
from nano.nano_utils import create_account
from nano.payment_monitor import Payment_Monitor
from util.validation import validate_email
from tortoise import run_async, Tortoise
from datetime import datetime, timedelta


# Load the .env file into environment variables
load_dotenv()
# Declare the app
app = FastAPI()

# Set Google authentication values
NR_SWAP_TOKEN_ENDPOINT = os.getenv("NR_SWAP_TOKEN_ENDPOINT")
CLIENT_ID = os.getenv("NR_GOOGLE_CLIENT_ID")

# Set up logger
logger = logging.getLogger("nr_log")
logger.setLevel(logging.INFO)
handler = TimedRotatingFileHandler('{}/logs/{:%Y-%m-%d}-nr.log'.format(os.getcwd(), datetime.now()),
                                   when="d",
                                   interval=1,
                                   backupCount=5)
logger.addHandler(handler)

# Payment Monitor
pm = Payment_Monitor()

# CORS management
ENV = os.getenv("ENV")
if ENV == "development":
    origins = ["*"]
    app.add_middleware(
        CORSMiddleware,
        # allow_origin_regex=origins,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    origins = "https:\/\/.*\.nanorepeat\.com.*"
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=origins,
        # allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.on_event("startup")
async def startup():
    """Run startup configurations"""
    logger.info("Subscribing")
    await DBConfig().init_package_db()
    try:
        asyncio.ensure_future(pm.subscribe_all())
        asyncio.ensure_future(pm.queue_consumer())
    except Exception as e:
        logger.info(e)
    logger.info("subscribed to accounts")


async def get_current_login(email: str):
    """Return the current user's login information"""
    email = email.lower()
    current_login = await Login.filter(email=email).first()
    if current_login is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error":"Incorrect username or password"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    login_return = {
        "user_id": current_login.user_id,
        "email": current_login.email,
        "email_confirmed": current_login.email_confirmed
    }
    return current_login


@app.on_event("shutdown")
async def shutdown():
    """Handle shutdown requirements"""
    await Tortoise.close_connections()


@app.get("/up")
async def upcheck():
    return JSONResponse(status_code=status.HTTP_200_OK, content=True)


@app.post(f"{NR_SWAP_TOKEN_ENDPOINT}",  include_in_schema=False)
async def google_swap_token(request: Request = None):
    """Verify the google token provided and then swap with a Nano Repeat JWT"""
    if not request.headers.get("X-Forwarded-For"):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"error":"Incorrect headers"})
    try:
        body_bytes = await request.body()
        auth_code = jsonable_encoder(body_bytes)
    except:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"error":"Incorrectly formed body"})

    try:
        idinfo = id_token.verify_oauth2_token(auth_code, requests.Request(), CLIENT_ID)

        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            logger.info("Google did not issue the cert")
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"error":"Incorrect issuer of certificate."})

        if idinfo['email'] and idinfo['email_verified']:
            email = idinfo.get('email')
        else:
            logger.info("email not present or verified")
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"error":"Unable to validate social login"})

    except:
        logger.info("Google login is not valid")
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"error":"Unable to validate social login"})

    login = await Login.filter(email=email.lower()).first()
    if not login:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error":"Google ID not associated with an account, please sign up"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"email": login.email}
    )
    return {"status_code": status.HTTP_200_OK, "access_token": access_token, "token_type": "bearer"}


@app.post("/signup")
async def signup(body: SignUpForm):
    """If the user does not already exist, create a new user"""
    if not validate_email(body.email):
        return JSONResponse(
            content={"error":"The email " + body.email + " must be a valid email address."},
            status_code=status.HTTP_400_BAD_REQUEST
        )
    login = await Login.filter(email=body.email.lower()).first()
    if login:
        if login.email_confirmed:
            return JSONResponse(
                content={"error":"The provided email is already registered."}, 
                status_code=status.HTTP_400_BAD_REQUEST
            )
        else:
            print("reconfirming because user tried to sign up with an unconfirmed email more than once.")
            confirm_email_token = create_access_token(data={'email': body.email})
            await send_confirm_email_template(body.first_name, confirm_email_token, body.email)
            return JSONResponse(
                status_code = status.HTTP_400_BAD_REQUEST, 
                content={"error": "login exists but is unregistered - check email for registration"}
            )
    print("past the check if the login was already created")
    new_user = await User(first_name=body.first_name, last_name=body.last_name)
    await new_user.save()
    if body.password == "":
        print("creating a google login account")
        new_login = await new_user.create_login(email=body.email.lower(), password=body.password, email_confirmed=True)
    else:
        try:
            new_login = await new_user.create_login(email=body.email.lower(), password=body.password)
            confirm_email_token = create_access_token(data={'email': body.email}, override_expire=10)
            await send_confirm_email_template(body.first_name, confirm_email_token, body.email)
        except Exception:
            await new_login.delete()
            await new_user.delete()
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error": "Error creating the confirmation email.  Please retry."}
            )

    if not new_login or not new_user:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":"Error creating login.  Please retry."}
        )
    
    if body.forwarding_address is not None:
        await new_user.set_forwarding_address(body.forwarding_address)
        
    
    access_token = create_access_token(
            {"email": body.email}
        )
    
    return JSONResponse(
        status_code = status.HTTP_200_OK, 
        content={"user_id": str(new_user.id), "token": str(access_token)}
    )


@app.post("/confirm",  include_in_schema=False)
async def confirm_email(body: ConfirmTokenModel,  include_in_schema=False):
    """Mark a user's email as confirmed"""
    email = verify_access_token(body.token)
    if not email:
        logger.info("Error getting email")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error":"Token has expired, please sign up again."},
        )
    login = await Login.filter(email=email.lower()).first()
    if not login:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error":"Incorrect username or password"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    await login.set_confirmed()
    
    return status.HTTP_200_OK


@app.post("/forgotpassword",  include_in_schema=False)
async def forgotpassword(body: ForgotPasswordForm = None):
    """Generate a forgot password token and email it to the provided email to trigger resetting password"""
    if body is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error":"Incorrect username or password"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not validate_email(body.email):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":"Incorrectly formatted email."},
        )
    login = await get_current_login(body.email)
    if type(login) == JSONResponse:
        return login
    user = await User.filter(id=login.user_id).first()
    data = {"email": login.email}
    
    email_token = create_access_token(data=data, override_expire=10)
    await send_forgot_password_template(user.first_name, email_token, body.email)
    return status.HTTP_200_OK


@app.post('/changepassword',  include_in_schema=False)
async def change_password(body: ChangePasswordForm = None):
    """Change the password for the email associated with the provided token"""
    if body is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error":"Incorrectly formatted body"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    login = await verify_token(body.token)
    if login:
        try:
            hash_pass = hash_password(body.new_password)

            await login.set_password(hash_pass)
            return status.HTTP_200_OK
        except Exception as e:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error":f"Error setting password: {e}"}
            )


@app.post("/token",  include_in_schema=False)
async def login(form_data: LoginForm = None):
    """Validate provided password matches the user's hashed password"""
    if form_data is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error":"Incorrect username or password"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    login = await Login.filter(email=form_data.email.lower()).first()

    if not login:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error":"Incorrect username or password"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not login.email_confirmed:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error":"Please check email for confirmation before logging in."},
        )
    if form_data.password is "":
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error":"Incorrect username or password"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_password(login.hash_pass, form_data.password):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error":"Incorrect username or password"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        access_token = create_access_token(
            {"email": login.email}
        )
    except Exception as e:
        logger.error(e)

    return {"status_code": status.HTTP_200_OK, "access_token": access_token, "token_type": "bearer"}


async def verify_token(access_token: str):
    """Checks to see if the provided access token is valid.  If it is, returns the token holder's username"""
    username = verify_access_token(access_token)
    if username:
        return await get_current_login(username)
    return None


@app.get('/me')
async def read_user(token: str):
    """Returns the user's information"""
    login = await verify_token(token)
    if type(login) is JSONResponse:
        return login
    user = await User.filter(id=login.user_id).first()
    if user is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={'error':'User not found.'}
        )
    address = await ForwardingAddress.filter(user_id=login.user_id).first()

    if address is None:
        forward_address = None
    else:
        forward_address = address.address

    data = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "user_id": str(user.id),
        "email": login.email,
        "forward_address": forward_address
    }
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=data
    )


@app.get('/transactions/me')
async def read_transactions(token: str):
    """Return a list of transactions sent to monitored accounts"""
    login = await verify_token(token)
    if type(login) is JSONResponse:
        return login
    subscription_list = await Subscriptions.filter(merchant_id=login.user_id).all()
    tx_list = []
    for subscription in subscription_list:
        tx_obj = await Transactions.filter(receiver=subscription.payment_address).all()
        for tx in tx_obj:
            tx_list.append({
                "sender":tx.sender,
                "receiver": tx.receiver,
                "amount": tx.amount,
                "tx_hash": tx.tx_hash,
                "time_sent": str(tx.created_at)
            })
    
    if len(tx_list) == 0:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":f"There were no transactions found for your account {login.user_id}"}
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={'transactions': tx_list}
    )


def populate_subscription_return(subscription_list):
    """Serailize the subscription return"""
    subscription_return = []
    for subscription in subscription_list:
        subscription_return.append(
            {
                "id": str(subscription.subscription_id),
                "subscriber_id": str(subscription.subscriber_id),
                "payment_address": subscription.payment_address,
                "cost": subscription.cost,
                "currency": subscription.currency,
                "period": subscription.period,
                "created_date": str(subscription.created_at),
                "expiration_date": str(subscription.expiration_date)
            }
        )
    return subscription_return


@app.get('/subscriptions/all')
async def read_subscriptions(token: str):
    """Return a list of subscriptions associated with the logged in user"""
    login = await verify_token(token)
    if type(login) is JSONResponse:
        return login

    subscription_list = await Subscriptions.filter(merchant_id=login.user_id).all().order_by('expiration_date')

    if subscription_list is None:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":f"No subscriptions found for your account {login.user_id}"}
        )
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"subscriptions": populate_subscription_return(subscription_list)}
    )


@app.get('/subscriptions/address')
async def read_subscriptions(token: str, payment_address: str):
    """Return the subscription associated with the payment address provided"""
    login = await verify_token(token)
    if type(login) is JSONResponse:
        return login

    subscription_list = await Subscriptions.filter(merchant_id=login.user_id, payment_address=payment_address).first()

    if subscription_list is None:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":f"No subscriptions found for your account {login.user_id}"}
        )

    subscription = {
        "id": str(subscription_list.subscription_id),
        "subscriber_id": str(subscription_list.subscriber_id),
        "payment_address": subscription_list.payment_address,
        "cost": subscription_list.cost,
        "currency": subscription_list.currency,
        "period": subscription_list.period,
        "created_date": str(subscription_list.created_at),
        "expiration_date": str(subscription_list.expiration_date)
    }
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"subscriptions": subscription}
    )


@app.get('/subscriptions/customer')
async def read_customer_subscription(token: str, subscriber_id: str):
    """Returns a list of subscriptions for a provided customer ID"""
    login = await verify_token(token)
    if type(login) is JSONResponse:
        return login

    subscription_list = await Subscriptions.filter(subscriber_id=subscriber_id, merchant_id=login.user_id).all()

    if subscription_list is None:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":f"No subscriptions found for your account {login.user_id}"}
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"subscriptions": populate_subscription_return(subscription_list)}
    )


@app.get('/subscriptions/id')
async def read_single_subscription(token:str, subscription_id: str):
    """Returns an individual subscription by the provided subscription ID"""
    login = await verify_token(token)
    if type(login) is JSONResponse:
        return login

    subscription_list = await Subscriptions.filter(merchant_id=login.user_id, subscription_id=subscription_id).all()

    if subscription_list is None:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":f"No subscriptions found for subscription ID {subscription_id}"}
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"subscriptions": populate_subscription_return(subscription_list)}
    )


@app.post('/create_subscription')
async def create_subscription(token: str, subscription_in: SubscriptionsIn_Pydantic):
    """Create a new subscription for a customer of the signed in user"""
    login = await verify_token(token)
    if type(login) is JSONResponse:
        return login

    # Check if the user has confirmed their email and has a forwarding address
    if not login.email_confirmed:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":"You must confirm your email first."}
        )
    address = await ForwardingAddress.filter(user_id=login.user_id).first()
    if not address:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":"You must have a forwarding address set up before creating a subscription.  Visit your account page to add one."}
        )
        
    # Validate inputs are correct
    try:
        float(subscription_in.cost)
    except ValueError:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":"Provided cost of the subscription must be a number."}
        )

    new_subscription = Subscriptions(
        merchant_id = login.user_id,
        subscriber_id = subscription_in.subscriber_id,
        payment_address = await create_account(),
        cost = subscription_in.cost,
        # MVP is Nano only.
        currency = "NANO",
        # currency = subscription_in.currency,
        period = subscription_in.period,
        expiration_date = datetime.now()
    )
    await new_subscription.save()
    await pm.refresh_sub()
    print("refreshed the subscriptions")

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "subscriber_id": str(new_subscription.subscriber_id),
            "payment_address": new_subscription.payment_address,
            "cost": new_subscription.cost,
            "currency": new_subscription.currency,
            "period": new_subscription.period,
            "expiration_date": str(new_subscription.expiration_date),
            "subscription_id": str(new_subscription.subscription_id),
            "created_at": str(new_subscription.created_at)
        }
    )


@app.delete('/delete_subscription')
async def delete_subscription(token: str, delete_subscription: SubscriptionId_Pydantic):
    """Delete the provided subscription from use"""
    login = await verify_token(token)
    if type(login) is JSONResponse:
        return login

    subscription = await Subscriptions.filter(
        subscription_id=delete_subscription.subscription_id
    ).first()

    if subscription is None:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":"The provided subscription does not exist."}
        )

    try:
        await subscription.delete()
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":f"Error removing the subscription: {e}"}
        )
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"deleted": True}
    )


@app.put('/update_subscription')
async def update_subscription(token: str, update_subscription: UpdateSubscription):
    """Update information on the provided subscription"""
    login = await verify_token(token)
    if type(login) is JSONResponse:
        return login

    subscription = await Subscriptions.filter(
        merchant_id=login.user_id, 
        subscription_id=update_subscription.subscription_id
    ).first()

    if subscription is None:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":(f"No subscription found matching subscription: {update_subscription.subscription_id} "
                     f"for your user ID {login.user_id}.")}
        )
    if update_subscription.cost is not None:
        if await subscription.set_cost(update_subscription.cost) is None:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error":"Provided cost of the subscription must be a number."}
            )
    if update_subscription.period is not None:
        await subscription.set_period(update_subscription.period)
    if update_subscription.subscriber_id is not None:
        await subscription.set_subscriber_id(update_subscription.subscriber_id)


    new_subscription = await Subscriptions.filter(
            subscription_id=update_subscription.subscription_id
        ).first()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "subscriber_id": str(new_subscription.subscriber_id),
            "payment_address": new_subscription.payment_address,
            "cost": new_subscription.cost,
            "currency": new_subscription.currency,
            "period": new_subscription.period,
            "expiration_date": str(new_subscription.expiration_date),
            "subscription_id": str(new_subscription.subscription_id),
            "created_at": str(new_subscription.created_at)
        }
    ) 

@app.post("/verify")
async def verify_subscription(token: str, verify_subscription: VerifySubscription):
    """Check if the provided subscription ID is current"""
    login = await verify_token(token)
    if type(login) is JSONResponse:
        return login
    
    subscription = await Subscriptions.filter(
        subscription_id=verify_subscription.subscription_id
    ).first()

    if subscription is None:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":(f"No subscription found matching subscription: {verify_subscription.subscription_id} "
                     f"for your user ID {login.user_id}.")}
        )

    if (datetime.now() > subscription.expiration_date):
        active = False
    else:
        active = True
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "active": active,
            "expiration_date": str(subscription.expiration_date),
            "payment_address": subscription.payment_address
        }
    )
