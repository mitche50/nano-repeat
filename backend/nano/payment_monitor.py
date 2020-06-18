#!/home/nanorepeat/backend/venv/bin/python3
from decimal import Decimal

import asyncio
import logging
import rapidjson
import redis
import requests
import websockets

import os
import sys
from dotenv import load_dotenv
from datetime import datetime
from logging.handlers import TimedRotatingFileHandler


PACKAGE_PARENT = '..'
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

from db.models.transactions import Transactions
from db.models.subscriptions import Subscriptions
from db.models.forwardingaddress import ForwardingAddress
from db.db_config import DBConfig
from nano.nano_utils import send

import paho.mqtt.client as mqtt


class Payment_Monitor(object):
    def __init__(self):
        load_dotenv()

        self.logger = logging.getLogger('payment_log')
        self.ws_host = os.getenv('WS_HOST')
        self.ws_port = os.getenv('WS_PORT')
        self.redis_host =  os.getenv('REDIS_HOST')
        self.redis_port = os.getenv('REDIS_PORT')
        self.redis_pw = os.getenv('REDIS_PW')
        self.node_ip = os.getenv('NODE_IP')
        self.pippin_wallet = os.getenv('PIPPIN_WALLET')
        self.pippin_ip = os.getenv('PIPPIN_IP')
        self.subscription = asyncio.ensure_future(self.subscribe_all())
        self.convert_multiplier = Decimal(os.getenv('CONVERT_MULTIPLIER'))
        self.queue = asyncio.Queue(maxsize=0)
        self.mqtt = mqtt.Client()

        self.logger.setLevel(logging.INFO)
        handler = TimedRotatingFileHandler('{}/logs/{:%Y-%m-%d}-payment.log'.format(os.getcwd(), datetime.now()),
                                   when="d",
                                   interval=1,
                                   backupCount=5)
        self.logger.addHandler(handler)
        self.logger.info("config complete")


    def sub_data(self, topic: str="confirmation", ack: bool=False, options: dict=None):
        """Subscribe to the provided topic with optional arguments."""
        data = {'action': 'subscribe', 'topic': topic, 'ack': ack}
        if options is not None:
            data['options'] = options
        return data


    def get_accounts(self):
        """Get the list of accounts associated with the provided wallet"""
        account_list_data = {'action': 'account_list', 'wallet': self.pippin_wallet}
        account_list_json = rapidjson.dumps(account_list_data)
        r = requests.post(self.pippin_ip, data=account_list_json)
        account_list_return = r.json()
        return account_list_return['accounts']

    
    def send_mqtt_message(self, topic: str, payload: object):
        """Publish message on provided topic"""
        payload = json.dumps(payload)
        self.mqtt.username_pw_set(os.getenv('MQTT_ADMIN_LOGIN'), os.getenv('MQTT_ADMIN_PW'))
        self.mqtt.connect(os.getenv('MQTT_HOST'), int(os.getenv('MQTT_PORT')))
        self.mqtt.loop_start()
        infot = self.mqtt.publish("test", payload)
        self.mqtt.wait_for_publish()
        self.mqtt.disconnect()


    async def validate_amount(self, subscription, amount):
        """Validate the amount paid is the correct amount"""
        if Decimal(amount) > Decimal(subscription.cost):
            return "overpayment"
        elif Decimal(amount) < Decimal(subscription.cost):
            return "underpayment"
        else:
            return True


    async def log_transaction(self, amount: str, sender: str, receiver: str, tx_hash: str):
        try:
            transaction = Transactions(
                amount=amount,
                sender=sender,
                receiver=receiver,
                tx_hash=tx_hash
            )
            await transaction.save()
            # TODO: Get subscription ID for address
            return True
        except Exception:
            return False
    

    async def set_send_info(self, validity, amount, sender, merchant_id, cost):
        """Populate sending information to handle over and under payments, as well as forwarding to merchant"""
        send_info = {}
        print(f"validity: {validity}")
        if validity == 'underpayment':
            if Decimal(amount) >= 0.01:
                send_info['return_amount'] = amount
                send_info['return_address'] = sender
                send_info['forward_address'] = None
                send_info['forward_amount'] = "0"
            else:
                send_info['return_amount'] = "0"
                send_info['return_address'] = None
                send_info['forward_address'] = None
                send_info['forward_amount'] = "0"
        elif validity == 'overpayment':
            address = await ForwardingAddress.filter(user_id=merchant_id).first()
            send_info['return_address'] = sender
            send_info['return_amount'] = str((Decimal(amount) - Decimal(cost)))
            send_info['forward_address'] = address.address
            send_info['forward_amount'] = cost
        elif validity is True:
            address = await ForwardingAddress.filter(user_id=merchant_id).first()
            send_info['return_address'] = None
            send_info['forward_address'] = address.address
            send_info['return_amount'] = "0"
            send_info['forward_amount'] = str(amount)
        
        return send_info


    async def subscribe_all(self):
        """Retrieve all the accounts managed by pippin and add them to websocket subscription"""
        try:
            accounts = self.get_accounts()
        except Exception as e:
            self.logger.info(f"error: {e}")
        try:
            self.logger.info("Subscribing to accounts: {}".format(accounts))
        except Exception as e:
            self.logger.info("error: {}".format(e))
        options = {"accounts": accounts}
        queue: asyncio.Queue = self.queue

        self.logger.info(f"Connectin to websocket: {self.ws_host}:{self.ws_port}")
        async with websockets.connect("ws://{}:{}".format(self.ws_host, self.ws_port)) as websocket:
            
            await websocket.send(rapidjson.dumps(self.sub_data("confirmation", ack=True, options=options)))
        
            while 1:
                rec = rapidjson.loads(await websocket.recv())
                topic = rec.get("topic", None)
                if topic:
                    message = rec["message"]
                    if topic == "confirmation" and message['block']['subtype'] == 'send':
                        subscription = await Subscriptions.filter(payment_address=message['block']['link_as_account']).first()
                        if subscription is None:
                            continue
                        # Convert from raw to Nano
                        amount = str(Decimal(message['amount']) / self.convert_multiplier)
                        sender = message['account']
                        receiver = message['block']['link_as_account']
                        send_hash = message['hash']
                        validity = await self.validate_amount(subscription, amount)
                        send_info = await self.set_send_info(validity, amount, message['account'], subscription.merchant_id, subscription.cost)
                        # TODO: Send message to MQTT on topic '{subscription.merchant_id}/{subscription.subscriber_id}'
                        self.send_mqtt_message("test", {"receiver":receiver, "amount":amount, "hash":send_hash, "subscription":subscription})
                        send_info['source'] = message['block']['link_as_account']
                        log_info = {
                            "amount":amount,
                            "sender":sender,
                            "receiver":receiver,
                            "hash":send_hash,
                            "subscription":subscription
                        }
                        await queue.put({"type":"log", "log_info":log_info, "send_info":send_info})


    async def queue_consumer(self):
        """Worker to digest the queue and send transactions"""
        queue: asyncio.Queue = self.queue
        while True:
            try:
                message = await queue.get()
                if message['type'] == "send":
                    send_info = message['send_info']
                    if send_info['forward_address'] is not None:
                        self.logger.info(f"forwarding {send_info['forward_amount']} nano")
                        forward_return = await send(
                            source=send_info['source'], 
                            destination=send_info['forward_address'],
                            amount=send_info['forward_amount']
                        )
                        self.logger.info(f"forward return: {forward_return}")
                    if send_info['return_address'] is not None:
                        self.logger.info(f"forwarding {send_info['return_amount']} nano")
                        refund_return = await send(
                            source=send_info['source'],
                            destination=send_info['return_address'],
                            amount=send_info['return_amount']
                        )
                        self.logger.info(f"refund return: {refund_return}")

                elif message['type'] == 'log':
                    log_info = message['log_info']
                    log_result = await self.log_transaction(
                        log_info['amount'], 
                        log_info['sender'], 
                        log_info['receiver'],
                        log_info['hash']
                    )
                    if log_result == False:
                        continue

                    res = await log_info['subscription'].mark_paid()
                    if res is None:
                        continue
                    await queue.put({"type":"send", "log_info":log_info, "send_info":message['send_info']})
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                self.logger.info(f"Queue Error: {e}")

    async def refresh_sub(self):
        """Cancels the current subscription and resubscribes to all local accounts"""
        print("refreshing the subscription")
        try:
            self.subscription.cancel()
            self.subscription = asyncio.ensure_future(self.subscribe_all())
        except Exception as e:
            print(f"exception - {e}")


