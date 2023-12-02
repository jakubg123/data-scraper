const {Firestore} = require('@google-cloud/firestore');
const firestore = new Firestore({
    projectId: 'data-db-406620',
    keyFilename: '/home/jakubg/data-db-406620-2fe1ab987b4d.json',
});
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

exports.firestore = firestore;
exports.rl = rl;