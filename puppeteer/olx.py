from playwright.sync_api import sync_playwright

class Offer:
    def __init__(self, title, price, rating, reviewsNumber, link):
        self.title = title
        self.price = price
        self.rating = rating
        self.reviewsNumber = reviewsNumber
        self.link = link

    def __str__(self):
        return f"Nazwa: {self.title}, Cena: {self.price},\n      Link: {self.link}"

def scrapuj_olx(url):
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
                ##item = offers_elements[i].locator('div.css-u2ayx9')
                offer_link_element = offers_elements[i].locator('a')
                link = offer_link_element.get_attribute('href')
                title = (offers_elements[i].locator('h6').inner_text())
                optional = ""


                price_and_info = offers_elements[i].locator('p[data-testid="ad-price"]').inner_text()
                list_price_and_info = price_and_info.splitlines()


                if len(list_price_and_info) > 1:
                    price = list_price_and_info[0]
                    optional = list_price_and_info[1]
                else:
                    price = list_price_and_info[0]

                objekt = Offer(title, price,"","",link)
                ##print(str(i) + ". " + str(objekt))
                offers_list.append(objekt)
            except Exception as e:
                print(f"Error occured: {e} \n on "+str(title))
            except:
                print("Something went wrong")

        for index,item in enumerate(offers_list):
            print(f"{index}:  {item}")
        browser.close()

if __name__ == "__main__":
    url = "https://www.olx.pl/oferty/q-cokolwiek/"
    scrapuj_olx(url)
