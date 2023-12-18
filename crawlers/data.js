const {Firestore} = require('@google-cloud/firestore');
const firestore = new Firestore({
    projectId: 'data-db-406620',
    keyFilename: `${process.env.HOME}/data-db-406620-50268306fd82.json`,
});
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

exports.firestore = firestore;
exports.rl = rl;