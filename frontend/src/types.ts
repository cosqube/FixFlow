export interface Cause {
  cause: string;
  likelihood: string;
}

export interface Action {
  title: string;
  description: string;
  expected_result: string;
}

export interface DiagnosisResponse {
  problem: string;
  category: string;
  severity: string;
  confidence: number;
  evidence: string[];
  possible_causes: Cause[];
  diagnosis: string;
  recommended_actions: Action[];
  warnings: string[];
  simple_explanation: string;
  technical_explanation: string;
  ide_agent_instructions: string;
  escalation_conditions: string[];
}
