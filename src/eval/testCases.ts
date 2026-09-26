export interface EvalCase {
  text: string;
  expectedRules: string[]; // exact rule text that SHOULD be retrieved for this input
}

export const EVAL_CASES: EvalCase[] = [
  {
    text: "The report was submitted by the team.",
    expectedRules: ["Never use passive voice in product documentation."]
  },
  {
    text: "The system was accessed by 3 users yesterday.",
    expectedRules: [
      "Never use passive voice in product documentation.",
      "Spell out numbers below 10; use digits for 10 and above."
    ]
  },
  {
    text: "Please login to continue.",
    expectedRules: ["Use 'sign in' not 'log in' or 'login' as a verb."]
  },
  {
    text: "The user should login to view their profile.",
    expectedRules: [
      "Use 'sign in' not 'log in' or 'login' as a verb.",
      "Address the reader directly with 'you', not 'the user'."
    ]
  },
  {
    text: "We support red, green and blue themes.",
    expectedRules: ["Use Oxford commas in lists of three or more items."]
  },
  {
    text: "The user has 5 saved items in their cart.",
    expectedRules: [
      "Address the reader directly with 'you', not 'the user'.",
      "Spell out numbers below 10; use digits for 10 and above."
    ]
  },
  {
    text: "This is a normal, correctly written sentence.",
    expectedRules: [] // deliberately no relevant rule — tests that retrieval doesn't force a match
  }
];