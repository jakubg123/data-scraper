from playwright.sync_api import sync_playwright
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

cred = credentials.Certificate(
    f"C:/Users/damai/PycharmProjects/olxscraper/olxscrape-9a1d4-firebase-adminsdk-o6cju-59390a1e49.json")
firebase_admin.initialize_app(cred)


class Offer:
    def __init__(self, title, price, link):
        self.title = title
        self.price = price
        self.link = link

    def __str__(self):
        return f"Title: {self.title}, Price: {self.price}, Link: {self.link}"

    @staticmethod
    def from_element(element):
        title = element.locator('h6').inner_text()
        price = element.locator('p[data-testid="ad-price"]').inner_text().splitlines()[0]
        link = element.locator('a').get_attribute('href')
        if link.startswith('/'):
            link = 'https://www.olx.pl' + link
        return Offer(title, price, link)


def scrape_olx(url, num_pages):
    with sync_playwright() as p:

        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url)
        page.wait_for_selector('div[data-testid="listing-grid"]')
        ##add next pages to scrape
        ##add - avoid not related offers
        offers_elements = page.locator('div[data-cy="l-card"]').all()
        print(f"Number of offers: {len(offers_elements)}")

        offers_list = []
        for element in offers_elements:
            try:
                offer = Offer.from_element(element)
                offers_list.append(offer)
            except Exception as e:
                print(f"{e}")

        browser.close()
        return offers_list


def display_offers(offers):
    for index, offer in enumerate(offers, start=1):
        print(f"{index}: {offer}")


def insert_offers(offers, collection):
    if check_if_collection_exist(collection):
        db = firestore.client()
        collection_ref = db.collection(collection)
        for index, offer in enumerate(offers, start=1):
            data = {
                'index': index,
                'title': offer.title,
                'price': offer.price,
                'link': offer.link
            }
            collection_ref.add(data)


def check_if_collection_exist(collection):
    db = firestore.client()
    collection_ref = db.collection(collection)
    if collection_ref.get():
        return 1
    else:
        print(f"collection:{collection} doesn't exist")
        return 0


def clear_collection(collection):
    if check_if_collection_exist(collection):
        db = firestore.client()
        collection_ref = db.collection(collection)
        document = collection_ref.stream()
        for data in document:
            data.reference.delete()
    else:
        print(f"collection:{collection} doesn't exist")


if __name__ == "__main__":
    search_value = input("Enter your search: ")
    url = f"https://www.olx.pl/oferty/q-{search_value}/"
    num_pages = 3
    offers = scrape_olx(url, num_pages)
    display_offers(offers)
    insert_offers(offers, "new_collection")
