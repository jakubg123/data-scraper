const puppeteer = require('puppeteer-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const {firestore} = require('./data.js');
const db = require('./db_functions.js');
const {getAllCollectionsAndCount} = require("./db_functions");
const {getCollectionSize} = require('./db_functions')
const utils = require('./utils');

// async function insert(productData, collectionReference) {
//     const documentRef = collectionReference.doc();
//     try {
//         await documentRef.set(productData);
//         console.log(`Document written with ID: ${documentRef.id}`);
//     } catch (error) {
//         console.error(`Error writing to document: ${documentRef.id}`, error);
//     }
// }

async function insert(productData, collectionReference, customDocumentId) {
    const documentRef = customDocumentId
        ? collectionReference.doc(customDocumentId)
        : collectionReference.doc();

    try {
        await documentRef.set(productData);
        console.log(`Document written with ID: ${documentRef.id}`);
    } catch (error) {
        console.error(`Error writing to document: ${documentRef.id}`, error);
    }
}


async function main() {
    puppeteer.use(stealth);
    const browser = await puppeteer.launch({
        headless: true,
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

    // const collectionName = await db.createCollection();
    const collectionReference = firestore.collection(searchPhrase);


    let hasNextPage = true;

    const currentDate = utils.getCurrentDate();

    while (hasNextPage) {
        let products = await utils.search(page, 'div.category-list-body', '.cat-prod-row');

        for (const product of products) {
            const mainProductElement = await product.evaluate(el => {
                const linkElement = el.querySelector("a.go-to-product");
                const titleElement = el.querySelector("strong > a > span");

                return {
                    title: titleElement ? titleElement.textContent : "Null",
                    link: linkElement ? 'https://ceneo.pl' + linkElement.getAttribute('href') : "Null"
                };

            });


            if (mainProductElement.link !== "Null") {
                const newPage = await browser.newPage();
                await newPage.goto(mainProductElement.link);
                try {
                    const element = await newPage.waitForSelector('#click > div:nth-child(2) > div.show-remaining-offers.card__body.pt-0 > span.link.link--accent.show-remaining-offers__trigger.js_remainingTrigger', { timeout: 4000 });
                    if (element) {
                        await element.click();
                    }
                } catch (error) {
                    console.log('Did not find the expander', error.message);
                }




                let detailedProductsList = [];

                let detailedProducts = await utils.search(newPage,
                    'section.product-offers.product-offers--standard.js_async-offers-section-standard > ul',
                    'section.product-offers.product-offers--standard.js_async-offers-section-standard > ul > li');

                for (const detailed of detailedProducts) {
                    const productData = await detailed.evaluate((el, mainLink) => {
                        const priceElement = el.querySelector("div.product-offer__product.js_product-offer__product.js_productName.specific-variant-content > div.product-offer__product__price > a > span > span > span.value");
                        const pennyElement = el.querySelector("div.product-offer__product.js_product-offer__product.js_productName.specific-variant-content > div.product-offer__product__price > a > span > span > span.penny");
                        const productOffer = el.querySelector("div.product-offer__product.js_product-offer__product.js_productName.specific-variant-content > div.product-offer__product__offer-details > div.product-offer__product__offer-details__name > a")
                        const company = el.querySelector("div.product-offer__details.js_offer-details > div.product-offer__details__toolbar > ul > li.offer-shop-opinions > a")


                        return {
                            price: priceElement && pennyElement ? parseFloat(priceElement.textContent.replace(/[^\d]/g, '') + '.' + pennyElement.textContent.replace(/,/g, '')).toFixed(2) : null,
                            link: productOffer ? (productOffer.getAttribute('href') !== "#" ? 'https://ceneo.pl' + productOffer.getAttribute('href') : mainLink) : "Null",
                            companyName: company ? company.textContent.trim().replace("Dane i opinie o ", "").replace(/\.pl$/, "").replace(/\.com$/, "") : "Null"

                        };
                    }, mainProductElement.link);


                    if (!utils.fieldIsNull(productData)) {
                        detailedProductsList.push(productData);
                    }



                }

                const completeProductData = {
                    detailedProducts: detailedProductsList,
                    mainProduct: mainProductElement,
                    date: currentDate
                };

                const customDocumentName = mainProductElement.title + " " + currentDate

                await insert(completeProductData, collectionReference, customDocumentName);

                await newPage.close();


            }

        }

        hasNextPage = await utils.getNextSite(page);
    }

    await page.close()
}

main().then(() => {
    console.log("Done");
});