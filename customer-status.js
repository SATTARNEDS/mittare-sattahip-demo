(() => {
const customerLookupForm = document.querySelector("#customer-lookup-form");
const customerLookupFeedback = document.querySelector("#customer-lookup-feedback");
const customerStatusGrid = document.querySelector("#customer-status-grid");
const customerStatusLoading = document.querySelector("#customer-status-loading");
const customerResultsSection = document.querySelector(".customer-results");
const menuButton = document.querySelector(".menu-toggle");
const mainNavigation = document.querySelector(".main-nav");

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  mainNavigation?.classList.toggle("is-open", !isOpen);
});

mainNavigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton?.setAttribute("aria-expanded", "false");
    mainNavigation.classList.remove("is-open");
  });
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const linkPath = new URL(link.getAttribute("href"), window.location.href).pathname.split("/").pop() || "index.html";
  if (linkPath === currentPath) {
    link.classList.add("is-current");
    link.setAttribute("aria-current", "page");
  }
});

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
        <span>ตรวจสอบเบอร์โทร หรือเลขอ้างอิง/เลขกรมธรรม์อีกครั้ง หรือติดต่อทีมผู้ดูแล</span>
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

function renderCustomerNotice(title, message) {
  if (!customerStatusGrid) return;
  customerStatusGrid.innerHTML = `
    <div class="plan-empty">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(message)}</span>
    </div>
  `;
}

function setCustomerLoading(isLoading) {
  if (!customerStatusLoading || !customerStatusGrid || !customerLookupForm) return;
  customerStatusLoading.hidden = !isLoading;
  customerStatusLoading.setAttribute("aria-hidden", String(!isLoading));
  customerStatusGrid.hidden = isLoading;
  customerStatusGrid.toggleAttribute("hidden", isLoading);
  const submitButton = customerLookupForm.querySelector("button[type='submit']");
  if (submitButton) submitButton.disabled = isLoading;
}

function focusCustomerResults() {
  if (!customerResultsSection) return;
  customerResultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

customerLookupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(customerLookupForm);
  const phone = String(formData.get("phone") || "").trim();
  const reference = String(formData.get("reference") || "").trim();
  if (!phone && !reference) {
    customerLookupFeedback.textContent = "กรุณากรอกเบอร์โทร หรือเลขอ้างอิง/เลขกรมธรรม์ อย่างน้อยหนึ่งช่อง";
    renderCustomerNotice("ยังไม่ได้กรอกข้อมูลค้นหา", "กรอกเบอร์โทร หรือเลขอ้างอิง/เลขกรมธรรม์ อย่างน้อยหนึ่งช่อง");
    focusCustomerResults();
    return;
  }
  customerLookupFeedback.textContent = "กำลังตรวจสอบข้อมูล...";
  renderCustomerNotice("กำลังตรวจสอบข้อมูล", "ระบบกำลังค้นหาสถานะกรมธรรม์จากข้อมูลที่กรอก");
  setCustomerLoading(true);
  try {
    const response = await fetch("/api/customer/policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        reference
      })
    });
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json() : null;
    if (!response.ok) throw new Error(payload?.error || "ตรวจสอบข้อมูลไม่สำเร็จ");
    if (!Array.isArray(payload)) {
      throw new Error("กรุณารันผ่าน Flask server แล้วเปิด http://127.0.0.1:5000/customer-status.html");
    }
    renderCustomerPolicies(payload);
    customerLookupFeedback.textContent = payload.length
      ? `พบข้อมูลกรมธรรม์ ${payload.length} รายการ เลื่อนลงไปดูผลการตรวจสอบ`
      : "ไม่พบข้อมูลที่ตรงกัน เลื่อนลงไปดูรายละเอียด";
  } catch (error) {
    customerLookupFeedback.textContent = error.message;
    renderCustomerNotice("ตรวจสอบข้อมูลไม่สำเร็จ", error.message);
  } finally {
    setCustomerLoading(false);
    focusCustomerResults();
  }
});
})();
