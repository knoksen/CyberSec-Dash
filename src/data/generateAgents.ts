import type { Agent, AgentAlert, Severity } from "@/types/agent";

// Mulberry32 PRNG for deterministic seeds
function mulberry32(seed: number) {
  return function() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TEAMS = ["Blue Team", "Red Team", "Purple Team", "Threat Intel"] as const;
const ROLES = ["Analyst", "Hunter", "Responder", "Engineer", "Data", "Manager"] as const;
const GROUPS = ["G1", "G2", "G3", "G4", "G5"] as const;
const CITIES = ["NYC", "SFO", "LON", "BER", "AMS", "OSL", "DXB", "TOK", "SYD", "SCL"];
const SKILLS = [
  "SIEM", "EDR", "Forensics", "Threat Hunting", "DFIR", "MITRE ATT&CK",
  "Sigma", "YARA", "KQL", "Zeek", "Suricata", "ML Anomaly", "Go", "Rust", "Python"
];

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function sample<T>(rng: () => number, arr: readonly T[], k: number): T[] {
  const a = [...arr];
  const out: T[] = [];
  while (out.length < k && a.length) {
    out.push(a.splice(Math.floor(rng() * a.length), 1)[0]);
  }
  return out;
}

function randomAlert(rng: () => number, id: number): AgentAlert {
  const sev: Severity = rng() < 0.05 ? "critical" : rng() < 0.25 ? "high" : rng() < 0.65 ? "medium" : "low";
  const msgs = [
    "Suspicious login from new ASN",
    "EDR quarantine event",
    "Privilege escalation attempt",
    "Beaconing pattern detected",
    "Exfil volume spike",
    "New rule triggered: SIG-4212",
  ];
  const now = Date.now();
  const ts = new Date(now - Math.floor(rng() * 24 * 60 * 60 * 1000)).toISOString();
  return { id: `${id}-${Math.floor(rng() * 1e9)}`, ts, severity: sev, message: pick(rng, msgs) };
}

export interface GenerateOptions { count?: number; seed?: number; alertsPerAgent?: [min: number, max: number]; }

export function generateAgents(opts: GenerateOptions = {}): Agent[] {
  const count = opts.count ?? 200;
  const seed = opts.seed ?? 1337;
  const [minA, maxA] = opts.alertsPerAgent ?? [0, 5];
  const rng = mulberry32(seed);

  const agents: Agent[] = [];
  for (let i = 0; i < count; i++) {
    const id = i + 1;
    const name = `Agent-${id.toString().padStart(3, "0")}`;
    const handle = `a${id}`;
    const team = pick(rng, TEAMS);
    const role = pick(rng, ROLES);
    const group = pick(rng, GROUPS);
    const risk = Math.floor(rng() * 90) + 5; // 5..95
    const lastActive = new Date(Date.now() - Math.floor(rng() * 72 * 3600 * 1000)).toISOString();
    const skills = sample(rng, SKILLS, 3 + Math.floor(rng() * 4));
    const location = pick(rng, CITIES);

    const aCount = minA + Math.floor(rng() * (maxA - minA + 1));
    const alerts24h = Array.from({ length: aCount }, () => randomAlert(rng, id));

    agents.push({ id, name, handle, team, role, group, skills, location, risk, lastActive, alerts24h });
  }
  return agents;
}
