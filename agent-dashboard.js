const policyForm = document.querySelector("#agent-policy-form");
const policyTableBody = document.querySelector("#policy-table-body");
const policyEmpty = document.querySelector("#policy-empty");
const policySearch = document.querySelector("#policy-search");
const statusFilter = document.querySelector("#status-filter");
const messageTone = document.querySelector("#message-tone");
const generatedMessage = document.querySelector("#generated-message");
const openLineShare = document.querySelector("#open-line-share");
const currentAttachments = document.querySelector("#current-attachments");
const formFeedback = document.querySelector("#form-feedback");
const backupFeedback = document.querySelector("#backup-feedback");
const mainContent = document.querySelector("#main-content");
const authSection = document.querySelector("#agent-auth");
const loginForm = document.querySelector("#agent-login-form");
const loginFeedback = document.querySelector("#login-feedback");
const logoutButton = document.querySelector("#logout-button");
const productMediaForm = document.querySelector("#product-media-form");
const productMediaPlan = document.querySelector("#product-media-plan");
const productMediaList = document.querySelector("#product-media-list");
const mediaFeedback = document.querySelector("#media-feedback");

let policies = [];
let selectedPolicyId = "";
let productMedia = {};

const productMediaPlanOptions = [
  ["motor-1", "รถยนต์ประเภท 1"],
  ["motor-2", "รถยนต์ประเภท 2"],
  ["motor-3", "รถยนต์ประเภท 3"],
  ["motor-2plus", "รถยนต์ประเภท 2+"],
  ["motor-3plus", "รถยนต์ประเภท 3+"],
  ["motor-compulsory", "ประกันภัยรถยนต์ภาคบังคับ"],
  ["motor-one", "มิตรแท้หนึ่งเดียว"],
  ["motor-extra", "ป.1 Extra"],
  ["motor-eco", "แผนรถเก๋ง Eco Car"],
  ["motor-permpoon", "มิตรแท้เพิ่มพูน 2+"],
  ["motor-taweekoon", "มิตรแท้ทวีคูณ"],
  ["motor-permpoon3", "มิตรแท้เพิ่มพูน 3+"],
  ["residential-fire", "อัคคีภัยที่อยู่อาศัย"],
  ["home", "ประกันภัยบ้านมิตรแท้"],
  ["property-risk", "ประกันภัยความเสี่ยงภัยทรัพย์สิน"],
  ["construction", "ประกันภัยงานก่อสร้าง"],
  ["pa1", "อุบัติเหตุส่วนบุคคล อบ.1"],
  ["pa2", "อุบัติเหตุส่วนบุคคล อบ.2"],
  ["income-hospital", "ชดเชยรายได้กรณีเข้ารักษา"],
  ["golf", "ประกันภัยสำหรับผู้เล่นกอล์ฟ"],
  ["sme", "ประกันภัยธุรกิจ SME"],
  ["public-liability", "ประกันภัยความรับผิดต่อบุคคลภายนอก"],
  ["carrier", "ประกันภัยความรับผิดผู้ขนส่ง"],
  ["inland-named", "ขนส่งภายในประเทศแบบระบุภัย"],
  ["inland-allrisk", "ขนส่งภายในประเทศแบบ All Risks"],
  ["gold-shop", "ประกันภัยร้านทอง"],
  ["drone", "ประกันภัยโดรน"],
  ["fuel-station", "ประกันภัยสถานีบริการเชื้อเพลิง"],
  ["fuel-ctp", "พ.ร.บ. รถบรรทุก LPG / NGV / น้ำมัน"]
];

const salesStatusLabels = {
  new: "ลูกค้าใหม่",
  quoted: "ส่งใบเสนอราคาแล้ว",
  waiting: "รอตัดสินใจ",
  documents: "รอเอกสาร",
  payment: "นัดชำระ",
  renewed: "ต่ออายุแล้ว",
  "claim-followup": "ติดตามหลังเคลม",
  lost: "ปิดงานไม่สำเร็จ"
};

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: options.body instanceof FormData
      ? options.headers
      : { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    throw new Error(payload?.error || "เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
  }
  return payload;
}

