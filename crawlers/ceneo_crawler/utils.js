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
    return new Date();
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



module.exports = { getCurrentDate, fieldIsNull, sleep, search};
