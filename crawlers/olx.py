from playwright.sync_api import sync_playwright
from data import *
from db_functions_py import *


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


def scrape_olx(url):
    with sync_playwright() as p:

        browser = p.chromium.launch()
        page = browser.new_page()

        offers_list = []
        counter = 0
        next_page = ""
        while True:
            page.goto(url + next_page)
            page.wait_for_selector('div[data-testid="listing-grid"]')

            offers_elements = page.locator('div[data-cy="l-card"]').all()
            number_of_offers = [int(word) for word in
                                page.locator('span[data-testid="total-count"]').inner_text().split() if word.isdigit()]
            print(f"Number of offers for page {counter}: {len(offers_elements)} or for whole site {number_of_offers}")

            for element in offers_elements:
                try:
                    offer = Offer.from_element(element)
                    offers_list.append(offer)
                except Exception as e:
                    print(f"{e}")

            next_page_element = page.locator('a[data-testid="pagination-forward"]')
            if next_page_element.is_visible():
                next_url = next_page_element.get_attribute('href')
                next_page = next_url.split('/')[-1]
            else:
                break

        browser.close()
        return offers_list


def display_offers(offers):
    for index, offer in enumerate(offers, start=1):
        print(f"{index}: {offer}")


if __name__ == "__main__":
    search_value = input("Enter your search: ")
    url = f"https://www.olx.pl/oferty/q-{search_value}/"
    collection = search_value
    offers = scrape_olx(url)
    display_offers(offers)
    clear_collection(collection)
    insert_offers(offers, collection)
