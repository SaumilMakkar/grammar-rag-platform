import "./loadEnv";
import { getRulesCollection } from "../src/lib/db";

const INDEX_NAME = "style_rules_vector_index";

const DEFINITION = {
  fields: [
    {
      type: "vector",
      path: "embedding",
      numDimensions: 384, // matches all-MiniLM-L6-v2's output size
      similarity: "cosine"
    },
    {
      type: "filter",
      path: "userId"
    }
  ]
};

async function main() {
  const collection = await getRulesCollection();

  try {
    await collection.createSearchIndex({
      name: INDEX_NAME,
      type: "vectorSearch",
      definition: DEFINITION
    });
    console.log("Vector index creation requested — it builds asynchronously.");
    console.log("Check status in Atlas UI under your collection's 'Search Indexes' tab.");
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === 68) {
      console.log(`${INDEX_NAME} already exists — syncing its definition instead.`);
      await collection.updateSearchIndex(INDEX_NAME, DEFINITION);
      console.log("Definition update requested — it rebuilds asynchronously.");
    } else {
      throw err;
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});