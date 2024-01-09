import os

import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate(f'{os.getenv("HOME")}/data-db-406620-2fe1ab987b4d.json')
g_app = firebase_admin.initialize_app(cred)
nosql_db = firestore.client()