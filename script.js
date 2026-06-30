// 页面动效与交互脚本
// 小白改文字时请去 content.js；这个文件主要负责把内容显示到页面上。
const { animate, inView, scroll } = window.Motion;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
const content = window.siteContent || {};
const works = content.works || [];
const allCategory = content.worksSection?.allCategory || "全部";
const pointer = { x: innerWidth * .72, y: innerHeight * .36, active: false };

const grid = document.querySelector("#works-grid");
const filtersWrap = document.querySelector(".filters");
const modal = document.querySelector("#work-modal");

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element && value !== undefined) element.textContent = value;
}

function setHTML(selector, value) {
  const element = document.querySelector(selector);
  if (element && value !== undefined) element.innerHTML = value;
}

function renderPillList(selector, items = []) {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = items.map((item) => `<span>${escapeHTML(item)}</span>`).join("");
}

function applySiteContent() {
  if (content.pageTitle) document.title = content.pageTitle;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && content.pageDescription) metaDescription.setAttribute("content", content.pageDescription);

  // 顶部品牌、菜单与首屏文案
  setText(".brand", content.brand);
  setText(".hero-title", content.brand);
  document.querySelector(".brand")?.setAttribute("aria-label", `${content.brand || "Liz"} 首页`);
  document.querySelector(".hero-title")?.setAttribute("aria-label", content.brand || "Liz");

  const heroLines = content.hero?.lines || [];
  const heroCopy = document.querySelector(".hero-copy");
  if (heroCopy && heroLines.length) {
    heroCopy.innerHTML = heroLines.map((line) => `<p>${escapeHTML(line)}</p>`).join("");
  }
  setText(".hero-rail p", content.hero?.railText);
  setText(".scroll-cue span", content.hero?.scrollText);

  const nav = document.querySelector(".menu-panel nav");
  if (nav && content.nav?.length) {
    nav.innerHTML = content.nav
      .map((item) => `<a href="${escapeHTML(item.href)}"><span>${escapeHTML(item.number)}</span>${escapeHTML(item.label)}</a>`)
      .join("");
  }

  // About 关于我
  setText("#about .section-kicker span", content.about?.sectionNumber);
  setText("#about .section-kicker p", content.about?.sectionLabel);
  setText("#about .eyebrow", content.about?.eyebrow);
  setHTML(
    "#about h2",
    `${escapeHTML(content.about?.titleLine1 || "大家好，")}<br />${escapeHTML(content.about?.titleLine2 || "我是")} <em>${escapeHTML(content.about?.highlightName || content.brand || "Liz")}</em>。`
  );
  const aboutParagraph = document.querySelector(".about-copy > p:not(.eyebrow)");
  if (aboutParagraph && content.about?.description) aboutParagraph.textContent = content.about.description;
  renderPillList(".about-tags", content.about?.tags || []);

  // Works 作品集标题与筛选
  setText("#works .section-kicker span", content.worksSection?.sectionNumber);
  setText("#works .section-kicker p", content.worksSection?.sectionLabel);
  setHTML("#works h2", `${escapeHTML(content.worksSection?.titleBefore || "Selected")} <em>${escapeHTML(content.worksSection?.titleHighlight || "Works")}</em>`);
  setText("#works .section-note", content.worksSection?.note);
  renderFilters();

  // Skills 技能
  setText("#skills .section-kicker span", content.skills?.sectionNumber);
  setText("#skills .section-kicker p", content.skills?.sectionLabel);
  setHTML("#skills h2", `${escapeHTML(content.skills?.titleBefore || "Skills &")} <em>${escapeHTML(content.skills?.titleHighlight || "Tools")}</em>`);
  renderPillList(".skill-cloud", content.skills?.tags || []);

  // Footer 页脚
  setText(".footer .eyebrow", content.footer?.eyebrow);
  setHTML(".footer h2", `${escapeHTML(content.footer?.titleLine1 || "Have an idea?")}<br /><em>${escapeHTML(content.footer?.titleLine2 || "Let’s talk.")}</em>`);
  const emailLink = document.querySelector(".email-link");
  if (emailLink && content.footer?.email) {
    emailLink.href = `mailto:${content.footer.email}`;
    emailLink.innerHTML = `${escapeHTML(content.footer.email)} <i class="ph ph-arrow-up-right"></i>`;
  }
  setText(".footer-bottom > p", content.footer?.copyright);
  const socialLinks = document.querySelectorAll(".socials a");
  content.footer?.socials?.forEach((social, index) => {
    const link = socialLinks[index];
    if (!link) return;
    link.href = social.href || "#";
    link.setAttribute("aria-label", social.label || `Social ${index + 1}`);
  });
}

function renderFilters() {
  if (!filtersWrap) return;
  const categories = content.worksSection?.categories || [allCategory];
  filtersWrap.innerHTML = categories
    .map((category, index) => `<button class="filter ${index === 0 ? "active" : ""}" data-filter="${escapeHTML(category)}">${escapeHTML(category)}</button>`)
    .join("");

  filtersWrap.querySelectorAll(".filter").forEach((button) => button.addEventListener("click", () => {
    filtersWrap.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderWorks(button.dataset.filter);
  }));
}

