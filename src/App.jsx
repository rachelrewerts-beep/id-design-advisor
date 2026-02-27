import { useState, useRef, useEffect } from "react";

// ── Config ────────────────────────────────────────────────────────────────────

const FUNCTIONS = [
  { id: "cs", label: "Customer Success" },
  { id: "support", label: "Customer Support" },
  { id: "sales", label: "Sales" },
];

const ROLES = [
  { id: "csm", label: "CSM / Rep", sub: "Individual contributor, new to the role or company" },
  { id: "sr_csm", label: "Sr. CSM / Sr. Rep", sub: "Experienced IC, elevated expectations" },
  { id: "manager", label: "Manager", sub: "People manager, developing a team" },
  { id: "director", label: "Director", sub: "Org leader, strategic scope" },
];

const ROLE_FUNCTION_CONTEXT = {
  cs: {
    csm: "CSM onboarding: ramp to autonomous customer calls, QBR ownership, renewal conversations, product fluency, and strategic account management.",
    sr_csm: "Sr. CSM onboarding: executive presence, expansion revenue ownership, mentoring junior CSMs, complex renewal strategy, and multi-stakeholder account plans.",
    manager: "CS Manager onboarding: building a coaching culture, running effective 1:1s, developing CSM autonomy, handling escalations, and owning team health metrics.",
    director: "CS Director onboarding: org design, cross-functional alignment, KPI ownership, building scalable programs, and board-level reporting on retention and NRR.",
  },
  support: {
    csm: "Support rep onboarding: ticket triage, escalation paths, product knowledge depth, tone under pressure, SLA adherence, and resolution quality.",
    sr_csm: "Sr. Support rep onboarding: handling complex/escalated cases, mentoring junior reps, improving CSAT, and contributing to knowledge base quality.",
    manager: "Support Manager onboarding: queue management, coaching on tone and resolution quality, SLA accountability, escalation culture, and team CSAT ownership.",
    director: "Support Director onboarding: support org design, tooling decisions, self-serve deflection strategy, cross-functional escalation paths, and cost-per-ticket optimization.",
  },
  sales: {
    csm: "Sales rep onboarding: discovery frameworks, objection handling, demo fluency, CRM discipline, pipeline management, and deal progression.",
    sr_csm: "Sr. Sales rep onboarding: complex deal strategy, multi-threaded selling, negotiation, forecasting accuracy, and mentoring junior reps.",
    manager: "Sales Manager onboarding: pipeline coaching, forecast accountability, rep development, hiring calibration, and quota attainment culture.",
    director: "Sales Director onboarding: territory design, quota setting, go-to-market alignment, sales process governance, and revenue org scaling.",
  },
};

const GENERAL_QUESTIONS = [
  { id: "context", label: "What is this program for?", hint: "Describe the learner and purpose — e.g. ministry fellow orientation, volunteer onboarding, leadership development", type: "textarea" },
  { id: "timeline", label: "What's your timeline?", type: "single", options: ["Days (1-2 weeks)", "Weeks (2-6 weeks)", "Months (2-3 months)", "Months+ (3+ months)"] },
  { id: "contentClarity", label: "How well-defined is the content?", type: "single", options: ["Clearly defined and stable", "Mostly known, some gaps", "Evolving and needs discovery", "Unknown — needs significant analysis"] },
  { id: "learnerExperience", label: "What's the learner's starting point?", hint: "What can you realistically expect them to already know or be able to do?", type: "single", options: ["Total novice — starting from zero", "Some baseline knowledge or experience", "Experienced but in a different context", "High competence, needs refinement"] },
  { id: "successLooks", label: "What does success look like?", hint: "What should the learner be able to DO or demonstrate at the end?", type: "textarea" },
  { id: "outcomeType", label: "What type of outcome are you primarily targeting?", type: "multi", options: ["Observable behavior change", "Knowledge / recall", "Skill performance under pressure", "Confidence and autonomy", "Attitude or mindset shift"] },
  { id: "deliveryOwner", label: "Who owns delivery after you design it?", type: "single", options: ["I deliver it myself (facilitated)", "An internal manager or team", "The learner self-paces", "A blend of all of these"] },
  { id: "linearityNeeded", label: "Does the experience need to be linear?", type: "single", options: ["Strictly linear — order matters", "Mostly linear with some flexibility", "Flexible — learners choose their path", "Non-linear / modular by design"] },
  { id: "evaluationPriority", label: "How important is proving ROI / measuring outcomes?", type: "single", options: ["Critical — need measurable data", "Important but qualitative is okay", "Nice to have", "Not a current priority"] },
  { id: "constraints", label: "Any key constraints?", hint: "Budget, stakeholder dynamics, tools available, team capacity", type: "textarea" },
];

const REVENUE_QUESTIONS = [
  { id: "timeline", label: "What's the onboarding timeline?", hint: "How long from start date to expected full productivity?", type: "single", options: ["2-4 weeks", "4-8 weeks", "8-12 weeks (standard)", "3-6 months (complex role)"] },
  { id: "teamSize", label: "How many people are being onboarded?", type: "single", options: ["1 person (individual)", "2-5 people (small cohort)", "6-15 people (team)", "15+ people (program scale)"] },
  { id: "contentClarity", label: "How well-defined is the existing onboarding?", hint: "Are you building from scratch or improving something that exists?", type: "single", options: ["Starting from scratch", "Some docs exist, no real structure", "Structured program exists, needs improvement", "Strong program, needs role-specific tuning"] },
  { id: "learnerExperience", label: "What's the hire's background?", type: "single", options: ["New to this function entirely", "Function experience, new to the industry", "Industry experience, new to this company", "Experienced and seasoned, just needs context"] },
  { id: "successLooks", label: "What does 'fully ramped' look like?", hint: "What specific thing should they be able to do autonomously that they can't on day 1?", type: "textarea" },
  { id: "outcomeType", label: "What's the biggest ramp risk at this company?", type: "multi", options: ["Product/technical knowledge gaps", "Customer/prospect conversation confidence", "Internal process and tools confusion", "Culture and stakeholder navigation", "Manager not equipped to coach"] },
  { id: "deliveryOwner", label: "Who will own delivery day-to-day?", type: "single", options: ["Direct manager", "Dedicated enablement/L&D team", "Onboarding buddy / peer", "A blend — manager + peer + structured content"] },
  { id: "evaluationPriority", label: "How will you measure onboarding success?", type: "single", options: ["Time-to-first-milestone (call, deal, ticket)", "Manager confidence score at 30/60/90", "Retention at 6 months", "Hard revenue / retention metrics"] },
  { id: "constraints", label: "Any key constraints?", hint: "Manager bandwidth, tool limitations, remote vs. in-person, existing content you must use", type: "textarea" },
];

const STORAGE_KEY = "id_advisor_blueprints";

// ── System prompts ────────────────────────────────────────────────────────────

