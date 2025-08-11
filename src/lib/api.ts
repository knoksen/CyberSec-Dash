export type Agent = {
  id: number; name: string; team: string; role: string; group: string; risk: number;
  status: "online"|"offline"|"maintenance"; lastSeenMins: number; uptime: number; skills: string[];
};

export async function fetchAgents(params?: { q?: string; team?: string; role?: string }){
  const qs = new URLSearchParams(Object.entries(params||{}).filter(([,v])=> v)).toString();
  const res = await fetch(`/api/agents${qs?`?${qs}`:"[0m"}`);
  if(!res.ok) throw new Error(await res.text());
  return (await res.json()) as { items: Agent[]; total: number };
}

export async function addAgents(n: number){
  const res = await fetch(`/api/agents`, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ add: n }) });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function scaleAgents(n: number){
  const res = await fetch(`/api/agents`, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ scale: n }) });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}
