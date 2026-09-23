import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB || "grammar_rag";

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables");
}

// Reuse the client across hot reloads / serverless invocations
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;

  const globalAny = global as unknown as { _mongoClient?: MongoClient };

  if (!globalAny._mongoClient) {
    const client = new MongoClient(uri);
    try {
      await client.connect();
    } catch (err) {
      await client.close().catch(() => {});
      throw err;
    }
    globalAny._mongoClient = client;
  }

  cachedClient = globalAny._mongoClient;
  cachedDb = cachedClient.db(dbName);
  return cachedDb;
}

export async function getRulesCollection() {
  const db = await getDb();
  return db.collection("style_rules");
}

export async function getHistoryCollection() {
  const db = await getDb();
  return db.collection("correction_history");
}