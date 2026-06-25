const customerLookupForm = document.querySelector("#customer-lookup-form");
const customerLookupFeedback = document.querySelector("#customer-lookup-feedback");
const customerStatusGrid = document.querySelector("#customer-status-grid");

const salesStatusLabels = {
  new: "รับเรื่องแล้ว",
  quoted: "ส่งข้อมูลเสนอราคาแล้ว",
  waiting: "รอลูกค้าตัดสินใจ",
  documents: "รอเอกสารเพิ่มเติม",
  payment: "รอชำระเบี้ย",
  renewed: "ต่ออายุเรียบร้อย",
  "claim-followup": "อยู่ระหว่างติดตามงานเคลม",
  lost: "ปิดงาน"
};

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
  return `เหลือ ${days} วัน`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderCustomerPolicies(policies) {
  if (!policies.length) {
    customerStatusGrid.innerHTML = `
      <div class="plan-empty">
        <strong>ไม่พบข้อมูล</strong>
        <span>ตรวจสอบเบอร์โทรและเลขอ้างอิงอีกครั้ง หรือติดต่อทีมผู้ดูแล</span>
      </div>
    `;
    return;
  }

  customerStatusGrid.innerHTML = policies.map((policy) => {
    const dueDays = daysUntil(policy.endDate);
    const urgencyClass = dueDays < 0 ? "is-overdue" : dueDays <= 30 ? "is-soon" : "";
    return `
      <article class="customer-status-card">
        <div class="customer-status-card__top">
          <span>${escapeHtml(policy.publicRef)}</span>
          <strong class="status-pill status-pill--${escapeHtml(policy.salesStatus)}">${salesStatusLabels[policy.salesStatus] || policy.salesStatus}</strong>
        </div>
        <h3>${escapeHtml(policy.insuranceCategory)} ${escapeHtml(policy.productName || "")}</h3>
        <div class="customer-status-details">
          <div><span>ชื่อลูกค้า</span><strong>${escapeHtml(policy.customerName)}</strong></div>
          <div><span>เบอร์โทร</span><strong>${escapeHtml(policy.customerPhone)}</strong></div>
          <div><span>เลขกรมธรรม์</span><strong>${escapeHtml(policy.policyNumber || "-")}</strong></div>
          <div><span>บริษัท</span><strong>${escapeHtml(policy.insurerName || "-")}</strong></div>
          <div><span>วันเริ่มคุ้มครอง</span><strong>${formatDate(policy.startDate)}</strong></div>
          <div><span>วันหมดอายุ</span><strong class="${urgencyClass}">${formatDate(policy.endDate)}</strong></div>
          <div><span>เวลาคงเหลือ</span><strong class="${urgencyClass}">${getDueLabel(policy.endDate)}</strong></div>
          <div><span>เบี้ยที่บันทึกไว้</span><strong>${formatCurrency(policy.premiumAmount)}</strong></div>
        </div>
        ${policy.customerNotes ? `<p class="customer-status-note">${escapeHtml(policy.customerNotes)}</p>` : ""}
        <div class="customer-status-actions">
          <a class="button button--primary" href="https://line.me/R/ti/p/@mittaresattahipdemo" target="_blank" rel="noopener">คุยกับทีมผ่าน LINE</a>
          <a class="button button--dark" href="tel:0811759296">โทรทีมผู้ดูแล</a>
        </div>
      </article>
    `;
  }).join("");
}

customerLookupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(customerLookupForm);
  customerLookupFeedback.textContent = "กำลังตรวจสอบข้อมูล...";
  try {
    const response = await fetch("/api/customer/policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: formData.get("phone"),
        reference: formData.get("reference")
      })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "ตรวจสอบข้อมูลไม่สำเร็จ");
    renderCustomerPolicies(payload);
    customerLookupFeedback.textContent = payload.length
      ? "พบข้อมูลกรมธรรม์แล้ว"
      : "ไม่พบข้อมูลที่ตรงกัน";
  } catch (error) {
    customerLookupFeedback.textContent = error.message;
  }
});
