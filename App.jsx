import { useState } from "react";

const LAWS = [
  { id: "herd", label: "Herd Mentality", icon: "👥", desc: "Social proof through numbers & movement" },
  { id: "commitment", label: "Commitment & Consistency", icon: "📅", desc: "Mini-commitment + calendar link" },
  { id: "reciprocity", label: "Reciprocity", icon: "🎁", desc: "Give a snippet/tool upfront" },
  { id: "scarcity", label: "Scarcity", icon: "⏳", desc: "Limited time/slots/offer" },
  { id: "anchoring", label: "Anchoring Effect", icon: "⚓", desc: "Lead with a strong first number or stat" },
  { id: "authority", label: "Authority Bias", icon: "🏆", desc: "Position as expert/leader" },
  { id: "lossAversion", label: "Loss Aversion", icon: "🔒", desc: "Frame around what they'll lose" },
  { id: "socialProof", label: "Social Proof", icon: "⭐", desc: "Name-drop similar clients/results" },
];

const FIELDS = [
  { id: "industry", label: "Target Industry / Niche", placeholder: "e.g. Medical & wellness clinics, aesthetic clinics...", wide: false },
  { id: "prospect_role", label: "Prospect's Role / Title", placeholder: "e.g. Clinic owner, practice manager...", wide: false },
  { id: "pain_point", label: "Core Pain Point", placeholder: "e.g. Missing leads after hours, staff overwhelmed with bookings...", wide: true },
  { id: "offer", label: "Your Offer / Service", placeholder: "e.g. AI receptionist that handles WhatsApp 24/7...", wide: true },
  { id: "free_value", label: "Free Value / Snippet to Give", placeholder: "e.g. A short audit of their booking gap, a sample chatbot response...", wide: false },
  { id: "social_proof", label: "Social Proof (clients/results)", placeholder: "e.g. 3 clinics in Singapore & UK saw 40% drop in missed leads...", wide: false },
  { id: "anchor_stat", label: "Anchor Stat or Number", placeholder: "e.g. $4,200/month in missed bookings, 67% of leads go cold after hours...", wide: false },
  { id: "scarcity_frame", label: "Scarcity / Urgency Frame", placeholder: "e.g. Only 2 clinic slots this month, offer expires Friday...", wide: false },
  { id: "platform", label: "Outreach Platform", placeholder: "e.g. LinkedIn DM, cold email, WhatsApp, Instagram DM...", wide: false },
  { id: "tone", label: "Tone / Style", placeholder: "e.g. Consultative & warm, direct & confident, casual...", wide: false },
];

function buildSystemPrompt(activeLaws) {
  const selectedLaws = LAWS.filter(l => activeLaws.has(l.id));
  return `You are an expert cold outreach copywriter specialising in B2B automation and AI services sales. You write high-converting first messages that feel human, consultative, and genuinely helpful — never spammy.

Your job is to write a single first outreach message using the context provided. The message must naturally embed ALL of the following persuasion principles WITHOUT making them feel forced or mechanical:

${selectedLaws.map((l, i) => `${i + 1}. **${l.label}**: ${l.desc}`).join("\n")}

RULES:
- The message must feel like it was written by a real person, not a template
- Lead with THEIR pain or situation — never your product
- The anchoring stat should come early to set the frame
- The free value offer should feel generous, not like a hook
- Scarcity must feel real and specific, not fake urgency
- Call to action should ask for a small commitment (reply, a time, a question to answer)
- Length: 80–160 words. Punchy paragraphs. No bullet points.
- Platform tone should match the channel specified
- End with ONE clear CTA only

Return ONLY the message. No preamble, no explanation, no quotes around it.`;
}

function buildUserPrompt(fields) {
  const filled = FIELDS.filter(f => fields[f.id]?.trim());
  const context = filled.map(f => `${f.label}: ${fields[f.id]}`).join("\n");
  return `Write a first outreach message using this context:\n\n${context}\n\nApply all the persuasion principles from your instructions naturally.`;
}

