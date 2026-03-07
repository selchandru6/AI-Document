import { useState, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════
// ADLC MISSION CONTROL CENTER — Enterprise Multi-Workflow MCC
// Agent Villages | MCP Tools | Resource Health | Operations Console
// ═══════════════════════════════════════════════════════════════════

const VZ = { red: "#ee0000", black: "#000", white: "#fff", gray: "#f6f6f6", border: "#d8dada", darkGray: "#333", midGray: "#666", lightGray: "#e8e8e8" };

// ═══ SIMULATED DATA ═══
const WORKFLOWS = [
  { id: "billing-remediation", name: "Billing Remediation", team: "Billing Ops", status: "running", requests: 342, avgLatency: 1240, successRate: 97.3 },
  { id: "incident-response", name: "Incident Response", team: "SRE", status: "running", requests: 89, avgLatency: 3400, successRate: 94.1 },
  { id: "network-diagnostics", name: "Network Diagnostics", team: "Network Eng", status: "idle", requests: 0, avgLatency: 0, successRate: 0 },
  { id: "customer-onboarding", name: "Customer Onboarding", team: "CX Platform", status: "running", requests: 1203, avgLatency: 890, successRate: 99.1 },
];

const AGENT_VILLAGE = [
  { id: "orch-billing", name: "Orchestrator", workflow: "billing-remediation", status: "active", type: "orchestrator", tokens: 45200, calls: 342, latency: 120, icon: "⚡" },
  { id: "analyst-billing", name: "Analyst", workflow: "billing-remediation", status: "active", type: "worker", tokens: 23100, calls: 340, latency: 340, icon: "🔍" },
  { id: "remediator-billing", name: "Remediator", workflow: "billing-remediation", status: "processing", type: "worker", tokens: 31200, calls: 289, latency: 780, icon: "🔧" },
  { id: "hitl-billing", name: "HITL", workflow: "billing-remediation", status: "hitl_waiting", type: "mandatory", tokens: 0, calls: 53, latency: 45000, icon: "👤" },
  { id: "alerts-billing", name: "Alerts", workflow: "billing-remediation", status: "active", type: "mandatory", tokens: 1200, calls: 12, latency: 50, icon: "🚨" },
  { id: "monitor-billing", name: "Monitoring", workflow: "billing-remediation", status: "active", type: "mandatory", tokens: 800, calls: 342, latency: 30, icon: "📊" },
  { id: "orch-incident", name: "Orchestrator", workflow: "incident-response", status: "active", type: "orchestrator", tokens: 18900, calls: 89, latency: 200, icon: "⚡" },
  { id: "rca-incident", name: "RCA Agent", workflow: "incident-response", status: "processing", type: "worker", tokens: 42000, calls: 87, latency: 2100, icon: "🔬" },
  { id: "doc-incident", name: "Document Agent", workflow: "incident-response", status: "active", type: "worker", tokens: 15600, calls: 85, latency: 600, icon: "📄" },
  { id: "alerts-incident", name: "Alerts", workflow: "incident-response", status: "error", type: "mandatory", tokens: 400, calls: 3, latency: 0, icon: "🚨" },
  { id: "hitl-incident", name: "HITL", workflow: "incident-response", status: "active", type: "mandatory", tokens: 0, calls: 22, latency: 30000, icon: "👤" },
  { id: "monitor-incident", name: "Monitoring", workflow: "incident-response", status: "active", type: "mandatory", tokens: 600, calls: 89, latency: 25, icon: "📊" },
  { id: "orch-onboard", name: "Orchestrator", workflow: "customer-onboarding", status: "active", type: "orchestrator", tokens: 89000, calls: 1203, latency: 90, icon: "⚡" },
  { id: "validator-onboard", name: "Validator", workflow: "customer-onboarding", status: "active", type: "worker", tokens: 34000, calls: 1200, latency: 200, icon: "✅" },
  { id: "doc-onboard", name: "Document Agent", workflow: "customer-onboarding", status: "active", type: "worker", tokens: 28000, calls: 1198, latency: 400, icon: "📄" },
  { id: "hitl-onboard", name: "HITL", workflow: "customer-onboarding", status: "active", type: "mandatory", tokens: 0, calls: 45, latency: 20000, icon: "👤" },
  { id: "alerts-onboard", name: "Alerts", workflow: "customer-onboarding", status: "active", type: "mandatory", tokens: 200, calls: 5, latency: 40, icon: "🚨" },
  { id: "monitor-onboard", name: "Monitoring", workflow: "customer-onboarding", status: "active", type: "mandatory", tokens: 400, calls: 1203, latency: 20, icon: "📊" },
  // RL & LLM Agents (cross-workflow)
  { id: "rl-feedback", name: "RL Feedback Collector", workflow: "all-workflows", status: "active", type: "rl", tokens: 2400, calls: 1847, latency: 15, icon: "🧠" },
  { id: "rl-tuner", name: "Prompt Tuner", workflow: "all-workflows", status: "processing", type: "rl", tokens: 18000, calls: 14, latency: 45000, icon: "🎯" },
  { id: "llm-gateway", name: "LLM Gateway", workflow: "all-workflows", status: "active", type: "infra", tokens: 0, calls: 16662, latency: 8, icon: "🌐" },
  { id: "llm-evaluator", name: "LLM Output Evaluator", workflow: "all-workflows", status: "active", type: "rl", tokens: 8400, calls: 3842, latency: 120, icon: "⚖️" },
];

const MCP_TOOLS = [
  { name: "query_vectordb", type: "Knowledge", agents: 14, calls: 4280, status: "healthy", latency: 45 },
  { name: "send_alert", type: "Notification", agents: 4, calls: 20, status: "healthy", latency: 120 },
  { name: "execute_action", type: "Execution", agents: 3, calls: 289, status: "healthy", latency: 340 },
  { name: "search_logs", type: "Observability", agents: 2, calls: 174, status: "healthy", latency: 220 },
  { name: "request_approval", type: "HITL", agents: 4, calls: 120, status: "healthy", latency: 80 },
  { name: "generate_doc", type: "Documentation", agents: 3, calls: 1283, status: "healthy", latency: 890 },
  { name: "validate_rules", type: "Compliance", agents: 2, calls: 1200, status: "healthy", latency: 150 },
  { name: "create_plan", type: "Planning", agents: 2, calls: 289, status: "degraded", latency: 1200 },
  { name: "correlate_events", type: "Analytics", agents: 1, calls: 87, status: "healthy", latency: 560 },
  { name: "check_sla", type: "Monitoring", agents: 4, calls: 1634, status: "healthy", latency: 30 },
  { name: "poll_metrics", type: "Monitoring", agents: 4, calls: 1634, status: "healthy", latency: 25 },
  { name: "trigger_self_heal", type: "Resilience", agents: 4, calls: 3, status: "healthy", latency: 1500 },
  // LLM & RL Tools
  { name: "llm_invoke", type: "LLM Gateway", agents: 14, calls: 16662, status: "healthy", latency: 680 },
  { name: "llm_evaluate", type: "LLM Evaluation", agents: 6, calls: 3842, status: "healthy", latency: 120 },
  { name: "collect_feedback", type: "RL Feedback", agents: 8, calls: 1847, status: "healthy", latency: 15 },
  { name: "tune_prompt", type: "RL Tuning", agents: 1, calls: 14, status: "healthy", latency: 45000 },
  { name: "embed_document", type: "Embedding", agents: 2, calls: 48200, status: "healthy", latency: 120 },
  { name: "ab_test_route", type: "Experiment", agents: 3, calls: 716, status: "healthy", latency: 5 },
];

const RESOURCES = [
  { name: "Redis Cluster", type: "Cache/PubSub", status: "healthy", uptime: "99.99%", connections: 24, memory: "2.1GB/8GB", icon: "🔴" },
  { name: "Kafka Cluster", type: "Event Bus", status: "healthy", uptime: "99.97%", connections: 12, memory: "3 brokers", icon: "📨" },
  { name: "OpenSearch", type: "Vector DB", status: "healthy", uptime: "99.95%", connections: 8, memory: "12GB/32GB", icon: "🔎" },
  { name: "Oracle DB", type: "RDBMS", status: "healthy", uptime: "99.99%", connections: 16, memory: "48GB/128GB", icon: "🛢️" },
  { name: "OpenAI API", type: "LLM Provider", status: "healthy", uptime: "99.80%", connections: 4, memory: "Rate: 60K TPM", icon: "🤖" },
  { name: "Prometheus", type: "Metrics", status: "healthy", uptime: "99.99%", connections: 18, memory: "5.2GB/16GB", icon: "📈" },
  { name: "Cassandra", type: "NoSQL", status: "degraded", uptime: "99.90%", connections: 6, memory: "28GB/64GB", icon: "🗄️" },
];

// ═══ TRIGGER DEFINITIONS ═══
const TRIGGER_CONFIGS = [
  // Manual triggers
  { id: "trg-manual-billing", workflow: "billing-remediation", type: "manual", label: "Run Billing Remediation", desc: "Manually trigger billing profile analysis and remediation", icon: "🖱️", lastRun: "2 min ago", runCount: 342, avgDuration: "18s" },
  { id: "trg-manual-incident", workflow: "incident-response", type: "manual", label: "Run Incident Response", desc: "Manually trigger incident RCA and resolution", icon: "🖱️", lastRun: "12 min ago", runCount: 89, avgDuration: "45s" },
  { id: "trg-manual-onboard", workflow: "customer-onboarding", type: "manual", label: "Run Customer Onboarding", desc: "Manually trigger customer onboarding validation", icon: "🖱️", lastRun: "1 min ago", runCount: 1203, avgDuration: "12s" },
  { id: "trg-manual-network", workflow: "network-diagnostics", type: "manual", label: "Run Network Diagnostics", desc: "Manually trigger network health analysis", icon: "🖱️", lastRun: "Never", runCount: 0, avgDuration: "—" },
  // Cron triggers
  { id: "trg-cron-billing", workflow: "billing-remediation", type: "cron", label: "Billing Daily Scan", desc: "Scans all billing profiles for anomalies daily at 2:00 AM EST", cron: "0 2 * * *", schedule: "Daily @ 02:00", nextRun: "Tomorrow 02:00 AM", icon: "⏰", status: "active", lastRun: "Today 02:00 AM", runCount: 128, avgDuration: "4m 20s" },
  { id: "trg-cron-sla", workflow: "incident-response", type: "cron", label: "SLA Health Check", desc: "Checks all SLA metrics every 15 minutes", cron: "*/15 * * * *", schedule: "Every 15 min", nextRun: "In 8 min", icon: "⏰", status: "active", lastRun: "7 min ago", runCount: 4320, avgDuration: "6s" },
  { id: "trg-cron-compliance", workflow: "customer-onboarding", type: "cron", label: "Compliance Audit", desc: "Weekly compliance check on all onboarded customers", cron: "0 6 * * 1", schedule: "Weekly Mon @ 06:00", nextRun: "Mon 06:00 AM", icon: "⏰", status: "active", lastRun: "Last Mon 06:00", runCount: 52, avgDuration: "12m 30s" },
  { id: "trg-cron-cleanup", workflow: "billing-remediation", type: "cron", label: "Stale Profile Cleanup", desc: "Cleans up orphaned remediation records monthly", cron: "0 3 1 * *", schedule: "Monthly 1st @ 03:00", nextRun: "Apr 1 03:00 AM", icon: "⏰", status: "paused", lastRun: "Mar 1 03:00", runCount: 12, avgDuration: "8m" },
  // Event-driven triggers
  { id: "trg-event-kafka-billing", workflow: "billing-remediation", type: "event", label: "Kafka: billing.profile.changed", desc: "Triggers when a billing profile is created or modified in upstream system", source: "Kafka", topic: "billing.profile.changed", icon: "⚡", status: "listening", eventsToday: 187, lastEvent: "14 sec ago", avgDuration: "18s" },
  { id: "trg-event-kafka-incident", workflow: "incident-response", type: "event", label: "Kafka: alerts.critical.fired", desc: "Triggers on P1/P2 critical alert from monitoring stack", source: "Kafka", topic: "alerts.critical.fired", icon: "⚡", status: "listening", eventsToday: 3, lastEvent: "12 min ago", avgDuration: "45s" },
  { id: "trg-event-webhook", workflow: "customer-onboarding", type: "event", label: "Webhook: /api/onboard", desc: "REST webhook triggered by CRM when new customer is registered", source: "Webhook", topic: "POST /api/v1/onboard", icon: "🌐", status: "listening", eventsToday: 64, lastEvent: "1 min ago", avgDuration: "12s" },
  { id: "trg-event-s3", workflow: "billing-remediation", type: "event", label: "S3: billing-exports/", desc: "Triggers when new CSV/Parquet file lands in billing exports bucket", source: "S3 Event", topic: "s3://billing-exports/daily/", icon: "📦", status: "listening", eventsToday: 1, lastEvent: "Today 02:15 AM", avgDuration: "4m 20s" },
  { id: "trg-event-db", workflow: "incident-response", type: "event", label: "Oracle CDC: incident_log", desc: "Change Data Capture on incident_log table — triggers on new INSERT", source: "Oracle CDC", topic: "incident_log.INSERT", icon: "🛢️", status: "listening", eventsToday: 23, lastEvent: "7 min ago", avgDuration: "45s" },
  { id: "trg-event-redis", workflow: "network-diagnostics", type: "event", label: "Redis PubSub: network.anomaly", desc: "Subscribes to real-time network anomaly detection channel", source: "Redis PubSub", topic: "network.anomaly.detected", icon: "🔴", status: "idle", eventsToday: 0, lastEvent: "Never", avgDuration: "—" },
];

// ═══ LLM PROVIDERS & MODEL REGISTRY ═══
const LLM_PROVIDERS = [
  { id: "openai-gpt4o", provider: "OpenAI", model: "gpt-4o", status: "active", calls: 3842, tokens: { input: 2840000, output: 1420000 }, cost: 42.60, avgLatency: 890, p99Latency: 2400, errorRate: 0.3, rateLimit: "60K TPM", used: "42K TPM", icon: "🟢" },
  { id: "openai-gpt4o-mini", provider: "OpenAI", model: "gpt-4o-mini", status: "active", calls: 12400, tokens: { input: 8200000, output: 3100000 }, cost: 9.84, avgLatency: 340, p99Latency: 890, errorRate: 0.1, rateLimit: "200K TPM", used: "112K TPM", icon: "🟢" },
  { id: "anthropic-sonnet", provider: "Anthropic", model: "claude-sonnet-4-20250514", status: "standby", calls: 0, tokens: { input: 0, output: 0 }, cost: 0, avgLatency: 0, p99Latency: 0, errorRate: 0, rateLimit: "40K TPM", used: "0", icon: "🟡" },
  { id: "ollama-llama", provider: "Ollama (Local)", model: "llama3.1:70b", status: "active", calls: 420, tokens: { input: 310000, output: 180000 }, cost: 0, avgLatency: 1200, p99Latency: 3800, errorRate: 1.2, rateLimit: "Local GPU", used: "A100 80GB", icon: "🟢" },
  { id: "openai-embed", provider: "OpenAI", model: "text-embedding-3-large", status: "active", calls: 48200, tokens: { input: 14200000, output: 0 }, cost: 1.85, avgLatency: 120, p99Latency: 340, errorRate: 0.05, rateLimit: "1M TPM", used: "142K TPM", icon: "🟢" },
];

// ═══ REINFORCEMENT LEARNING & FEEDBACK ═══
const RL_METRICS = {
  totalFeedback: 1847,
  positiveRate: 89.2,
  negativeRate: 10.8,
  promptVersions: 14,
  activeExperiments: 3,
  lastTuning: "2 hours ago",
  agents: [
    { agent: "Analyst", workflow: "billing-remediation", accuracy: 94.2, trend: [88, 90, 91, 92, 93, 94, 94.2], feedback: { positive: 312, negative: 28 }, promptVersion: "v3.2", lastTuned: "2h ago" },
    { agent: "Remediator", workflow: "billing-remediation", accuracy: 91.8, trend: [85, 87, 88, 90, 91, 91.5, 91.8], feedback: { positive: 264, negative: 25 }, promptVersion: "v2.8", lastTuned: "6h ago" },
    { agent: "RCA Agent", workflow: "incident-response", accuracy: 87.5, trend: [78, 80, 82, 84, 85, 86, 87.5], feedback: { positive: 76, negative: 11 }, promptVersion: "v4.1", lastTuned: "1h ago" },
    { agent: "Validator", workflow: "customer-onboarding", accuracy: 98.1, trend: [95, 96, 97, 97.5, 98, 98, 98.1], feedback: { positive: 1176, negative: 24 }, promptVersion: "v1.5", lastTuned: "3d ago" },
    { agent: "Document Agent", workflow: "incident-response", accuracy: 82.3, trend: [74, 76, 78, 79, 80, 81, 82.3], feedback: { positive: 70, negative: 15 }, promptVersion: "v5.0", lastTuned: "30m ago" },
    { agent: "Orchestrator", workflow: "billing-remediation", accuracy: 96.5, trend: [92, 93, 94, 95, 95.5, 96, 96.5], feedback: { positive: 330, negative: 12 }, promptVersion: "v2.1", lastTuned: "1d ago" },
  ],
  experiments: [
    { name: "Analyst CoT vs Direct", status: "running", aVariant: "Chain-of-Thought prompt", bVariant: "Direct answer prompt", aScore: 94.2, bScore: 91.1, samples: 340, started: "2 days ago" },
    { name: "RCA 5-Why depth", status: "running", aVariant: "3-level 5-Why", bVariant: "5-level 5-Why", aScore: 85.0, bScore: 87.5, samples: 87, started: "1 day ago" },
    { name: "Remediator plan format", status: "completed", aVariant: "Structured JSON plan", bVariant: "Free-text plan", aScore: 91.8, bScore: 84.2, samples: 289, started: "5 days ago" },
  ],
};

// ═══ OPENSEARCH SOLUTION REGISTRY ═══
const SOLUTIONS = [
  { id: "sol-billing-rules", name: "Billing Remediation Rules", workflow: "billing-remediation", type: "Rules", docs: 342, chunks: 2840, lastIndexed: "14 min ago", size: "48MB", embedModel: "text-embedding-3-large", status: "current", searchQuality: 94.2, queryCount: 4280, icon: "📋" },
  { id: "sol-billing-profiles", name: "Customer Billing Profiles", workflow: "billing-remediation", type: "Profiles", docs: 12400, chunks: 89000, lastIndexed: "2 hours ago", size: "1.2GB", embedModel: "text-embedding-3-large", status: "current", searchQuality: 91.8, queryCount: 3420, icon: "👥" },
  { id: "sol-incident-runbooks", name: "Incident Runbooks", workflow: "incident-response", type: "Runbooks", docs: 89, chunks: 1240, lastIndexed: "1 day ago", size: "24MB", embedModel: "text-embedding-3-large", status: "current", searchQuality: 88.5, queryCount: 780, icon: "📖" },
  { id: "sol-incident-postmortems", name: "Post-Mortem Database", workflow: "incident-response", type: "Knowledge", docs: 234, chunks: 4200, lastIndexed: "3 hours ago", size: "67MB", embedModel: "text-embedding-3-large", status: "current", searchQuality: 86.1, queryCount: 520, icon: "🔍" },
  { id: "sol-network-topology", name: "Network Topology Maps", workflow: "network-diagnostics", type: "Reference", docs: 48, chunks: 890, lastIndexed: "1 week ago", size: "156MB", embedModel: "text-embedding-3-large", status: "stale", searchQuality: 78.3, queryCount: 0, icon: "🗺️" },
  { id: "sol-onboard-policies", name: "Onboarding Policies", workflow: "customer-onboarding", type: "Policies", docs: 56, chunks: 680, lastIndexed: "3 days ago", size: "12MB", embedModel: "text-embedding-3-large", status: "current", searchQuality: 96.4, queryCount: 1200, icon: "📜" },
  { id: "sol-onboard-compliance", name: "Compliance Requirements", workflow: "customer-onboarding", type: "Compliance", docs: 128, chunks: 2100, lastIndexed: "1 day ago", size: "34MB", embedModel: "text-embedding-3-large", status: "current", searchQuality: 97.1, queryCount: 1200, icon: "✅" },
  { id: "sol-alert-thresholds", name: "Alert Threshold Definitions", workflow: "all", type: "Config", docs: 24, chunks: 180, lastIndexed: "6 hours ago", size: "2MB", embedModel: "text-embedding-3-large", status: "current", searchQuality: 99.0, queryCount: 1634, icon: "🚨" },
  { id: "sol-sla-definitions", name: "SLA Definitions & Targets", workflow: "all", type: "Config", docs: 18, chunks: 120, lastIndexed: "2 days ago", size: "1.4MB", embedModel: "text-embedding-3-large", status: "current", searchQuality: 98.5, queryCount: 890, icon: "📊" },
];

const STATUS = {
  active: { color: "#00875a", bg: "#e3fcef", label: "Active" },
  processing: { color: "#0052cc", bg: "#deebff", label: "Processing" },
  hitl_waiting: { color: "#ff8b00", bg: "#fff4e5", label: "HITL Wait" },
  error: { color: "#de350b", bg: "#ffebe6", label: "Error" },
  idle: { color: "#6b778c", bg: "#f4f5f7", label: "Idle" },
  completed: { color: "#6b778c", bg: "#f4f5f7", label: "Done" },
  healthy: { color: "#00875a", bg: "#e3fcef" },
  degraded: { color: "#ff8b00", bg: "#fff4e5" },
  down: { color: "#de350b", bg: "#ffebe6" },
};

const TOPOLOGY_NODES = {
  "billing-remediation": [
    { id: "orch", label: "Orchestrator", x: 120, y: 150, icon: "⚡" },
    { id: "analyst", label: "Analyst", x: 300, y: 80, icon: "🔍" },
    { id: "remed", label: "Remediator", x: 300, y: 220, icon: "🔧" },
    { id: "hitl", label: "HITL", x: 480, y: 150, icon: "👤" },
    { id: "alerts", label: "Alerts", x: 620, y: 80, icon: "🚨" },
    { id: "monitor", label: "Monitor", x: 620, y: 220, icon: "📊" },
  ],
  "incident-response": [
    { id: "orch", label: "Orchestrator", x: 120, y: 150, icon: "⚡" },
    { id: "rca", label: "RCA Agent", x: 300, y: 80, icon: "🔬" },
    { id: "doc", label: "Doc Agent", x: 300, y: 220, icon: "📄" },
    { id: "hitl", label: "HITL", x: 480, y: 150, icon: "👤" },
    { id: "alerts", label: "Alerts", x: 620, y: 80, icon: "🚨" },
    { id: "monitor", label: "Monitor", x: 620, y: 220, icon: "📊" },
  ],
};
const TOPOLOGY_EDGES = {
  "billing-remediation": [
    ["orch","analyst"],["orch","remed"],["analyst","hitl"],["remed","hitl"],["hitl","alerts"],["hitl","monitor"]
  ],
  "incident-response": [
    ["orch","rca"],["orch","doc"],["rca","hitl"],["doc","hitl"],["hitl","alerts"],["hitl","monitor"]
  ],
};

// ═══ COMPONENTS ═══

function StatusDot({ status, size = 8 }) {
  const s = STATUS[status] || STATUS.idle;
  return <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: s.color, boxShadow: status === "active" || status === "healthy" ? `0 0 6px ${s.color}66` : "none", flexShrink: 0 }} />;
}

