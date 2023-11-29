const puppeteer = require('puppeteer-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();


class Product {
    constructor(title, price, rating, reviewsNumber) {
        this.title = title;
        this.price = price;
        this.rating = rating;
        this.reviewsNumber = reviewsNumber;
    }
}


stealth.onBrowser = () => {};
puppeteer.use(stealth);

puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: "./tmp"
}).then(async browser => {
    const page = await browser.newPage()
    const searchPhrase = process.argv[2];

    if (!searchPhrase) {
        console.error('Please provide a search phrase as a command line argument.');
        process.exit(1);
    }

    await page.goto('https://www.ceneo.pl/')
    await page.waitForXPath('//*[@id="form-head-search-q"]')
    await page.type('#form-head-search-q', searchPhrase);


    const searchButtonXPath = '/html/body/div[1]/header/div[2]/div[2]/form/button';
    const [searchButton] = await page.$x(searchButtonXPath);
    if (searchButton) {
        await searchButton.click();
    }


    await page.waitForSelector('div.category-list-body', {timeout: 100000})

    const products = await page.$$('.cat-prod-row');

    let items = [];

    for (const product of products) {
        let title = "Null"
        let price = null;
        let rating =0
        let reviewsNumber = 0
            // strong > a > span
        try {
            title = await page.evaluate(
                el => el.querySelector("strong > a > span").textContent,
                product
            );
        } catch (error) {
            console.error("Error extracting product title:", error.message);
        }

        try {
            const priceValue = await page.evaluate(
                el => el.querySelector("span.price-format.nowrap > span > span.value").textContent,
                product
            );

            const cleanPriceValue = priceValue.replace(/[^\d]/g, '');

            const pricePenny = await page.evaluate(
                el => el.querySelector("span.price-format.nowrap > span > span.penny").textContent,
                product
            );
            const cleanPricePenny = pricePenny.replace(/,/g, '');

            price = parseFloat(`${cleanPriceValue}.${cleanPricePenny}`);
        } catch (error) {
            console.error("Error extracting product price:", error.message);
        }

        try {
            rating = await page.evaluate(
                el => el.querySelector("div.prod-review > span > span.product-score").textContent,
                product
            );
            rating = parseFloat(rating.replace(/,/g, '.')) || 0;

        } catch (error) {
            console.error("Error extracting rating:", error.message);
            console.log(title)
        }

        try {
            reviewsNumber = await page.evaluate(
                el => el.querySelector("div.prod-review > span > span.prod-review__qo > a").textContent,
                product
            );
            reviewsNumber = parseInt(reviewsNumber.replace(/,/g, '')) || 0;

        } catch (error) {
            console.error("Error extracting reviewsNumber:", error.message);
            console.log(title)

        }

        items.push(new Product(title, price, rating, reviewsNumber));

    }

    console.log(items);


    await browser.close();
});



