import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function connectToMongoDB() {
	try {
		await client.connect();
	} catch (error) {
		console.error(error);
	} finally {
		// await client.close();
	}
}
connectToMongoDB().then(() => {});
