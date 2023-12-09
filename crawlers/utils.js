class Product {
    constructor(title, price, link, company, date) {
        this.title = title;
        this.price = price;
        this.link = link;
        this.company = company;
        this.date = date;
    }
}

function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function fieldIsNull(productData) {
    for (let key in productData) {
        if (productData[key] === "Null") {
            return true;
        }
    }
    return false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function search(page, waitSelector, getSelector){
    await page.waitForSelector(waitSelector, {timeout : 20000});
    return page.$$(getSelector);
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

module.exports = { getCurrentDate, fieldIsNull, sleep, search, getNextSite };