async function initializeAgentDashboard() {
  try {
    const session = await apiFetch("/api/session");
    setAuthenticated(session.authenticated);
    if (session.authenticated) await Promise.all([refreshPolicies(), refreshProductMedia()]);
  } catch (error) {
    loginFeedback.textContent = "กรุณารันผ่าน Flask server ด้วยคำสั่ง python app.py";
  }
}

function setAuthenticated(isAuthenticated) {
  authSection.hidden = isAuthenticated;
  mainContent.hidden = !isAuthenticated;
  logoutButton.hidden = !isAuthenticated;
}

async function refreshPolicies() {
  policies = await apiFetch("/api/policies");
  renderAll();
}

async function refreshProductMedia() {
  if (!productMediaForm) return;
  productMedia = await apiFetch("/api/product-media");
  renderProductMediaList();
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(`${dateValue}T00:00:00`));
}

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "-";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0
  }).format(amount);
}

function daysUntil(dateValue) {
  if (!dateValue) return Number.POSITIVE_INFINITY;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(`${dateValue}T00:00:00`);
  return Math.ceil((targetDate - today) / 86400000);
}

function getDueLabel(endDate) {
  const days = daysUntil(endDate);
  if (!Number.isFinite(days)) return "ไม่ระบุวัน";
  if (days < 0) return `เลยกำหนด ${Math.abs(days)} วัน`;
  if (days === 0) return "หมดอายุวันนี้";
  return `อีก ${days} วัน`;
}

function getActivePolicies() {
  return policies.filter((policy) => policy.salesStatus !== "renewed" && policy.salesStatus !== "lost");
}

function renderDashboard() {
  const activePolicies = getActivePolicies();
  const overdue = activePolicies.filter((policy) => daysUntil(policy.endDate) < 0).length;
  const due7 = activePolicies.filter((policy) => {
    const days = daysUntil(policy.endDate);
    return days >= 0 && days <= 7;
  }).length;
  const due30 = activePolicies.filter((policy) => {
    const days = daysUntil(policy.endDate);
    return days >= 0 && days <= 30;
  }).length;
  const followup = activePolicies.filter((policy) => daysUntil(policy.nextFollowUp) <= 0).length;
  const urgentCount = overdue + due7 + followup;

  setText("#stat-overdue", overdue);
  setText("#stat-due7", due7);
  setText("#stat-due30", due30);
  setText("#stat-followup", followup);
  setText("#hero-due-count", urgentCount);
  setText("#hero-due-label", urgentCount ? "มีงานที่ควรติดตาม" : "ยังไม่มีงานด่วน");

  const alerts = [];
  if (overdue) alerts.push(`มีกรมธรรม์เลยกำหนด ${overdue} รายการ ควรติดต่อก่อนรายการอื่น`);
  if (due7) alerts.push(`มีกรมธรรม์ครบกำหนดใน 7 วัน ${due7} รายการ`);
  if (followup) alerts.push(`มีนัดติดตามวันนี้หรือเลยกำหนด ${followup} รายการ`);

  const alertContainer = document.querySelector("#agent-alerts");
  alertContainer.innerHTML = alerts.length
    ? alerts.map((alert) => `<p><strong>แจ้งเตือนภายใน</strong>${escapeHtml(alert)}</p>`).join("")
    : `<p><strong>แจ้งเตือนภายใน</strong>ยังไม่มีงานเร่งด่วนในวันนี้</p>`;
}

