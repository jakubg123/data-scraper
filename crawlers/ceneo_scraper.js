const puppeteer = require('puppeteer-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const url = require("url");
const {rl, firestore} = require('./data.js');


class Product {
    constructor(title, price, rating, reviewsNumber, link) {
        this.title = title;
        this.price = price;
        this.link = link;
    }
}


const collectionReference = firestore.collection('data-scraper');

async function insert(productData) {
    const documentRef = collectionReference.doc();
    try {
        await documentRef.set(productData);
        console.log(`${documentRef.id}`);
    } catch (error) {
        console.error(`Error writing to document: ${documentRef.id}`, error);
    }
}

async function search(page, searchPhrase) {
    const ceneoUrl = 'https://www.ceneo.pl';

    await page.goto(ceneoUrl);
    await page.waitForXPath('//*[@id="form-head-search-q"]');
    await page.type('#form-head-search-q', searchPhrase);

    const searchButtonXPath = '/html/body/div[2]/header/div[2]/div[2]/form/button';
    const [searchButton] = await page.$x(searchButtonXPath);
    if (searchButton) {
        await searchButton.click();
    }

    await page.waitForSelector('div.category-list-body', {timeout: 20000});
    return page.$$('.cat-prod-row');
}


stealth.onBrowser = () => {
};
puppeteer.use(stealth);
puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: "./tmp"
}).then(async browser => {
    const page = await browser.newPage()
    const searchPhrase = process.argv[2];


    if (!searchPhrase) {
        console.error('Search phrase missing');
        process.exit(1);
    }

    const products = await search(page, searchPhrase);


    for (const product of products) {
        let title = "Null"
        let price = null;
        let link = "Null"
        // strong > a > span
        const productData = await page.evaluate(product => {
            const titleElement = product.querySelector("strong > a > span");
            const priceElement = product.querySelector("span.price-format.nowrap > span > span.value");
            const pennyElement = product.querySelector("span.price-format.nowrap > span > span.penny");
            const linkElement = product.querySelector("a.go-to-product");

            return {
                title: titleElement ? titleElement.textContent : "Null",
                price: priceElement && pennyElement ? parseFloat(priceElement.textContent.replace(/[^\d]/g, '') + '.' + pennyElement.textContent.replace(/,/g, '')) : null,
                link: linkElement ? 'https://ceneo.pl' + linkElement.getAttribute('href') : "Null"
            };
        }, product);

        await insert(productData);

    }
    await browser.close();
    process.exit(0);
});