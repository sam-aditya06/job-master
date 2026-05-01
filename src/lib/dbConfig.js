import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

let cached = global._mongo || { client: null, db: null, promise: null };

export async function connectDB() {

  if (cached.db) return cached.db;

  if (!cached.promise) {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    cached.promise = client.connect();
    cached.client = client;
  }

  await cached.promise;
  cached.db = cached.client.db("jobs-master");

  global._mongo = cached;

  if (cached.db) {
    return cached.db;
  }
}