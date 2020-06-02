import logging
import os
from dotenv import load_dotenv

from fastapi import FastAPI
from tortoise.contrib.starlette import register_tortoise
from tortoise import Tortoise

class DBConfig(object):
    def __init__(self):
        load_dotenv()
        self.logger = logging.getLogger()
        self.logger.info(f"DB: {os.getenv('NR_POSTGRES_DB')}")
        self.models = {'db': ['db.models.login', 'db.models.user', 'db.models.transactions',
                              'db.models.subscriptions', 'db.models.forwardingaddress'
                              ]}
        self.postgres_db = os.getenv('NR_POSTGRES_DB')
        self.postgres_user = os.getenv('NR_POSTGRES_USER')
        self.postgres_password = os.getenv('NR_POSTGRES_PASS')
        self.postgres_host = os.getenv('NR_POSTGRES_HOST', '127.0.0.1')
        self.postgres_port = os.getenv('NR_POSTGRES_PORT', 5432)
        
        if self.postgres_db is None or self.postgres_user is None or self.postgres_password is None:
            raise Exception(f"ERROR: Postgres is not properly configured. "
                            "NR_POSTGRES_DB = {self.postgres_db}, NR_POSTGRES_USER = {self.postgres_user}, "
                            "and NR_POSTGRES_PASS = {self.postgres_password} environment variables are all required.")
    

    async def init_package_db(self):
        self.logger.info(f"Using PostgreSQL Database {self.postgres_db}")
        await Tortoise.init(
                db_url=f'postgres://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}',
                modules=self.models
            )
        await Tortoise.generate_schemas(safe=True)