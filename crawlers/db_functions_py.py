from data import cred
import firebase_admin
from firebase_admin import firestore

app = firebase_admin.initialize_app(cred)
db = firestore.client()


def check_if_collection_exist(collection):
    collection_ref = db.collection(collection)
    if collection_ref.get():
        return 1
    else:
        print(f"collection:{collection} doesn't exist")
        return 0


def insert(offer_data, collection):
    collection_ref = db.collection(collection)
    data = {
        'title': offer_data.title,
        'price': offer_data.price,
        'link': offer_data.link
    }
    collection_ref.add(data)


def insert_offers(offers, collection):
    collection_ref = db.collection(collection)
    for index, offer in enumerate(offers, start=1):
        data = {
            'title': offer.title,
            'price': offer.price,
            'link': offer.link
        }
        collection_ref.add(data)


def clear_collection(collection):
    if check_if_collection_exist(collection):
        collection_ref = db.collection(collection)
        document = collection_ref.stream()
        for data in document:
            data.reference.delete()


def print_collection(collection):
    if check_if_collection_exist(collection):
        docs = db.collection("cities").stream()
        for doc in docs:
            print(f"{doc.id} => {doc.to_dict()}")


def delete_collection(collection, batch_size):
    docs = collection.list_documents(page_size=batch_size)
    deleted = 0

    for doc in docs:
        print(f"Deleting doc {doc.id} => {doc.get().to_dict()}")
        doc.delete()
        deleted = deleted + 1

    if deleted >= batch_size:
        return delete_collection(collection, batch_size)


def delete_all_collections():
    collections_list = db.collections()
    for collection_name in collections_list:
        delete_collection(collection_name, 1)


def list_All_Collections():
    collections_list = db.collections()
    for collection_name in collections_list:
        print(collection_name)

    print('All collections have been deleted.')
