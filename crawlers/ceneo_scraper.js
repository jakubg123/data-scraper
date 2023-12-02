const puppeteer = require('puppeteer-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const { rl, firestore } = require('./data.js');
const db = require('./db_functions.js');

class Product {
    constructor(title, price, link) {
        this.title = title;
        this.price = price;
        this.link = link;
    }
}

async function insert(productData, collectionReference) {
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

async function main() {
    puppeteer.use(stealth);
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        userDataDir: "./tmp"
    });

    const page = await browser.newPage();
    const searchPhrase = process.argv[2];

    if (!searchPhrase) {
        console.error('Search phrase missing');
        await browser.close();
        return;
    }


    const collectionName = await db.createCollection();
    const collectionReference = firestore.collection(collectionName);

    const products = await search(page, searchPhrase);

    for (const product of products) {
        const productData = await page.evaluate(product => {
            const titleElement = product.querySelector("strong > a > span");
            const priceElement = product.querySelector("span.price-format.nowrap > span > span.value");
            const pennyElement = product.querySelector("span.price-format.nowrap > span > span.penny");
            const linkElement = product.querySelector("a.go-to-product");

            return {
                title: titleElement ? titleElement.textContent : "Null",
                price: priceElement && pennyElement ? parseFloat(priceElement.textContent.replace(/[^\d]/g, '') +
                    '.' + pennyElement.textContent.replace(/,/g, '')) : null,
                link: linkElement ? 'https://ceneo.pl' + linkElement.getAttribute('href') : "Null"
            };
        }, product);



        await insert(productData, collectionReference);
    }

    await browser.close();
}


main();