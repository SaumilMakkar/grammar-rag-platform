import "./loadEnv";
import { addStyleRule } from "../src/lib/vectorStore";
import { DEFAULT_STYLE_RULES } from "../src/lib/defaultRules";

// Rules are scoped per-user; override with a real signed-in user's id if you
// want these to actually show up in the app for that account.
const SEED_USER_ID = process.env.SEED_USER_ID || "seed-user";

async function main() {
  for (const rule of DEFAULT_STYLE_RULES) {
    const id = await addStyleRule(rule, SEED_USER_ID);
    console.log(`Added rule: "${rule}" -> ${id}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});