import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;

const globalAny = global as unknown as { _mongoClientPromise?: Promise<MongoClient> };

const clientPromise: Promise<MongoClient> =
  globalAny._mongoClientPromise ?? (globalAny._mongoClientPromise = new MongoClient(uri).connect());

export default clientPromise;