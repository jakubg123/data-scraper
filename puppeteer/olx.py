from playwright.sync_api import sync_playwright

class Offer:
    def __init__(self, title, price, rating, reviewsNumber, link):
        self.title = title
        self.price = price
        self.rating = rating
        self.reviewsNumber = reviewsNumber
        self.link = link

    def __str__(self):
        return f"Title: {self.title}, price: {self.price},\n      Link: {self.link}"

def scrape_olx(url):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url)
        locator = page.wait_for_selector('div[data-testid="adCard-featured"].css-1jh69qu')

        offers_elements = page.locator('div[data-cy="l-card"]').all()
        print("Number of offers: " + str(len(offers_elements)))

        offers_list = []

        for i in range(1, len(offers_elements)):
            try:
                offer_link_element = offers_elements[i].locator('a')
                link = offer_link_element.get_attribute('href')
                if link.startswith('/'):
                    link = 'https://www.olx.pl' + link
                title = (offers_elements[i].locator('h6').inner_text())
                optional = ""

                price_and_info = offers_elements[i].locator('p[data-testid="ad-price"]').inner_text()
                list_price_and_info = price_and_info.splitlines()

                if len(list_price_and_info) > 1:
                    price = list_price_and_info[0]
                    optional = list_price_and_info[1]
                else:
                    price = list_price_and_info[0]

                offer = Offer(title, price,"","",link)
                offers_list.append(offer)
            except Exception as e:
                print(f"An unexpected error occurred: {e}")


        browser.close()
        for index, item in enumerate(offers_list):
            print(f"{index+1}:  {item}")

if __name__ == "__main__":
    searchValue = input("Enter your search: ")
    url = "https://www.olx.pl/oferty/q-"+searchValue+"/"
    scrape_olx(url)
