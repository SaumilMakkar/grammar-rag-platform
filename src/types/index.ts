export interface StyleRule {
  _id?: string;
  text: string; // e.g. "Never use passive voice in product docs"
  embedding: number[];
  category?: string; // e.g. "tone", "grammar", "terminology"
  createdAt?: Date;
}


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