export interface AgentAlert {
  id: number;
  severity: "Critical" | "High" | "Medium" | "Low";
  message: string;
}

export interface Agent {
  id: number;
  name: string;
  role: string;
  team: string;
  group: string;
  scope: "local" | "international";
  avatar: string;
  alerts: AgentAlert[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  streaming?: boolean;
}

export interface Alert {
  title: string;
  description: string;
  imageUrl: string;
}

export interface Resource {
  title: string;
  description: string;
  href: string;
  icon?: string;
  imageUrl?: string;
}
