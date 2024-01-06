from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import datetime
import psycopg2
from sqlalchemy import Numeric, Date

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgres@localhost/postgres'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    pricings = db.relationship('ProductPricing', backref='product', lazy=True)


class Company(db.Model):
    __tablename__ = 'companies'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    pricings = db.relationship('ProductPricing', backref='company', lazy=True)


class ProductPricing(db.Model):
    __tablename__ = 'productpricing'

    id = db.Column(db.Integer, primary_key=True)
    productid = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    companyid = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    price = db.Column(db.Numeric(10, 2))
    scrapedate = db.Column(db.Date)


@app.route('/products', methods=['GET'])
def get_products():
    try:
        products = Product.query.all()
        return jsonify({"products": [{"id": product.id, "name": product.name} for product in products]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/companies', methods=['GET'])
def get_companies():
    try:
        companies = Company.query.all()
        return jsonify({"companies": [{"id": "company.id", "name": company.name} for company in companies]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/productpricings', methods=['GET'])
def get_product_pricings():
    try:
        pricings = ProductPricing.query.join(Product, ProductPricing.productid == Product.id) \
            .join(Company, ProductPricing.companyid == Company.id) \
            .add_columns(Product.name.label("product_name"), Company.name.label("company_name"),
                         ProductPricing.price, ProductPricing.scrapedate) \
            .all()

        product_pricings = []
        for pricing in pricings:
            lowest_pricing_record = ProductPricing.query.filter_by(
                productid=pricing.ProductPricing.productid,
                companyid=pricing.ProductPricing.companyid
            ).order_by(ProductPricing.price).first()

            latest_pricing = ProductPricing.query.filter_by(
                productid=pricing.ProductPricing.productid,
                companyid=pricing.ProductPricing.companyid
            ).order_by(ProductPricing.scrapedate.desc()).first()

            product_pricings.append({
                "product_id" : pricing.ProductPricing.productid,
                "company_id" : pricing.ProductPricing.companyid,
                "product_name": pricing.product_name,
                "company_name": pricing.company_name,
                "current_price": str(latest_pricing.price),
                "lowest_price": str(lowest_pricing_record.price),
                "lowest_price_date": lowest_pricing_record.scrapedate.strftime('%Y-%m-%d'),
                "scrape_date": pricing.scrapedate.strftime('%Y-%m-%d')
            })

        return jsonify({"productPricings": product_pricings}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run()
