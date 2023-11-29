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
    const url = process.argv[2];
    await page.goto(url);
    await page.waitForXPath('//*[@id="body"]/div/div/div[3]/div/section/div[5]', { timeout: 100000 })

    const products = await page.$$('.cat-prod-row');

    let items = [];

    for (const product of products) {
        try {
            const title = await page.evaluate(
                el => el.querySelector("strong > a > span").textContent,
                product
            );
            items.push(new Product(title));
            console.log(title);
        } catch (error) {
            console.error("Error extracting product title:", error.message);
        }
    }

    console.log(items);

    await browser.close();
});

class Product {
    constructor(title) {
        this.title = title;
    }
}

