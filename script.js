const workflows = [
  {
    title: "Marketplace inventory mismatch",
    owner: "Supply Chain",
    source: "Warehouse sheet + marketplace API",
    priority: "High",
    status: "Data alert",
    description: "Lip Crayon Nude Blush shows 214 units in the warehouse sheet but 38 units live on marketplace listings.",
    automation: "Schedule an API reconciliation job that flags SKU quantity variance above 8% and drafts a correction ticket.",
    integration: "Google Sheets, marketplace API, email alert",
    saving: "6 hours/week",
  },
  {
    title: "Customer return classification",
    owner: "Support",
    source: "Return form + CRM",
    priority: "Medium",
    status: "Review",
    description: "Return reasons are manually tagged before quality and refund teams can act.",
    automation: "Use keyword rules and AI classification to map return notes to shade issue, damaged unit, delayed delivery, or wrong item.",
    integration: "CRM export, spreadsheet rules, AI tagger",
    saving: "8 hours/week",
  },
  {
    title: "Influencer campaign reporting",
    owner: "Marketing",
    source: "Sheets + social metrics",
    priority: "Low",
    status: "Ready",
    description: "Weekly campaign metrics are copied manually into a leadership summary.",
    automation: "Pull engagement and order attribution into one report template with automated highlights.",
    integration: "Google Sheets, social API, report builder",
    saving: "5 hours/week",
  },
  {
    title: "SOP update request triage",
    owner: "Operations",
    source: "Internal request form",
    priority: "Medium",
    status: "Review",
    description: "Teams ask repeated process questions when SOP ownership and latest steps are unclear.",
    automation: "Route requests to SOP owners and recommend matching SOPs before a new request is created.",
    integration: "Form responses, SOP index, Slack/email",
    saving: "12 hours/week",
  },
];

const sops = [
  {
    title: "Shade mismatch return handling",
    department: "Support",
    keywords: ["return", "shade", "customer", "refund", "exchange"],
    action: "Verify order shade, request product photo, classify issue, and send the refund or replacement path.",
  },
  {
    title: "SKU inventory reconciliation",
    department: "Supply Chain",
    keywords: ["stock", "inventory", "sku", "warehouse", "marketplace"],
    action: "Compare warehouse closing stock with channel listing quantity and escalate variance above threshold.",
  },
  {
    title: "Campaign report publishing",
    department: "Marketing",
    keywords: ["campaign", "influencer", "report", "engagement", "weekly"],
    action: "Collect reach, saves, code usage, and attributed orders before publishing the Friday summary.",
  },
  {
    title: "SOP change approval",
    department: "Operations",
    keywords: ["sop", "approval", "process", "owner", "documentation"],
    action: "Log requested change, assign owner, collect approval, and update the SOP index with revision notes.",
  },
];

const workflowList = document.querySelector("#workflowList");
const workflowSearch = document.querySelector("#workflowSearch");
const sopSearch = document.querySelector("#sopSearch");
const sopResults = document.querySelector("#sopResults");
const reportList = document.querySelector("#reportList");
const copyReport = document.querySelector("#copyReport");
const copyNote = document.querySelector("#copyNote");
const draftType = document.querySelector("#draftType");
const draftContext = document.querySelector("#draftContext");
const draftOutput = document.querySelector("#draftOutput");
const generateDraft = document.querySelector("#generateDraft");

function priorityClass(priority) {
  return priority.toLowerCase();
}

function workflowMatches(workflow, query) {
  const content = [
    workflow.title,
    workflow.owner,
    workflow.source,
    workflow.priority,
    workflow.status,
    workflow.description,
  ]
    .join(" ")
    .toLowerCase();
  return content.includes(query.toLowerCase());
}

function selectWorkflow(workflow, element) {
  document.querySelectorAll(".workflow-item").forEach((item) => item.classList.remove("active"));
  element.classList.add("active");
  document.querySelector("#automationTitle").textContent = workflow.title;
  document.querySelector("#automationBody").textContent = workflow.automation;
  document.querySelector("#automationIntegration").textContent = workflow.integration;
  document.querySelector("#automationSaving").textContent = workflow.saving;
}

