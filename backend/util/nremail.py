import smtplib
import ssl
from email.message import EmailMessage
from email.headerregistry import Address
from email.utils import make_msgid
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from dotenv import load_dotenv
import os

load_dotenv()

NR_URL = os.getenv("NR_FRONTEND_URL")
NR_EMAIL_PORT = int(os.getenv("NR_EMAIL_PORT"))
NR_EMAIL_PW = os.getenv("NR_EMAIL_PW")
SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')


async def send_email(receiver: str, subject: str, message: str, html_msg: str = None):
  """ Send an email from the provided sender to the provided receiver """
  try:
    message = Mail(
      from_email='nanorepeat@nanorepeat.tk',
      to_emails=receiver,
      subject=subject,
      html_content=html_msg
    )
    sg = SendGridAPIClient(SENDGRID_API_KEY)
    response = sg.send(message)
    
    print("Sent!")
  except Exception as e:
    print(e)


async def send_confirm_email_template(first_name: str, token: str, receiver: str):
  """Format the confirm email template and send to the provided receiver"""
  message = f"""\
    Hello {first_name}!\n\n

    Thank you for registering for a Nano Repeat account!  Please copy and paste the link below to confirm your email.
    NOTE: This token will expire within 10 minutes of this email being sent.  Request a new token by signing up again.\n\n

    {NR_URL}/confirm/{token.decode("utf-8")}\n\n

    {NR_URL}
    """

  html_msg = f"""\
    Hello {first_name}!<br><br>

    Thank you for registering for a Nano Repeat account!  Please click the link below to confirm your email.
    NOTE: This token will expire within 10 minutes of this email being sent.<br><br>
    
    <a href="{NR_URL}/confirm/{token.decode("utf-8")}">Confirm Email</a><br><br>

    Creating an account means you agree to our <a href="{NR_URL}/terms">Terms and Conditions</a> and <a href="{NR_URL}/privacy">Privacy Policy</a>.<br>
    If you do not agree, or did not sign up for this service, you can disregard this email.<br><br>
    <a href="{NR_URL}">Nano Repeat</a>
    """

  print(f"Sending email to {receiver} -  {message}")

  await send_email(receiver, "Nano Repeat - Please Confirm Email", message, html_msg)


async def send_forgot_password_template(first_name: str, token: str, receiver: str):
  """Format the confirm email template and send to the provided receiver"""
  message = f"""\
    Hello {first_name}!\n\n

    This email is to alert you that someone has tried to reset your password.  
    If you would like to reset your password, please follow the below link.\n
    NOTE: This token will expire within 10 minutes of this email being sent.  
    If you did not sign up for this service, you can disregard this email.\n\n

    {NR_URL}/changepw/{token.decode("utf-8")}\n\n

    {NR_URL}
    """

  html_msg = f"""\
    Hello {first_name}!<br><br>

    This email is to alert you that someone has tried to reset your password.  
    If you would like to reset your password, please follow the below link.<br>
    NOTE: This token will expire within 10 minutes of this email being sent.  
    If you did not sign up for this service, you can disregard this email.<br><br>

    <a href="{NR_URL}/changepw/{token.decode("utf-8")}">Change Password</a><br><br>

    <a href="{NR_URL}">Nano Repeat</a>
    """

  await send_email(receiver, "Nano Repeat - Password Reset", message, html_msg)