const s = {
  label: {
    display: "block",
    fontSize: 11,
    letterSpacing: "0.15em",
    color: "#a09070",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    background: "#161410",
    border: "1px solid #2a2218",
    borderRadius: 4,
    color: "#f0ece4",
    fontSize: 13,
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    lineHeight: 1.5,
    transition: "border-color 0.15s",
  },
};

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("anthropic_key") || "");
  const [keyVisible, setKeyVisible] = useState(false);
  const [fields, setFields] = useState({});
  const [activeLaws, setActiveLaws] = useState(new Set(LAWS.map(l => l.id)));
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("prompt");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const saveKey = (val) => {
    setApiKey(val);
    localStorage.setItem("anthropic_key", val);
  };

  const toggle = (id) => {
    setActiveLaws(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const generateMessage = async () => {
    if (!apiKey.trim()) { setError("Please enter your Anthropic API key above."); return; }
    setError("");
    setLoading(true);
    setOutput("");
    setTab("message");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey.trim(),
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-opus-4-5",
          max_tokens: 1000,
          system: buildSystemPrompt(activeLaws),
          messages: [{ role: "user", content: buildUserPrompt(fields) }],
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error.message); setLoading(false); return; }
      const text = data.content?.map(b => b.text || "").join("") || "Error generating message.";
      setOutput(text);
    } catch (e) {
      setError("Something went wrong. Check your API key and try again.");
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filledCount = FIELDS.filter(f => fields[f.id]?.trim()).length;

  return (
    <div style={{ background: "#0e0e0e", minHeight: "100vh", color: "#f0ece4" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1209 0%, #0e0e0e 100%)",
        borderBottom: "1px solid #2a2218",
        padding: "32px 28px 24px",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{
            fontSize: 11, letterSpacing: "0.25em", color: "#c9a84c",
            textTransform: "uppercase", marginBottom: 8, fontFamily: "'DM Mono', monospace",
          }}>Persuasion Architecture</div>
          <h1 style={{
            fontSize: 32, fontWeight: 300, margin: "0 0 6px",
            color: "#f5f0e8", lineHeight: 1.2,
            fontFamily: "'Cormorant Garamond', serif",
          }}>Cold Outreach Generator</h1>
          <p style={{ color: "#5a5040", fontSize: 13, margin: 0 }}>
            8 psychological laws. One high-converting first message.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 28px 80px" }}>

        {/* API Key */}
        <div style={{
          background: "#111009", border: "1px solid #2a2218",
          borderRadius: 6, padding: "16px 20px", marginBottom: 28,
        }}>
          <label style={{ ...s.label, marginBottom: 8 }}>
            🔑 Anthropic API Key — <span style={{ color: "#5a5040", textTransform: "none", letterSpacing: 0 }}>stored locally in your browser, never sent anywhere else</span>
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type={keyVisible ? "text" : "password"}
              value={apiKey}
              onChange={e => saveKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{ ...s.input, flex: 1 }}
              onFocus={e => e.target.style.borderColor = "#c9a84c"}
              onBlur={e => e.target.style.borderColor = "#2a2218"}
            />
            <button
              onClick={() => setKeyVisible(v => !v)}
              style={{
                padding: "10px 14px", background: "#1a1612",
                border: "1px solid #2a2218", borderRadius: 4,
                color: "#7a6a50", fontSize: 12, cursor: "pointer",
              }}
            >{keyVisible ? "Hide" : "Show"}</button>
          </div>
          <p style={{ fontSize: 11, color: "#3a3028", marginTop: 6 }}>
            Get your key at console.anthropic.com → API Keys
          </p>
        </div>

        {/* Laws Toggle */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#c9a84c", textTransform: "uppercase", marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>
            Active Persuasion Laws
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {LAWS.map(l => (
              <button
                key={l.id}
                onClick={() => toggle(l.id)}
                title={l.desc}
                style={{
                  padding: "7px 13px", borderRadius: 4,
                  border: activeLaws.has(l.id) ? "1px solid #c9a84c" : "1px solid #2a2218",
                  background: activeLaws.has(l.id) ? "rgba(201,168,76,0.1)" : "transparent",
                  color: activeLaws.has(l.id) ? "#c9a84c" : "#3a3028",
                  fontSize: 12, cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                <span>{l.icon}</span> {l.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#3a3028", marginTop: 6 }}>
            {activeLaws.size} of {LAWS.length} active — hover for description
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #2a2218", marginBottom: 24 }}>
          {[["prompt", "📝 Context"], ["message", "✉️ Message"]].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "10px 20px", background: "transparent", border: "none",
              borderBottom: tab === t ? "2px solid #c9a84c" : "2px solid transparent",
              color: tab === t ? "#c9a84c" : "#3a3028",
              fontSize: 13, cursor: "pointer",
              letterSpacing: "0.04em", marginBottom: -1,
            }}>{label}</button>
          ))}
        </div>

        {/* Context Tab */}
        {tab === "prompt" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {FIELDS.map(f => (
                <div key={f.id} style={{ gridColumn: f.wide ? "1 / -1" : undefined }}>
                  <label style={s.label}>{f.label}</label>
                  <textarea
                    rows={f.wide ? 2 : 1}
                    placeholder={f.placeholder}
                    value={fields[f.id] || ""}
                    onChange={e => setFields(p => ({ ...p, [f.id]: e.target.value }))}
                    style={s.input}
                    onFocus={e => e.target.style.borderColor = "#c9a84c"}
                    onBlur={e => e.target.style.borderColor = "#2a2218"}
                  />
                </div>
              ))}
            </div>

            {error && (
              <div style={{
                marginTop: 16, padding: "10px 14px", background: "rgba(180,60,60,0.1)",
                border: "1px solid rgba(180,60,60,0.3)", borderRadius: 4,
                color: "#e07070", fontSize: 13,
              }}>{error}</div>
            )}

            <div style={{
              marginTop: 24, display: "flex", alignItems: "center",
              justifyContent: "space-between", flexWrap: "wrap", gap: 12,
            }}>
              <div style={{ fontSize: 12, color: "#3a3028" }}>
                {filledCount}/{FIELDS.length} fields filled
              </div>
              <button
                onClick={generateMessage}
                disabled={loading || filledCount < 3 || !apiKey.trim()}
                style={{
                  padding: "12px 28px",
                  background: (filledCount >= 3 && apiKey.trim()) ? "#c9a84c" : "#1e1a12",
                  color: (filledCount >= 3 && apiKey.trim()) ? "#0e0e0e" : "#3a3028",
                  border: "none", borderRadius: 4, fontSize: 13,
                  fontWeight: 500, letterSpacing: "0.05em",
                  cursor: (filledCount >= 3 && apiKey.trim()) ? "pointer" : "not-allowed",
                  transition: "all 0.15s",
                }}
              >
                {loading ? "Generating..." : "Generate Message →"}
              </button>
            </div>
          </div>
        )}

        {/* Message Tab */}
        {tab === "message" && (
          <div>
            {loading && (
              <div style={{ padding: "56px 24px", textAlign: "center", color: "#3a3028", fontSize: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 12, animation: "spin 2s linear infinite" }}>⚙️</div>
                Weaving in {activeLaws.size} persuasion laws...
              </div>
            )}

            {!loading && error && (
              <div style={{
                padding: "14px 18px", background: "rgba(180,60,60,0.1)",
                border: "1px solid rgba(180,60,60,0.3)", borderRadius: 4,
                color: "#e07070", fontSize: 13, marginBottom: 16,
              }}>{error}</div>
            )}

            {!loading && output && (
              <>
                <div style={{
                  background: "#161410", border: "1px solid #2a2218",
                  borderRadius: 6, padding: "24px 26px",
                  lineHeight: 1.8, fontSize: 14, color: "#e8e2d8",
                  whiteSpace: "pre-wrap", marginBottom: 16,
                }}>
                  {output}
                </div>

                <div style={{
                  background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.12)",
                  borderRadius: 6, padding: "14px 18px", marginBottom: 16,
                }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#c9a84c", marginBottom: 8, fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>
                    Laws Applied
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {LAWS.filter(l => activeLaws.has(l.id)).map(l => (
                      <span key={l.id} style={{
                        fontSize: 11,
                        background: "rgba(201,168,76,0.08)", color: "#c9a84c",
                        padding: "3px 9px", borderRadius: 12,
                        border: "1px solid rgba(201,168,76,0.15)",
                      }}>{l.icon} {l.label}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={copyToClipboard} style={{
                    padding: "10px 20px", background: "#c9a84c", color: "#0e0e0e",
                    border: "none", borderRadius: 4, fontSize: 13, fontWeight: 500, cursor: "pointer",
                  }}>{copied ? "✓ Copied!" : "Copy Message"}</button>
                  <button onClick={generateMessage} style={{
                    padding: "10px 20px", background: "transparent", color: "#c9a84c",
                    border: "1px solid #c9a84c", borderRadius: 4, fontSize: 13, cursor: "pointer",
                  }}>Regenerate</button>
                  <button onClick={() => setTab("prompt")} style={{
                    padding: "10px 20px", background: "transparent", color: "#3a3028",
                    border: "1px solid #2a2218", borderRadius: 4, fontSize: 13, cursor: "pointer",
                  }}>Edit Context</button>
                </div>
              </>
            )}

            {!loading && !output && !error && (
              <div style={{ padding: "56px 24px", textAlign: "center", color: "#3a3028", fontSize: 14 }}>
                Fill in the Context tab and hit Generate.
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          div[style*="gridTemplateColumns"] { display: block !important; }
          div[style*="gridTemplateColumns"] > div { margin-bottom: 12px; }
        }
      `}</style>
    </div>
  );
}
