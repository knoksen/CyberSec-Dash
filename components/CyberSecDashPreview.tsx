import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer } from "recharts";
import { ShieldCheck, AlertTriangle, Search, Filter, Send, Bot, Users, Activity, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- Mock Data ---------------------------------------------------------------
const AGENTS = Array.from({ length: 8 }).map((_, i) => ({
	id: i + 1,
	name: `Agent-${i + 1}`,
	team: i % 2 === 0 ? "Blue Team" : "Red Team",
	role: ["Analyst", "Hunter", "Responder"][i % 3],
	group: ["A", "B", "C"][i % 3],
	risk: Math.floor(Math.random() * 50) + 25,
}));

const seedSeries = () =>
	Array.from({ length: 24 }, (_, i) => ({ t: i, value: Math.max(5, Math.round(40 + 10 * Math.sin(i / 2))) }));

// --- Components --------------------------------------------------------------
function Header({ onReset }: { onReset: () => void }) {
	return (
		<div className="flex items-center justify-between gap-3">
			<div className="flex items-center gap-3">
				<div className="p-2 rounded-2xl bg-gray-900 text-white"><ShieldCheck className="w-5 h-5" /></div>
				<div>
					<h1 className="text-2xl font-semibold">CyberSec‑Dash</h1>
					<p className="text-sm text-muted-foreground">Live preview (mocked data)</p>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="outline" onClick={onReset} className="rounded-2xl"><Zap className="w-4 h-4 mr-2"/>Reset</Button>
						</TooltipTrigger>
						<TooltipContent>Reset demo state</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<Button className="rounded-2xl"><Bot className="w-4 h-4 mr-2"/>AI Assist</Button>
			</div>
		</div>
	);
}

function Stat({ icon: Icon, label, value }: any) {
	return (
		<Card className="rounded-2xl">
			<CardContent className="p-4">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-xl bg-gray-100"><Icon className="w-5 h-5"/></div>
					<div>
						<div className="text-xs text-muted-foreground">{label}</div>
						<div className="text-lg font-semibold">{value}</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function FilterBar({ onFilter }: { onFilter: (q: string) => void }) {
	const [q, setQ] = useState("");
	useEffect(() => { onFilter(q); }, [q, onFilter]);
	return (
		<div className="flex items-center gap-2">
			<div className="relative flex-1">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
				<Input className="pl-9 rounded-2xl" placeholder="Search agents, teams..." value={q} onChange={(e) => setQ(e.target.value)} />
			</div>
			<Button variant="outline" className="rounded-2xl"><Filter className="w-4 h-4 mr-2"/>Filters</Button>
		</div>
	);
}

function AgentCard({ agent, onSelect }: { agent: any; onSelect: (a: any) => void }) {
	const color = agent.risk > 75 ? "bg-red-500" : agent.risk > 50 ? "bg-amber-500" : "bg-emerald-500";
	return (
		<motion.div layout>
			<Card onClick={() => onSelect(agent)} className="cursor-pointer rounded-2xl hover:shadow-lg transition">
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<div className="font-medium">{agent.name}</div>
							<div className="text-xs text-muted-foreground">{agent.team} • {agent.role} • G{agent.group}</div>
						</div>
						<Badge variant="secondary" className="rounded-xl">ID {agent.id}</Badge>
					</div>
					<div className="mt-3">
						<div className="flex items-center justify-between text-xs mb-1"><span>Risk</span><span>{agent.risk}%</span></div>
						<Progress value={agent.risk} className="h-2 rounded-full"/>
						<div className="mt-2 h-1.5 rounded-full w-12"/>
						<div className={`mt-2 h-1.5 rounded-full w-1/3 ${color}`}/>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

function AgentGrid({ items, onSelect }: { items: any[]; onSelect: (a: any) => void }) {
	return (
		<div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			<AnimatePresence>
				{items.map((a) => (
					<motion.div key={a.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
						<AgentCard agent={a} onSelect={onSelect} />
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}

function MiniChart({ data }: { data: { t: number; value: number }[] }) {
	return (
		<Card className="rounded-2xl">
			<CardContent className="p-4 h-40">
				<div className="text-xs text-muted-foreground mb-2">Alert volume (24h)</div>
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
						<XAxis hide dataKey="t"/>
						<YAxis hide/>
						<RTooltip/>
						<Line type="monotone" dataKey="value" dot={false} strokeWidth={2} />
					</LineChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

function ChatBox() {
	const [input, setInput] = useState("");
	const [msgs, setMsgs] = useState<{ role: "user" | "bot"; text: string; id: string }[]>([
		{ role: "bot", text: "Hi! Ask me about agent risk or recent alerts.", id: window.crypto.randomUUID() },
	]);
	const listRef = useRef<HTMLDivElement>(null);
	useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [msgs]);

	const send = async () => {
		if (!input.trim()) return;
		const userMsg = { role: "user" as const, text: input.trim(), id: window.crypto.randomUUID() };
		setMsgs((m) => [...m, userMsg]);
		setInput("");
		// Mock streaming reply
		const replyId = window.crypto.randomUUID();
		setMsgs((m) => [...m, { role: "bot", text: "", id: replyId }]);
		const chunks = ["Analyzing signals…", "Correlating alerts…", "Most risk: Agent‑3 (82%)."];
		for (const c of chunks) {
			await new Promise((r) => setTimeout(r, 600));
			setMsgs((m) => m.map((x) => (x.id === replyId ? { ...x, text: c } : x)));
		}
	};

	return (
		<Card className="rounded-2xl h-full">
			<CardContent className="p-0 h-full flex flex-col">
				<div ref={listRef} className="flex-1 overflow-auto p-4 space-y-3">
					{msgs.map((m) => (
						<div key={m.id} className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : ""}`}>
							<div className={`rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-gray-900 text-white" : "bg-gray-100"}`}>{m.text}</div>
						</div>
					))}
				</div>
				<div className="p-3 border-t flex items-center gap-2">
					<Input placeholder="Ask the AI…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} className="rounded-2xl" />
					<Button onClick={send} className="rounded-2xl"><Send className="w-4 h-4"/></Button>
				</div>
			</CardContent>
		</Card>
	);
}

export default function CyberSecDashPreview() {
	const [series, setSeries] = useState(seedSeries());
	const [agents, setAgents] = useState(AGENTS);
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<any | null>(null);
	const [alerts, setAlerts] = useState<{ id: string; text: string; sev: "low"|"med"|"high" }[]>([]);

	// Simulate live alerts + risk drift
	useEffect(() => {
		const timer = setInterval(() => {
			// drift risk
			setAgents((prev) => prev.map((a) => ({ ...a, risk: Math.max(0, Math.min(100, a.risk + (Math.random() < 0.5 ? -1 : 1))) })));
			// append alert
			const pick = prevPick(agents);
			const sev = Math.random() < 0.15 ? "high" : Math.random() < 0.5 ? "med" : "low";
			setAlerts((arr) => [
				...arr.slice(-6),
				{ id: window.crypto.randomUUID(), text: `${pick.name} anomaly in ${pick.group} group`, sev },
			]);
			// update chart
			setSeries((s) => {
				const next = s.slice(1).concat({ t: s[s.length - 1].t + 1, value: Math.max(5, s[s.length - 1].value + (Math.random() < 0.5 ? -2 : 2)) });
				return next;
			});
		}, 1500);
		return () => clearInterval(timer);
	}, [agents]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return agents;
		return agents.filter((a) => `${a.name} ${a.team} ${a.role} ${a.group}`.toLowerCase().includes(q));
	}, [agents, query]);

	const high = agents.filter((a) => a.risk >= 70).length;
	const med = agents.filter((a) => a.risk >= 40 && a.risk < 70).length;

	return (
		<div className="p-6 space-y-6">
			<Header onReset={() => { setAgents(AGENTS); setQuery(""); setSeries(seedSeries()); setAlerts([]); setSelected(null); }} />

			{/* Top stats */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Stat icon={Activity} label="Active agents" value={agents.length} />
				<Stat icon={Users} label="High risk" value={high} />
				<Stat icon={AlertTriangle} label="Medium risk" value={med} />
				<Stat icon={ShieldCheck} label="Coverage" value={`${90 + Math.floor(Math.random()*10)}%`} />
			</div>

			<FilterBar onFilter={setQuery} />

			<div className="grid lg:grid-cols-3 gap-4">
				{/* Grid */}
				<div className="lg:col-span-2 space-y-4">
					<AgentGrid items={filtered} onSelect={setSelected} />
				</div>
				{/* Side panel */}
				<div className="space-y-4">
					<MiniChart data={series} />
					<Card className="rounded-2xl">
						<CardContent className="p-4 space-y-3">
							<div className="flex items-center gap-2 text-sm font-medium"><AlertTriangle className="w-4 h-4 text-amber-500"/> Live alerts</div>
							<div className="space-y-2 max-h-44 overflow-auto pr-1">
								<AnimatePresence>
									{alerts.map((a) => (
										<motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm flex items-center gap-2">
											<span className={`w-2 h-2 rounded-full ${a.sev === "high" ? "bg-red-500" : a.sev === "med" ? "bg-amber-500" : "bg-emerald-500"}`} />
											<span>{a.text}</span>
										</motion.div>
									))}
								</AnimatePresence>
							</div>
						</CardContent>
					</Card>
					<ChatBox />
				</div>
			</div>

			{/* Modal */}
			<AnimatePresence>
				{selected && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
						<motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-xl font-semibold">{selected.name}</h3>
									<p className="text-sm text-muted-foreground">{selected.team} • {selected.role} • Group {selected.group}</p>
								</div>
								<Badge className="rounded-xl" variant="secondary">Risk {selected.risk}%</Badge>
							</div>
							<div className="mt-4 space-y-2 text-sm">
								<p>Last event: Suspicious login from unknown ASN.</p>
								<p>Recommendation: Enforce MFA and rotate device tokens.</p>
							</div>
							<div className="mt-6 flex justify-end">
								<Button className="rounded-2xl" onClick={() => setSelected(null)}>Close</Button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function prevPick(list: any[]) {
	return list[Math.floor(Math.random() * list.length)];
}