function renderWorkflows() {
  const query = workflowSearch.value.trim();
  const visible = workflows.filter((workflow) => workflowMatches(workflow, query));
  workflowList.innerHTML = "";

  visible.forEach((workflow, index) => {
    const item = document.createElement("article");
    item.className = "workflow-item";
    item.tabIndex = 0;
    item.innerHTML = `
      <div class="item-top">
        <div>
          <h3>${workflow.title}</h3>
          <p>${workflow.description}</p>
        </div>
        <span class="badge ${priorityClass(workflow.priority)}">${workflow.priority}</span>
      </div>
      <div class="workflow-meta">
        <span>${workflow.owner}</span>
        <span>${workflow.source}</span>
        <span>${workflow.status}</span>
      </div>
    `;
    item.addEventListener("click", () => selectWorkflow(workflow, item));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        selectWorkflow(workflow, item);
      }
    });
    workflowList.appendChild(item);
    if (index === 0) {
      selectWorkflow(workflow, item);
    }
  });
}

function sopMatches(sop, query) {
  const normalized = query.toLowerCase();
  return [sop.title, sop.department, sop.action, ...sop.keywords].join(" ").toLowerCase().includes(normalized);
}

function renderSops() {
  const query = sopSearch.value.trim();
  const visible = query ? sops.filter((sop) => sopMatches(sop, query)) : sops;
  sopResults.innerHTML = "";
  visible.forEach((sop) => {
    const card = document.createElement("article");
    card.className = "sop-card";
    card.innerHTML = `
      <div class="item-top">
        <h3>${sop.title}</h3>
        <span class="badge ready">${sop.department}</span>
      </div>
      <p>${sop.action}</p>
      <div class="sop-meta">${sop.keywords.map((keyword) => `<span>${keyword}</span>`).join("")}</div>
    `;
    sopResults.appendChild(card);
  });
}

function renderMetrics() {
  document.querySelector("#openItems").textContent = workflows.length;
  document.querySelector("#dataAlerts").textContent = workflows.filter((workflow) => workflow.status === "Data alert").length;
  document.querySelector("#sopCount").textContent = sops.length;
}

function renderReport() {
  const lines = [
    "Inventory mismatch automation should be prioritized first because it affects live marketplace stock accuracy.",
    "Support return tagging can reduce repeated manual classification before refund review.",
    "Campaign report publishing is ready for a weekly report template and metric pull.",
    "SOP search currently covers support, supply chain, marketing, and operations workflows.",
  ];
  reportList.innerHTML = lines.map((line) => `<li>${line}</li>`).join("");
  return lines;
}

function buildDraft(type, context) {
  const templates = {
    vendor: `Subject: Follow-up required on stock reconciliation\n\nHi team,\n\nWe found an operations mismatch that needs review:\n\n${context}\n\nPlease confirm the latest stock position, expected correction timeline, and whether any marketplace listings need to be paused or updated.\n\nRegards,\nOperations Team`,
    support: `Subject: Customer support escalation summary\n\nIssue summary:\n${context}\n\nSuggested next step:\nPlease verify the order details, map the concern to the correct SOP category, and update the customer with a clear resolution timeline.\n\nInternal note:\nTag this case for trend tracking if similar complaints appear more than three times this week.`,
    sop: `Subject: SOP update note\n\nProcess area:\n${context}\n\nRecommended update:\nAdd the latest owner, trigger condition, required data fields, and escalation path so teams can resolve this without a separate clarification thread.\n\nDocumentation owner:\nOperations`,
  };
  return templates[type];
}

workflowSearch.addEventListener("input", renderWorkflows);
sopSearch.addEventListener("input", renderSops);
generateDraft.addEventListener("click", () => {
  draftOutput.value = buildDraft(draftType.value, draftContext.value.trim());
});
copyReport.addEventListener("click", async () => {
  const report = renderReport().join("\n");
  try {
    await navigator.clipboard.writeText(report);
    copyNote.textContent = "Report copied to clipboard.";
  } catch {
    copyNote.textContent = "Clipboard is unavailable; select the report text manually.";
  }
});

renderMetrics();
renderWorkflows();
renderSops();
renderReport();
draftOutput.value = buildDraft(draftType.value, draftContext.value.trim());