function renderPolicyTable() {
  const searchTerm = policySearch?.value.trim().toLowerCase() || "";
  const selectedStatus = statusFilter?.value || "all";
  const filteredPolicies = policies
    .filter((policy) => selectedStatus === "all" || policy.salesStatus === selectedStatus)
    .filter((policy) => {
      const searchableText = [
        policy.customerName,
        policy.customerPhone,
        policy.policyNumber,
        policy.publicRef,
        policy.productName,
        policy.insuranceCategory,
        policy.customerNotes
      ].join(" ").toLowerCase();
      return searchableText.includes(searchTerm);
    })
    .sort((a, b) => daysUntil(a.endDate) - daysUntil(b.endDate));

  policyEmpty.hidden = filteredPolicies.length > 0;
  policyTableBody.innerHTML = filteredPolicies.map((policy) => {
    const dueDays = daysUntil(policy.endDate);
    const urgencyClass = dueDays < 0 ? "is-overdue" : dueDays <= 7 ? "is-soon" : "";
    const attachmentCount = policy.attachments?.length || 0;

    return `
      <tr class="${policy.id === selectedPolicyId ? "is-selected" : ""}">
        <td>
          <strong>${escapeHtml(policy.customerName)}</strong>
          <span>${escapeHtml(policy.customerPhone || "-")}</span>
          <small>อ้างอิง ${escapeHtml(policy.publicRef)}</small>
        </td>
        <td>
          <strong>${escapeHtml(policy.insuranceCategory)}</strong>
          <span>${escapeHtml(policy.productName || "ไม่ระบุแผน")}</span>
          <small>${escapeHtml(policy.policyNumber || "ยังไม่มีเลขกรมธรรม์")} · ${attachmentCount} ไฟล์</small>
        </td>
        <td>
          <strong class="${urgencyClass}">${formatDate(policy.endDate)}</strong>
          <span>${getDueLabel(policy.endDate)}</span>
          <small>${formatCurrency(policy.premiumAmount)}</small>
        </td>
        <td>
          <span class="status-pill status-pill--${escapeHtml(policy.salesStatus)}">${salesStatusLabels[policy.salesStatus] || policy.salesStatus}</span>
        </td>
        <td>
          <strong>${formatDate(policy.nextFollowUp)}</strong>
          <span>${policy.nextFollowUp ? getDueLabel(policy.nextFollowUp) : "ยังไม่ตั้งนัด"}</span>
        </td>
        <td>
          <div class="agent-table-actions">
            <button type="button" data-action="select" data-id="${policy.id}">ข้อความ</button>
            <button type="button" data-action="edit" data-id="${policy.id}">แก้ไข</button>
            <button type="button" data-action="delete" data-id="${policy.id}">ลบ</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getSelectedPolicy() {
  return policies.find((item) => String(item.id) === String(selectedPolicyId));
}

function renderCurrentAttachments(policy) {
  const attachments = policy?.attachments || [];
  currentAttachments.hidden = !attachments.length;
  currentAttachments.innerHTML = attachments.length
    ? `
      <h3>ไฟล์ที่แนบไว้</h3>
      ${attachments.map((file) => `
        <div class="attachment-chip">
          <a href="${file.url}" target="_blank" rel="noopener">${escapeHtml(file.name)}</a>
          <span>${Math.round(file.size / 1024)} KB</span>
          <button type="button" data-remove-attachment="${file.id}">ลบไฟล์</button>
        </div>
      `).join("")}
    `
    : "";
}

function initializeProductMediaPlanOptions() {
  if (!productMediaPlan) return;
  productMediaPlan.innerHTML = productMediaPlanOptions
    .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
    .join("");
}

function getPlanLabel(planId) {
  return productMediaPlanOptions.find(([value]) => value === planId)?.[1] || planId;
}

function renderProductMediaList() {
  if (!productMediaList || !productMediaPlan) return;
  const planId = productMediaPlan.value;
  const media = productMedia[planId] || { cover: null, images: [], pdf: null };
  const files = [
    media.cover ? { ...media.cover, label: "รูปประกอบ" } : null,
    ...(media.images || []).map((image, index) => ({ ...image, label: `รูปเอกสาร ${index + 1}` })),
    media.pdf ? { ...media.pdf, label: "PDF เอกสาร" } : null
  ].filter(Boolean);

  productMediaList.innerHTML = files.length
    ? `
      <strong>${escapeHtml(getPlanLabel(planId))}</strong>
      ${files.map((file) => `
        <div class="media-file-card">
          ${file.url && file.type?.startsWith("image/")
            ? `<img src="${escapeHtml(file.url)}" alt="">`
            : `<span class="media-file-card__icon">PDF</span>`}
          <div>
            <b>${escapeHtml(file.label)}</b>
            <a href="${escapeHtml(file.url)}" target="_blank" rel="noopener">${escapeHtml(file.originalName || file.filename)}</a>
            <small>${Math.round((file.size || 0) / 1024)} KB</small>
          </div>
          <button type="button" data-remove-product-media="${escapeHtml(file.filename)}">ลบ</button>
        </div>
      `).join("")}
    `
    : `
      <div class="plan-empty plan-empty--compact">
        <strong>ยังไม่มีไฟล์สำหรับ ${escapeHtml(getPlanLabel(planId))}</strong>
        <span>ถ้าไม่อัปโหลด ระบบจะใช้รูปและเอกสารเดิมจากโฟลเดอร์ document/assets</span>
      </div>
    `;
}

function resetForm() {
  policyForm.reset();
  document.querySelector("#policy-id").value = "";
  document.querySelector("#form-title").textContent = "เพิ่มข้อมูลกรมธรรม์";
  document.querySelector("#form-mode-number").textContent = "01";
  currentAttachments.hidden = true;
  currentAttachments.innerHTML = "";
  formFeedback.textContent = "พร้อมบันทึกข้อมูลลง SQLite";
}

function editPolicy(policyId) {
  const policy = policies.find((item) => String(item.id) === String(policyId));
  if (!policy) return;

  document.querySelector("#policy-id").value = policy.id;
  document.querySelector("#customer-name").value = policy.customerName || "";
  document.querySelector("#customer-phone").value = policy.customerPhone || "";
  document.querySelector("#line-name").value = policy.lineName || "";
  document.querySelector("#assigned-agent").value = policy.assignedAgent || "";
  document.querySelector("#insurance-category").value = policy.insuranceCategory || "รถยนต์";
  document.querySelector("#product-name").value = policy.productName || "";
  document.querySelector("#policy-number").value = policy.policyNumber || "";
  document.querySelector("#insurer-name").value = policy.insurerName || "";
  document.querySelector("#start-date").value = policy.startDate || "";
  document.querySelector("#end-date").value = policy.endDate || "";
  document.querySelector("#premium-amount").value = policy.premiumAmount || "";
  document.querySelector("#sales-status").value = policy.salesStatus || "new";
  document.querySelector("#next-follow-up").value = policy.nextFollowUp || "";
  document.querySelector("#customer-notes").value = policy.customerNotes || "";
  document.querySelector("#form-title").textContent = "แก้ไขข้อมูลกรมธรรม์";
  document.querySelector("#form-mode-number").textContent = "02";
  renderCurrentAttachments(policy);
  document.querySelector("#policy-form").scrollIntoView({ behavior: "smooth", block: "start" });
}

function selectPolicy(policyId) {
  selectedPolicyId = String(policyId);
  renderMessage();
  renderPolicyTable();
}

async function deletePolicy(policyId) {
  const policy = policies.find((item) => String(item.id) === String(policyId));
  if (!policy) return;
  const confirmed = window.confirm(`ต้องการลบข้อมูลของ ${policy.customerName} ใช่ไหม`);
  if (!confirmed) return;

  await apiFetch(`/api/policies/${policyId}`, { method: "DELETE" });
  if (selectedPolicyId === String(policyId)) selectedPolicyId = "";
  await refreshPolicies();
}

function renderMessage() {
  const policy = getSelectedPolicy();
  if (!policy) {
    generatedMessage.value = "";
    generatedMessage.placeholder = "เลือกกรมธรรม์จากรายการเพื่อสร้างข้อความ";
    openLineShare.href = "#";
    openLineShare.setAttribute("aria-disabled", "true");
    return;
  }

  const tone = messageTone.value;
  const dueLabel = getDueLabel(policy.endDate);
  const agentName = policy.assignedAgent || "ทีม Mittare Sattahip";
  const messages = {
    renewal: `สวัสดีครับ/ค่ะ คุณ${policy.customerName}\n\nกรมธรรม์${policy.insuranceCategory}${policy.productName ? ` (${policy.productName})` : ""} จะครบกำหนดวันที่ ${formatDate(policy.endDate)} (${dueLabel})\n\nเลขอ้างอิงสำหรับเช็กสถานะ: ${policy.publicRef}\n\n${agentName} ขอช่วยตรวจสอบแผนต่ออายุและเปรียบเทียบความคุ้มครองให้ก่อนตัดสินใจ หากสะดวกสามารถส่งข้อมูลเพิ่มเติมหรือแจ้งเวลาที่สะดวกให้ติดต่อกลับได้ครับ/ค่ะ`,
    document: `สวัสดีครับ/ค่ะ คุณ${policy.customerName}\n\nเพื่อดำเนินงาน${policy.insuranceCategory}${policy.productName ? ` (${policy.productName})` : ""} ต่อ รบกวนส่งเอกสาร/รูปภาพเพิ่มเติมตามที่สะดวกครับ/ค่ะ\n\nเลขอ้างอิง: ${policy.publicRef}\nข้อมูลกรมธรรม์เดิม: ${policy.policyNumber || "ยังไม่ระบุ"}\nหมายเหตุ: ${policy.customerNotes || "ทีมงานจะแจ้งรายการเอกสารที่ต้องใช้เพิ่มเติม"}`,
    payment: `สวัสดีครับ/ค่ะ คุณ${policy.customerName}\n\nขอแจ้งนัดชำระเบี้ยสำหรับ${policy.insuranceCategory}${policy.productName ? ` (${policy.productName})` : ""}\nเลขอ้างอิง: ${policy.publicRef}\nเบี้ยโดยประมาณ/ตามที่บันทึกไว้: ${formatCurrency(policy.premiumAmount)}\nวันหมดอายุกรมธรรม์: ${formatDate(policy.endDate)}\n\nหากชำระแล้วสามารถส่งหลักฐานกลับมาให้ทีมตรวจสอบได้ครับ/ค่ะ`,
    claim: `สวัสดีครับ/ค่ะ คุณ${policy.customerName}\n\n${agentName} ขออนุญาตติดตามงานเคลม/การดูแลหลังเกิดเหตุของ${policy.insuranceCategory}${policy.productName ? ` (${policy.productName})` : ""}\nเลขอ้างอิง: ${policy.publicRef}\n\nหากมีเอกสารเพิ่มเติม รูปภาพ หรือข้อสงสัยเกี่ยวกับขั้นตอนถัดไป ส่งกลับมาในแชทนี้ได้เลยครับ/ค่ะ`
  };

  generatedMessage.value = messages[tone];
  openLineShare.href = `https://line.me/R/msg/text/?${encodeURIComponent(generatedMessage.value)}`;
  openLineShare.removeAttribute("aria-disabled");
}

function renderAll() {
  renderDashboard();
  renderPolicyTable();
  renderMessage();
}

async function handleFormSubmit(event) {
  event.preventDefault();
  try {
    const formData = new FormData(policyForm);
    const policyId = formData.get("policyId");
    const endpoint = policyId ? `/api/policies/${policyId}` : "/api/policies";
    const method = policyId ? "PUT" : "POST";
    const savedPolicy = await apiFetch(endpoint, { method, body: formData });
    selectedPolicyId = String(savedPolicy.id);
    resetForm();
    formFeedback.textContent = "บันทึกข้อมูลลง SQLite เรียบร้อยแล้ว";
    await refreshPolicies();
  } catch (error) {
    formFeedback.textContent = error.message;
  }
}

async function removeAttachment(attachmentId) {
  const confirmed = window.confirm("ต้องการลบไฟล์แนบนี้ใช่ไหม");
  if (!confirmed) return;
  await apiFetch(`/api/attachments/${attachmentId}`, { method: "DELETE" });
  await refreshPolicies();
  const policyId = document.querySelector("#policy-id").value;
  if (policyId) renderCurrentAttachments(policies.find((item) => String(item.id) === String(policyId)));
}

async function addSampleData() {
  await apiFetch("/api/demo/seed", { method: "POST", body: JSON.stringify({}) });
  await refreshPolicies();
  formFeedback.textContent = "เพิ่มข้อมูลตัวอย่างลง SQLite แล้ว ลองใช้ MT4-DEMO-001 กับเบอร์ 081-111-2222 ในหน้าลูกค้า";
}

async function exportData() {
  const payload = await apiFetch("/api/export");
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mittare-sqlite-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  backupFeedback.textContent = "Export ข้อมูลจาก SQLite เรียบร้อยแล้ว";
}

async function clearAllData() {
  const confirmed = window.confirm("ต้องการลบข้อมูลกรมธรรม์ทั้งหมดในฐานข้อมูลใช่ไหม");
  if (!confirmed) return;
  await apiFetch("/api/policies", { method: "DELETE" });
  selectedPolicyId = "";
  resetForm();
  await refreshPolicies();
  backupFeedback.textContent = "ลบข้อมูลทั้งหมดแล้ว";
}

async function handleProductMediaSubmit(event) {
  event.preventDefault();
  try {
    const formData = new FormData(productMediaForm);
    const planId = formData.get("planId");
    await apiFetch(`/api/product-media/${encodeURIComponent(planId)}`, {
      method: "POST",
      body: formData
    });
    productMediaForm.querySelector("#product-media-files").value = "";
    mediaFeedback.textContent = "อัปโหลดไฟล์เข้าคลังรูปเว็บเรียบร้อยแล้ว";
    await refreshProductMedia();
  } catch (error) {
    mediaFeedback.textContent = error.message;
  }
}

async function removeProductMedia(filename) {
  if (!productMediaPlan?.value || !filename) return;
  const confirmed = window.confirm("ต้องการลบไฟล์นี้ออกจากหน้าเว็บใช่ไหม");
  if (!confirmed) return;
  try {
    await apiFetch(
      `/api/product-media/${encodeURIComponent(productMediaPlan.value)}/files/${encodeURIComponent(filename)}`,
      { method: "DELETE" }
    );
    mediaFeedback.textContent = "ลบไฟล์ออกจากคลังรูปเว็บแล้ว";
    await refreshProductMedia();
  } catch (error) {
    mediaFeedback.textContent = error.message;
  }
}

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const password = new FormData(loginForm).get("adminPassword");
    await apiFetch("/api/session", {
      method: "POST",
      body: JSON.stringify({ password })
    });
    loginForm.reset();
    setAuthenticated(true);
    await Promise.all([refreshPolicies(), refreshProductMedia()]);
  } catch (error) {
    loginFeedback.textContent = error.message;
  }
});

