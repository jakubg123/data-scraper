from playwright.sync_api import sync_playwright


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
        page.goto(url)
        page.wait_for_selector('div[data-testid="listing-grid"]')

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


if __name__ == "__main__":
    search_value = input("Enter your search: ")
    url = f"https://www.olx.pl/oferty/q-{search_value}/"
    offers = scrape_olx(url)
    display_offers(offers)
