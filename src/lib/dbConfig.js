import { MongoClient, ServerApiVersion } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

export async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("jobs-master");
  }
  return db;
}

export async function closeDB() {
  await client.close();
}