function renderWorks(filter = allCategory) {
  const list = filter === allCategory ? works : works.filter((work) => work.category === filter);

  grid.innerHTML = list.map((work) => {
    const index = works.indexOf(work);
    return `
      <article class="work-card" data-index="${index}" tabindex="0" role="button" aria-label="查看作品：${escapeHTML(work.title)}">
        <img src="${escapeHTML(work.image)}" alt="${escapeHTML(work.title)} 抽象作品视觉" loading="lazy" />
        <span class="work-index">${String(index + 1).padStart(2, "0")}</span>
        <div class="work-overlay">
          <p class="work-category">${escapeHTML(work.category)}</p>
          <h3 class="work-title">${escapeHTML(work.title)}<i class="ph ph-arrow-up-right"></i></h3>
        </div>
      </article>`;
  }).join("");

  animate(".work-card", { opacity: [0, 1], y: [34, 0] }, { duration: .62, delay: (i) => i * .06, easing: [.22, .7, .2, 1] });
  bindWorkCards();
}

function bindWorkCards() {
  grid.querySelectorAll(".work-card").forEach((card) => {
    const open = () => openWork(Number(card.dataset.index));
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });

    // 鼠标经过作品卡片时，用光斑追随指针，增强“玻璃下有光”的触感。
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}

function openWork(index) {
  const work = works[index];
  document.querySelector("#modal-image").src = work.image;
  document.querySelector("#modal-image").alt = `${work.title} 作品大图`;
  document.querySelector("#modal-category").textContent = work.category;
  document.querySelector("#modal-title").textContent = work.title;
  document.querySelector("#modal-description").textContent = work.description;
  modal.showModal();
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.close();
  document.body.style.overflow = "";
}

document.querySelector("#modal-close").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
modal.addEventListener("close", () => { document.body.style.overflow = ""; });

// 全屏菜单
const panel = document.querySelector("#menu-panel");
const menuButton = document.querySelector("#menu-button");
const openMenu = () => {
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  menuButton.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
};
const closeMenu = () => {
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
  menuButton.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
};
menuButton.addEventListener("click", openMenu);
document.querySelector("#menu-close").addEventListener("click", closeMenu);
document.addEventListener("click", (event) => {
  const link = event.target.closest(".menu-panel nav a");
  if (link) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    if (modal.open) closeModal();
  }
});

// 滚动后导航切换为黑色玻璃拟态背景。
const header = document.querySelector("#site-header");
window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 48), { passive: true });

// 鼠标柔光跟随：只改变背景光斑位置，不影响点击和内容层级。
window.addEventListener("pointermove", (event) => {
  root.style.setProperty("--cursor-x", `${event.clientX}px`);
  root.style.setProperty("--cursor-y", `${event.clientY}px`);
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
}, { passive: true });

// Framer Motion 滚动渐入、视差与局部循环动效。
function initMotion() {
  if (!reduced) {
    inView("[data-reveal]", (element) => {
      animate(element, { opacity: [0, 1], y: [36, 0] }, { duration: .85, easing: [.22, .7, .2, 1] });
    }, { margin: "0px 0px -12% 0px", amount: .18 });

    scroll(animate(".hero-art", { y: [0, 78], opacity: [1, .74] }, { easing: "linear" }), {
      target: document.querySelector(".hero"),
      offset: ["start start", "end start"]
    });
    scroll(animate(".hero-title", { y: [0, 58], opacity: [1, .42] }, { easing: "linear" }), {
      target: document.querySelector(".hero"),
      offset: ["start start", "end start"]
    });

    animate(".hero-copy p", { opacity: [.72, 1, .76], x: [0, 5, 0] }, {
      duration: 5.8,
      repeat: Infinity,
      delay: (i) => i * .32,
      easing: "ease-in-out"
    });
    animate(".scroll-cue i", { y: [0, 8, 0], opacity: [.6, 1, .6] }, {
      duration: 1.9,
      repeat: Infinity,
      easing: "ease-in-out"
    });
    document.querySelectorAll(".skill-cloud span").forEach((tag, index) => tag.style.setProperty("--tag-index", index));
  } else {
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      el.style.opacity = 1;
      el.style.transform = "none";
    });
  }
}

// 缓慢微光粒子背景：加入连线、鼠标轻微推散和不同色相，让暗场更有生命感。
const canvas = document.querySelector("#particles");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * ratio;
  canvas.height = innerHeight * ratio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(135, Math.max(72, Math.floor(innerWidth / 11)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.45 + .35,
    vx: (Math.random() - .5) * .18,
    vy: -(Math.random() * .22 + .035),
    alpha: Math.random() * .42 + .1,
    hue: [214, 252, 286, 322][Math.floor(Math.random() * 4)]
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];

    if (pointer.active) {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 155 && distance > 0) {
        const force = (155 - distance) / 155;
        p.x += (dx / distance) * force * .42;
        p.y += (dy / distance) * force * .42;
      }
    }

    p.x += p.vx;
    p.y += p.vy;
    if (p.y < -8 || p.x < -8 || p.x > innerWidth + 8) {
      p.y = innerHeight + 8;
      p.x = Math.random() * innerWidth;
    }

    ctx.beginPath();
    ctx.shadowBlur = 12;
    ctx.shadowColor = `hsla(${p.hue}, 90%, 70%, .55)`;
    ctx.fillStyle = `hsla(${p.hue}, 88%, 74%, ${p.alpha})`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowBlur = 0;
  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < 92) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(143, 136, 255, ${(.08 * (1 - distance / 92)).toFixed(3)})`;
        ctx.lineWidth = .55;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  if (!reduced) requestAnimationFrame(drawParticles);
}

applySiteContent();
renderWorks();
initMotion();
resizeCanvas();
drawParticles();
window.addEventListener("resize", resizeCanvas);
