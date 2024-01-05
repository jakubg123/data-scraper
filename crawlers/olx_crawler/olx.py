from playwright.sync_api import sync_playwright
from db_functions import *
import sys


class Offer:
    def __init__(self, title, price, link, provider='olx'):
        self.title = title
        self.price = price
        self.link = link
        self.provider = provider

    def __str__(self):
        return f"Title: {self.title}, Price: {self.price}, Link: {self.link}"

    def __eq__(self, other):
        return isinstance(other,
                          Offer) and self.title == other.title and self.price == other.price and self.link == other.link

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
        next_page = ""
        while True:
            page.goto(url + next_page)
            page.wait_for_selector('div[data-testid="listing-grid"]')
            all_divs = page.locator('div[data-testid="listing-grid"]').all()
            offers_elements = all_divs[0].locator('div[data-cy="l-card"]').all()

            for element in offers_elements:
                try:
                    offer = Offer.from_element(element)
                    if offer not in offers_list: offers_list.append(offer)
                except Exception as e:
                    print(f"{e}")

            next_page_element = page.locator('a[data-testid="pagination-forward"]')
            if next_page_element.is_visible():
                next_url = next_page_element.get_attribute('href')
                next_page = next_url.split('/')[-1]
            else:
                break
            if len(all_divs) > 1:
                break

        browser.close()
        return offers_list


def display_offers(offers):
    for index, offer in enumerate(offers, start=1):
        print(f"{index}: {offer}")


if __name__ == "__main__":
    search_value = sys.argv[1]
    url = f"https://www.olx.pl/oferty/q-{search_value}/"
    collection = search_value
    offers = scrape_olx(url)
    insert_offers(offers, collection)

