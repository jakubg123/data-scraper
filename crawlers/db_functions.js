const firestore = require('./data.js');
async function deleteCollection(collectionPath, batchSize) {
    const collectionRef = firestore.collection(collectionPath);
    const query = collectionRef.limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteDocuments(query, batchSize, resolve).catch(reject);
    });
}

async function deleteDocuments(query, batchSize, resolve) {
    const dbRecords = await query.get();

    if (dbRecords.size === 0) {
        resolve();
        return;
    }

    const batch = firestore.batch();
    dbRecords.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();

    process.nextTick(() => {
        deleteDocuments(query, batchSize, resolve);
    });
}

async function getCollectionSize(collectionPath){
    const collectionRef = firestore.collection(collectionPath);
    const dbRecords = await collectionRef.get();

    return dbRecords.size;


}

async function getAllDocuments(collectionPath) {
    const collectionRef = firestore.collection(collectionPath);
    const dbRecords = await collectionRef.get();

    if (dbRecords.empty) {
        console.log('No documents.');
        return;
    }

    dbRecords.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
    });
}

const collectionPath = 'data-scraper';
batchSize = 300;

getCollectionSize(collectionPath)
    .then(count => console.log(`Number of documents in '${collectionPath}': ${count}`))


getAllDocuments(collectionPath)
    .then(() => console.log('All records retrieved'))

deleteCollection(collectionPath, batchSize)
    .then(() => console.log('Collection deleted'))


