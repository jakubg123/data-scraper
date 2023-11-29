const puppeteer = require('puppeteer-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();

stealth.onBrowser = () => {};
puppeteer.use(stealth);

puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: "./tmp"
}).then(async browser => {
    const page = await browser.newPage()
    const url = 'https://www.ceneo.pl/Karmy_dla_psow;szukaj-brit+karmy+dla+ps%c3%b3w'
    await page.goto(url);
    await page.waitForXPath('//*[@id="body"]/div/div/div[3]/div/section/div[5]', { timeout: 100000 })

    const products = await page.$$('.cat-prod-row');

    let items = [];

    for (const product of products) {
        let title = "Null"
        let price = "Null"
        let rating = "Null"
        try {
            // strong > a > span
            title = await page.evaluate(
                el => el.querySelector("strong > a > span").textContent,
                product
            );
        } catch (error) {
            console.error("Error extracting product title:", error.message);
        }

        try {
            price = await page.evaluate(
                el => el.querySelector("span.price-format.nowrap > span > span.value").textContent,
                product
            );
        } catch (error) {
            console.error("Error extracting product title:", error.message);
        }

        try {
            rating = await page.evaluate(
                el => el.querySelector("div.prod-review > span > span.product-score").textContent,
                product
            );

            rating = rating.substring(1, 4);

        } catch (error) {
            console.error("Error extracting product title:", error.message);
        }

        console.log(title)
        console.log(price)
        console.log(rating)

    }


    await browser.close();
});

class Product {
    constructor(title, price, rating) {
        this.title = title;
        this.price = price;
        this.rating = rating;
    }
}

