const lineLoginStatus = document.querySelector("#line-login-status");
const lineLoginButton = document.querySelector("#line-login-button");
const lineLogoutButton = document.querySelector("#line-logout-button");
const lineProfile = document.querySelector("#line-profile");
const lineProfilePicture = document.querySelector("#line-profile-picture");
const lineProfileTitle = document.querySelector("#line-profile-title");
const lineProfileUserId = document.querySelector("#line-profile-user-id");
const linePolicyGrid = document.querySelector("#line-policy-grid");
const linePolicyLoading = document.querySelector("#line-policy-loading");
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

const lineLoginErrorMessages = {
  line_login_not_configured: "ยังไม่ได้ตั้งค่า LINE Login Channel ID/Secret",
  invalid_state: "เซสชัน LINE Login ไม่ตรงกัน กรุณาลองใหม่อีกครั้ง",
  missing_code: "LINE ไม่ส่งรหัสยืนยันกลับมา กรุณาลองใหม่",
  ACCESS_DENIED: "ลูกค้ายกเลิกการอนุญาต LINE Login"
};

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
  return `เหลือ ${days} วัน`;
}

function setLinePolicyLoading(isLoading) {
  if (!linePolicyLoading || !linePolicyGrid) return;
  linePolicyLoading.hidden = !isLoading;
  linePolicyLoading.setAttribute("aria-hidden", String(!isLoading));
  linePolicyGrid.hidden = isLoading;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "ไม่สามารถเชื่อมต่อระบบได้");
  return payload;
}

function renderLineProfile(profile) {
  const isLoggedIn = Boolean(profile?.userId);
  lineProfile.hidden = !isLoggedIn;
  lineLoginButton.hidden = isLoggedIn;
  lineLogoutButton.hidden = !isLoggedIn;
  if (!isLoggedIn) return;
  lineProfilePicture.src = profile.pictureUrl || "assets/logo.svg";
  lineProfilePicture.alt = profile.displayName ? `รูปโปรไฟล์ LINE ของ ${profile.displayName}` : "รูปโปรไฟล์ LINE";
  lineProfileTitle.textContent = profile.displayName || "LINE Profile";
  lineProfileUserId.textContent = profile.userId || "";
}

function renderPolicies(policies) {
  if (!policies.length) {
    linePolicyGrid.innerHTML = `
      <div class="plan-empty">
        <strong>ยังไม่พบกรมธรรม์ที่ผูกกับ LINE นี้</strong>
        <span>ให้ทีมหลังบ้านนำ LINE User ID ไปบันทึกในช่อง LINE User ID ของกรมธรรม์ก่อน</span>
      </div>
    `;
    return;
  }

  linePolicyGrid.innerHTML = policies.map((policy) => {
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

async function loadLinePolicies() {
  setLinePolicyLoading(true);
  try {
    const policies = await fetchJson("/api/customer/line-policies");
    renderPolicies(policies);
  } finally {
    setLinePolicyLoading(false);
  }
}

async function initializeLineLoginPage() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");
  const login = params.get("login");
  try {
    const session = await fetchJson("/api/customer/line-session");
    renderLineProfile(session.profile);
    if (!session.configured) {
      lineLoginStatus.textContent = "ยังไม่ได้ตั้งค่า LINE Login บน server";
      lineLoginButton.setAttribute("aria-disabled", "true");
      return;
    }
    if (!session.authenticated) {
      lineLoginStatus.textContent = error
        ? (lineLoginErrorMessages[error] || `LINE Login ไม่สำเร็จ: ${error}`)
        : "พร้อมให้ลูกค้า Login ด้วย LINE";
      return;
    }
    lineLoginStatus.textContent = login === "success"
      ? "Login สำเร็จและบันทึก LINE Profile แล้ว"
      : "เข้าสู่ระบบด้วย LINE แล้ว";
    await loadLinePolicies();
  } catch (loadError) {
    lineLoginStatus.textContent = loadError.message;
  }
}

lineLogoutButton?.addEventListener("click", async () => {
  try {
    await fetchJson("/api/customer/line-session", { method: "DELETE" });
    renderLineProfile(null);
    lineLoginStatus.textContent = "ออกจากระบบ LINE แล้ว";
    linePolicyGrid.innerHTML = `
      <div class="plan-empty">
        <strong>ยังไม่ได้เข้าสู่ระบบด้วย LINE</strong>
        <span>กดปุ่ม Login ด้วย LINE ด้านบนเพื่อเริ่มตรวจสอบข้อมูล</span>
      </div>
    `;
  } catch (error) {
    lineLoginStatus.textContent = error.message;
  }
});

initializeLineLoginPage();