logoutButton?.addEventListener("click", async () => {
  await apiFetch("/api/session", { method: "DELETE" });
  policies = [];
  selectedPolicyId = "";
  setAuthenticated(false);
});

policyForm?.addEventListener("submit", handleFormSubmit);
policyForm?.addEventListener("reset", () => window.setTimeout(resetForm, 0));
policySearch?.addEventListener("input", renderPolicyTable);
statusFilter?.addEventListener("change", renderPolicyTable);
messageTone?.addEventListener("change", renderMessage);

policyTableBody?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const policyId = button.dataset.id;
  if (button.dataset.action === "select") selectPolicy(policyId);
  if (button.dataset.action === "edit") editPolicy(policyId);
  if (button.dataset.action === "delete") deletePolicy(policyId);
});

currentAttachments?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-remove-attachment]");
  if (!button) return;
  removeAttachment(button.dataset.removeAttachment);
});

productMediaForm?.addEventListener("submit", handleProductMediaSubmit);
productMediaPlan?.addEventListener("change", renderProductMediaList);
productMediaList?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-remove-product-media]");
  if (!button) return;
  removeProductMedia(button.dataset.removeProductMedia);
});

document.querySelector("#copy-message")?.addEventListener("click", async () => {
  if (!generatedMessage.value) return;
  try {
    await navigator.clipboard.writeText(generatedMessage.value);
    formFeedback.textContent = "คัดลอกข้อความแล้ว";
  } catch (error) {
    generatedMessage.focus();
    generatedMessage.select();
    formFeedback.textContent = "เบราว์เซอร์ไม่อนุญาตให้คัดลอกอัตโนมัติ กรุณากด Ctrl+C หลังเลือกข้อความ";
  }
});

document.querySelector("#add-sample-data")?.addEventListener("click", addSampleData);
document.querySelector("#export-data")?.addEventListener("click", exportData);
document.querySelector("#clear-all-data")?.addEventListener("click", clearAllData);

initializeProductMediaPlanOptions();
initializeAgentDashboard();
