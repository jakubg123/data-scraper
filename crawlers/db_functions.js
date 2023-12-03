const {firestore, rl} = require('./data');
exports.createCollection = createCollection;
exports.getAllCollectionsAndCount = getAllCollectionsAndCount;
exports.getCollectionSize = getCollectionSize;

async function deleteCollection(collectionName, batchSize) {
    const exists = await collectionExists(collectionName);

    if (exists) {
        const collectionRef = firestore.collection(collectionName);
        const query = collectionRef.limit(batchSize);

        return new Promise((resolve, reject) => {
            deleteDocuments(query, batchSize, resolve).catch(reject);
        });
    } else {
        console.log(`Invalid collection name '${collectionName}'`);
    }
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

async function deleteAllCollections() {
    const collections = await firestore.listCollections();

    for (const collection of collections) {
        console.log(`Deleting collection: ${collection.id}`);

        const documents = await collection.listDocuments();
        const deletePromises = documents.map(doc => doc.delete());
        await Promise.all(deletePromises);

        console.log(`Deleted collection: ${collection.id}`);
    }

    console.log('All collections have been deleted.');
}

async function getAllDocuments(collectionName) {
    const exists = await collectionExists(collectionName);
    if (!exists) {
        console.log(`Invalid collection name '${collectionName}'`);
        return;
    }
    const collectionRef = firestore.collection(collectionName);
    const dbRecords = await collectionRef.get();

    if (dbRecords.empty) {
        console.log('No documents in the collection.');
        return;
    }

    dbRecords.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
    });
}


async function getCollectionSize(collectionName) {
    const exists = await collectionExists(collectionName)
    if (exists) {
        const collectionRef = firestore.collection(collectionName);
        const dbRecords = await collectionRef.get();
        return dbRecords.size;
    } else {
        console.log(`Invalid collection name:'${collectionName}'`);
    }

}

async function listAllCollections() {
    const collections = await firestore.listCollections();
    collections.forEach(collection => {
        console.log('Collection:', collection.id);
    });
}

async function collectionExists(collectionID) {
    const collectionRef = firestore.collection(collectionID);
    const dbRecords = await collectionRef.limit(1).get();
    return !dbRecords.empty;
}

async function getAllCollectionsAndCount() {
    try {
        const collections = await firestore.listCollections();
        const numberOfCollections = collections.length;
        console.log(`Total number of collections: ${numberOfCollections}`);

        return numberOfCollections;
    } catch (error) {
        console.error(error);
    }
}


async function getCollectionID() {
    const collectionCount = await getAllCollectionsAndCount();
    if (collectionCount !== 0) {
        const collections = await firestore.listCollections();
        collections.forEach((collection, index) => {
            console.log(`${collection.id}`);
        });

        const collectionName = await new Promise((resolve) => {
            rl.question('Choose collection: ', (answer) => {
                resolve(answer);
            });
        });

        if (collections.some(collection => collection.id === collectionName)) {
            return collectionName;
        }

    }
    return null;
}

async function createCollection() {
    let collectionName = await getCollectionID();
    if (collectionName === null) {
        collectionName = await new Promise((resolve) => {
            rl.question("Insert new collection name:", (answer) => {
                rl.close();
                resolve(answer);
            });
        });

        console.log(`Collection reference prepared for '${collectionName}'`);
    } else {
        console.log(`Using existing collection '${collectionName}'`);
    }

    return collectionName;
}


deleteAllCollections();