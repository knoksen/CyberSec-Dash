export type Severity = "low" | "medium" | "high" | "critical";

export interface AgentAlert {
  id: string;
  ts: string; // ISO
  severity: Severity;
  message: string;
}

export interface Agent {
  id: number;
  name: string;
  handle: string; // short slug
  team: "Blue Team" | "Red Team" | "Purple Team" | "Threat Intel";
  role: "Analyst" | "Hunter" | "Responder" | "Engineer" | "Data" | "Manager";
  group: `G${1|2|3|4|5}` | string;
  skills: string[];
  location: string; // city / timezone code
  risk: number; // 0..100
  lastActive: string; // ISO
  alerts24h: AgentAlert[];
}
