const puppeteer = require('puppeteer-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const { firestore } = require('./data.js');
const db = require('./db_functions.js');
const {getAllCollectionsAndCount} = require("./db_functions");
const {getCollectionSize} = require('./db_functions')

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
        console.log(`Document written with ID: ${documentRef.id}`);
    } catch (error) {
        console.error(`Error writing to document: ${documentRef.id}`, error);
    }
}

async function search(page) {
    await page.waitForSelector('div.category-list-body', {timeout: 20000});
    return page.$$('.cat-prod-row');
}

async function getNextSite(page) {
    const nextPageButton = await page.$('a.pagination__item.pagination__next');
    if (nextPageButton) {
        await nextPageButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        return true;
    } else {
        return false;
    }
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

    await page.goto('https://www.ceneo.pl');
    await page.waitForXPath('//*[@id="form-head-search-q"]');
    await page.type('#form-head-search-q', searchPhrase);
    const searchButtonXPath = '/html/body/div[2]/header/div[2]/div[2]/form/button';
    const [searchButton] = await page.$x(searchButtonXPath);
    if (searchButton) {
        await searchButton.click();
    }

    const collectionName = await db.createCollection();
    const collectionReference = firestore.collection(collectionName);

    let hasNextPage = true;

    while (hasNextPage) {
        let products = await search(page);

        for (const product of products) {
            const productData = await product.evaluate(el => {
                const titleElement = el.querySelector("strong > a > span");
                const priceElement = el.querySelector("span.price-format.nowrap > span > span.value");
                const pennyElement = el.querySelector("span.price-format.nowrap > span > span.penny");
                const linkElement = el.querySelector("a.go-to-product");

                return {
                    title: titleElement ? titleElement.textContent.trim() : "Null",
                    price: priceElement && pennyElement ? parseFloat(priceElement.textContent.replace(/[^\d]/g, '') + '.' + pennyElement.textContent.replace(/,/g, '')) : null,
                    link: linkElement ? 'https://ceneo.pl' + linkElement.getAttribute('href') : "Null"
                };
            });

            await insert(productData, collectionReference);
        }

        hasNextPage = await getNextSite(page);
    }

    let collectionCount = await getCollectionSize(collectionName);
    console.log(collectionCount);

    await browser.close();
}

main();