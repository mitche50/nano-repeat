import requests
import rapidjson as json

import os
import sys
from dotenv import load_dotenv
from decimal import Decimal
from asyncio import sleep
from datetime import datetime

load_dotenv()

WALLET = os.getenv('PIPPIN_WALLET')
NODE_IP = os.getenv('PIPPIN_IP')
WORK_KEY = os.getenv('DPOW_KEY')
WORK_USER = os.getenv('DPOW_USER')
WORK_SERVER = os.getenv('DPOW_SERVER')
CONVERT_MULTIPLIER = Decimal(os.getenv('CONVERT_MULTIPLIER'))

async def create_account():
    """Create a new nano address"""
    account_data = {'action': 'account_create', 'wallet': WALLET}
    account_data_json = json.dumps(account_data)
    r = requests.post(NODE_IP, data=account_data_json)
    new_address = r.json()
    return new_address['account']


def get_pow(sender_account):
    """Retrieves the frontier (hash of previous transaction) of the provided account and generates work for the next block."""
    try:
        account_info_call = {'action': 'account_info', 'account': sender_account}
        json_request = json.dumps(account_info_call)
        r = requests.post('{}'.format(NODE_IP), data=json_request)
        rx = r.json()
        if 'frontier' in rx:
            hash = rx['frontier']
        else:
            public_key_data = {'action': 'account_key', 'account': sender_account}
            json_request = json.dumps(public_key_data)
            r = requests.post('{}'.format(NODE_IP), data=json_request)
            rx = r.json()
            hash = rx['key']

    except Exception as e:
        return ''

    work = ''
    try:
        work_data = {'hash': hash, 'api_key': WORK_KEY, 'user': WORK_USER, 'difficulty': 'ffffffc000000000', 'timeout': 5,}

        json_request = json.dumps(work_data)
        r = requests.post('{}'.format(WORK_SERVER), data=json_request)
        rx = r.json()
        if 'work' in rx:
            work = rx['work']
        else:
            print("{}: work not in keys, response from server: {}".format(datetime.now(), rx))
    except Exception as e:
        print("{}: ERROR GENERATING WORK: {}".format(datetime.now(), e))
        pass

    return work

async def send(source: str, destination: str, amount: str):
    """Send funds from the provided source to the provided destination"""
    await receive_pending(source)

    amount = str(int(Decimal(amount) * CONVERT_MULTIPLIER))
    if '.' in amount:
        amount = amount[:amount.index('.')]
    work = get_pow(source)
    if work == '':
        send_data = {
            "action": "send",
            "wallet": WALLET,
            "source": source,
            "destination": destination,
            "amount": amount
        }
    else:
        send_data = {
            "action": "send",
            "wallet": WALLET,
            "source": source,
            "destination": destination,
            "amount": amount,
            "work": work
        }
    send_data_json = json.dumps(send_data)
    r = requests.post(NODE_IP, data=send_data_json)
    send_return = r.json()
    return send_return


async def receive_pending(sender_account):
    """Check to see if the account has any pending blocks and process them"""
    try:
        pending_data = {'action': 'pending', 'account': sender_account, 'include_active': 'true'}
        pending_data_json = json.dumps(pending_data)
        r = requests.post(NODE_IP, data=pending_data_json)
        pending_blocks = r.json()
        if len(pending_blocks['blocks']) > 0:
            try:
                for block in pending_blocks['blocks']:
                    work = get_pow(sender_account)
                    if work == '':
                        print("{}: processing without pow".format(datetime.now()))
                        receive_data = {'action': "receive", 'wallet': WALLET, 'account': sender_account,
                                        'block': block}
                    else:
                        print("{}: processing with pow".format(datetime.now()))
                        receive_data = {'action': "receive", 'wallet': WALLET, 'account': sender_account,
                                        'block': block, 'work': work}
                    receive_json = json.dumps(receive_data)
                    requests.post('{}'.format(NODE_IP), data=receive_json)
            except Exception as e:
                raise e
    except Exception as e:
        raise e

    return