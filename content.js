/*
  Liz 作品集内容配置
  使用方法：
  1. 只修改引号 "" 里面的文字。
  2. 不要删除逗号、冒号、大括号和中括号。
  3. 图片放到 images 文件夹后，把 image 改成对应路径即可。
*/

window.siteContent = {
  brand: "Liz",
  pageTitle: "Liz — Creative Designer & AI Visual Creator",
  pageDescription: "Liz — 视觉创意、AI 美学设计与数字内容创作作品集",

  nav: [
    { number: "01", label: "Home", href: "#home" },
    { number: "02", label: "About", href: "#about" },
    { number: "03", label: "Works", href: "#works" },
    { number: "04", label: "Skills", href: "#skills" },
    { number: "05", label: "Contact", href: "#contact" }
  ],

  hero: {
    lines: [
      "CREATIVE DESIGNER",
      "AI VISUAL CREATOR",
      "BUILD AESTHETIC DIGITAL WORKS"
    ],
    railText: "2026 LIZ PORTFOLIO",
    scrollText: "SCROLL TO EXPLORE"
  },

  about: {
    sectionNumber: "01",
    sectionLabel: "ABOUT ME",
    eyebrow: "CREATIVE DIRECTION · AI AESTHETICS",
    titleLine1: "hi，",
    titleLine2: "我是",
    highlightName: "Liz",
    description: "hi，我是 Liz。03年来自山西临汾喜欢探索新鲜事物的天秤座、网页版式设计、AI视觉项目落地。偏爱暗黑高级、未来极简的艺术表达，用科技与美学结合的方式，打造兼具质感与创意的数字作品。",
    tags: [
      "跳舞,
      "旅游,
      "AI创意生成",
      "视觉排版",
      "品牌视觉",
      "前端基础",
      "后期光影调色",
      "作品集策划"
    ]
  },

  worksSection: {
    sectionNumber: "02",
    sectionLabel: "SELECTED WORKS",
    titleBefore: "Selected",
    titleHighlight: "Works",
    note: "视觉设计 · AI 创意 · 网页项目 · 摄影",
    allCategory: "全部",
    categories: ["全部", "视觉设计", "AI创意", "网页项目", "摄影"]
  },

  works: [
    {
      title: "Liquid Memory",
      category: "AI创意",
      image: "./images/work-1.jpg",
      description: "以液态铬与冷色霓虹为视觉语言，探索记忆、光线与数字材质之间的流动关系。"
    },
    {
      title: "Refraction",
      category: "视觉设计",
      image: "./images/work-2.jpg",
      description: "围绕透明、折射与层叠结构展开的实验视觉，建立克制而具有未来感的品牌氛围。"
    },
    {
      title: "Light Columns",
      category: "网页项目",
      image: "./images/work-3.jpg",
      description: "为数字体验构建的空间化视觉系统，通过光柱节奏引导页面叙事与浏览层次。"
    },
    {
      title: "Orbit Study",
      category: "视觉设计",
      image: "./images/work-4.jpg",
      description: "以几何体、轨道与柔光为核心的系列视觉，研究平衡、留白和视觉张力。"
    },
    {
      title: "Particle Field",
      category: "AI创意",
      image: "./images/work-5.jpg",
      description: "生成式粒子纤维实验，将微观结构转化为富有生命感的数字光影场。"
    },
    {
      title: "Luminous Lens",
      category: "摄影",
      image: "./images/work-6.jpg",
      description: "聚焦玻璃材质、光线反射与深色空间的抽象摄影创作。"
    },
    {
      title: "Iridescent Land",
      category: "摄影",
      image: "./images/work-7.jpg",
      description: "用微距视角记录虹彩表面，让色彩、纹理和景深形成陌生而柔软的地貌。"
    },
    {
      title: "Future Portal",
      category: "网页项目",
      image: "./images/work-8.jpg",
      description: "以沉浸式光环为入口意象的网页概念，结合极简信息架构与电影化视觉。"
    }
  ],

  skills: {
    sectionNumber: "03",
    sectionLabel: "CAPABILITIES",
    titleBefore: "Skills &",
    titleHighlight: "Tools",
    tags: [
      "UI / UX DESIGN",
      "WEB VISUAL",
      "AI ART DIRECTION",
      "BRAND IDENTITY",
      "EDITORIAL LAYOUT",
      "FIGMA",
      "MIDJOURNEY",
      "PHOTOSHOP",
      "AFTER EFFECTS",
      "HTML / CSS",
      "TAILWIND CSS",
      "JAVASCRIPT",
      "LIGHT & COLOR",
      "PORTFOLIO STRATEGY"
    ]
  },

  footer: {
    eyebrow: "LET'S CREATE SOMETHING BEAUTIFUL",
    titleLine1: "Have an idea?",
    titleLine2: "Let’s talk.",
    email: "hello@example.com",
    copyright: "© 2026 Liz All Rights Reserved。",
    socials: [
      { label: "Behance", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "Dribbble", href: "#" },
      { label: "小红书", href: "#" }
    ]
  }
};
