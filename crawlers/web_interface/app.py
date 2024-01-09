import firebase_config
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from config import Config
from routes.companies import companies_blueprint
from routes.pricings import pricings_blueprint
from routes.products import products_blueprint
from utilities import run_script

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

db = SQLAlchemy(app)


app.register_blueprint(products_blueprint, url_prefix='/products')
app.register_blueprint(companies_blueprint, url_prefix='/companies')
app.register_blueprint(pricings_blueprint, url_prefix='/productpricings')


@app.route('/get_collections', methods=['GET'])
def get_collections():
    collections_list = firebase_config.nosql_db.collections()
    collection_names = [collection.id for collection in collections_list]

    return jsonify(collection_names)


@app.route('/run')
def run_crawler():
    search_phrase = request.args.get('search')
    if not search_phrase:
        return "Search phrase is required", 400

    run_script(search_phrase)
    return "Crawler script started with search phrase: " + search_phrase


if __name__ == '__main__':
    app.run('0.0.0.0')
