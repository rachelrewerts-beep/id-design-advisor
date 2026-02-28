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

const METHODOLOGIES = [
  "MEDDIC",
  "Challenger",
  "SPIN",
  "Command of the Message",
  "Business Review Framework",
  "Other",
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

const REVENUE_QUESTIONS_BASE = [
  { id: "timeline", label: "What's the onboarding timeline?", hint: "How long from start date to expected full productivity?", type: "single", options: ["2-4 weeks", "4-8 weeks", "8-12 weeks (standard)", "3-6 months (complex role)"] },
  { id: "teamSize", label: "How many people are being onboarded?", type: "single", options: ["1 person (individual)", "2-5 people (small cohort)", "6-15 people (team)", "15+ people (program scale)"] },
  { id: "contentClarity", label: "How well-defined is the existing onboarding?", hint: "Are you building from scratch or improving something that exists?", type: "single", options: ["Starting from scratch", "Some docs exist, no real structure", "Structured program exists, needs improvement", "Strong program, needs role-specific tuning"] },
  { id: "learnerExperience", label: "What's the hire's background?", type: "single", options: ["New to this function entirely", "Function experience, new to the industry", "Industry experience, new to this company", "Experienced and seasoned, just needs context"] },
  { id: "successLooks", label: "What does 'fully ramped' look like?", hint: "What specific thing should they be able to do autonomously that they can't on day 1?", type: "textarea" },
  { id: "outcomeType", label: "What's the biggest ramp risk at this company?", hint: "Consider both company-side factors (limited manager bandwidth, no structured playbook, unclear ICP) and hire-side gaps you've observed (confidence, product knowledge, process familiarity). Select all that apply.", type: "multi", options: ["Product/technical knowledge gaps", "Customer/prospect conversation confidence", "Internal process and tools confusion", "Culture and stakeholder navigation", "Manager not equipped to coach", "No structured playbook or content to ramp from"] },
  { id: "deliveryOwner", label: "Who will own delivery day-to-day?", type: "single", options: ["Direct manager", "Dedicated enablement/L&D team", "Onboarding buddy / peer", "A blend — manager + SME + peer + structured content"] },
  { id: "evaluationPriority", label: "How will you measure onboarding success?", type: "single", options: ["Time-to-first-milestone (call, deal, ticket)", "Manager confidence score at 30/60/90", "Retention at 6 months", "Hard revenue / retention metrics"] },
  { id: "constraints", label: "Any key constraints?", hint: "Manager bandwidth, tool limitations, remote vs. in-person, existing content you must use", type: "textarea" },
];

const PRODUCT_RAMP_QUESTIONS_IC = [
  { id: "productRampNeeded", label: "How much product ramp does this hire need?", hint: "Consider their background and how technical your product is", type: "single", options: ["Significant — they're new to this type of product entirely", "Moderate — they have general familiarity but not your specific product", "Light — they have directly relevant product experience", "Minimal — product knowledge isn't a core requirement for this role"] },
  { id: "productRampSuccess", label: "What does product readiness look like for this role?", hint: "Select all that apply — these become product ramp milestones in the blueprint", type: "multi", options: ["Can answer common customer questions on a live call without escalating", "Can navigate the product and find key reports independently", "Can mimic a customer's workflow to troubleshoot issues", "Can demo or walk through core use cases confidently", "Understands product positioning and competitive differentiation"] },
];

const PRODUCT_RAMP_QUESTIONS_DIRECTOR = [
  { id: "productRampNeeded", label: "How much product orientation does this leader need?", type: "single", options: ["Deep — they'll be hands-on with the product regularly", "Moderate — they need enough to coach their team and talk to customers", "Light — high-level awareness is sufficient for this role"] },
];

const STORAGE_KEY = "id_advisor_blueprints";
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ── System prompts ────────────────────────────────────────────────────────────

function buildSystemPrompt(mode, functionId, roleId) {
  const base = `You are an expert Instructional Designer with deep knowledge of ADDIE, SAM, Dick & Carey, Kemp Design Model, and Backwards Design.

On the first message, produce a strategic blueprint with these sections:

## Recommended Design Model
## Learning Objectives
## Product Ramp
## Key People to Meet
## Early Risks to Validate
## Evaluation Approach

IMPORTANT FORMATTING RULES:
- Never use markdown tables (no | pipes |)
- Use bullet points only
- For activities with owner/format/timing, use nested bullets:
  - Activity name
  - Owner: person
  - Format: format type
  - Timing: timing

On follow-up messages, respond conversationally first acknowledging what changed and why, then output the full revised blueprint with the same sections.`;

  if (mode === "general") {
    return base + `

Be specific and practical. If transcript or application content is uploaded, extract learner insights (prior experience, goals, gaps, motivations) and personalize the blueprint. Call out 1-2 specific insights that shaped your recommendations. Keep the initial blueprint under 700 words.`;
  }

  const roleContext = ROLE_FUNCTION_CONTEXT[functionId]?.[roleId] || "";
  const fnLabel = FUNCTIONS.find(f => f.id === functionId)?.label || functionId;
  const roleLabel = ROLES.find(r => r.id === roleId)?.label || roleId;
  const isDirector = roleId === "director";

  return base + `

You are designing a ${fnLabel} onboarding program for a ${roleLabel}. Context: ${roleContext}

COMPANY CONTEXT: If the user has provided methodology, ICP, stakeholders, or company documents, use them to make every section company-specific. Reference actual methodology names, ICP characteristics, product use cases, and internal terminology. The program outline should reflect their real stack and process.

PRODUCT RAMP SECTION: 
${isDirector
  ? "For a Director, product ramp is about strategic orientation — watching customer videos, understanding positioning, and getting enough product context to coach their team and speak credibly to customers. Keep this section brief (3-5 bullets). Emphasize self-led learning: recorded demos, customer call recordings, shadowing a product walkthrough."
  : "For this role, product ramp is a critical milestone. Design it as a self-led progression: recorded videos and documentation first, then hands-on practice in the application, then observed practice on a live call. Include specific success milestones based on what the user indicated (e.g. can answer customer questions on a call, can find key reports, can mimic customer workflows). Make it concrete — name the activity type, not just the category."}

KEY PEOPLE TO MEET SECTION:
Based on the role, function, and any stakeholders provided, suggest a structured meeting plan:
- Week 1: Internal orientation meetings (direct manager, team members, immediate cross-functional partners)
- Week 2: Broader stakeholder meetings (adjacent teams, key internal resources, leadership where appropriate)
If specific names/titles were provided by the user, use them. Otherwise suggest role-based recommendations appropriate to the function and seniority level.

If learner transcripts or application responses are uploaded, extract insights about this specific hire and personalize the blueprint to their background, gaps, and communication style. Call out 1-2 specific insights from the transcript that shaped your recommendations.

Think like a consultant who has built onboarding programs at B2B SaaS companies. Be concrete. Name specific activities, not categories. Keep the blueprint under 700 words — focused and actionable.`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
// ── Plan system prompt ───────────────────────────────────────────────────────

function buildPlanSystemPrompt(mode, functionId, roleId, blueprintText) {
  const fnLabel = FUNCTIONS.find(f => f.id === functionId)?.label || functionId;
  const roleLabel = ROLES.find(r => r.id === roleId)?.label || roleId;
  return `You are an expert Instructional Designer building a week-by-week onboarding program plan.

Here is the strategic blueprint you are executing against:
${blueprintText}

Generate a complete week-by-week program plan covering every week of the onboarding timeline.

Structure EVERY week exactly like this:

## Week N — [Descriptive Title]
### Product
- Activity name
- Owner: person
- Format: format
- Timing: specific day or days
### Program
- Activity name
- Owner: person
- Format: format
- Timing: specific day or days

RULES:
- Cover ALL weeks — do not stop early
- Product activities taper off naturally: heavy weeks 1-3, lighter weeks 4-6, gone by week 7+. Write "No product activities this week" under ### Product if none.
- Program activities run every week throughout
- 2-4 activities per section per week maximum — quality over quantity
- Be specific: use real names, tools, and formats from the blueprint context
- Never use markdown tables
- On follow-up feedback, output the complete revised plan — all weeks, same structure`;
}



function getRevenueQuestions(roleId) {
  const productQs = roleId === "director" ? PRODUCT_RAMP_QUESTIONS_DIRECTOR : PRODUCT_RAMP_QUESTIONS_IC;
  return [...REVENUE_QUESTIONS_BASE, ...productQs];
}

function formatAnswers(answers, questions) {
  return questions.map(q => {
    const val = answers[q.id];
    if (!val || (Array.isArray(val) && val.length === 0)) return null;
    return `${q.label}\nAnswer: ${Array.isArray(val) ? val.join(", ") : val}`;
  }).filter(Boolean).join("\n\n");
}

const SUB_ITEM_PREFIXES = /^(Owner|Format|Timing|Week|Day|Duration|Who|When|How):/i;

function parseMarkdown(text) {
  const lines = text.split("\n");
  let html = ""; let inUl = false; let inOl = false;

  const closeList = () => {
    if (inUl) { html += "</ul>"; inUl = false; }
    if (inOl) { html += "</ol>"; inOl = false; }
  };

  for (const line of lines) {
    const raw = line;
    const t = line.trim();
    if (t.startsWith("|") || t.match(/^\|?[-:]+\|/)) continue;

    const isIndented = raw.match(/^(\s{2,}|\t)- /);
    const isSubKeyword = t.startsWith("- ") && SUB_ITEM_PREFIXES.test(t.slice(2));

    if (t.startsWith("## ")) {
      closeList();
      html += `<h2>${t.slice(3)}</h2>`;
    } else if (t.match(/^(\d+)\. /)) {
      if (!inOl) { closeList(); html += "<ol>"; inOl = true; }
      html += `<li>${t.replace(/^\d+\. /, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`;
    } else if (isIndented || isSubKeyword) {
      if (!inUl) { html += "<ul>"; inUl = true; }
      const content = t.replace(/^-\s*/, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      html += `<li class="sub-item">${content}</li>`;
    } else if (t.startsWith("- ")) {
      if (!inUl) { closeList(); html += "<ul>"; inUl = true; }
      html += `<li>${t.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`;
    } else if (t === "") {
      closeList();
    } else {
      closeList();
      html += `<p>${t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`;
    }
  }
  closeList();
  return html;
}

function parseMarkdownToWord(text) {
  const lines = text.split("\n");
  let html = ""; let inUl = false; let inOl = false;
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("|") || t.match(/^\|?[-:]+\|/)) continue;
    if (t.startsWith("## ")) { if (inUl) { html += "</ul>"; inUl = false; } if (inOl) { html += "</ol>"; inOl = false; } html += `<h2>${t.slice(3)}</h2>`; }
    else if (t.match(/^\d+\. /)) { if (!inOl) { if (inUl) { html += "</ul>"; inUl = false; } html += "<ol>"; inOl = true; } html += `<li>${t.replace(/^\d+\. /, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`; }
    else if (t.startsWith("  - ") || t.startsWith("    - ")) { if (!inUl) { html += "<ul>"; inUl = true; } html += `<li style="margin-left:20pt">${t.replace(/^\s+- /, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`; }
    else if (t.startsWith("- ")) { if (!inUl) { if (inOl) { html += "</ol>"; inOl = false; } html += "<ul>"; inUl = true; } html += `<li>${t.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`; }
    else if (t === "") { if (inUl) { html += "</ul>"; inUl = false; } if (inOl) { html += "</ol>"; inOl = false; } html += "<p>&nbsp;</p>"; }
    else { if (inUl) { html += "</ul>"; inUl = false; } if (inOl) { html += "</ol>"; inOl = false; } html += `<p>${t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`; }
  }
  if (inUl) html += "</ul>"; if (inOl) html += "</ol>";
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

function splitBlueprintAndPlan(text) {
  const sep = "---PROGRAM_PLAN---";
  const idx = text.indexOf(sep);
  if (idx === -1) return { blueprint: text, programPlan: null };
  return {
    blueprint: text.slice(0, idx).trim(),
    programPlan: text.slice(idx + sep.length).trim(),
  };
}

function parseProgramWeeks(text) {
  if (!text) return [];
  const weeks = [];
  const lines = text.split("\n");
  let currentWeek = null;
  let currentSection = null; // "product" | "program"

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;

    const weekMatch = t.match(/^##\s+Week\s+(\d+)\s*[—–-]?\s*(.*)/i);
    if (weekMatch) {
      if (currentWeek) weeks.push(currentWeek);
      currentWeek = { number: parseInt(weekMatch[1]), title: weekMatch[2].trim(), product: [], program: [] };
      currentSection = null;
      continue;
    }

    if (!currentWeek) continue;

    if (t.match(/^###\s+Product/i)) { currentSection = "product"; continue; }
    if (t.match(/^###\s+Program/i)) { currentSection = "program"; continue; }

    if (t.startsWith("- ") && currentSection) {
      currentWeek[currentSection].push(t.slice(2));
    }
  }
  if (currentWeek) weeks.push(currentWeek);
  return weeks;
}

function exportToWord(blueprint, programPlan, programWeeks, label) {
  const date = new Date().toLocaleDateString();
  const blueprintHtml = parseMarkdownToWord(blueprint || "");

  // Build week-by-week HTML for Word
  let planHtml = "";
  if (programWeeks && programWeeks.length > 0) {
    planHtml += `<h1 style="page-break-before:always">Program Plan — Week by Week</h1>`;
    for (const week of programWeeks) {
      planHtml += `<h2>Week ${week.number}${week.title ? " — " + week.title : ""}</h2>`;
      if (week.product.length > 0 && week.product[0] !== "No product activities this week") {
        planHtml += `<h3 style="font-size:11pt;font-weight:bold;color:#5a7a5a;margin:8pt 0 4pt">Product</h3><ul>`;
        for (const item of week.product) {
          const isSub = SUB_ITEM_PREFIXES.test(item);
          planHtml += isSub
            ? `<li style="margin-left:20pt;color:#666;font-size:10pt">${item}</li>`
            : `<li>${item.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`;
        }
        planHtml += `</ul>`;
      }
      if (week.program.length > 0) {
        planHtml += `<h3 style="font-size:11pt;font-weight:bold;color:#5a5a7a;margin:8pt 0 4pt">Program</h3><ul>`;
        for (const item of week.program) {
          const isSub = SUB_ITEM_PREFIXES.test(item);
          planHtml += isSub
            ? `<li style="margin-left:20pt;color:#666;font-size:10pt">${item}</li>`
            : `<li>${item.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`;
        }
        planHtml += `</ul>`;
      }
    }
  }

  const wordHTML = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>body{font-family:Arial,sans-serif;font-size:12pt;color:#1a1a1a;margin:1in}h1{font-size:18pt;font-weight:bold;color:#1a1a1a;border-bottom:2pt solid #c8a96e;padding-bottom:6pt;margin-bottom:12pt}h2{font-size:13pt;font-weight:bold;color:#7a5a2a;margin-top:16pt;margin-bottom:5pt}p{font-size:12pt;line-height:1.5;margin:4pt 0}ul,ol{margin:6pt 0 6pt 20pt}li{font-size:11pt;line-height:1.5;margin-bottom:3pt}strong{font-weight:bold}.meta{font-size:10pt;color:#666;margin-bottom:24pt}</style></head><body><h1>${label}</h1><p class="meta">Instructional Design Blueprint &nbsp;·&nbsp; ${date}</p>${blueprintHtml}${planHtml}</body></html>`;
  const blob = new Blob([wordHTML], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${label.replace(/[^a-z0-9]/gi, "_")}_Blueprint.doc`;
  a.click(); URL.revokeObjectURL(url);
}

// ── File Upload with context ──────────────────────────────────────────────────

function FileUpload({ files, onAdd, onRemove, onUpdateContext, title, subtitle, maxFiles = 5 }) {
  const inputRef = useRef();
  const [fileError, setFileError] = useState("");

  const handleFiles = async (incoming) => {
    setFileError("");
    for (const file of Array.from(incoming)) {
      if (files.length >= maxFiles) { setFileError(`Maximum ${maxFiles} files allowed.`); break; }
      if (file.size > MAX_FILE_SIZE_BYTES) { setFileError(`"${file.name}" is too large. Max file size is ${MAX_FILE_SIZE_MB}MB.`); continue; }
      const isText = file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md");
      const isPDF = file.type === "application/pdf";
      if (!isText && !isPDF) { setFileError(`"${file.name}" is not supported. Please upload .txt, .md, or .pdf files.`); continue; }
      try {
        let content, contentType;
        if (isText) { content = await readFileAsText(file); contentType = "text"; }
        else { content = await readFileAsBase64(file); contentType = "pdf"; }
        onAdd({ name: file.name, content, contentType, size: file.size, context: "" });
      } catch (e) { setFileError(`Could not read "${file.name}". Please try again.`); }
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
            <div key={i} className="file-item">
              <div className="file-chip">
                <span className="file-icon">{f.contentType === "pdf" ? "PDF" : "TXT"}</span>
                <span className="file-name">{f.name}</span>
                <span className="file-size">{(f.size / 1024).toFixed(0)}kb</span>
                <button className="file-remove" onClick={() => onRemove(i)}>✕</button>
              </div>
              <input
                className="file-context-input"
                placeholder="Optional: describe this file (e.g. 'current onboarding doc' or 'candidate LinkedIn export')"
                value={f.context || ""}
                onChange={e => onUpdateContext(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
      {fileError && <div className="file-error">{fileError}</div>}
      {files.length < maxFiles && (
        <div className="drop-zone" onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("dragging"); }}
          onDragLeave={e => e.currentTarget.classList.remove("dragging")}
          onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("dragging"); handleFiles(e.dataTransfer.files); }}>
          <input ref={inputRef} type="file" accept=".txt,.md,.pdf" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
          <span className="drop-icon">↑</span>
          <span className="drop-text">Drop files or <span className="drop-link">browse</span></span>
          <span className="drop-hint">.txt, .md, .pdf · max {MAX_FILE_SIZE_MB}MB per file · up to {maxFiles} files</span>
        </div>
      )}
    </div>
  );
}

// ── Company Context Step ──────────────────────────────────────────────────────

function CompanyContextStep({ context, onChange }) {
  const [showOtherMethodology, setShowOtherMethodology] = useState(
    context.methodology && !METHODOLOGIES.slice(0, -1).includes(context.methodology) ? true : false
  );

  const handleMethodologySelect = (val) => {
    if (val === "Other") {
      setShowOtherMethodology(true);
      onChange({ ...context, methodology: "", methodologySelected: "Other" });
    } else {
      setShowOtherMethodology(false);
      onChange({ ...context, methodology: val, methodologySelected: val });
    }
  };

  return (
    <div className="company-context">
      <div className="cc-header">
        <div className="cc-title">Company Context</div>
        <div className="cc-badge">Makes blueprints company-specific</div>
      </div>
      <div className="cc-sub">The more you share here, the more the blueprint will reflect how your client actually operates — not generic best practices.</div>

      <div className="cc-field">
        <label className="cc-label">Sales or CS methodology</label>
        <div className="cc-hint">Select the primary methodology this team uses</div>
        <div className="methodology-grid">
          {METHODOLOGIES.map(m => (
            <button key={m}
              className={`method-btn ${(context.methodologySelected || context.methodology) === m ? "selected" : ""}`}
              onClick={() => handleMethodologySelect(m)}>{m}</button>
          ))}
        </div>
        {showOtherMethodology && (
          <input className="cc-input-single" style={{ marginTop: "0.6rem" }}
            placeholder="Describe your methodology..."
            value={context.methodology || ""}
            onChange={e => onChange({ ...context, methodology: e.target.value, methodologySelected: "Other" })}
          />
        )}
      </div>

      <div className="cc-field">
        <label className="cc-label">Ideal Customer Profile (ICP)</label>
        <div className="cc-hint">Who are their customers? Size, industry, buyer persona, what they care about</div>
        <textarea className="cc-input" rows={2}
          placeholder="e.g. Mid-market B2B SaaS, 100-500 employees, RevOps or CS leaders as primary buyers, care about retention and expansion..."
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
        <label className="cc-label">Key people this hire should meet</label>
        <div className="cc-hint">List names and titles — the blueprint will suggest when to schedule each meeting (Week 1 vs Week 2)</div>
        <textarea className="cc-input" rows={3}
          placeholder={"e.g.\nJordan Lee, VP of Customer Success\nAlex Kim, Head of Product\nMaria Chen, Sales Director\nOnboarding buddy: Sam Rivera, Sr. CSM"}
          value={context.stakeholders || ""}
          onChange={e => onChange({ ...context, stakeholders: e.target.value })}
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
        onUpdateContext={(i, val) => {
          const updated = [...(context.files || [])];
          updated[i] = { ...updated[i], context: val };
          onChange({ ...context, files: updated });
        }}
        title="Upload company materials"
        subtitle="Playbooks, existing onboarding docs, positioning guides — Claude will read these and reference them in the blueprint."
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
  const [view, setView] = useState("home");
  const [mode, setMode] = useState(null);
  const [selectedFn, setSelectedFn] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [companyCtx, setCompanyCtx] = useState({});
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [learnerFiles, setLearnerFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [feedbackInput, setFeedbackInput] = useState("");
  const [savedBlueprints, setSavedBlueprints] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [planHistory, setPlanHistory] = useState([]);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState("");
  const bottomRef = useRef(null);

  const questions = mode === "revenue" ? getRevenueQuestions(selectedRole) : GENERAL_QUESTIONS;
  const totalSteps = questions.length;
  const currentQ = questions[step - 1];
  const progress = Math.round((step / totalSteps) * 100);
  const revisionCount = chatHistory.filter(m => m.role === "assistant").length;
  const latestBlueprint = [...chatHistory].filter(m => m.role === "assistant").pop()?.content || null;
  const latestPlanRaw = [...planHistory].filter(m => m.role === "assistant").pop()?.content || null;
  const programWeeks = parseProgramWeeks(latestPlanRaw);

  const blueprintLabel = mode === "revenue"
    ? `${FUNCTIONS.find(f => f.id === selectedFn)?.label} ${ROLES.find(r => r.id === selectedRole)?.label} Onboarding`
    : (answers.context?.slice(0, 40) || "Blueprint");

  useEffect(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) setSavedBlueprints(JSON.parse(saved)); } catch {}
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
    let text = `Program Intake Answers:\n\n${formatAnswers(ans, questions)}`;

    if (mode === "revenue") {
      const ctxParts = [];
      if (compCtx.methodology) ctxParts.push(`Methodology: ${compCtx.methodology}`);
      if (compCtx.icp) ctxParts.push(`ICP: ${compCtx.icp}`);
      if (compCtx.product) ctxParts.push(`Product: ${compCtx.product}`);
      if (compCtx.stakeholders) ctxParts.push(`Key people to meet:\n${compCtx.stakeholders}`);
      if (compCtx.other) ctxParts.push(`Additional context: ${compCtx.other}`);
      if (ctxParts.length > 0) text += `\n\n---\nCOMPANY CONTEXT:\n${ctxParts.join("\n")}`;

      if (compCtx.files?.length > 0) {
        compCtx.files.filter(f => f.contentType === "text").forEach((f, i) => {
          const truncated = f.content.length > 5000 ? f.content.slice(0, 5000) + "\n[truncated]" : f.content;
          const ctx = f.context ? ` (${f.context})` : "";
          text += `\n\n---\nCompany Document ${i + 1}: ${f.name}${ctx}\n${truncated}`;
        });
        compCtx.files.filter(f => f.contentType === "pdf").forEach(f => {
          parts.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: f.content } });
          const ctx = f.context ? ` (${f.context})` : "";
          parts.push({ type: "text", text: `(Company document: ${f.name}${ctx})` });
        });
      }
    }

    text += "\n\nPlease provide your instructional design recommendation.";
    parts.unshift({ type: "text", text });

    lFiles.forEach(f => {
      const ctx = f.context ? ` (${f.context})` : "";
      if (f.contentType === "text") {
        const truncated = f.content.length > 5000 ? f.content.slice(0, 5000) + "\n[truncated]" : f.content;
        parts.push({ type: "text", text: `\n---\nLearner Document: ${f.name}${ctx}\n${truncated}` });
      } else {
        parts.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: f.content } });
        parts.push({ type: "text", text: `(Learner document: ${f.name}${ctx})` });
      }
    });

    return { parts, systemPrompt };
  };

  const callAPI = async (history, sysPrompt) => {
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 5000,
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
    } catch (e) {
      setError("Unfortunately, your blueprint did not generate. Please try again — if the issue continues, check your inputs and try with less uploaded content.");
      console.error("Blueprint generation error:", e.message);
    }
    setLoading(false);
  };

  const runPlanGeneration = async () => {
    if (!latestBlueprint) return;
    setPlanLoading(true); setPlanError(""); setShowPlan(false);
    const sysPrompt = buildPlanSystemPrompt(mode, selectedFn, selectedRole, latestBlueprint);
    const userMsg = { role: "user", content: "Generate the full week-by-week program plan based on this blueprint.", isChat: false };
    const newHistory = [userMsg];
    setPlanHistory(newHistory);
    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 6000,
          system: sysPrompt,
          messages: newHistory.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.map(b => b.text || "").join("") || "";
      setPlanHistory([...newHistory, { role: "assistant", content: text }]);
      setShowPlan(true);
    } catch (e) {
      setPlanError("Unfortunately, the program plan did not generate. Please try again.");
      console.error("Plan generation error:", e.message);
    }
    setPlanLoading(false);
  };

  const handleNextQuestion = () => {
    if (step < totalSteps) setStep(step + 1);
    else { setView("results"); runAnalysis(answers, companyCtx, learnerFiles); }
  };

  const handleEditSave = (newAnswers) => {
    setAnswers(newAnswers); setShowEditor(false); setChatHistory([]); setShowPlan(false); setPlanHistory([]); setPlanError("");
    setView("results"); runAnalysis(newAnswers, companyCtx, learnerFiles);
  };

  const sendFeedback = async () => {
    if (!feedbackInput.trim() || loading || planLoading) return;
    const isPlanFeedback = planHistory.length > 1;
    if (isPlanFeedback) {
      // Route to plan
      setPlanLoading(true); setPlanError("");
      const userMsg = { role: "user", content: feedbackInput.trim(), isChat: true };
      const newHistory = [...planHistory, userMsg];
      setPlanHistory(newHistory); setFeedbackInput("");
      try {
        const res = await fetch("/api/claude", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 6000,
            system: buildPlanSystemPrompt(mode, selectedFn, selectedRole, latestBlueprint),
            messages: newHistory.map(({ role, content }) => ({ role, content })),
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        const text = data.content?.map(b => b.text || "").join("") || "";
        setPlanHistory([...newHistory, { role: "assistant", content: text }]);
      } catch (e) {
        setPlanError("Unfortunately, the program plan did not update. Please try again.");
      }
      setPlanLoading(false);
    } else {
      // Route to blueprint
      setLoading(true); setError("");
      const userMsg = { role: "user", content: feedbackInput.trim(), isChat: true };
      const newHistory = [...chatHistory, userMsg];
      setChatHistory(newHistory); setFeedbackInput("");
      // Clear plan when blueprint changes
      setPlanHistory([]); setShowPlan(false);
      try {
        const text = await callAPI(newHistory);
        setChatHistory([...newHistory, { role: "assistant", content: text }]);
      } catch (e) {
        setError("Unfortunately, your blueprint did not update. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleSave = async (name, onSuccess) => {
    const bp = {
      id: Date.now(), name, savedAt: new Date().toLocaleDateString(),
      mode, selectedFn, selectedRole, answers,
      companyCtx: { ...companyCtx, files: [] },
      chatHistory, uploadedFileNames: learnerFiles.map(f => f.name),
      label: blueprintLabel,
    };
    const updated = [bp, ...savedBlueprints];
    setSavedBlueprints(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); onSuccess?.(); } catch {}
  };

  const loadBlueprint = (bp) => {
    setMode(bp.mode); setSelectedFn(bp.selectedFn); setSelectedRole(bp.selectedRole);
    setAnswers(bp.answers); setCompanyCtx(bp.companyCtx || {}); setChatHistory(bp.chatHistory);
    setLearnerFiles([]); setView("results");
  };

  const deleteBlueprint = async (id) => {
    const updated = savedBlueprints.filter(b => b.id !== id);
    setSavedBlueprints(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  };

  const reset = () => {
    setView("home"); setMode(null); setSelectedFn(null); setSelectedRole(null);
    setCompanyCtx({}); setStep(1); setAnswers({}); setLearnerFiles([]);
    setChatHistory([]); setFeedbackInput(""); setError(""); setShowPlan(false); setPlanHistory([]); setPlanError("");
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
    .intro-headline { font-family: 'Playfair Display', serif; font-size: 2.4rem; font-weight: 900; line-height: 1.1; color: #f0ebe0; margin-bottom: 1rem; }
    .intro-sub { font-size: 0.92rem; font-weight: 300; color: #8a8d9a; line-height: 1.7; margin-bottom: 2rem; }
    .mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .mode-card { background: #0d0f14; border: 1px solid #2a2d38; border-radius: 14px; padding: 1.5rem; cursor: pointer; transition: all 0.15s; text-align: left; }
    .mode-card:hover { border-color: #c8a96e66; background: #101318; }
    .mode-card-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: #f0ebe0; margin-bottom: 0.4rem; }
    .mode-card-sub { font-size: 0.78rem; color: #5a5d6a; font-weight: 300; line-height: 1.5; }
    .models-footnote { font-size: 0.72rem; color: #3a3d4a; font-weight: 300; text-align: center; margin-top: 1rem; line-height: 1.5; }
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
    .cc-input-single { width: 100%; background: #0d0f14; border: 1px solid #2a2d38; border-radius: 9px; padding: 0.65rem 1rem; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 300; color: #e8e4dc; outline: none; transition: border-color 0.2s; }
    .cc-input-single:focus { border-color: #c8a96e; }
    .cc-input-single::placeholder { color: #3a3d4a; }
    .methodology-grid { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.35rem; }
    .method-btn { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 400; color: #8a8d9a; background: #0d0f14; border: 1px solid #2a2d38; border-radius: 8px; padding: 0.45rem 0.9rem; cursor: pointer; transition: all 0.12s; }
    .method-btn:hover { border-color: #4a4d5a; color: #e8e4dc; }
    .method-btn.selected { border-color: #c8a96e; color: #e8c87a; background: rgba(200,169,110,0.08); }
    .progress-bar { height: 2px; background: #1e2130; border-radius: 2px; margin-bottom: 2rem; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #c8a96e, #e8c87a); border-radius: 2px; transition: width 0.4s ease; }
    .step-label { font-size: 0.68rem; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: #c8a96e; margin-bottom: 0.6rem; }
    .question-text { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: #f0ebe0; line-height: 1.3; margin-bottom: 0.4rem; }
    .question-hint { font-size: 0.8rem; color: #5a5d6a; margin-bottom: 1.4rem; font-weight: 300; line-height: 1.55; }
    .multi-hint { font-size: 0.68rem; color: #5a5d6a; margin-bottom: 0.8rem; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 500; }
    .answer-input { width: 100%; background: #0d0f14; border: 1px solid #2a2d38; border-radius: 10px; padding: 0.85rem 1rem; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 300; color: #e8e4dc; resize: vertical; outline: none; transition: border-color 0.2s; margin-bottom: 1.4rem; }
    .answer-input:focus { border-color: #c8a96e; }
    .answer-input::placeholder { color: #3a3d4a; }
    .options-grid { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.4rem; }
    .option-btn { width: 100%; text-align: left; background: #0d0f14; border: 1px solid #2a2d38; border-radius: 10px; padding: 0.8rem 1rem; font-family: 'DM Sans', sans-serif; font-size: 0.86rem; font-weight: 400; color: #8a8d9a; cursor: pointer; transition: all 0.12s; }
    .option-btn:hover { border-color: #4a4d5a; color: #e8e4dc; background: #161920; }
    .option-btn.selected { border-color: #c8a96e; color: #e8c87a; background: rgba(200,169,110,0.08); }
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
    .upload-panel { background: #0a0c12; border: 1px solid #2a2d38; border-radius: 12px; padding: 1.1rem; margin-top: 0.5rem; }
    .upload-title-row { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.3rem; }
    .upload-title { font-size: 0.8rem; font-weight: 500; color: #c8c4bc; }
    .upload-badge { font-size: 0.6rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #5a5d6a; border: 1px solid #2a2d38; border-radius: 100px; padding: 0.15rem 0.5rem; }
    .upload-sub { font-size: 0.76rem; color: #5a5d6a; font-weight: 300; line-height: 1.5; margin-bottom: 0.75rem; }
    .file-list { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 0.6rem; }
    .file-item { display: flex; flex-direction: column; gap: 0.3rem; }
    .file-chip { display: flex; align-items: center; gap: 0.45rem; background: #13161e; border: 1px solid #2a2d38; border-radius: 8px; padding: 0.45rem 0.7rem; }
    .file-icon { font-size: 0.6rem; font-weight: 600; letter-spacing: 0.06em; color: #5a5d6a; background: #1e2130; border-radius: 4px; padding: 0.15rem 0.35rem; flex-shrink: 0; }
    .file-name { font-size: 0.78rem; color: #c8c4bc; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .file-size { font-size: 0.68rem; color: #4a4d5a; flex-shrink: 0; }
    .file-remove { font-size: 0.72rem; color: #4a4d5a; background: none; border: none; cursor: pointer; transition: color 0.15s; }
    .file-remove:hover { color: #e07070; }
    .file-context-input { width: 100%; background: #0d0f14; border: 1px solid #1e2130; border-radius: 7px; padding: 0.45rem 0.7rem; font-family: 'DM Sans', sans-serif; font-size: 0.75rem; font-weight: 300; color: #7a7d8a; outline: none; transition: border-color 0.2s; }
    .file-context-input:focus { border-color: #c8a96e55; color: #c8c4bc; }
    .file-context-input::placeholder { color: #2a2d38; }
    .file-error { font-size: 0.76rem; color: #e07070; margin-bottom: 0.5rem; padding: 0.5rem 0.75rem; background: rgba(224,112,112,0.08); border-radius: 7px; border: 1px solid rgba(224,112,112,0.2); }
    .drop-zone { border: 1px dashed #2a2d38; border-radius: 9px; padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; cursor: pointer; transition: all 0.15s; }
    .drop-zone:hover, .drop-zone.dragging { border-color: #c8a96e66; background: rgba(200,169,110,0.04); }
    .drop-icon { font-size: 1.1rem; color: #4a4d5a; }
    .drop-text { font-size: 0.8rem; color: #6a6d7a; }
    .drop-link { color: #c8a96e; text-decoration: underline; }
    .drop-hint { font-size: 0.68rem; color: #4a4d5a; font-weight: 300; }
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
    .result-body h2 { font-family: 'Playfair Display', serif; font-size: 0.98rem; font-weight: 700; color: #e8c87a; margin-top: 1.3rem; margin-bottom: 0.4rem; background: rgba(200,169,110,0.06); padding: 0.4rem 0.75rem; border-radius: 6px; border-left: 3px solid #c8a96e; }
    .result-body h2:first-child { margin-top: 0; }
    .result-body ul { padding-left: 1.15rem; margin: 0.35rem 0; }
    .result-body ol { padding-left: 1.3rem; margin: 0.35rem 0; }
    .result-body li { margin-bottom: 0.35rem; }
    .result-body li.sub-item { color: #7a7d8a; font-size: 0.84rem; margin-left: 0.75rem; margin-bottom: 0.2rem; }
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
    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 0; gap: 1.4rem; }
    .loading-inline { display: flex; align-items: center; gap: 0.6rem; padding: 0.4rem 0; }
    .spinner { width: 18px; height: 18px; border: 2px solid #2a2d38; border-top-color: #c8a96e; border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; }
    .spinner-lg { width: 32px; height: 32px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-text { font-size: 0.82rem; color: #5a5d6a; font-weight: 300; }
    .error-msg { color: #e07070; font-size: 0.84rem; margin-top: 0.6rem; padding: 0.85rem 1rem; background: rgba(224,112,112,0.08); border-radius: 10px; border: 1px solid rgba(224,112,112,0.2); line-height: 1.5; }
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
    .program-plan { margin-top: 2rem; border-top: 2px solid #c8a96e33; padding-top: 1.75rem; }
    .plan-header { margin-bottom: 1.4rem; }
    .plan-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: #f0ebe0; margin-bottom: 0.25rem; }
    .plan-subtitle { font-size: 0.78rem; color: #5a5d6a; font-weight: 300; }
    .plan-week { background: #0d0f14; border: 1px solid #2a2d38; border-radius: 14px; margin-bottom: 0.9rem; overflow: hidden; }
    .plan-week-header { display: flex; align-items: baseline; gap: 0.75rem; padding: 0.85rem 1.2rem; background: #13161e; border-bottom: 1px solid #1e2130; }
    .plan-week-num { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #c8a96e; flex-shrink: 0; }
    .plan-week-title { font-size: 0.88rem; font-weight: 500; color: #e8e4dc; }
    .plan-week-body { padding: 1rem 1.2rem; display: flex; flex-direction: column; gap: 1rem; }
    .plan-section { display: flex; flex-direction: column; gap: 0.4rem; }
    .plan-section-label { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; padding: 0.2rem 0.55rem; border-radius: 4px; display: inline-block; width: fit-content; }
    .product-label { color: #6aaa88; background: rgba(106,170,136,0.1); border: 1px solid rgba(106,170,136,0.2); }
    .program-label { color: #7a9acc; background: rgba(122,154,204,0.1); border: 1px solid rgba(122,154,204,0.2); }
    .plan-list { list-style: none; padding: 0; margin: 0.25rem 0 0 0; display: flex; flex-direction: column; gap: 0.25rem; }
    .plan-item { font-size: 0.86rem; font-weight: 400; color: #c8c4bc; line-height: 1.5; padding-left: 0.85rem; position: relative; }
    .plan-item::before { content: '–'; position: absolute; left: 0; color: #4a4d5a; }
    .plan-sub { font-size: 0.78rem; font-weight: 300; color: #6a6d7a; line-height: 1.4; padding-left: 1.6rem; position: relative; }
    .plan-sub::before { content: '·'; position: absolute; left: 0.85rem; color: #3a3d4a; }
    .plan-export-row { display: flex; justify-content: flex-end; padding-top: 1rem; margin-top: 0.5rem; border-top: 1px solid #1e2130; }
    .plan-cta { background: linear-gradient(135deg, rgba(200,169,110,0.06), rgba(200,169,110,0.02)); border: 1px solid #c8a96e44; border-radius: 14px; padding: 1.4rem 1.5rem; margin-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; }
    .plan-cta-title { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: #f0ebe0; margin-bottom: 0.3rem; }
    .plan-cta-sub { font-size: 0.78rem; color: #7a7d8a; font-weight: 300; line-height: 1.5; }
    .plan-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
    .btn-reveal { font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500; color: #c8a96e; background: rgba(200,169,110,0.08); border: 1px solid #c8a96e55; border-radius: 10px; padding: 0.6rem 1.2rem; cursor: pointer; transition: all 0.15s; white-space: nowrap; flex-shrink: 0; }
    .btn-reveal:hover { background: rgba(200,169,110,0.16); }
    .plan-preview { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.75rem; }
    .plan-preview-pill { font-size: 0.72rem; font-weight: 400; color: #5a5d6a; background: #0d0f14; border: 1px solid #2a2d38; border-radius: 100px; padding: 0.3rem 0.75rem; }
  `;

  return (
    <>
      <style>{CSS}</style>
      {showSaveModal && <SaveModal label={blueprintLabel} onSave={handleSave} onClose={() => setShowSaveModal(false)} />}
      {showEditor && <AnswerEditor answers={answers} questions={questions} onSave={handleEditSave} onClose={() => setShowEditor(false)} />}

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
                  onUpdateContext={(i, val) => {
                    const updated = [...learnerFiles];
                    updated[i] = { ...updated[i], context: val };
                    setLearnerFiles(updated);
                  }}
                  title="Learner transcripts or application responses"
                  subtitle="Upload interview notes, application answers, or intake forms. Claude will use them to personalize the blueprint."
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
              {!loading && error && chatHistory.length <= 1 && (
                <div className="error-state">
                  <div className="error-msg">{error}</div>
                  <div className="btn-row" style={{ marginTop: "1.25rem" }}>
                    <button className="btn-back" onClick={() => { setView("questions"); setStep(questions.length); setError(""); }}>← Back to questions</button>
                    <button className="btn-primary" onClick={() => { setError(""); runAnalysis(answers, companyCtx, learnerFiles); }}>Try again →</button>
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
                      <button className="btn-ghost" onClick={() => { if (latestBlueprint) exportToWord(latestBlueprint, latestPlanRaw, programWeeks, blueprintLabel); }}>↓ Export Word Doc</button>
                    </div>
                  </div>
                  <AnswersSummary />

                  {/* Blueprint chat bubbles — only show last assistant message */}
                  <div className="chat-area">
                    {chatHistory.filter(m => m.role === "user" && m.isChat).map((msg, i) => (
                      <div key={i} className="chat-bubble user-bubble">
                        <div className="bubble-label">You</div>
                        <div className="bubble-text">{msg.content}</div>
                      </div>
                    ))}
                    {latestBlueprint && (
                      <div className="chat-bubble ai-bubble">
                        <div className="bubble-label">Blueprint</div>
                        <div className="result-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(latestBlueprint) }} />
                      </div>
                    )}
                    {loading && <div className="loading-inline"><div className="spinner" /><div className="loading-text">Revising blueprint…</div></div>}
                  </div>

                  {/* Generate Plan Button */}
                  {latestBlueprint && !loading && planHistory.length === 0 && (
                    <div className="plan-cta">
                      <div className="plan-cta-text">
                        <div className="plan-cta-title">Ready to build the week-by-week plan?</div>
                        <div className="plan-cta-sub">Review the blueprint above, make any changes, then generate the full program plan.</div>
                      </div>
                      <button className="btn-primary" onClick={runPlanGeneration}>Generate Program Plan →</button>
                    </div>
                  )}

                  {/* Plan Loading */}
                  {planLoading && (
                    <div className="loading-state">
                      <div className="spinner spinner-lg" />
                      <div className="loading-text">Building your week-by-week program plan…</div>
                    </div>
                  )}

                  {/* Plan Error */}
                  {!planLoading && planError && (
                    <div className="error-state">
                      <div className="error-msg">{planError}</div>
                      <div className="btn-row" style={{ marginTop: "1rem" }}>
                        <button className="btn-primary" onClick={runPlanGeneration}>Try again →</button>
                      </div>
                    </div>
                  )}

                  {/* Program Plan */}
                  {programWeeks.length > 0 && !planLoading && (
                    <div className="program-plan">
                      <div className="plan-header">
                        <div className="plan-title-row">
                          <div>
                            <div className="plan-title">Program Plan</div>
                            <div className="plan-subtitle">{programWeeks.length} weeks · scroll to review, then export for your manager and new hire</div>
                          </div>
                          <button className="btn-ghost" onClick={() => { if (latestBlueprint) exportToWord(latestBlueprint, latestPlanRaw, programWeeks, blueprintLabel); }}>↓ Export Word Doc</button>
                        </div>
                      </div>
                      {programWeeks.map(week => (
                        <div key={week.number} className="plan-week">
                          <div className="plan-week-header">
                            <span className="plan-week-num">Week {week.number}</span>
                            {week.title && <span className="plan-week-title">{week.title}</span>}
                          </div>
                          <div className="plan-week-body">
                            {week.product.length > 0 && week.product[0] !== "No product activities this week" && (
                              <div className="plan-section">
                                <div className="plan-section-label product-label">Product</div>
                                <ul className="plan-list">
                                  {week.product.map((item, i) => {
                                    const isSubItem = SUB_ITEM_PREFIXES.test(item);
                                    return <li key={i} className={isSubItem ? "plan-sub" : "plan-item"}>{item}</li>;
                                  })}
                                </ul>
                              </div>
                            )}
                            {week.program.length > 0 && (
                              <div className="plan-section">
                                <div className="plan-section-label program-label">Program</div>
                                <ul className="plan-list">
                                  {week.program.map((item, i) => {
                                    const isSubItem = SUB_ITEM_PREFIXES.test(item);
                                    return <li key={i} className={isSubItem ? "plan-sub" : "plan-item"}>{item}</li>;
                                  })}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="plan-export-row">
                        <button className="btn-primary" onClick={() => { if (latestBlueprint) exportToWord(latestBlueprint, latestPlanRaw, programWeeks, blueprintLabel); }}>↓ Export Word Doc</button>
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} />
                  {error && <div className="error-msg">{error}</div>}
                  {!loading && (
                    <div className="feedback-section">
                      <div className="feedback-label">{planHistory.length > 1 ? "Refine the program plan →" : "Clarify or push back on the blueprint →"}</div>
                      <div className="feedback-row">
                        <textarea className="feedback-input"
                          placeholder={planHistory.length > 1
                            ? `e.g. "Add a mock EBR prep session in week 5" or "Week 8 needs more manager coaching"`
                            : mode === "revenue"
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
