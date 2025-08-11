
import { Agent } from './types';

export const AGENTS: Agent[] = [
  {
    id: 1,
    name: "Agent Nyx",
    role: "Lead",
    team: "Blue Team",
    group: "Infrastructure Security",
    scope: "international",
    avatar: "https://storage.googleapis.com/a1aa/image/904ba6ab-8902-4a9a-5452-40243933fbc9.jpg",
    alerts: [
      { id: 1, severity: 'Critical', message: 'Zero-day exploit detected' },
      { id: 2, severity: 'High', message: 'Unusual outbound traffic' },
    ]
  },
  {
    id: 2,
    name: "Agent Vex",
    role: "Analyst",
    team: "Red Team",
    group: "Threat Intelligence",
    scope: "international",
    avatar: "https://storage.googleapis.com/a1aa/image/cc5b3808-05db-4e9b-6e64-a7d1edcb7c86.jpg",
    alerts: [
      { id: 1, severity: 'High', message: 'Phishing campaign analysis' },
      { id: 2, severity: 'Medium', message: 'Malware signature updated' },
    ]
  },
  {
    id: 3,
    name: "Agent Kade",
    role: "Engineer",
    team: "Blue Team",
    group: "Response",
    scope: "local",
    avatar: "https://storage.googleapis.com/a1aa/image/59b33216-bdc0-4186-83fc-5eeb670880cd.jpg",
    alerts: [
        { id: 1, severity: 'Low', message: 'Routine system patching' },
    ]
  },
  {
    id: 4,
    name: "Agent Lyra",
    role: "Specialist",
    team: "Red Team",
    group: "Threat Intelligence",
    scope: "international",
    avatar: "https://storage.googleapis.com/a1aa/image/3a7f4f3d-1a2b-4f3e-9a7a-2f3b9a7c8d4e.jpg",
    alerts: [
        { id: 1, severity: 'High', message: 'New malware family identified' },
        { id: 2, severity: 'Medium', message: 'Reverse engineering C2 protocol' },
    ]
  },
  {
    id: 5,
    name: "Agent Mira",
    role: "Specialist",
    team: "Blue Team",
    group: "Infrastructure Security",
    scope: "local",
    avatar: "https://storage.googleapis.com/a1aa/image/7e8f9a2c-4b3d-4f6a-9a1b-3c2d4e5f6a7b.jpg",
    alerts: [
        { id: 1, severity: 'Medium', message: 'Firewall rule audit complete' },
    ]
  },
  {
    id: 6,
    name: "Agent Aria",
    role: "Analyst",
    team: "Blue Team",
    group: "Response",
    scope: "international",
    avatar: "https://storage.googleapis.com/a1aa/image/1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e.jpg",
    alerts: [
        { id: 1, severity: 'Critical', message: 'Active DDoS attack detected' },
        { id: 2, severity: 'High', message: 'Suspicious login spike' },
        { id: 3, severity: 'Low', message: 'SIEM alert volume normal' },
    ]
  },
];
