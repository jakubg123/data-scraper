import json
import psycopg2
from datetime import datetime
import sys


def insert_product(cursor, product_name):
    cursor.execute("INSERT INTO Products (Name) VALUES (%s) ON CONFLICT (Name) DO NOTHING RETURNING ID;",
                   (product_name,))
    result = cursor.fetchone()
    if result:
        return result[0]
    cursor.execute("SELECT ID FROM Products WHERE Name = %s;", (product_name,))
    result = cursor.fetchone()
    return result[0]


def insert_company(cursor, company_name):
    cursor.execute("INSERT INTO Companies (Name) VALUES (%s) ON CONFLICT (Name) DO NOTHING RETURNING ID;",
                   (company_name,))
    result = cursor.fetchone()
    if result:
        return result[0]
    cursor.execute("SELECT ID FROM Companies WHERE Name = %s;", (company_name,))
    result = cursor.fetchone()

    return result[0] if result else None


def insert_product_pricing(cursor, product_id, company_id, price, date_str):
    scrape_date = datetime.fromisoformat(date_str)
    cursor.execute("""
        INSERT INTO ProductPricing (ProductID, CompanyID, Price, ScrapeDate) 
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (ProductID, CompanyID, ScrapeDate) DO NOTHING;
        """, (product_id, company_id, price, scrape_date))


def process_line(line, cursor):
    try:
        data = json.loads(line)

        product_name = data['product']
        product_id = insert_product(cursor, product_name)
        print(product_id)

        for item in data['detailedProducts']:
            company_name = item['companyName']
            price = item['price']
            date_str = data['date']

            company_id = insert_company(cursor, company_name)
            print(company_id)

            if product_id and company_id:
                insert_product_pricing(cursor, product_id, company_id, price, date_str)
                print(f"Inserting {product_id} -- {company_id}")

    except Exception as e:
        print(f"error: {e}")
        raise


def main(file_path):
    conn = None
    cursor = None
    try:
        conn = psycopg2.connect(dbname="postgres", user="postgres", password="postgres", host="db")

        cursor = conn.cursor()

        with open(file_path, 'r') as file:
            for line in file:
                try:
                    process_line(line, cursor)
                    conn.commit()
                except Exception as e:
                    print({e})
                    conn.rollback()

    except Exception as e:
        print(f"db connection: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(1)
    file_path = sys.argv[1]
    main(file_path)
