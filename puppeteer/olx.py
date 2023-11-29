from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    url = 'https://www.olx.pl/oferty/q-cokolwiek/'

    page.goto(url)
    page.wait_for_load_state('domcontentloaded')

    title = page.title()
    print('Tytuł strony:', title)

    offer_elements = page.locator('div[data-cy="l-card"]').all()
    print("ilosc przedmiotow: "+str(len(offer_elements)))
    for i in range(1, len(offer_elements)):

        # try:
            item = offer_elements[i].locator('div.css-u2ayx9')
            title = (item.locator('h6').inner_text())

            if(item.locator('[data-testid="adCard-featured"].css-1jh69qu').is_visible()):print("reklama:")
            line = item.locator('p[data-testid="ad-price"]').inner_text().splitlines()
            if len(line) > 2:
                for t in line:
                    price, info = t.split("\n")
            else:
                price = line

            print(str(i)+". nazwa: "+ title+",  cena: "+str(price))
        # except:
        #     print("Something went wrong")


    browser.close()


