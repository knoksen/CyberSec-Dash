// Azure Functions HTTP endpoint for agents
import { app, HttpRequest, HttpResponseInit } from "@azure/functions";

// Simple in-memory store (SWA Functions keep warm for a while)
let NEXT_ID = 1;
let AGENTS: any[] = [];

const ROLES = ["Analyst","Hunter","Responder","Threat Intel","Forensics","IR Lead","Purple Ops"] as const;
const TEAMS = ["Blue Team","Red Team","Purple Team"] as const;
const GROUPS = ["A","B","C","D","E","F"] as const;
const SKILLS = ["EDR","SIEM","DFIR","OSINT","YARA","Sigma","Malware","CloudSec","IAM","K8s","WAF","Forensics","ThreatHunt"] as const;

function rand<T>(arr: readonly T[]) { return arr[Math.floor(Math.random()*arr.length)]; }
function randint(min:number,max:number){ return Math.floor(Math.random()*(max-min+1))+min; }
function roleRiskBase(role:string){
  switch(role){
    case "Responder": return 65;
    case "IR Lead": return 60;
    case "Hunter": return 55;
    case "Forensics": return 50;
    case "Threat Intel": return 45;
    case "Analyst": return 40;
    default: return 50;
  }
}
function makeAgent(){
  const role = rand(ROLES) as string;
  const base = roleRiskBase(role);
  const a = {
    id: NEXT_ID++,
    name: `Agent-${String(NEXT_ID-1).padStart(3,"0")}`,
    team: rand(TEAMS),
    role,
    group: rand(GROUPS),
    risk: Math.min(100, Math.max(5, base + randint(-15, 20))),
    status: Math.random() < 0.8 ? "online" : Math.random() < 0.5 ? "offline" : "maintenance",
    lastSeenMins: randint(0, 45),
    uptime: randint(93, 100),
    skills: Array.from(new Set(Array.from({ length: 3 + randint(0, 2) }, () => rand(SKILLS))))
  };
  return a;
}
function ensureSeed(n=24){ if(AGENTS.length===0){ AGENTS = Array.from({length:n}, ()=> makeAgent()); } }

app.http("agents", {
  methods: ["GET","POST","DELETE","OPTIONS"],
  authLevel: "anonymous",
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return { status: 204, headers: cors() };

    ensureSeed();

    if (req.method === "GET") {
      const url = new URL(req.url);
      const q = url.searchParams.get("q")?.toLowerCase() || "";
      const team = url.searchParams.get("team") || "";
      const role = url.searchParams.get("role") || "";
      const data = AGENTS.filter((a)=>{
        const matchesQ = !q || `${a.name} ${a.team} ${a.role} ${a.group} ${a.skills.join(" ")}`.toLowerCase().includes(q);
        const matchesTeam = !team || a.team === team;
        const matchesRole = !role || a.role === role;
        return matchesQ && matchesTeam && matchesRole;
      });
      return { status: 200, jsonBody: { items: data, total: AGENTS.length }, headers: cors() };
    }

    if (req.method === "POST") {
      const body = await req.json().catch(()=>({} as any));
      const { add, scale } = body as { add?: number; scale?: number };
      if (typeof add === "number" && add > 0) {
        const newOnes = Array.from({length: add}, ()=> makeAgent());
        AGENTS = AGENTS.concat(newOnes);
        return { status: 200, jsonBody: { ok: true, added: newOnes.length, total: AGENTS.length }, headers: cors() };
      }
      if (typeof scale === "number" && scale > 0) {
        if (AGENTS.length > scale) AGENTS = AGENTS.slice(0, scale);
        else AGENTS = AGENTS.concat(Array.from({length: scale-AGENTS.length}, ()=> makeAgent()));
        return { status: 200, jsonBody: { ok: true, total: AGENTS.length }, headers: cors() };
      }
      return { status: 400, body: "Specify { add: n } or { scale: n }", headers: cors() };
    }

    if (req.method === "DELETE") {
      AGENTS = [];
      NEXT_ID = 1;
      return { status: 200, jsonBody: { ok: true, total: 0 }, headers: cors() };
    }

    return { status: 405, body: "Method not allowed", headers: cors() };
  }
});

function cors(){
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
