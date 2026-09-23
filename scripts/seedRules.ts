import "./loadEnv";
import { addStyleRule } from "../src/lib/vectorStore";

const SEED_RULES = [
  "Never use passive voice in product documentation.",
  "Spell out numbers below 10; use digits for 10 and above.",
  "Use 'sign in' not 'log in' or 'login' as a verb.",
  "Keep sentences under 25 words where possible.",
  "Use Oxford commas in lists of three or more items.",
  "Address the reader directly with 'you', not 'the user'."
];

async function main() {
  for (const rule of SEED_RULES) {
    const id = await addStyleRule(rule);
    console.log(`Added rule: "${rule}" -> ${id}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});