function buildSystemPrompt(mode, functionId, roleId) {
  const base = `You are an expert Instructional Designer with deep knowledge of ADDIE, SAM, Dick & Carey, Kemp Design Model, and Backwards Design.

On the first message, produce a design blueprint with these sections:

## Recommended Design Model
## Learning Objectives
## Program Outline
## Early Risks to Validate
## Evaluation Approach

On follow-up messages, respond conversationally — acknowledge what changed, explain why, then output a revised full blueprint with the same headers. Be focused; don't re-explain unchanged sections. Ask a concise follow-up question if needed.`;

  if (mode === "general") {
    return base + `

Be specific and practical. If transcript or application content is uploaded, extract learner insights (prior experience, goals, gaps, motivations) and personalize the blueprint. Call out 1-2 specific insights that shaped your recommendations. Keep the initial blueprint under 700 words.`;
  }

  const roleContext = ROLE_FUNCTION_CONTEXT[functionId]?.[roleId] || "";
  const fnLabel = FUNCTIONS.find(f => f.id === functionId)?.label || functionId;
  const roleLabel = ROLES.find(r => r.id === roleId)?.label || roleId;

  return base + `

You are designing a ${fnLabel} onboarding program for a ${roleLabel}. Context: ${roleContext}

COMPANY CONTEXT: If the user has provided methodology, ICP, or company documents, use them to make every section company-specific rather than generic. Reference their actual methodology names, ICP characteristics, product use cases, and internal terminology wherever possible. The program outline should reflect their real stack and process, not generic best practices.

If learner transcripts or application responses are uploaded, extract insights about this specific hire and personalize the blueprint to their background, gaps, and communication style.

Think like a consultant who has built CS, Support, and Sales onboarding programs at B2B SaaS companies scaling from 10 to 100-person revenue teams. Be concrete. Name specific activities, not categories. Keep the initial blueprint under 750 words.`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatAnswers(answers, questions) {
  return questions.map(q => {
    const val = answers[q.id];
    if (!val || (Array.isArray(val) && val.length === 0)) return null;
    return `${q.label}\nAnswer: ${Array.isArray(val) ? val.join(", ") : val}`;
  }).filter(Boolean).join("\n\n");
}

function parseMarkdown(text) {
  const lines = text.split("\n");
  let html = ""; let inUl = false;
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("## ")) { if (inUl) { html += "</ul>"; inUl = false; } html += `<h2>${t.slice(3)}</h2>`; }
    else if (t.startsWith("- ")) { if (!inUl) { html += "<ul>"; inUl = true; } html += `<li>${t.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`; }
    else if (t === "") { if (inUl) { html += "</ul>"; inUl = false; } }
    else { if (inUl) { html += "</ul>"; inUl = false; } html += `<p>${t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`; }
  }
  if (inUl) html += "</ul>";
  return html;
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function exportToWord(blueprint, label) {
  const date = new Date().toLocaleDateString();
  let htmlContent = "";
  const lines = blueprint.split("\n"); let inUl = false;
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("## ")) { if (inUl) { htmlContent += "</ul>"; inUl = false; } htmlContent += `<h2>${t.slice(3)}</h2>`; }
    else if (t.startsWith("- ")) { if (!inUl) { htmlContent += "<ul>"; inUl = true; } htmlContent += `<li>${t.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`; }
    else if (t === "") { if (inUl) { htmlContent += "</ul>"; inUl = false; } htmlContent += "<p>&nbsp;</p>"; }
    else { if (inUl) { htmlContent += "</ul>"; inUl = false; } htmlContent += `<p>${t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`; }
  }
  if (inUl) htmlContent += "</ul>";
  const wordHTML = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>body{font-family:Arial,sans-serif;font-size:12pt;color:#1a1a1a;margin:1in}h1{font-size:20pt;font-weight:bold;color:#1a1a1a;border-bottom:2pt solid #c8a96e;padding-bottom:6pt;margin-bottom:12pt}h2{font-size:14pt;font-weight:bold;color:#7a5a2a;margin-top:18pt;margin-bottom:6pt}p{font-size:12pt;line-height:1.5;margin:4pt 0}ul{margin:6pt 0 6pt 20pt}li{font-size:12pt;line-height:1.5;margin-bottom:3pt}strong{font-weight:bold}.meta{font-size:10pt;color:#666;margin-bottom:24pt}</style></head><body><h1>${label}</h1><p class="meta">Instructional Design Blueprint &nbsp;·&nbsp; ${date}</p>${htmlContent}</body></html>`;
  const blob = new Blob([wordHTML], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${label.replace(/[^a-z0-9]/gi, "_")}_Blueprint.doc`;
  a.click(); URL.revokeObjectURL(url);
}

// ── Reusable file upload ──────────────────────────────────────────────────────

function FileUpload({ files, onAdd, onRemove, title, subtitle, maxFiles = 5 }) {
  const inputRef = useRef();
  const handleFiles = async (incoming) => {
    for (const file of Array.from(incoming)) {
      if (files.length >= maxFiles) break;
      const isText = file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md");
      const isPDF = file.type === "application/pdf";
      if (!isText && !isPDF) continue;
      try {
        let content, contentType;
        if (isText) { content = await readFileAsText(file); contentType = "text"; }
        else { content = await readFileAsBase64(file); contentType = "pdf"; }
        onAdd({ name: file.name, content, contentType, size: file.size });
      } catch (e) { console.error(e); }
    }
  };
  return (
    <div className="upload-panel">
      <div className="upload-title-row">
        <span className="upload-title">{title}</span>
        <span className="upload-badge">Optional</span>
      </div>
      {subtitle && <div className="upload-sub">{subtitle}</div>}
      {files.length > 0 && (
        <div className="file-list">
          {files.map((f, i) => (
            <div key={i} className="file-chip">
              <span className="file-icon">{f.contentType === "pdf" ? "PDF" : "TXT"}</span>
              <span className="file-name">{f.name}</span>
              <span className="file-size">{(f.size / 1024).toFixed(0)}kb</span>
              <button className="file-remove" onClick={() => onRemove(i)}>✕</button>
            </div>
          ))}
        </div>
      )}
      {files.length < maxFiles && (
        <div className="drop-zone" onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("dragging"); }}
          onDragLeave={e => e.currentTarget.classList.remove("dragging")}
          onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("dragging"); handleFiles(e.dataTransfer.files); }}>
          <input ref={inputRef} type="file" accept=".txt,.md,.pdf" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
          <span className="drop-icon">↑</span>
          <span className="drop-text">Drop files or <span className="drop-link">browse</span></span>
          <span className="drop-hint">.txt, .md, .pdf · up to {maxFiles} files</span>
        </div>
      )}
    </div>
  );
}

// ── Company Context Step ──────────────────────────────────────────────────────

function CompanyContextStep({ context, onChange }) {
  return (
    <div className="company-context">
      <div className="cc-header">
        <div className="cc-title">Company Context</div>
        <div className="cc-badge">Makes blueprints company-specific</div>
      </div>
      <div className="cc-sub">The more you share here, the more the blueprint will reflect how your client actually operates — not generic best practices.</div>

      <div className="cc-field">
        <label className="cc-label">Sales or CS methodology</label>
        <div className="cc-hint">e.g. MEDDIC, Challenger, SPIN, Command of the Message, Gainsight playbooks, EBR framework</div>
        <textarea className="cc-input" rows={2}
          placeholder="e.g. We use MEDDIC for qualification. Our CS team runs structured EBRs quarterly using a Gainsight scorecard..."
          value={context.methodology || ""}
          onChange={e => onChange({ ...context, methodology: e.target.value })}
        />
      </div>

      <div className="cc-field">
        <label className="cc-label">Ideal Customer Profile (ICP)</label>
        <div className="cc-hint">Who are their customers? Size, industry, buyer persona, what they care about</div>
        <textarea className="cc-input" rows={2}
          placeholder="e.g. Mid-market B2B SaaS companies, 100-500 employees, RevOps or CS leaders as primary buyers, care about retention and expansion..."
          value={context.icp || ""}
          onChange={e => onChange({ ...context, icp: e.target.value })}
        />
      </div>

      <div className="cc-field">
        <label className="cc-label">Product or service in one sentence</label>
        <div className="cc-hint">What does the company sell and what outcome do customers buy it for?</div>
        <textarea className="cc-input" rows={2}
          placeholder="e.g. A customer success platform that helps CS teams reduce churn by surfacing health signals and automating playbooks..."
          value={context.product || ""}
          onChange={e => onChange({ ...context, product: e.target.value })}
        />
      </div>

      <div className="cc-field">
        <label className="cc-label">Anything else we should know</label>
        <div className="cc-hint">Stack, internal terminology, known gaps in current onboarding, cultural context</div>
        <textarea className="cc-input" rows={2}
          placeholder="e.g. Team uses Salesforce + Gong + Notion. Current onboarding is mostly Notion docs with no structured call coaching..."
          value={context.other || ""}
          onChange={e => onChange({ ...context, other: e.target.value })}
        />
      </div>

      <FileUpload
        files={context.files || []}
        onAdd={f => onChange({ ...context, files: [...(context.files || []), f] })}
        onRemove={i => onChange({ ...context, files: (context.files || []).filter((_, idx) => idx !== i) })}
        title="Upload company materials"
        subtitle="Playbooks, existing onboarding docs, positioning guides, sales decks — Claude will read these and reference them in the blueprint."
        maxFiles={5}
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function QuestionCard({ question, value, onChange }) {
  if (question.type === "textarea") return (
    <textarea className="answer-input" placeholder={question.hint || "Your answer..."} value={value || ""} onChange={e => onChange(e.target.value)} rows={3} />
  );
  if (question.type === "single") return (
    <div className="options-grid">
      {question.options.map(opt => (
        <button key={opt} className={`option-btn ${value === opt ? "selected" : ""}`} onClick={() => onChange(opt)}>{opt}</button>
      ))}
    </div>
  );
  const selected = value || [];
  return (
    <div className="options-grid">
      {question.options.map(opt => (
        <button key={opt} className={`option-btn ${selected.includes(opt) ? "selected" : ""}`}
          onClick={() => onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])}>{opt}</button>
      ))}
    </div>
  );
}

function ChatBubble({ msg }) {
  if (msg.role === "user" && !msg.isChat) return null;
  if (msg.role === "user") return (
    <div className="chat-bubble user-bubble">
      <div className="bubble-label">You</div>
      <div className="bubble-text">{msg.content}</div>
    </div>
  );
  return (
    <div className="chat-bubble ai-bubble">
      <div className="bubble-label">Blueprint</div>
      <div className="result-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
    </div>
  );
}

function AnswerEditor({ answers, questions, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...answers });
  const update = (id, val) => setDraft(d => ({ ...d, [id]: val }));
  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="editor-panel">
        <div className="editor-header">
          <div className="editor-title">Edit Your Answers</div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="editor-sub">Change anything and regenerate your blueprint.</div>
        <div className="editor-body">
          {questions.map(q => (
            <div key={q.id} className="editor-field">
              <div className="editor-field-label">{q.label}</div>
              {q.hint && <div className="editor-field-hint">{q.hint}</div>}
              {q.type === "textarea" && <textarea className="editor-input" value={draft[q.id] || ""} onChange={e => update(q.id, e.target.value)} rows={2} />}
              {q.type === "single" && (
                <div className="editor-options">
                  {q.options.map(opt => <button key={opt} className={`editor-opt ${draft[q.id] === opt ? "selected" : ""}`} onClick={() => update(q.id, opt)}>{opt}</button>)}
                </div>
              )}
              {q.type === "multi" && (
                <div className="editor-options">
                  {q.options.map(opt => { const sel = draft[q.id] || []; return <button key={opt} className={`editor-opt ${sel.includes(opt) ? "selected" : ""}`} onClick={() => update(q.id, sel.includes(opt) ? sel.filter(s => s !== opt) : [...sel, opt])}>{opt}</button>; })}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="editor-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => onSave(draft)}>Regenerate Blueprint →</button>
        </div>
      </div>
    </div>
  );
}

function SaveModal({ label, onSave, onClose }) {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const handle = () => { if (!name.trim()) return; onSave(name.trim(), () => { setMsg("Saved!"); setTimeout(onClose, 900); }); };
  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-title">Save Blueprint</div>
        <div className="modal-sub">Give it a name so you can find it later.</div>
        <input className="modal-input" autoFocus placeholder={label ? `e.g. "${label}"` : "e.g. CSM Onboarding — Acme Q3"} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handle(); }} />
        <div className="modal-row">
          {msg && <span className="save-msg">{msg}</span>}
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handle} disabled={!name.trim()}>Save →</button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  // Navigation
  const [view, setView] = useState("home"); // home | mode_select | fn_select | role_select | company_ctx | questions | results | saved

  // Mode
  const [mode, setMode] = useState(null); // "general" | "revenue"
  const [selectedFn, setSelectedFn] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  // Company context (revenue mode)
  const [companyCtx, setCompanyCtx] = useState({});

  // Intake
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [learnerFiles, setLearnerFiles] = useState([]);

  // Results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [feedbackInput, setFeedbackInput] = useState("");

  // Saved
  const [savedBlueprints, setSavedBlueprints] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const bottomRef = useRef(null);

  const questions = mode === "revenue" ? REVENUE_QUESTIONS : GENERAL_QUESTIONS;
  const totalSteps = questions.length;
  const currentQ = questions[step - 1];
  const progress = Math.round((step / totalSteps) * 100);
  const revisionCount = chatHistory.filter(m => m.role === "assistant").length;
  const latestBlueprint = [...chatHistory].filter(m => m.role === "assistant").pop()?.content || null;

  const blueprintLabel = mode === "revenue"
    ? `${FUNCTIONS.find(f => f.id === selectedFn)?.label} ${ROLES.find(r => r.id === selectedRole)?.label} Onboarding`
    : (answers.context?.slice(0, 40) || "Blueprint");

  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get(STORAGE_KEY); if (r) setSavedBlueprints(JSON.parse(r.value)); } catch {}
    })();
  }, []);

  useEffect(() => {
    if (view === "results" && bottomRef.current) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [chatHistory, loading]);

  const canAdvance = () => {
    const val = answers[currentQ?.id];
    if (!val) return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === "string" && val.trim() === "") return false;
    return true;
  };

  const buildInitialContent = (ans, compCtx, lFiles) => {
    const parts = [];
    const systemPrompt = buildSystemPrompt(mode, selectedFn, selectedRole);

    // Intake answers
    let text = `Program Intake Answers:\n\n${formatAnswers(ans, questions)}`;

    // Company context
    if (mode === "revenue") {
      const ctxParts = [];
      if (compCtx.methodology) ctxParts.push(`Methodology: ${compCtx.methodology}`);
      if (compCtx.icp) ctxParts.push(`ICP: ${compCtx.icp}`);
      if (compCtx.product) ctxParts.push(`Product: ${compCtx.product}`);
      if (compCtx.other) ctxParts.push(`Additional context: ${compCtx.other}`);
      if (ctxParts.length > 0) text += `\n\n---\nCOMPANY CONTEXT:\n${ctxParts.join("\n")}`;

      // Company files
      if (compCtx.files?.length > 0) {
        compCtx.files.forEach((f, i) => {
          if (f.contentType === "text") {
            const truncated = f.content.length > 6000 ? f.content.slice(0, 6000) + "\n[truncated]" : f.content;
            text += `\n\n---\nCompany Document ${i + 1}: ${f.name}\n${truncated}`;
          }
        });
        // Add PDF company files
        compCtx.files.filter(f => f.contentType === "pdf").forEach((f, i) => {
          parts.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: f.content } });
          parts.push({ type: "text", text: `(Company document: ${f.name})` });
        });
      }
    }

    text += "\n\nPlease provide your instructional design recommendation.";
    parts.unshift({ type: "text", text });

    // Learner files
    lFiles.forEach(f => {
      if (f.contentType === "text") {
        const truncated = f.content.length > 5000 ? f.content.slice(0, 5000) + "\n[truncated]" : f.content;
        parts.push({ type: "text", text: `\n---\nLearner Document: ${f.name}\n${truncated}` });
      } else {
        parts.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: f.content } });
        parts.push({ type: "text", text: `(Learner document: ${f.name})` });
      }
    });

    return { parts, systemPrompt };
  };

  const callAPI = async (history, sysPrompt) => {
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        system: sysPrompt || buildSystemPrompt(mode, selectedFn, selectedRole),
        messages: history.map(({ role, content }) => ({ role, content })),
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.content?.map(b => b.text || "").join("") || "";
  };

  const runAnalysis = async (ans, compCtx, lFiles) => {
    setLoading(true); setError("");
    const { parts, systemPrompt } = buildInitialContent(ans, compCtx, lFiles);
    const userMsg = { role: "user", content: parts, isChat: false };
    const newHistory = [userMsg];
    setChatHistory(newHistory);
    try {
      const text = await callAPI(newHistory, systemPrompt);
      setChatHistory([...newHistory, { role: "assistant", content: text }]);
    } catch (e) { setError("Something went wrong: " + e.message); }
    setLoading(false);
  };

  const handleNextQuestion = () => {
    if (step < totalSteps) setStep(step + 1);
    else { setView("results"); runAnalysis(answers, companyCtx, learnerFiles); }
  };

  const handleEditSave = (newAnswers) => {
    setAnswers(newAnswers); setShowEditor(false); setChatHistory([]);
    setView("results"); runAnalysis(newAnswers, companyCtx, learnerFiles);
  };

  const sendFeedback = async () => {
    if (!feedbackInput.trim() || loading) return;
    setLoading(true); setError("");
    const userMsg = { role: "user", content: feedbackInput.trim(), isChat: true };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory); setFeedbackInput("");
    try {
      const text = await callAPI(newHistory);
      setChatHistory([...newHistory, { role: "assistant", content: text }]);
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
  };

  const handleSave = async (name, onSuccess) => {
    const bp = {
      id: Date.now(), name, savedAt: new Date().toLocaleDateString(),
      mode, selectedFn, selectedRole, answers, companyCtx: { ...companyCtx, files: [] },
      chatHistory, uploadedFileNames: learnerFiles.map(f => f.name),
      label: blueprintLabel,
    };
    const updated = [bp, ...savedBlueprints];
    setSavedBlueprints(updated);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(updated)); onSuccess?.(); } catch {}
  };

  const loadBlueprint = (bp) => {
    setMode(bp.mode); setSelectedFn(bp.selectedFn); setSelectedRole(bp.selectedRole);
    setAnswers(bp.answers); setCompanyCtx(bp.companyCtx || {}); setChatHistory(bp.chatHistory);
    setLearnerFiles([]); setView("results");
  };

  const deleteBlueprint = async (id) => {
    const updated = savedBlueprints.filter(b => b.id !== id);
    setSavedBlueprints(updated);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  };

  const reset = () => {
    setView("home"); setMode(null); setSelectedFn(null); setSelectedRole(null);
    setCompanyCtx({}); setStep(1); setAnswers({}); setLearnerFiles([]);
    setChatHistory([]); setFeedbackInput(""); setError("");
  };

  const AnswersSummary = () => (
    <div className="answers-bar">
      <div className="answers-bar-top">
        <span className="answers-bar-label">
          {mode === "revenue" ? `${FUNCTIONS.find(f => f.id === selectedFn)?.label} · ${ROLES.find(r => r.id === selectedRole)?.label}` : "Your Intake"}
        </span>
        <button className="btn-edit-inline" onClick={() => setShowEditor(true)}>✎ Edit &amp; Regenerate</button>
      </div>
      <div className="answers-chips">
        {questions.map(q => {
          const val = answers[q.id];
          if (!val || (Array.isArray(val) && val.length === 0)) return null;
          const display = Array.isArray(val) ? val.join(", ") : val;
          return (
            <div key={q.id} className="answer-chip">
              <span className="chip-label">{q.label.replace("?", "")}</span>
              <span className="chip-val">{display.length > 55 ? display.slice(0, 52) + "…" : display}</span>
            </div>
          );
        })}
        {mode === "revenue" && (companyCtx.methodology || companyCtx.icp || (companyCtx.files?.length > 0)) && (
          <div className="answer-chip">
            <span className="chip-label">Company context</span>
            <span className="chip-val">
              {[companyCtx.methodology && "methodology", companyCtx.icp && "ICP", companyCtx.files?.length > 0 && `${companyCtx.files.length} file(s)`].filter(Boolean).join(" · ")}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // ── CSS ───────────────────────────────────────────────────────────────────
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #0d0f14; color: #e8e4dc; min-height: 100vh; }
    .shell { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1rem; background: radial-gradient(ellipse at 20% 50%, #1a1f2e 0%, #0d0f14 60%); }
    .shell.top { justify-content: flex-start; padding-top: 2.5rem; }
    .card { width: 100%; max-width: 700px; background: #13161e; border: 1px solid #2a2d38; border-radius: 20px; padding: 2.5rem; box-shadow: 0 40px 80px rgba(0,0,0,0.5); position: relative; }
    .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #c8a96e, #e8c87a, #c8a96e); border-radius: 20px 20px 0 0; }

    .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
    .topbar-logo { font-family: 'Playfair Display', serif; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: #c8a96e; }
    .topbar-nav { display: flex; gap: 1.25rem; }
    .topbar-nav button { font-family: 'DM Sans', sans-serif; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #5a5d6a; background: none; border: none; cursor: pointer; transition: color 0.2s; padding: 0; }
    .topbar-nav button:hover, .topbar-nav button.active { color: #c8a96e; }

    /* Home mode cards */
    .intro-headline { font-family: 'Playfair Display', serif; font-size: 2.4rem; font-weight: 900; line-height: 1.1; color: #f0ebe0; margin-bottom: 1rem; }
    .intro-sub { font-size: 0.92rem; font-weight: 300; color: #8a8d9a; line-height: 1.7; margin-bottom: 2rem; }
    .mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0; }
    .mode-card { background: #0d0f14; border: 1px solid #2a2d38; border-radius: 14px; padding: 1.5rem; cursor: pointer; transition: all 0.15s; text-align: left; }
    .mode-card:hover { border-color: #c8a96e66; background: #101318; }
    .mode-card-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: #f0ebe0; margin-bottom: 0.4rem; }
    .mode-card-sub { font-size: 0.78rem; color: #5a5d6a; font-weight: 300; line-height: 1.5; }
    .mode-card-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.75rem; }
    .mode-tag { font-size: 0.62rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.2rem 0.55rem; border-radius: 100px; border: 1px solid #2a2d38; color: #6a6d7a; }
    .models-footnote { font-size: 0.72rem; color: #3a3d4a; font-weight: 300; text-align: center; margin-top: 1rem; line-height: 1.5; }

    /* Selector screens */
    .selector-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: #f0ebe0; margin-bottom: 0.4rem; }
    .selector-sub { font-size: 0.85rem; color: #5a5d6a; font-weight: 300; margin-bottom: 1.5rem; }
    .fn-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; }
    .fn-card { background: #0d0f14; border: 1px solid #2a2d38; border-radius: 12px; padding: 1.25rem 1rem; cursor: pointer; transition: all 0.15s; text-align: center; }
    .fn-card:hover { border-color: #c8a96e66; }
    .fn-card.selected { border-color: #c8a96e; background: rgba(200,169,110,0.06); }
    .fn-label { font-size: 0.88rem; font-weight: 500; color: #c8c4bc; }
    .role-list { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem; }
    .role-card { background: #0d0f14; border: 1px solid #2a2d38; border-radius: 12px; padding: 1rem 1.25rem; cursor: pointer; transition: all 0.15s; text-align: left; }
    .role-card:hover { border-color: #c8a96e66; }
    .role-card.selected { border-color: #c8a96e; background: rgba(200,169,110,0.06); }
    .role-label { font-size: 0.92rem; font-weight: 500; color: #e8e4dc; }
    .role-sub { font-size: 0.76rem; color: #5a5d6a; font-weight: 300; margin-top: 0.2rem; }

    /* Company context */
    .company-context { display: flex; flex-direction: column; gap: 1.25rem; }
    .cc-header { display: flex; align-items: center; gap: 0.75rem; }
    .cc-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: #f0ebe0; }
    .cc-badge { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #c8a96e; border: 1px solid #c8a96e44; padding: 0.25rem 0.6rem; border-radius: 100px; }
    .cc-sub { font-size: 0.82rem; color: #5a5d6a; font-weight: 300; line-height: 1.55; }
    .cc-field { display: flex; flex-direction: column; gap: 0.3rem; }
    .cc-label { font-size: 0.8rem; font-weight: 500; color: #c8c4bc; }
    .cc-hint { font-size: 0.72rem; color: #4a4d5a; font-weight: 300; }
    .cc-input { width: 100%; background: #0d0f14; border: 1px solid #2a2d38; border-radius: 9px; padding: 0.75rem 1rem; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 300; color: #e8e4dc; resize: vertical; outline: none; transition: border-color 0.2s; }
    .cc-input:focus { border-color: #c8a96e; }
    .cc-input::placeholder { color: #3a3d4a; }

    /* Questions */
    .progress-bar { height: 2px; background: #1e2130; border-radius: 2px; margin-bottom: 2rem; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #c8a96e, #e8c87a); border-radius: 2px; transition: width 0.4s ease; }
    .step-label { font-size: 0.68rem; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: #c8a96e; margin-bottom: 0.6rem; }
    .question-text { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: #f0ebe0; line-height: 1.3; margin-bottom: 0.4rem; }
    .question-hint { font-size: 0.8rem; color: #5a5d6a; margin-bottom: 1.4rem; font-weight: 300; }
    .multi-hint { font-size: 0.68rem; color: #5a5d6a; margin-bottom: 0.8rem; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 500; }
    .answer-input { width: 100%; background: #0d0f14; border: 1px solid #2a2d38; border-radius: 10px; padding: 0.85rem 1rem; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 300; color: #e8e4dc; resize: vertical; outline: none; transition: border-color 0.2s; margin-bottom: 1.4rem; }
    .answer-input:focus { border-color: #c8a96e; }
    .answer-input::placeholder { color: #3a3d4a; }
    .options-grid { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.4rem; }
    .option-btn { width: 100%; text-align: left; background: #0d0f14; border: 1px solid #2a2d38; border-radius: 10px; padding: 0.8rem 1rem; font-family: 'DM Sans', sans-serif; font-size: 0.86rem; font-weight: 400; color: #8a8d9a; cursor: pointer; transition: all 0.12s; }
    .option-btn:hover { border-color: #4a4d5a; color: #e8e4dc; background: #161920; }
    .option-btn.selected { border-color: #c8a96e; color: #e8c87a; background: rgba(200,169,110,0.08); }

    /* Buttons */
    .btn-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-top: 1.25rem; }
    .btn-back { font-family: 'DM Sans', sans-serif; font-size: 0.83rem; font-weight: 500; color: #5a5d6a; background: none; border: none; cursor: pointer; padding: 0.5rem 0; transition: color 0.2s; }
    .btn-back:hover { color: #8a8d9a; }
    .btn-primary { font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 500; color: #0d0f14; background: linear-gradient(135deg, #c8a96e, #e8c87a); border: none; border-radius: 10px; padding: 0.8rem 1.75rem; cursor: pointer; transition: opacity 0.2s, transform 0.15s; letter-spacing: 0.02em; white-space: nowrap; }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }
    .btn-ghost { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 500; color: #5a5d6a; background: none; border: 1px solid #2a2d38; border-radius: 8px; padding: 0.5rem 1rem; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
    .btn-ghost:hover { color: #c8a96e; border-color: #c8a96e55; }
    .btn-ghost.gold { color: #c8a96e; border-color: #c8a96e55; }
    .btn-ghost.gold:hover { background: rgba(200,169,110,0.1); }
    .btn-skip { font-family: 'DM Sans', sans-serif; font-size: 0.78rem; color: #4a4d5a; background: none; border: none; cursor: pointer; transition: color 0.15s; }
    .btn-skip:hover { color: #8a8d9a; }

    /* File upload */
    .upload-panel { background: #0a0c12; border: 1px solid #2a2d38; border-radius: 12px; padding: 1.1rem; margin-top: 0.5rem; }
    .upload-title-row { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.3rem; }
    .upload-title { font-size: 0.8rem; font-weight: 500; color: #c8c4bc; }
    .upload-badge { font-size: 0.6rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #5a5d6a; border: 1px solid #2a2d38; border-radius: 100px; padding: 0.15rem 0.5rem; }
    .upload-sub { font-size: 0.76rem; color: #5a5d6a; font-weight: 300; line-height: 1.5; margin-bottom: 0.75rem; }
    .file-list { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.6rem; }
    .file-chip { display: flex; align-items: center; gap: 0.45rem; background: #13161e; border: 1px solid #2a2d38; border-radius: 8px; padding: 0.45rem 0.7rem; }
    .file-icon { font-size: 0.6rem; font-weight: 600; letter-spacing: 0.06em; color: #5a5d6a; background: #1e2130; border-radius: 4px; padding: 0.15rem 0.35rem; flex-shrink: 0; }
    .file-name { font-size: 0.78rem; color: #c8c4bc; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .file-size { font-size: 0.68rem; color: #4a4d5a; flex-shrink: 0; }
    .file-remove { font-size: 0.72rem; color: #4a4d5a; background: none; border: none; cursor: pointer; transition: color 0.15s; }
    .file-remove:hover { color: #e07070; }
    .drop-zone { border: 1px dashed #2a2d38; border-radius: 9px; padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; cursor: pointer; transition: all 0.15s; }
    .drop-zone:hover, .drop-zone.dragging { border-color: #c8a96e66; background: rgba(200,169,110,0.04); }
    .drop-icon { font-size: 1.1rem; color: #4a4d5a; }
    .drop-text { font-size: 0.8rem; color: #6a6d7a; }
    .drop-link { color: #c8a96e; text-decoration: underline; }
    .drop-hint { font-size: 0.68rem; color: #4a4d5a; font-weight: 300; }

    /* Results */
    .result-topbar { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.1rem; flex-wrap: wrap; }
    .result-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: #f0ebe0; }
    .revision-note { font-size: 0.68rem; color: #5a5d6a; margin-top: 0.25rem; }
    .export-bar { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; flex-shrink: 0; }

    .chat-area { display: flex; flex-direction: column; gap: 1.4rem; margin-bottom: 1.4rem; }
    .chat-bubble { display: flex; flex-direction: column; gap: 0.4rem; }
    .bubble-label { font-size: 0.63rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
    .user-bubble .bubble-label { color: #5a9a8a; }
    .ai-bubble .bubble-label { color: #c8a96e; }
    .user-bubble .bubble-text { background: #0f1a18; border: 1px solid #1e3530; border-radius: 12px; padding: 0.85rem 1rem; font-size: 0.86rem; font-weight: 300; color: #9ad4c0; line-height: 1.6; }
    .result-body { background: #0d0f14; border: 1px solid #2a2d38; border-radius: 12px; padding: 1.4rem; line-height: 1.75; font-size: 0.88rem; font-weight: 300; color: #c8c4bc; }
    .result-body h2 { font-family: 'Playfair Display', serif; font-size: 0.98rem; font-weight: 700; color: #e8c87a; margin-top: 1.3rem; margin-bottom: 0.4rem; }
    .result-body h2:first-child { margin-top: 0; }
    .result-body ul { padding-left: 1.15rem; margin: 0.35rem 0; }
    .result-body li { margin-bottom: 0.3rem; }
    .result-body strong { color: #e8e4dc; font-weight: 500; }
    .result-body p { margin-bottom: 0.5rem; }

    .answers-bar { background: #0d0f14; border: 1px solid #2a2d38; border-radius: 10px; padding: 0.9rem 1rem; margin-bottom: 1.1rem; }
    .answers-bar-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; }
    .answers-bar-label { font-size: 0.63rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #4a4d5a; }
    .btn-edit-inline { font-family: 'DM Sans', sans-serif; font-size: 0.7rem; font-weight: 500; color: #c8a96e; background: rgba(200,169,110,0.08); border: 1px solid #c8a96e44; border-radius: 6px; padding: 0.28rem 0.65rem; cursor: pointer; transition: all 0.15s; }
    .btn-edit-inline:hover { background: rgba(200,169,110,0.16); }
    .answers-chips { display: flex; flex-direction: column; gap: 0.28rem; }
    .answer-chip { display: flex; gap: 0.5rem; align-items: baseline; }
    .chip-label { font-size: 0.68rem; color: #4a4d5a; font-weight: 500; white-space: nowrap; flex-shrink: 0; min-width: 95px; }
    .chip-val { font-size: 0.74rem; color: #7a7d8a; font-weight: 300; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .feedback-section { border-top: 1px solid #1e2130; padding-top: 1.3rem; }
    .feedback-label { font-size: 0.66rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: #5a5d6a; margin-bottom: 0.65rem; }
    .feedback-row { display: flex; gap: 0.6rem; align-items: flex-end; }
    .feedback-input { flex: 1; background: #0d0f14; border: 1px solid #2a2d38; border-radius: 10px; padding: 0.75rem 0.95rem; font-family: 'DM Sans', sans-serif; font-size: 0.86rem; font-weight: 300; color: #e8e4dc; outline: none; resize: none; transition: border-color 0.2s; min-height: 44px; max-height: 100px; }
    .feedback-input:focus { border-color: #c8a96e; }
    .feedback-input::placeholder { color: #3a3d4a; }
    .btn-send { font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500; color: #0d0f14; background: linear-gradient(135deg, #c8a96e, #e8c87a); border: none; border-radius: 10px; padding: 0 1.2rem; cursor: pointer; transition: opacity 0.2s; height: 44px; white-space: nowrap; }
    .btn-send:hover:not(:disabled) { opacity: 0.85; }
    .btn-send:disabled { opacity: 0.35; cursor: not-allowed; }
    .bottom-row { display: flex; justify-content: space-between; margin-top: 0.85rem; }
    .btn-text { font-family: 'DM Sans', sans-serif; font-size: 0.76rem; font-weight: 400; color: #3a3d4a; background: none; border: none; cursor: pointer; transition: color 0.2s; }
    .btn-text:hover { color: #6a6d7a; }

    /* Loading */
    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 0; gap: 1.4rem; }
    .loading-inline { display: flex; align-items: center; gap: 0.6rem; padding: 0.4rem 0; }
    .spinner { width: 18px; height: 18px; border: 2px solid #2a2d38; border-top-color: #c8a96e; border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; }
    .spinner-lg { width: 32px; height: 32px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-text { font-size: 0.82rem; color: #5a5d6a; font-weight: 300; }
    .error-msg { color: #e07070; font-size: 0.8rem; margin-top: 0.5rem; }

    /* Modals / editor */
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: flex-start; justify-content: center; z-index: 200; padding: 2rem 1rem; overflow-y: auto; }
    .modal { background: #13161e; border: 1px solid #2a2d38; border-radius: 16px; padding: 2rem; width: 100%; max-width: 420px; position: relative; margin: auto; }
    .modal::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #c8a96e, #e8c87a); border-radius: 16px 16px 0 0; }
    .modal-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: #f0ebe0; margin-bottom: 0.4rem; }
    .modal-sub { font-size: 0.82rem; color: #5a5d6a; margin-bottom: 1.3rem; font-weight: 300; }
    .modal-input { width: 100%; background: #0d0f14; border: 1px solid #2a2d38; border-radius: 8px; padding: 0.75rem 1rem; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; color: #e8e4dc; outline: none; transition: border-color 0.2s; margin-bottom: 1rem; }
    .modal-input:focus { border-color: #c8a96e; }
    .modal-row { display: flex; gap: 0.65rem; justify-content: flex-end; align-items: center; }
    .save-msg { font-size: 0.78rem; color: #5a9a7a; }
    .editor-panel { background: #13161e; border: 1px solid #2a2d38; border-radius: 20px; width: 100%; max-width: 620px; position: relative; overflow: hidden; margin: auto; }
    .editor-panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #c8a96e, #e8c87a, #c8a96e); }
    .editor-header { display: flex; align-items: center; justify-content: space-between; padding: 1.4rem 1.6rem 0; }
    .editor-title { font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 700; color: #f0ebe0; }
    .btn-close { font-size: 1rem; color: #5a5d6a; background: none; border: none; cursor: pointer; transition: color 0.15s; }
    .btn-close:hover { color: #c8a96e; }
    .editor-sub { font-size: 0.8rem; color: #5a5d6a; font-weight: 300; padding: 0.35rem 1.6rem 1.1rem; }
    .editor-body { padding: 0 1.6rem; display: flex; flex-direction: column; gap: 1.1rem; max-height: 55vh; overflow-y: auto; }
    .editor-body::-webkit-scrollbar { width: 3px; }
    .editor-body::-webkit-scrollbar-thumb { background: #2a2d38; border-radius: 3px; }
    .editor-field { display: flex; flex-direction: column; gap: 0.3rem; }
    .editor-field-label { font-size: 0.78rem; font-weight: 500; color: #c8c4bc; }
    .editor-field-hint { font-size: 0.7rem; color: #4a4d5a; font-weight: 300; }
    .editor-input { width: 100%; background: #0d0f14; border: 1px solid #2a2d38; border-radius: 8px; padding: 0.6rem 0.85rem; font-family: 'DM Sans', sans-serif; font-size: 0.83rem; font-weight: 300; color: #e8e4dc; resize: vertical; outline: none; transition: border-color 0.2s; }
    .editor-input:focus { border-color: #c8a96e; }
    .editor-options { display: flex; flex-direction: column; gap: 0.3rem; }
    .editor-opt { width: 100%; text-align: left; background: #0d0f14; border: 1px solid #2a2d38; border-radius: 7px; padding: 0.55rem 0.85rem; font-family: 'DM Sans', sans-serif; font-size: 0.78rem; color: #8a8d9a; cursor: pointer; transition: all 0.12s; }
    .editor-opt:hover { border-color: #4a4d5a; color: #e8e4dc; }
    .editor-opt.selected { border-color: #c8a96e; color: #e8c87a; background: rgba(200,169,110,0.08); }
    .editor-footer { display: flex; justify-content: flex-end; gap: 0.65rem; padding: 1.1rem 1.6rem 1.4rem; border-top: 1px solid #1e2130; margin-top: 1.1rem; }

    /* Saved */
    .saved-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: #f0ebe0; margin-bottom: 0.4rem; }
    .saved-sub { font-size: 0.82rem; color: #5a5d6a; font-weight: 300; margin-bottom: 1.6rem; }
    .saved-empty { text-align: center; padding: 2.5rem 0; color: #3a3d4a; font-size: 0.86rem; font-weight: 300; }
    .saved-list { display: flex; flex-direction: column; gap: 0.6rem; }
    .saved-item { background: #0d0f14; border: 1px solid #2a2d38; border-radius: 12px; padding: 1rem 1.2rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; transition: border-color 0.15s; }
    .saved-item:hover { border-color: #3a3d4a; }
    .saved-item-info { flex: 1; min-width: 0; }
    .saved-item-name { font-size: 0.9rem; font-weight: 500; color: #e8e4dc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .saved-item-meta { font-size: 0.7rem; color: #5a5d6a; margin-top: 0.2rem; font-weight: 300; }
    .saved-item-type { font-size: 0.62rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #c8a96e; margin-bottom: 0.2rem; }
    .saved-item-actions { display: flex; gap: 0.4rem; flex-shrink: 0; }
    .btn-load { font-family: 'DM Sans', sans-serif; font-size: 0.74rem; font-weight: 500; color: #c8a96e; background: rgba(200,169,110,0.08); border: 1px solid #c8a96e44; border-radius: 7px; padding: 0.32rem 0.75rem; cursor: pointer; transition: all 0.15s; }
    .btn-load:hover { background: rgba(200,169,110,0.16); }
    .btn-del { font-family: 'DM Sans', sans-serif; font-size: 0.74rem; color: #5a5d6a; background: none; border: 1px solid #2a2d38; border-radius: 7px; padding: 0.32rem 0.55rem; cursor: pointer; transition: all 0.15s; }
    .btn-del:hover { color: #e07070; border-color: #e0707044; }
    .divider { height: 1px; background: #1e2130; margin: 1.5rem 0; }
  `;

  return (
    <>
      <style>{CSS}</style>

      {showSaveModal && (
        <SaveModal label={blueprintLabel} onSave={handleSave} onClose={() => setShowSaveModal(false)} />
      )}
      {showEditor && (
        <AnswerEditor answers={answers} questions={questions} onSave={handleEditSave} onClose={() => setShowEditor(false)} />
      )}

      <div className={`shell ${["results", "saved", "company_ctx", "questions"].includes(view) ? "top" : ""}`}>
        <div className="card">

          <div className="topbar">
            <div className="topbar-logo">ID Design Advisor</div>
            <div className="topbar-nav">
              <button className={view !== "saved" ? "active" : ""} onClick={reset}>New Blueprint</button>
              <button className={view === "saved" ? "active" : ""} onClick={() => setView("saved")}>
                Saved {savedBlueprints.length > 0 ? `(${savedBlueprints.length})` : ""}
              </button>
            </div>
          </div>

          {/* ── HOME ── */}
          {view === "home" && (
            <>
              <h1 className="intro-headline">From intake<br />to blueprint.</h1>
              <p className="intro-sub">Choose a path — design for revenue teams with role, function, and company context baked in, or use the general tool for any other learning program.<br/><br/>Both paths use ADDIE · SAM · Dick &amp; Carey · Kemp · Backwards Design — the right model is recommended based on your inputs.</p>
              <div className="mode-grid">
                <button className="mode-card" onClick={() => { setMode("revenue"); setView("fn_select"); }}>
                  <div className="mode-card-title">Revenue Teams</div>
                  <div className="mode-card-sub">Onboarding blueprints for CS, Support, or Sales — tuned to role, company methodology, and ICP.</div>
                </button>
                <button className="mode-card" onClick={() => { setMode("general"); setView("questions"); }}>
                  <div className="mode-card-title">General</div>
                  <div className="mode-card-sub">Any learning program — volunteer onboarding, ministry training, leadership development, and more.</div>
                </button>
              </div>
            </>
          )}

          {/* ── FUNCTION SELECT ── */}
          {view === "fn_select" && (
            <>
              <div className="selector-title">Which function?</div>
              <div className="selector-sub">This shapes the blueprint's language, success metrics, and program structure.</div>
              <div className="fn-grid">
                {FUNCTIONS.map(fn => (
                  <button key={fn.id} className={`fn-card ${selectedFn === fn.id ? "selected" : ""}`} onClick={() => setSelectedFn(fn.id)}>
                    <div className="fn-label">{fn.label}</div>
                  </button>
                ))}
              </div>
              <div className="btn-row">
                <button className="btn-back" onClick={() => setView("home")}>← Back</button>
                <button className="btn-primary" onClick={() => setView("role_select")} disabled={!selectedFn}>Next →</button>
              </div>
            </>
          )}

          {/* ── ROLE SELECT ── */}
          {view === "role_select" && (
            <>
              <div className="selector-title">Which role?</div>
              <div className="selector-sub">Each role needs a fundamentally different onboarding design.</div>
              <div className="role-list">
                {ROLES.map(r => (
                  <button key={r.id} className={`role-card ${selectedRole === r.id ? "selected" : ""}`} onClick={() => setSelectedRole(r.id)}>
                    <div className="role-label">{r.label}</div>
                    <div className="role-sub">{r.sub}</div>
                  </button>
                ))}
              </div>
              <div className="btn-row">
                <button className="btn-back" onClick={() => setView("fn_select")}>← Back</button>
                <button className="btn-primary" onClick={() => setView("company_ctx")} disabled={!selectedRole}>Next →</button>
              </div>
            </>
          )}

          {/* ── COMPANY CONTEXT ── */}
          {view === "company_ctx" && (
            <>
              <CompanyContextStep context={companyCtx} onChange={setCompanyCtx} />
              <div className="btn-row">
                <button className="btn-back" onClick={() => setView("role_select")}>← Back</button>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <button className="btn-skip" onClick={() => { setView("questions"); setStep(1); }}>Skip for now</button>
                  <button className="btn-primary" onClick={() => { setView("questions"); setStep(1); }}>Continue →</button>
                </div>
              </div>
            </>
          )}

          {/* ── QUESTIONS ── */}
          {view === "questions" && (
            <>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
              <div className="step-label">Question {step} of {totalSteps}</div>
              <div className="question-text">{currentQ.label}</div>
              {currentQ.hint && <div className="question-hint">{currentQ.hint}</div>}
              {currentQ.type === "multi" && <div className="multi-hint">Select all that apply</div>}
              <QuestionCard question={currentQ} value={answers[currentQ.id]} onChange={val => setAnswers({ ...answers, [currentQ.id]: val })} />

              {step === totalSteps && (
                <FileUpload
                  files={learnerFiles}
                  onAdd={f => setLearnerFiles(prev => [...prev, f])}
                  onRemove={i => setLearnerFiles(prev => prev.filter((_, idx) => idx !== i))}
                  title="Learner transcripts or application responses"
                  subtitle="Upload interview notes, application answers, or intake forms for this specific hire. Claude will use them to personalize the blueprint."
                />
              )}

              <div className="btn-row">
                <button className="btn-back" onClick={() => {
                  if (step === 1) setView(mode === "revenue" ? "company_ctx" : "home");
                  else setStep(step - 1);
                }}>← Back</button>
                <button className="btn-primary" onClick={handleNextQuestion} disabled={!canAdvance()}>
                  {step === totalSteps ? "Generate Blueprint →" : "Next →"}
                </button>
              </div>
            </>
          )}

          {/* ── RESULTS ── */}
          {view === "results" && (
            <>
              {loading && chatHistory.length <= 1 && (
                <div className="loading-state">
                  <div className="spinner spinner-lg" />
                  <div className="loading-text">
                    {(companyCtx.files?.length > 0 || learnerFiles.length > 0)
                      ? "Reading your documents and building your blueprint…"
                      : "Analyzing and building your blueprint…"}
                  </div>
                </div>
              )}

              {chatHistory.length > 1 && (
                <>
                  <div className="result-topbar">
                    <div>
                      <div className="result-title">{blueprintLabel}</div>
                      {revisionCount > 1 && <div className="revision-note">Revision {revisionCount}</div>}
                    </div>
                    <div className="export-bar">
                      <button className="btn-ghost gold" onClick={() => setShowSaveModal(true)}>⬇ Save</button>
                      <button className="btn-ghost" onClick={() => { if (latestBlueprint) exportToWord(latestBlueprint, blueprintLabel); }}>↓ Export Word Doc</button>
                    </div>
                  </div>

                  <AnswersSummary />

                  <div className="chat-area">
                    {chatHistory.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                    {loading && <div className="loading-inline"><div className="spinner" /><div className="loading-text">Revising blueprint…</div></div>}
                  </div>

                  <div ref={bottomRef} />
                  {error && <div className="error-msg">{error}</div>}

                  {!loading && (
                    <div className="feedback-section">
                      <div className="feedback-label">Clarify or push back on anything →</div>
                      <div className="feedback-row">
                        <textarea className="feedback-input"
                          placeholder={mode === "revenue"
                            ? `e.g. "They use Challenger not MEDDIC" or "This hire has 3 years of CS experience"`
                            : `e.g. "The timeline is actually 4 weeks" or "She has prior experience I didn't mention"`}
                          value={feedbackInput} onChange={e => setFeedbackInput(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendFeedback(); } }}
                          rows={2}
                        />
                        <button className="btn-send" onClick={sendFeedback} disabled={!feedbackInput.trim()}>Revise →</button>
                      </div>
                      <div className="bottom-row">
                        <button className="btn-text" onClick={reset}>↺ Start over</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── SAVED ── */}
          {view === "saved" && (
            <>
              <div className="saved-title">Saved Blueprints</div>
              <div className="saved-sub">All answers, company context, and revisions preserved.</div>
              {savedBlueprints.length === 0 ? (
                <div className="saved-empty">No saved blueprints yet.<br />Generate one and hit "Save" to store it here.</div>
              ) : (
                <div className="saved-list">
                  {savedBlueprints.map(bp => (
                    <div key={bp.id} className="saved-item">
                      <div className="saved-item-info">
                        <div className="saved-item-type">{bp.mode === "revenue" ? `${FUNCTIONS.find(f => f.id === bp.selectedFn)?.label} · ${ROLES.find(r => r.id === bp.selectedRole)?.label}` : "General"}</div>
                        <div className="saved-item-name">{bp.name}</div>
                        <div className="saved-item-meta">{bp.savedAt} · {bp.chatHistory.filter(m => m.role === "assistant").length} version{bp.chatHistory.filter(m => m.role === "assistant").length !== 1 ? "s" : ""}{bp.uploadedFileNames?.length > 0 ? ` · ${bp.uploadedFileNames.length} file(s)` : ""}</div>
                      </div>
                      <div className="saved-item-actions">
                        <button className="btn-load" onClick={() => loadBlueprint(bp)}>Load →</button>
                        <button className="btn-del" onClick={() => deleteBlueprint(bp.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: "1.6rem", display: "flex", justifyContent: "flex-end" }}>
                <button className="btn-primary" onClick={reset}>+ New Blueprint</button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
