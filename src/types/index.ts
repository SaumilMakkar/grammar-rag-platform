


export interface CorrectionRequest {
  text: string;
  tone?: "neutral" | "formal" | "casual" | "confident" | "friendly";
  translateTo?: string; // ISO language name, optional
}

export interface CorrectionResponse {
  corrected: string;
  explanation: string;
  appliedRules: string[]; // which retrieved style rules were actually used
  translated?: string;
}
export interface StyleRule {
  _id?: string;
  text: string;
  embedding: number[];
  category?: string;
  userId: string; // owner — scopes retrieval and the rules list per user
  createdAt?: Date;
}

export interface RetrievalLogEntry {
  ruleText: string;
  score: number;
  wasApplied: boolean;
}