function Badge({ children, color, bg }) {
  return <span style={{ padding: "2px 8px", borderRadius: 3, fontSize: 10, fontWeight: 700, color, background: bg, letterSpacing: 0.5 }}>{children}</span>;
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ padding: "12px 16px", background: VZ.white, border: `1px solid ${VZ.border}`, borderTop: `3px solid ${accent || VZ.red}`, minWidth: 140 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: VZ.midGray, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: VZ.black, marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: VZ.midGray, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function MiniGauge({ value, max, color, size = 40 }) {
  const pct = Math.min(value / max, 1);
  const r = size / 2 - 4;
  const circ = Math.PI * r;
  return (
    <svg width={size} height={size / 2 + 4} viewBox={`0 0 ${size} ${size / 2 + 4}`}>
      <path d={`M 4 ${size/2} A ${r} ${r} 0 0 1 ${size-4} ${size/2}`} fill="none" stroke="#e8e8e8" strokeWidth={4} strokeLinecap="round" />
      <path d={`M 4 ${size/2} A ${r} ${r} 0 0 1 ${size-4} ${size/2}`} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeDasharray={`${pct * circ} ${circ}`} />
    </svg>
  );
}

function FlowDots({ x1, y1, x2, y2, active }) {
  const [off, setOff] = useState(0);
  useEffect(() => { if (!active) return; const i = setInterval(() => setOff(p => (p + 3) % 100), 40); return () => clearInterval(i); }, [active]);
  if (!active) return null;
  const dx = x2 - x1, dy = y2 - y1;
  return [0, 1, 2].map(i => { const t = ((off + i * 33) % 100) / 100; return <circle key={i} cx={x1+dx*t} cy={y1+dy*t} r={3-i*0.5} fill={VZ.red} opacity={1-i*0.3} />; });
}

// ═══ MAIN TABS ═══

function OverviewTab({ agents, workflows }) {
  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === "active" || a.status === "processing").length;
  const errorAgents = agents.filter(a => a.status === "error").length;
  const hitlPending = agents.filter(a => a.status === "hitl_waiting").length;
  const totalTokens = agents.reduce((s, a) => s + a.tokens, 0);
  const totalCalls = agents.reduce((s, a) => s + a.calls, 0);
  const runningWf = workflows.filter(w => w.status === "running").length;

  return (
    <div style={{ padding: 20 }}>
      {/* KPI Strip */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard label="Active Workflows" value={runningWf} sub={`${workflows.length} total`} accent="#00875a" />
        <StatCard label="Total Agents" value={totalAgents} sub={`${activeAgents} active, ${errorAgents} errors`} accent={errorAgents > 0 ? "#de350b" : "#00875a"} />
        <StatCard label="HITL Queue" value={hitlPending} sub="awaiting human approval" accent="#ff8b00" />
        <StatCard label="Total Calls" value={totalCalls.toLocaleString()} sub="across all agents" />
        <StatCard label="Token Usage" value={`${(totalTokens/1000).toFixed(0)}K`} sub={`~$${(totalTokens*0.00003).toFixed(2)} cost`} />
        <StatCard label="Avg Success" value={`${(workflows.filter(w=>w.status==="running").reduce((s,w)=>s+w.successRate,0) / Math.max(runningWf,1)).toFixed(1)}%`} sub="running workflows" accent="#00875a" />
      </div>

      {/* Workflow Cards */}
      <div style={{ fontSize: 11, fontWeight: 700, color: VZ.midGray, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Active Workflows</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {workflows.map(wf => {
          const wfAgents = agents.filter(a => a.workflow === wf.id);
          const wfActive = wfAgents.filter(a => a.status === "active" || a.status === "processing").length;
          const wfError = wfAgents.filter(a => a.status === "error").length;
          const st = wf.status === "running" ? (wfError > 0 ? "degraded" : "healthy") : "idle";
          return (
            <div key={wf.id} style={{ background: VZ.white, border: `1px solid ${VZ.border}`, borderLeft: `4px solid ${STATUS[st]?.color || VZ.midGray}`, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{wf.name}</div>
                <Badge color={STATUS[st]?.color} bg={STATUS[st]?.bg}>{wf.status.toUpperCase()}</Badge>
              </div>
              <div style={{ fontSize: 11, color: VZ.midGray, marginBottom: 8 }}>Team: {wf.team}</div>
              <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
                <div>Agents: <b>{wfActive}/{wfAgents.length}</b></div>
                <div>Requests: <b>{wf.requests}</b></div>
                <div>Latency: <b>{wf.avgLatency}ms</b></div>
                {wf.successRate > 0 && <div>Success: <b style={{color: wf.successRate > 95 ? "#00875a" : "#de350b"}}>{wf.successRate}%</b></div>}
              </div>
              {wfError > 0 && <div style={{ marginTop: 6, fontSize: 11, color: "#de350b", fontWeight: 600 }}>⚠ {wfError} agent(s) in error state</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgentVillageTab({ agents, filter }) {
  const filtered = filter === "all" ? agents : agents.filter(a => a.workflow === filter);
  const grouped = {};
  filtered.forEach(a => { (grouped[a.workflow] = grouped[a.workflow] || []).push(a); });

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: VZ.midGray, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>
        Agent Village — {filtered.length} agents {filter !== "all" ? `(${filter})` : "across all workflows"}
      </div>
      {Object.entries(grouped).map(([wfId, wfAgents]) => (
        <div key={wfId} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: VZ.red, marginBottom: 8, borderBottom: `2px solid ${VZ.red}`, paddingBottom: 4, display: "inline-block" }}>
            {WORKFLOWS.find(w => w.id === wfId)?.name || wfId}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
            {wfAgents.map(agent => {
              const st = STATUS[agent.status] || STATUS.idle;
              return (
                <div key={agent.id} style={{ background: VZ.white, border: `1px solid ${VZ.border}`, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start", borderLeft: `3px solid ${st.color}` }}>
                  <div style={{ fontSize: 20, lineHeight: 1 }}>{agent.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{agent.name}</div>
                      <StatusDot status={agent.status} />
                    </div>
                    <Badge color={st.color} bg={st.bg}>{st.label}</Badge>
                    <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 10, color: VZ.midGray }}>
                      <span>{agent.calls} calls</span>
                      <span>{agent.latency}ms</span>
                      <span>{(agent.tokens/1000).toFixed(1)}K tok</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ToolsTab() {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: VZ.midGray, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>
        MCP Tool Stack — {MCP_TOOLS.length} registered tools
      </div>
      <div style={{ background: VZ.white, border: `1px solid ${VZ.border}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "8px 14px", background: VZ.black, color: VZ.white, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>
          <span>TOOL NAME</span><span>TYPE</span><span>STATUS</span><span>AGENTS</span><span>CALLS</span><span>AVG LATENCY</span>
        </div>
        {MCP_TOOLS.map((tool, i) => {
          const st = STATUS[tool.status] || STATUS.healthy;
          return (
            <div key={tool.name} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "10px 14px", borderBottom: `1px solid ${VZ.lightGray}`, fontSize: 12, background: i % 2 ? VZ.gray : VZ.white, alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontFamily: "monospace" }}>{tool.name}</span>
              <span><Badge color={VZ.midGray} bg={VZ.lightGray}>{tool.type}</Badge></span>
              <span><StatusDot status={tool.status} size={6} /> <span style={{ color: st.color, fontWeight: 600, marginLeft: 4 }}>{tool.status}</span></span>
              <span>{tool.agents}</span>
              <span>{tool.calls.toLocaleString()}</span>
              <span>{tool.latency}ms</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResourcesTab() {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: VZ.midGray, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>
        Infrastructure Resources — {RESOURCES.length} services
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {RESOURCES.map(res => {
          const st = STATUS[res.status] || STATUS.healthy;
          return (
            <div key={res.name} style={{ background: VZ.white, border: `1px solid ${VZ.border}`, borderTop: `3px solid ${st.color}`, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{res.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{res.name}</div>
                    <div style={{ fontSize: 10, color: VZ.midGray }}>{res.type}</div>
                  </div>
                </div>
                <Badge color={st.color} bg={st.bg}>{res.status.toUpperCase()}</Badge>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11, color: VZ.darkGray }}>
                <div>Uptime: <b>{res.uptime}</b></div>
                <div>Connections: <b>{res.connections}</b></div>
                <div style={{ gridColumn: "1/3" }}>Capacity: <b>{res.memory}</b></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopologyTab({ selectedWorkflow }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const i = setInterval(() => setTick(p => p + 1), 100); return () => clearInterval(i); }, []);

  const nodes = TOPOLOGY_NODES[selectedWorkflow];
  const edges = TOPOLOGY_EDGES[selectedWorkflow];
  if (!nodes) return <div style={{ padding: 40, color: VZ.midGray, textAlign: "center" }}>Select a running workflow to view topology. Available: {Object.keys(TOPOLOGY_NODES).join(", ")}</div>;

  const getN = id => nodes.find(n => n.id === id);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: VZ.midGray, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>
        Live Topology — {WORKFLOWS.find(w => w.id === selectedWorkflow)?.name}
      </div>
      <div style={{ background: VZ.white, border: `1px solid ${VZ.border}`, padding: 8 }}>
        <svg viewBox="0 0 760 300" style={{ width: "100%", height: 320 }}>
          <defs>
            <pattern id="tgrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#f0f0f0" strokeWidth="0.5" />
            </pattern>
            <filter id="glow2"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <rect width="760" height="300" fill="url(#tgrid)" />

          {edges.map(([s, t], i) => {
            const from = getN(s), to = getN(t);
            if (!from || !to) return null;
            return (
              <g key={i}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#ccc" strokeWidth={1.5} strokeDasharray="6 3" />
                <FlowDots x1={from.x} y1={from.y} x2={to.x} y2={to.y} active={true} />
              </g>
            );
          })}

          {nodes.map(n => (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={26} fill="white" stroke={VZ.black} strokeWidth={2} filter="url(#glow2)" />
              <circle cx={n.x} cy={n.y} r={34} fill="none" stroke={VZ.red} strokeWidth={1} opacity={0.3}>
                <animate attributeName="r" values="28;38;28" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="central" fontSize="16">{n.icon}</text>
              <text x={n.x} y={n.y + 42} textAnchor="middle" fontSize="10" fontWeight="700" fill={VZ.darkGray}>{n.label}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function LogsTab() {
  const logs = [
    { ts: "14:23:01.234", level: "INFO", agent: "orchestrator", wf: "billing-remediation", msg: "Dispatched analyst + remediator for BRQ-4821" },
    { ts: "14:23:02.891", level: "INFO", agent: "analyst", wf: "billing-remediation", msg: "Profile analysis complete — confidence: 94.2%" },
    { ts: "14:23:03.102", level: "WARN", agent: "hitl", wf: "billing-remediation", msg: "Awaiting human approval for override action (53 pending)" },
    { ts: "14:23:04.556", level: "ERROR", agent: "alerts", wf: "incident-response", msg: "Alert delivery failed — Slack webhook timeout (3 retries exhausted)" },
    { ts: "14:23:05.011", level: "INFO", agent: "rca", wf: "incident-response", msg: "Root cause identified: DNS resolution failure in zone us-east-2b" },
    { ts: "14:23:06.789", level: "INFO", agent: "monitoring", wf: "billing-remediation", msg: "Health check passed — CPU: 34%, Mem: 62%, all circuits closed" },
    { ts: "14:23:07.234", level: "INFO", agent: "validator", wf: "customer-onboarding", msg: "1200/1200 records validated — 0 violations found" },
    { ts: "14:23:08.567", level: "WARN", agent: "create_plan", wf: "billing-remediation", msg: "Tool latency degraded: 1200ms (threshold: 500ms)" },
  ];
  const levelColors = { INFO: "#0052cc", WARN: "#ff8b00", ERROR: "#de350b" };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: VZ.midGray, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Operations Log</div>
      <div style={{ background: VZ.white, border: `1px solid ${VZ.border}`, fontFamily: "monospace", fontSize: 11.5 }}>
        {logs.map((log, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "6px 14px", borderBottom: `1px solid ${VZ.lightGray}`, background: log.level === "ERROR" ? "#fff5f5" : i % 2 ? VZ.gray : VZ.white }}>
            <span style={{ color: VZ.midGray, flexShrink: 0, width: 90 }}>{log.ts}</span>
            <span style={{ color: levelColors[log.level], fontWeight: 700, flexShrink: 0, width: 42 }}>{log.level}</span>
            <span style={{ color: VZ.red, flexShrink: 0, width: 100 }}>{log.agent}</span>
            <span style={{ color: "#8993a4", flexShrink: 0, width: 140, fontSize: 10 }}>{log.wf}</span>
            <span style={{ color: VZ.darkGray }}>{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ MAIN APP ═══

function LlmRlTab() {
  return (
    <div style={{ padding: 20 }}>
      {/* ── LLM Provider Registry ── */}
      <div style={{ fontSize: 11, fontWeight: 700, color: VZ.midGray, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>
        LLM Provider Registry — {LLM_PROVIDERS.length} models configured
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12, marginBottom: 28 }}>
        {LLM_PROVIDERS.map(llm => {
          const isActive = llm.status === "active";
          const costColor = llm.cost > 20 ? "#de350b" : llm.cost > 5 ? "#ff8b00" : "#00875a";
          return (
            <div key={llm.id} style={{ background: VZ.white, border: `1px solid ${VZ.border}`, borderTop: `3px solid ${isActive ? "#00875a" : "#ff8b00"}`, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{llm.model}</div>
                  <div style={{ fontSize: 10, color: VZ.midGray }}>{llm.provider}</div>
                </div>
                <Badge color={isActive ? "#00875a" : "#ff8b00"} bg={isActive ? "#e3fcef" : "#fff4e5"}>{llm.status.toUpperCase()}</Badge>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11, marginBottom: 8 }}>
                <div>Calls: <b>{llm.calls.toLocaleString()}</b></div>
                <div>Cost: <b style={{ color: costColor }}>${llm.cost.toFixed(2)}</b></div>
                <div>Avg Latency: <b>{llm.avgLatency}ms</b></div>
                <div>P99: <b style={{ color: llm.p99Latency > 2000 ? "#de350b" : VZ.darkGray }}>{llm.p99Latency}ms</b></div>
                <div>Error Rate: <b style={{ color: llm.errorRate > 1 ? "#de350b" : "#00875a" }}>{llm.errorRate}%</b></div>
                <div>Rate: <b>{llm.used}</b> / {llm.rateLimit}</div>
              </div>
              {/* Token bar */}
              <div style={{ fontSize: 10, color: VZ.midGray, marginBottom: 4 }}>Tokens: {((llm.tokens.input + llm.tokens.output) / 1000000).toFixed(1)}M total</div>
              <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: VZ.lightGray }}>
                <div style={{ width: `${llm.tokens.input / (llm.tokens.input + llm.tokens.output + 1) * 100}%`, background: "#0052cc", borderRadius: "3px 0 0 3px" }} />
                <div style={{ width: `${llm.tokens.output / (llm.tokens.input + llm.tokens.output + 1) * 100}%`, background: "#00875a" }} />
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 9, color: VZ.midGray, marginTop: 3 }}>
                <span><span style={{ display: "inline-block", width: 8, height: 8, background: "#0052cc", borderRadius: 2, marginRight: 3 }} />Input: {(llm.tokens.input/1000000).toFixed(1)}M</span>
                <span><span style={{ display: "inline-block", width: 8, height: 8, background: "#00875a", borderRadius: 2, marginRight: 3 }} />Output: {(llm.tokens.output/1000000).toFixed(1)}M</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Reinforcement Learning Dashboard ── */}
      <div style={{ fontSize: 11, fontWeight: 700, color: VZ.midGray, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>
        Reinforcement Learning — Agent Performance & Tuning
      </div>

      {/* RL KPI strip */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard label="Total Feedback" value={RL_METRICS.totalFeedback.toLocaleString()} sub={`${RL_METRICS.positiveRate}% positive`} accent="#00875a" />
        <StatCard label="Prompt Versions" value={RL_METRICS.promptVersions} sub="across all agents" accent="#0052cc" />
        <StatCard label="Active Experiments" value={RL_METRICS.activeExperiments} sub="A/B tests running" accent="#6554c0" />
        <StatCard label="Last Tuning" value={RL_METRICS.lastTuning} sub="prompt auto-adjustment" accent="#ff8b00" />
      </div>

      {/* RL Agent Performance Table */}
      <div style={{ background: VZ.white, border: `1px solid ${VZ.border}`, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 100px 120px 1fr 100px 100px", padding: "8px 14px", background: VZ.black, color: VZ.white, fontSize: 10, fontWeight: 700 }}>
          <span>AGENT</span><span>WORKFLOW</span><span>ACCURACY</span><span>TREND (7 runs)</span><span>FEEDBACK (+/-)</span><span>PROMPT VER</span><span>LAST TUNED</span>
        </div>
        {RL_METRICS.agents.map((ra, i) => {
          const accColor = ra.accuracy >= 95 ? "#00875a" : ra.accuracy >= 85 ? "#ff8b00" : "#de350b";
          const trendMax = Math.max(...ra.trend);
          const trendMin = Math.min(...ra.trend);
          const trendRange = trendMax - trendMin || 1;
          const sparkW = 90, sparkH = 20;
          const sparkPts = ra.trend.map((v, j) => `${(j / (ra.trend.length - 1)) * sparkW},${sparkH - ((v - trendMin) / trendRange) * sparkH}`).join(" ");
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 100px 120px 1fr 100px 100px", padding: "10px 14px", borderBottom: `1px solid ${VZ.lightGray}`, background: i % 2 ? VZ.gray : VZ.white, fontSize: 12, alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>{ra.agent}</span>
              <span style={{ fontSize: 10, color: VZ.midGray }}>{ra.workflow}</span>
              <span style={{ fontWeight: 700, color: accColor }}>{ra.accuracy}%</span>
              <span>
                <svg width={sparkW} height={sparkH}><polyline points={sparkPts} fill="none" stroke={accColor} strokeWidth={1.5} /></svg>
              </span>
              <span style={{ display: "flex", gap: 8, fontSize: 11 }}>
                <span style={{ color: "#00875a" }}>+{ra.feedback.positive}</span>
                <span style={{ color: "#de350b" }}>-{ra.feedback.negative}</span>
                <span style={{ fontSize: 10, color: VZ.midGray }}>({(ra.feedback.positive / (ra.feedback.positive + ra.feedback.negative) * 100).toFixed(0)}% pos)</span>
              </span>
              <span style={{ fontFamily: "monospace", fontSize: 11, background: "#f4f5f7", padding: "2px 6px", borderRadius: 3 }}>{ra.promptVersion}</span>
              <span style={{ fontSize: 10, color: VZ.midGray }}>{ra.lastTuned}</span>
            </div>
          );
        })}
      </div>

      {/* A/B Experiments */}
      <div style={{ fontSize: 12, fontWeight: 700, color: "#6554c0", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
        🧪 Active Experiments (A/B Prompt Testing)
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
        {RL_METRICS.experiments.map((exp, i) => {
          const isRunning = exp.status === "running";
          const winner = exp.aScore >= exp.bScore ? "A" : "B";
          return (
            <div key={i} style={{ background: VZ.white, border: `1px solid ${VZ.border}`, borderLeft: `4px solid ${isRunning ? "#6554c0" : "#00875a"}`, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 12 }}>{exp.name}</div>
                <Badge color={isRunning ? "#6554c0" : "#00875a"} bg={isRunning ? "#eae6ff" : "#e3fcef"}>{exp.status.toUpperCase()}</Badge>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div style={{ padding: 8, background: winner === "A" ? "#e3fcef" : VZ.gray, borderRadius: 4, border: `1px solid ${winner === "A" ? "#00875a44" : VZ.lightGray}` }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: VZ.midGray }}>VARIANT A {winner === "A" && "✓"}</div>
                  <div style={{ fontSize: 9, color: VZ.midGray, marginBottom: 4 }}>{exp.aVariant}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: winner === "A" ? "#00875a" : VZ.darkGray }}>{exp.aScore}%</div>
                </div>
                <div style={{ padding: 8, background: winner === "B" ? "#e3fcef" : VZ.gray, borderRadius: 4, border: `1px solid ${winner === "B" ? "#00875a44" : VZ.lightGray}` }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: VZ.midGray }}>VARIANT B {winner === "B" && "✓"}</div>
                  <div style={{ fontSize: 9, color: VZ.midGray, marginBottom: 4 }}>{exp.bVariant}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: winner === "B" ? "#00875a" : VZ.darkGray }}>{exp.bScore}%</div>
                </div>
              </div>
              <div style={{ fontSize: 10, color: VZ.midGray }}>Samples: <b>{exp.samples}</b> | Started: {exp.started}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SolutionsTab() {
  const totalDocs = SOLUTIONS.reduce((s, sol) => s + sol.docs, 0);
  const totalChunks = SOLUTIONS.reduce((s, sol) => s + sol.chunks, 0);
  const totalQueries = SOLUTIONS.reduce((s, sol) => s + sol.queryCount, 0);
  const staleCount = SOLUTIONS.filter(s => s.status === "stale").length;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: VZ.midGray, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>
        OpenSearch Solution Registry — Knowledge Base Catalog
      </div>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard label="Solution Indexes" value={SOLUTIONS.length} sub={`${staleCount > 0 ? staleCount + " stale" : "all current"}`} accent={staleCount > 0 ? "#ff8b00" : "#00875a"} />
        <StatCard label="Total Documents" value={totalDocs.toLocaleString()} sub="indexed across all solutions" />
        <StatCard label="Vector Chunks" value={`${(totalChunks / 1000).toFixed(0)}K`} sub="embedded in OpenSearch" accent="#0052cc" />
        <StatCard label="Total Queries" value={totalQueries.toLocaleString()} sub="knowledge base lookups" accent="#6554c0" />
      </div>

      {/* Solution cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
        {SOLUTIONS.map(sol => {
          const isCurrent = sol.status === "current";
          const qualColor = sol.searchQuality >= 95 ? "#00875a" : sol.searchQuality >= 85 ? "#0052cc" : sol.searchQuality >= 75 ? "#ff8b00" : "#de350b";
          const wf = sol.workflow === "all" ? "All Workflows" : (WORKFLOWS.find(w => w.id === sol.workflow)?.name || sol.workflow);
          return (
            <div key={sol.id} style={{ background: VZ.white, border: `1px solid ${VZ.border}`, borderLeft: `4px solid ${isCurrent ? "#00875a" : "#ff8b00"}`, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 22 }}>{sol.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{sol.name}</div>
                    <div style={{ fontSize: 10, color: VZ.midGray, marginTop: 1 }}>{wf}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <Badge color={isCurrent ? "#00875a" : "#ff8b00"} bg={isCurrent ? "#e3fcef" : "#fff4e5"}>{sol.status.toUpperCase()}</Badge>
                  <Badge color={VZ.midGray} bg={VZ.lightGray}>{sol.type}</Badge>
                </div>
              </div>

              {/* Metrics grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, fontSize: 11, marginBottom: 10 }}>
                <div>Docs: <b>{sol.docs.toLocaleString()}</b></div>
                <div>Chunks: <b>{sol.chunks.toLocaleString()}</b></div>
                <div>Size: <b>{sol.size}</b></div>
                <div>Queries: <b>{sol.queryCount.toLocaleString()}</b></div>
                <div>Indexed: <b style={{ color: !isCurrent ? "#ff8b00" : VZ.darkGray }}>{sol.lastIndexed}</b></div>
                <div>Embed: <b style={{ fontSize: 9 }}>ada-3-lg</b></div>
              </div>

              {/* Search quality bar */}
              <div style={{ fontSize: 10, color: VZ.midGray, marginBottom: 4 }}>Search Quality: <b style={{ color: qualColor }}>{sol.searchQuality}%</b></div>
              <div style={{ height: 6, borderRadius: 3, background: VZ.lightGray, overflow: "hidden" }}>
                <div style={{ width: `${sol.searchQuality}%`, height: "100%", background: qualColor, borderRadius: 3, transition: "width 0.5s" }} />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <button style={{ padding: "4px 10px", fontSize: 10, fontWeight: 600, color: VZ.white, background: "#0052cc", border: "none", borderRadius: 3, cursor: "pointer" }}>
                  🔄 Re-Index
                </button>
                <button style={{ padding: "4px 10px", fontSize: 10, fontWeight: 600, color: VZ.midGray, background: VZ.lightGray, border: "none", borderRadius: 3, cursor: "pointer" }}>
                  📊 Query Stats
                </button>
                <button style={{ padding: "4px 10px", fontSize: 10, fontWeight: 600, color: VZ.midGray, background: VZ.lightGray, border: "none", borderRadius: 3, cursor: "pointer" }}>
                  🔍 Test Search
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══ MAIN APP ═══

function TriggersTab({ onTrigger, executions }) {
  const [selectedType, setSelectedType] = useState("all");
  const [showPayload, setShowPayload] = useState(null);
  const [customPayload, setCustomPayload] = useState('{\n  "account_id": "ACC-12345",\n  "action": "analyze"\n}');
  const [cronInput, setCronInput] = useState("*/30 * * * *");

  const typeFilters = ["all", "manual", "cron", "event"];
  const filtered = selectedType === "all" ? TRIGGER_CONFIGS : TRIGGER_CONFIGS.filter(t => t.type === selectedType);
  const manualTriggers = filtered.filter(t => t.type === "manual");
  const cronTriggers = filtered.filter(t => t.type === "cron");
  const eventTriggers = filtered.filter(t => t.type === "event");

  const triggerTypeStyles = {
    manual: { color: "#0052cc", bg: "#deebff", icon: "🖱️", label: "MANUAL" },
    cron: { color: "#00875a", bg: "#e3fcef", icon: "⏰", label: "CRON" },
    event: { color: "#6554c0", bg: "#eae6ff", icon: "⚡", label: "EVENT" },
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Header with type filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: VZ.midGray, textTransform: "uppercase", letterSpacing: 1.5 }}>
          Workflow Triggers — {TRIGGER_CONFIGS.length} configured
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {typeFilters.map(tf => (
            <button key={tf} onClick={() => setSelectedType(tf)} style={{
              padding: "4px 14px", fontSize: 11, fontWeight: selectedType === tf ? 700 : 400,
              color: selectedType === tf ? VZ.white : VZ.midGray,
              background: selectedType === tf ? VZ.red : VZ.white,
              border: `1px solid ${selectedType === tf ? VZ.red : VZ.border}`,
              borderRadius: 3, cursor: "pointer", textTransform: "uppercase",
            }}>
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ MANUAL TRIGGERS ═══ */}
      {manualTriggers.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0052cc", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            🖱️ Manual Triggers — Click to Execute
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
            {manualTriggers.map(trg => {
              const isRunning = executions.some(e => e.triggerId === trg.id && e.status === "running");
              return (
                <div key={trg.id} style={{ background: VZ.white, border: `1px solid ${VZ.border}`, borderLeft: "4px solid #0052cc", padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{trg.label}</div>
                      <div style={{ fontSize: 11, color: VZ.midGray, marginTop: 2 }}>{trg.desc}</div>
                    </div>
                    <Badge color="#0052cc" bg="#deebff">MANUAL</Badge>
                  </div>
                  <div style={{ display: "flex", gap: 12, fontSize: 10, color: VZ.midGray, marginBottom: 10 }}>
                    <span>Last: {trg.lastRun}</span>
                    <span>Runs: {trg.runCount}</span>
                    <span>Avg: {trg.avgDuration}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => onTrigger(trg.id, trg.workflow, "manual", null)}
                      disabled={isRunning}
                      style={{
                        padding: "6px 18px", fontSize: 12, fontWeight: 700,
                        color: VZ.white, background: isRunning ? VZ.midGray : VZ.red,
                        border: "none", borderRadius: 3, cursor: isRunning ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                      {isRunning ? (<><span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> RUNNING...</>) : (<>▶ TRIGGER NOW</>)}
                    </button>
                    <button onClick={() => setShowPayload(showPayload === trg.id ? null : trg.id)}
                      style={{ padding: "6px 12px", fontSize: 11, color: VZ.midGray, background: VZ.gray, border: `1px solid ${VZ.border}`, borderRadius: 3, cursor: "pointer" }}>
                      {showPayload === trg.id ? "Hide" : "Custom Payload"}
                    </button>
                  </div>
                  {showPayload === trg.id && (
                    <div style={{ marginTop: 10 }}>
                      <textarea value={customPayload} onChange={e => setCustomPayload(e.target.value)}
                        style={{ width: "100%", height: 80, fontFamily: "monospace", fontSize: 11, padding: 8, border: `1px solid ${VZ.border}`, borderRadius: 3, resize: "vertical" }} />
                      <button onClick={() => { onTrigger(trg.id, trg.workflow, "manual", customPayload); setShowPayload(null); }}
                        style={{ marginTop: 6, padding: "4px 14px", fontSize: 11, fontWeight: 600, color: VZ.white, background: "#0052cc", border: "none", borderRadius: 3, cursor: "pointer" }}>
                        ▶ Trigger with Payload
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ CRON TRIGGERS ═══ */}
      {cronTriggers.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#00875a", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            ⏰ Scheduled Triggers (Cron / Async)
          </div>
          <div style={{ background: VZ.white, border: `1px solid ${VZ.border}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 100px", padding: "8px 14px", background: VZ.black, color: VZ.white, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>
              <span>SCHEDULE</span><span>CRON EXPRESSION</span><span>STATUS</span><span>NEXT RUN</span><span>LAST RUN</span><span>RUNS</span><span>ACTIONS</span>
            </div>
            {cronTriggers.map((trg, i) => {
              const isPaused = trg.status === "paused";
              return (
                <div key={trg.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 100px", padding: "10px 14px", borderBottom: `1px solid ${VZ.lightGray}`, background: i % 2 ? VZ.gray : VZ.white, alignItems: "center", fontSize: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{trg.label}</div>
                    <div style={{ fontSize: 10, color: VZ.midGray }}>{trg.desc}</div>
                  </div>
                  <span style={{ fontFamily: "monospace", fontSize: 11, background: "#f4f5f7", padding: "2px 8px", borderRadius: 3 }}>{trg.cron}</span>
                  <span>
                    <StatusDot status={isPaused ? "idle" : "active"} size={6} />
                    <span style={{ marginLeft: 4, fontWeight: 600, color: isPaused ? VZ.midGray : "#00875a" }}>{isPaused ? "Paused" : "Active"}</span>
                  </span>
                  <span style={{ fontSize: 11, color: isPaused ? VZ.midGray : VZ.darkGray }}>{isPaused ? "—" : trg.nextRun}</span>
                  <span style={{ fontSize: 11 }}>{trg.lastRun}</span>
                  <span>{trg.runCount.toLocaleString()}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => onTrigger(trg.id, trg.workflow, "cron_manual", null)}
                      style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: VZ.white, background: VZ.red, border: "none", borderRadius: 2, cursor: "pointer" }}>
                      ▶ Run
                    </button>
                    <button style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: VZ.midGray, background: VZ.lightGray, border: "none", borderRadius: 2, cursor: "pointer" }}>
                      {isPaused ? "Resume" : "Pause"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Add new cron */}
          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: VZ.midGray }}>New schedule:</span>
            <input value={cronInput} onChange={e => setCronInput(e.target.value)}
              style={{ fontFamily: "monospace", fontSize: 11, padding: "4px 8px", border: `1px solid ${VZ.border}`, borderRadius: 3, width: 160 }} />
            <select style={{ fontSize: 11, padding: "4px 8px", border: `1px solid ${VZ.border}`, borderRadius: 3 }}>
              {WORKFLOWS.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <button style={{ padding: "4px 14px", fontSize: 11, fontWeight: 600, color: VZ.white, background: "#00875a", border: "none", borderRadius: 3, cursor: "pointer" }}>
              + Add Schedule
            </button>
          </div>
        </div>
      )}

      {/* ═══ EVENT-DRIVEN TRIGGERS ═══ */}
      {eventTriggers.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6554c0", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            ⚡ Event-Driven Triggers — Real-time Listeners
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
            {eventTriggers.map(trg => {
              const isListening = trg.status === "listening";
              return (
                <div key={trg.id} style={{ background: VZ.white, border: `1px solid ${VZ.border}`, borderLeft: "4px solid #6554c0", padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{trg.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>{trg.label}</div>
                        <div style={{ fontSize: 10, color: VZ.midGray, marginTop: 1 }}>{trg.desc}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                    <Badge color="#6554c0" bg="#eae6ff">{trg.source}</Badge>
                    <Badge color={VZ.midGray} bg={VZ.lightGray}>{WORKFLOWS.find(w => w.id === trg.workflow)?.name}</Badge>
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 10, background: "#f8f8f8", padding: "4px 8px", borderRadius: 3, marginBottom: 8, color: VZ.darkGray, border: `1px solid ${VZ.lightGray}` }}>
                    {trg.topic}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 12, fontSize: 10, color: VZ.midGray }}>
                      <span>Today: <b style={{ color: VZ.darkGray }}>{trg.eventsToday}</b> events</span>
                      <span>Last: <b>{trg.lastEvent}</b></span>
                      <span>Avg: <b>{trg.avgDuration}</b></span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {isListening && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10 }}>
                          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#6554c0", animation: "blink 1.5s infinite" }} />
                          <span style={{ color: "#6554c0", fontWeight: 600 }}>LISTENING</span>
                        </span>
                      )}
                      {!isListening && (
                        <span style={{ fontSize: 10, color: VZ.midGray, fontWeight: 600 }}>IDLE</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ RECENT EXECUTIONS ═══ */}
      {executions.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: VZ.red, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            📋 Recent Trigger Executions
          </div>
          <div style={{ background: VZ.white, border: `1px solid ${VZ.border}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 100px 100px 100px 100px", padding: "8px 14px", background: VZ.black, color: VZ.white, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>
              <span>TIMESTAMP</span><span>TRIGGER</span><span>WORKFLOW</span><span>TYPE</span><span>STATUS</span><span>DURATION</span>
            </div>
            {executions.slice(0, 10).map((exec, i) => {
              const trg = TRIGGER_CONFIGS.find(t => t.id === exec.triggerId);
              const stColor = exec.status === "completed" ? "#00875a" : exec.status === "running" ? "#0052cc" : "#de350b";
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr 100px 100px 100px 100px", padding: "8px 14px", borderBottom: `1px solid ${VZ.lightGray}`, background: i % 2 ? VZ.gray : VZ.white, fontSize: 11, alignItems: "center" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 10 }}>{exec.timestamp}</span>
                  <span style={{ fontWeight: 600 }}>{trg?.label || exec.triggerId}</span>
                  <span style={{ fontSize: 10 }}>{exec.workflow}</span>
                  <span><Badge {...(triggerTypeStyles[exec.type] || triggerTypeStyles.manual)}>{(triggerTypeStyles[exec.type]?.label || "MANUAL")}</Badge></span>
                  <span style={{ color: stColor, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    {exec.status === "running" && <span style={{ display: "inline-block", width: 8, height: 8, border: "2px solid #0052cc", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
                    {exec.status.toUpperCase()}
                  </span>
                  <span>{exec.duration}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
      `}</style>
    </div>
  );
}

// ═══ MAIN APP ═══

export default function MCC() {
  const [tab, setTab] = useState("overview");
  const [wfFilter, setWfFilter] = useState("all");
  const [selectedTopo, setSelectedTopo] = useState("billing-remediation");
  const [time, setTime] = useState(new Date());
  const [executions, setExecutions] = useState([]);

  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);

  // Auto-complete running executions after a delay
  useEffect(() => {
    const i = setInterval(() => {
      setExecutions(prev => prev.map(e => {
        if (e.status === "running" && Date.now() - e.startTime > (3000 + Math.random() * 5000)) {
          return { ...e, status: "completed", duration: `${((Date.now() - e.startTime) / 1000).toFixed(1)}s` };
        }
        return e;
      }));
    }, 500);
    return () => clearInterval(i);
  }, []);

  const handleTrigger = useCallback((triggerId, workflow, type, payload) => {
    const now = new Date();
    const ts = now.toLocaleTimeString() + "." + String(now.getMilliseconds()).padStart(3, "0");
    const exec = {
      triggerId,
      workflow,
      type: type === "cron_manual" ? "cron" : type,
      status: "running",
      timestamp: ts,
      duration: "—",
      payload: payload || null,
      startTime: Date.now(),
    };
    setExecutions(prev => [exec, ...prev].slice(0, 50));
  }, []);

  const totalErrors = AGENT_VILLAGE.filter(a => a.status === "error").length;
  const totalActive = AGENT_VILLAGE.filter(a => a.status === "active" || a.status === "processing").length;
  const degradedTools = MCP_TOOLS.filter(t => t.status !== "healthy").length;
  const runningExecs = executions.filter(e => e.status === "running").length;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "triggers", label: "Triggers" },
    { id: "agents", label: "Agent Village" },
    { id: "topology", label: "Topology" },
    { id: "llm-rl", label: "LLM & RL" },
    { id: "solutions", label: "Solutions" },
    { id: "tools", label: "MCP Tools" },
    { id: "resources", label: "Resources" },
    { id: "logs", label: "Ops Log" },
  ];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", background: VZ.gray, color: VZ.black }}>

      {/* ══════ HEADER ══════ */}
      <header style={{ padding: "12px 24px", background: VZ.white, borderBottom: `2px solid ${VZ.black}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1 }}>verizon<span style={{ color: VZ.red }}>.</span></div>
          <div style={{ borderLeft: "1px solid #ccc", paddingLeft: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 0.5 }}>ADLC MISSION CONTROL CENTER</div>
            <div style={{ fontSize: 10, color: VZ.midGray }}>Enterprise Multi-Agent System Operations</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <StatusDot status={totalErrors > 0 ? "error" : "active"} size={10} />
            <span style={{ fontSize: 12, fontWeight: 700, color: totalErrors > 0 ? "#de350b" : "#00875a" }}>
              {totalErrors > 0 ? "DEGRADED" : "ALL SYSTEMS OPERATIONAL"}
            </span>
          </div>
          <div style={{ fontSize: 11, color: VZ.midGray }}>
            {totalActive}/{AGENT_VILLAGE.length} agents
            {runningExecs > 0 && <span style={{ color: "#0052cc", marginLeft: 8 }}> | {runningExecs} executing</span>}
            {degradedTools > 0 && <span style={{ color: "#ff8b00", marginLeft: 8 }}> | {degradedTools} tool(s) degraded</span>}
          </div>
          <div style={{ fontSize: 11, color: VZ.midGray, fontFamily: "monospace" }}>
            {time.toLocaleTimeString()}
          </div>
        </div>
      </header>

      {/* ══════ TAB BAR ══════ */}
      <div style={{ display: "flex", background: VZ.white, borderBottom: `1px solid ${VZ.border}`, padding: "0 24px", gap: 0, flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 20px", fontSize: 12, fontWeight: tab === t.id ? 700 : 400,
            color: tab === t.id ? VZ.red : VZ.midGray,
            background: "transparent", border: "none", cursor: "pointer",
            borderBottom: tab === t.id ? `3px solid ${VZ.red}` : "3px solid transparent",
            transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6,
          }}>
            {t.label}
            {t.id === "triggers" && runningExecs > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: VZ.red, color: VZ.white, fontSize: 9, fontWeight: 700 }}>{runningExecs}</span>
            )}
          </button>
        ))}
        {/* Workflow filter for Agent Village / Topology */}
        {(tab === "agents" || tab === "topology") && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: VZ.midGray }}>Workflow:</span>
            <select value={tab === "topology" ? selectedTopo : wfFilter} onChange={e => tab === "topology" ? setSelectedTopo(e.target.value) : setWfFilter(e.target.value)}
              style={{ fontSize: 11, padding: "4px 8px", border: `1px solid ${VZ.border}`, borderRadius: 3 }}>
              {tab === "agents" && <option value="all">All Workflows</option>}
              {WORKFLOWS.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* ══════ CONTENT ══════ */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        {tab === "overview" && <OverviewTab agents={AGENT_VILLAGE} workflows={WORKFLOWS} />}
        {tab === "triggers" && <TriggersTab onTrigger={handleTrigger} executions={executions} />}
        {tab === "agents" && <AgentVillageTab agents={AGENT_VILLAGE} filter={wfFilter} />}
        {tab === "topology" && <TopologyTab selectedWorkflow={selectedTopo} />}
        {tab === "llm-rl" && <LlmRlTab />}
        {tab === "solutions" && <SolutionsTab />}
        {tab === "tools" && <ToolsTab />}
        {tab === "resources" && <ResourcesTab />}
        {tab === "logs" && <LogsTab />}
      </main>

      {/* ══════ FOOTER ══════ */}
      <footer style={{ padding: "6px 24px", background: VZ.white, borderTop: `1px solid ${VZ.border}`, display: "flex", justifyContent: "space-between", fontSize: 10, color: VZ.midGray, flexShrink: 0 }}>
        <span>Agent Factory v2.0 — Generated by Enterprise Architecture</span>
        <span>{WORKFLOWS.length} workflows | {AGENT_VILLAGE.length} agents | {MCP_TOOLS.length} tools | {LLM_PROVIDERS.length} LLMs | {SOLUTIONS.length} solutions | {RESOURCES.length} resources</span>
      </footer>
    </div>
  );
}
