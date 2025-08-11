export function startMockAlerts(onEvent: (evt: { agentId: number; delta: number }) => void) {
  const t = window.setInterval(() => {
    const agentId = 1 + Math.floor(Math.random() * 300);
    const delta = Math.random() < 0.5 ? -1 : 1;
    onEvent({ agentId, delta });
  }, 2500);
  return () => window.clearInterval(t);
}
