from app import db


class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    pricings = db.relationship('ProductPricing', backref='product', lazy=True)


class Company(db.Model):
    __tablename__ = 'companies.py'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    pricings = db.relationship('ProductPricing', backref='company', lazy=True)


class ProductPricing(db.Model):
    __tablename__ = 'productpricing'

    id = db.Column(db.Integer, primary_key=True)
    productid = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    companyid = db.Column(db.Integer, db.ForeignKey('companies.py.id'), nullable=False)
    price = db.Column(db.Numeric(10, 2))
    scrapedate = db.Column(db.Date)