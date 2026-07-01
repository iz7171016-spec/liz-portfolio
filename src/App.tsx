import { type MouseEvent, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { motion } from "motion/react";
import {
  BookOpen,
  Brain,
  Compass,
  Layers3,
  Mail,
  Music2,
  Sparkles,
  VolumeX,
} from "lucide-react";
import { LateLight } from "./LateLight";

const videoSrc =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4";
const assetSrc = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
const musicSrc = assetSrc("/audio/summer-eyes.mp3");

const navItems = [
  { label: "01 WHO I AM", href: "#who" },
  { label: "02 WHAT I BUILD", href: "#build" },
  { label: "03 WHAT I THINK", href: "#think" },
  { label: "04 WHAT I'M LEARNING", href: "#learning" },
  { label: "05 WHAT'S NEXT", href: "#next" },
];

const whoLinks = [
  { label: "自我介绍", href: "#intro" },
  { label: "兴趣", href: "#interests" },
  { label: "成长轨迹", href: "#growth" },
];

const buildLinks = [
  { label: "Multimodel evaluation", href: "#multimodel-evaluation" },
  { label: "Automation workflows", href: "#automation-workflows" },
  { label: "AI products", href: "#ai-products" },
];

const thinkLinks = [
  { label: "AI 会取代工作，还是重新定义工作？", href: "#ai-work" },
  { label: "Prompt Engineering 还是未来的核心能力吗？", href: "#prompt-engineering" },
  { label: "未来五年，最重要的 AI 能力是什么？", href: "#future-ai-skills" },
];

const learningDetailLinks = [
  { label: "GitHub 基础", href: "#github-basics" },
  { label: "Agent Skills", href: "#agent-skills" },
  { label: "Copilot 实践", href: "#copilot-practice" },
];

const toolLinks = [
  { label: "Dify", href: "https://dify.ai" },
  { label: "Codex", href: "https://chatgpt.com/codex/" },
  { label: "Claude", href: "https://claude.ai" },
  { label: "n8n", href: "https://n8n.io" },
  { label: "Zapier", href: "https://zapier.com" },
];

const learningLinks = [
  { label: "DeepLearning.AI", href: "https://www.deeplearning.ai" },
  { label: "Hugging Face Learn", href: "https://huggingface.co/learn" },
  { label: "Google AI for Developers", href: "https://ai.google.dev" },
  { label: "OpenAI Academy", href: "https://academy.openai.com" },
  { label: "Anthropic Docs", href: "https://docs.anthropic.com" },
  { label: "arXiv", href: "https://arxiv.org" },
];

const githubSkillLinks = [
  { label: "GitHub Skills（官方交互式练习）", href: "https://skills.github.com/" },
  { label: "Introduction to GitHub（GitHub 入门）", href: "https://github.com/skills/introduction-to-github" },
  { label: "Awesome Agent Skills（Agent 技能合集）", href: "https://github.com/VoltAgent/awesome-agent-skills" },
  { label: "Awesome Copilot Skills（Copilot 用法合集）", href: "https://awesome-copilot.github.com/skills/" },
  { label: "GitHub Learning Resources（Git/GitHub 学习资料）", href: "https://docs.github.com/en/get-started/start-your-journey/git-and-github-learning-resources" },
];

const introParagraphs = [
  "你好~我叫王琪璎，也可以叫我 Liz。",
  "我是一个真诚、热情，也很愿意和别人建立连接的人。平时的我比较喜欢沟通，也很在意团队里的协作氛围。我希望自己不只是把一件事完成，更希望能在合作的过程中，让沟通更顺畅，让事情推进得更高效。",
  "我对 AI 方向一直保持着很强的好奇心，也希望自己能在这个领域持续成长。对我来说，AI 不只是提升效率的工具，它也是一种新的表达方式。它可以帮助我们重新组织复杂的问题，也能让创意拥有更多落地的可能。",
  "在之后的学习和工作中，我希望自己能够把表达能力、共情能力和执行力结合起来，认真理解任务背后的需求，也持续提升自己对模型、数据和用户体验的理解。",
  "生活里的我兴趣也比较丰富。我喜欢音乐、电影、旅行，也喜欢接触新鲜事物。这些不同领域的体验，也在不断影响我的观察方式和思考方式。",
  "如果用几个词来形容我，我会说是真诚、好奇、愿意学习，也有一点点不服输。很期待接下来能认识更多优秀的人，也希望能和大家一起探索 AI 与创造力的更多可能。",
];

const growthCities = [
  { city: "山西临汾", note: "起点" },
  { city: "山西运城", note: "继续出发" },
  { city: "西安", note: "打开新的视野" },
  { city: "北京", note: "奔向更大的现场" },
];

const interestCards = [
  {
    title: "辩论视频",
    caption: "喜欢看观点交锋，也喜欢观察一个观点是如何被组织、表达和回应的。",
    tags: ["表达", "逻辑", "现场感"],
  },
  {
    title: "流行音乐",
    caption: "国内外知名歌手都会听，旋律、歌词和舞台氛围经常会给我带来新的情绪灵感。",
    tags: ["Taylor Swift", "Adele", "Jay Chou", "Eason Chan"],
  },
  {
    title: "电影与旅行",
    caption: "电影让我看见不同的人生，旅行让我重新感受真实的世界。",
    tags: ["故事", "城市", "风景"],
  },
];

const aiPortfolioImages = [
  assetSrc("/portfolio/p1.webp"),
  assetSrc("/portfolio/p2.webp"),
  assetSrc("/portfolio/p3.webp"),
  assetSrc("/portfolio/p4.webp"),
  assetSrc("/portfolio/p5.webp"),
  assetSrc("/portfolio/p6.webp"),
];

const detailPages = {
  intro: {
    number: "01 / 01",
    title: "自我介绍",
    back: "#who",
    text: "你好~我叫王琪璎，也可以叫我 Liz。",
    image: assetSrc("/images/intro-liz.webp"),
    paragraphs: introParagraphs,
  },
  interests: {
    number: "01 / 02",
    title: "兴趣",
    back: "#who",
    text: "我喜欢能带来情绪、观点和现场感的内容。辩论视频让我看到观点如何被表达和碰撞，流行音乐会陪我进入不同状态，电影和旅行则让我保留对世界的好奇。很多灵感不是突然出现的，而是在这些日常体验里慢慢积累起来的。",
    interestCards,
  },
  growth: {
    number: "01 / 03",
    title: "成长轨迹",
    back: "#who",
    text: "从山西临汾出发，经过运城、西安，再来到北京。每一站都不是简单的地点变化，而是一次新的适应、选择和成长。",
    routeMap: growthCities,
  },
  "multimodel-evaluation": {
    number: "02 / 01",
    title: "Multimodel evaluation",
    back: "#build",
    text: "这里记录我对多模态评测的理解与实践：从评测目标、样本设计、评分维度到结果汇报，把模型表现转化为更清晰、可复盘、可决策的判断依据。",
    links: [{ label: "Open 评测汇报", href: "https://pince.vercel.app" }],
  },
  "automation-workflows": {
    number: "02 / 02",
    title: "Automation workflows",
    back: "#build",
    text: "这里放的是我自己搭建的一条自动化链路：用 Dify 串起任务流程，再用飞书文档沉淀说明、结果和复盘，让一个想法从流程设计变成可以被打开、验证和持续优化的工作方式。",
    links: [
      {
        label: "Open Dify 工作流",
        href: "https://cloud.dify.ai/app/9f89122e-f894-4a38-ae09-53969d78d50d/workflow",
      },
      {
        label: "Open 想法落地过程",
        href: "https://xcnysi1641sk.feishu.cn/wiki/IaNHwu9LsigXFhk4Ylvcz5Binnp?from=from_copylink",
      },
    ],
  },
  "ai-products": {
    number: "02 / 03",
    title: "AI products",
    back: "#build",
    text: "这里收纳我做过的 AI 产品原型与工具实验：从质检流程，到专注空间，把想法变成可以被打开、体验和继续迭代的页面。",
    links: [
      { label: "Open V1 质检工具", href: assetSrc("/tools/quality-check.html") },
      { label: "Open LateLight AI 自习室", href: "#latelight" },
      { label: "Open AI作品集", href: "#ai-portfolio" },
    ],
  },
  "ai-portfolio": {
    number: "02 / 04",
    title: "AI作品集",
    back: "#ai-products",
    text: "我们总在不自觉地重复既定的生活模式，习惯性跟风、产生标准化情绪。我用这支短片记录日常里的荒诞瞬间，希望始终做一个清醒的旁观者，守住自己的思考与节奏。",
    portfolioImages: aiPortfolioImages,
    video: assetSrc("/portfolio/ai-short-film-web.mp4"),
  },
  "ai-work": {
    number: "03 / 01",
    title: "AI 会取代工作，还是重新定义工作？",
    back: "#think",
    text: "这里会整理我对 AI 与工作的思考：哪些任务会被自动化，哪些能力会变得更重要，以及人如何重新定义自己的价值。",
    source:
      "https://www.techradar.com/pro/entirely-automating-everything-is-not-the-future-we-want-openai-ceo-sam-altman-lays-out-his-companys-vision-as-it-opens-a-third-phase-and-looks-to-build-technology-to-benefit-everyone?utm_source=chatgpt.com",
  },
  "prompt-engineering": {
    number: "03 / 02",
    title: "Prompt Engineering 还是未来的核心能力吗？",
    back: "#think",
    text: "这里会记录我对 Prompt、Context Engineering、Agent 工作流的理解：未来关键可能不是一句提示词，而是设计上下文、目标和反馈系统的能力。",
    source: "https://pub.towardsai.net/state-of-context-engineering-in-2026-cf92d010eab1",
  },
  "future-ai-skills": {
    number: "03 / 03",
    title: "未来五年，最重要的 AI 能力是什么？",
    back: "#think",
    text: "这里会沉淀关于未来 AI 能力的观察：多模态理解、评测判断、自动化编排、产品感，以及持续学习的速度。",
    source: "https://arxiv.org/abs/2606.21894?utm_source=chatgpt.com",
  },
  "github-basics": {
    number: "04 / 01",
    title: "GitHub 基础",
    back: "#learning",
    text: "我正在补齐 Git、GitHub 和项目协作的基础能力，包括仓库管理、分支、提交记录、文档阅读和开源项目浏览。它不只是一个代码平台，更像是理解真实项目如何被组织、迭代和协作的入口。",
  },
  "agent-skills": {
    number: "04 / 02",
    title: "Agent Skills",
    back: "#learning",
    text: "我想继续学习如何把任务拆成更清晰的步骤，让 Agent 能理解目标、调用工具、产出结果，并在过程中保留可检查的链路。对我来说，这类技能能帮助复杂工作变得更有结构，也更容易复用。",
  },
  "copilot-practice": {
    number: "04 / 03",
    title: "Copilot 实践",
    back: "#learning",
    text: "我正在尝试把 Copilot 当成日常学习和创作里的协作伙伴：用它辅助理解代码、整理思路、生成初稿和检查细节。重点不是让 AI 替我完成一切，而是学会更准确地提问、更清楚地判断结果。",
  },
} as const;

const sections = [
  {
    id: "who",
    number: "01",
    title: "WHO I AM",
    eyebrow: "",
    text: "我叫栗子~我相信，每一次创作，都是一次新的探索。我用技术实现想法，也用作品表达自己。\n欢迎来到我的世界~",
    meta: ["自我介绍", "兴趣", "成长轨迹"],
    icon: Sparkles,
  },
  {
    id: "build",
    number: "02",
    title: "WHAT I BUILD",
    eyebrow: "Experiences with texture",
    text: "构建智能工作流、多模态评测体系和 AI 自动化方案，让复杂工作变得更高效、更可靠。",
    meta: ["Multimodel evaluation", "Automation workflows", "AI products"],
    icon: Layers3,
  },
  {
    id: "think",
    number: "03",
    title: "WHAT I THINK",
    eyebrow: "Notes from the edge",
    text: "一个不断更新的思维档案馆",
    meta: ["AI 会取代工作，还是重新定义工作？", "Prompt Engineering 还是未来的核心能力吗？", "未来五年，最重要的 AI 能力是什么？"],
    icon: Brain,
  },
  {
    id: "learning",
    number: "04",
    title: "WHAT I'M LEARNING",
    eyebrow: "In progress by design",
    text: "我正在整理一组能长期复用的学习工具箱：从 GitHub 基础、Agent 技能到 Copilot 实践，让自己更熟悉真实项目的协作方式，也更会借助 AI 把想法推进成作品。",
    meta: ["GitHub 基础", "Agent Skills", "Copilot 实践"],
    icon: BookOpen,
  },
  {
    id: "next",
    number: "05",
    title: "WHAT'S NEXT",
    eyebrow: "A future-facing studio practice",
    text: "接下来，我希望自己能继续保持好奇，也更扎实地往前走。想把学到的 AI 能力慢慢沉淀成真正有用的作品，不只是做出一个页面或一个工具，而是让它能解决具体的问题，也能留下自己的表达。我期待未来能遇到更多愿意交流、一起创造的人，在一次次尝试里，把想法变成更清晰、更可靠、也更有温度的东西。",
    meta: ["To be continued..."],
    icon: Compass,
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.24 },
  transition: { duration: 0.8, ease: "easeOut" },
} as const;

function Logo() {
  return (
    <span className="inline-flex items-center gap-3 text-white">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 256 256"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M 4.688 136 C 68.373 136 120 187.627 120 251.312 C 120 252.883 119.967 254.445 119.905 256 L 0 256 L 0 136.096 C 1.555 136.034 3.117 136 4.688 136 Z M 251.312 136 C 252.883 136 254.445 136.034 256 136.096 L 256 256 L 136.095 256 C 136.032 254.438 136.001 252.875 136 251.312 C 136 187.627 187.627 136 251.312 136 Z M 119.905 0 C 119.967 1.555 120 3.117 120 4.688 C 120 68.373 68.373 120 4.687 120 C 3.117 120 1.555 119.967 0 119.905 L 0 0 Z M 256 119.905 C 254.445 119.967 252.883 120 251.312 120 C 187.627 120 136 68.373 136 4.687 C 136 3.117 136.033 1.555 136.095 0 L 256 0 Z" />
      </svg>
    </span>
  );
}

export function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isToolOpen, setIsToolOpen] = useState(false);
  const [isLearningOpen, setIsLearningOpen] = useState(false);
  const [isSkillOpen, setIsSkillOpen] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [route, setRoute] = useState(() => window.location.hash.replace("#", ""));

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash.replace("#", ""));
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const detailPage = detailPages[route as keyof typeof detailPages];

  const handleDetailBack = (
    event: MouseEvent<HTMLAnchorElement>,
    target: string,
  ) => {
    event.preventDefault();
    const targetRoute = target.replace("#", "");
    if (targetRoute in detailPages) {
      flushSync(() => setRoute(targetRoute));
      window.history.pushState(null, "", target);
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    flushSync(() => setRoute(""));
    window.history.pushState(null, "", target);
    const targetElement = document.querySelector(target);
    if (targetElement) {
      window.scrollTo({
        top: window.scrollY + targetElement.getBoundingClientRect().top,
        behavior: "auto",
      });
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsMusicOn(false);
    }
  };

  const startMusic = async () => {
    const audio = audioRef.current ?? new Audio(musicSrc);
    audio.loop = true;
    audio.volume = 0.18;
    audioRef.current = audio;
    await audio.play();
    setIsMusicOn(true);
  };

  const toggleMusic = async () => {
    if (audioRef.current && isMusicOn) {
      stopMusic();
      return;
    }
    await startMusic();
  };

  useEffect(() => {
    let cancelled = false;
    startMusic().catch(() => {
      const handleFirstGesture = () => {
        if (!cancelled) {
          startMusic().catch(() => undefined);
        }
        window.removeEventListener("pointerdown", handleFirstGesture);
      };
      window.addEventListener("pointerdown", handleFirstGesture, { once: true });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="relative w-full min-h-screen overflow-x-hidden flex flex-col items-center font-sans text-white selection:bg-white/20 selection:text-white">
      <video
        className="fixed inset-0 w-full h-full object-cover z-[0]"
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-[1] bg-black/40" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-7xl px-5 py-6 md:px-8 md:py-8">
        <div className="sticky top-4 z-30">
          <header className="liquid-glass flex h-[76px] items-center justify-between gap-4 rounded-full px-5 text-white/75 md:px-6">
            <div className="flex items-center gap-3">
              <a href="#home" aria-label="Liz home">
                <Logo />
              </a>
              <button
                type="button"
                onClick={toggleMusic}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white/50 hover:text-white"
                aria-label={isMusicOn ? "Turn background music off" : "Turn background music on"}
                aria-pressed={isMusicOn}
              >
                {isMusicOn ? <Music2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
              </button>
            </div>
            <div className="min-w-0 flex-1 text-center text-white/86">
              <p className="text-sm leading-tight md:text-base">Hi ! 我是Liz~，欢迎来找我聊天~</p>
              <p className="mt-1 text-[11px] leading-tight text-white/60 md:text-xs">💡站内按钮随意探索~</p>
            </div>
            <button
              type="button"
              onClick={() => setIsContactOpen((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white/50 hover:text-white"
              aria-label="Show Liz contact information"
              aria-expanded={isContactOpen}
            >
              <Mail size={16} aria-hidden="true" />
            </button>
          </header>
          {isContactOpen && (
            <div className="liquid-glass absolute right-4 top-[88px] z-40 w-[min(22rem,calc(100vw-2rem))] rounded-3xl p-5 text-left text-sm text-white/76 md:right-6">
              <a className="block transition-colors hover:text-white" href="tel:15934535294">
                tel:15934535294
              </a>
              <a
                className="mt-3 block transition-colors hover:text-white"
                href="mailto:2979127424@qq.com"
              >
                e-mail:2979127424@qq.com
              </a>
            </div>
          )}
        </div>

        {isPhotoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5">
            <button
              type="button"
              className="absolute inset-0 cursor-default"
              aria-label="Close photo"
              onClick={() => setIsPhotoOpen(false)}
            />
            <div className="liquid-glass relative z-10 aspect-[4/5] w-full max-w-sm rounded-3xl p-3">
              <img
                src={assetSrc("/images/liz-photo.webp")}
                alt="Liz"
                className="h-full w-full rounded-[1.25rem] object-cover"
                onError={(event) => {
                  event.currentTarget.style.opacity = "0";
                }}
              />
            </div>
          </div>
        )}

        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
            <button
              type="button"
              className="absolute inset-0 cursor-default"
              aria-label="Close portfolio image"
              onClick={() => setPreviewImage(null)}
            />
            <div className="liquid-glass relative z-10 w-full max-w-5xl rounded-3xl p-3">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute right-5 top-5 z-10 rounded-full border border-white/15 bg-black/25 px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/68 backdrop-blur-md transition-colors hover:border-white/40 hover:text-white"
              >
                Close
              </button>
              <img
                src={previewImage}
                alt="AI portfolio preview"
                className="max-h-[82vh] w-full rounded-[1.25rem] object-contain"
              />
            </div>
          </div>
        )}

        {route === "latelight" ? (
          <section className="py-8 md:py-12">
            <LateLight
              onBack={() => {
                flushSync(() => setRoute(""));
                window.history.pushState(null, "", "#build");
                const targetElement = document.querySelector("#build");
                if (targetElement) {
                  window.scrollTo({
                    top: window.scrollY + targetElement.getBoundingClientRect().top,
                    behavior: "auto",
                  });
                }
              }}
            />
          </section>
        ) : detailPage ? (
          <section className="min-h-[calc(100vh-7rem)] py-20">
            <motion.article
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="liquid-glass grid min-h-[520px] gap-10 rounded-3xl p-6 md:grid-cols-[0.72fr_1.28fr] md:p-10"
            >
              <div className="flex flex-col justify-between gap-10">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-white/45">
                    {detailPage.number}
                  </p>
                  <h1 className="mt-4 text-3xl font-medium leading-none md:text-5xl">
                    {detailPage.title}
                  </h1>
                </div>
                <a
                  href={detailPage.back}
                  onClick={(event) => handleDetailBack(event, detailPage.back)}
                  className="w-fit rounded-full border border-white/15 px-5 py-3 text-xs uppercase tracking-[0.2em] text-white/60 transition-colors hover:border-white/40 hover:text-white"
                >
                  Back
                </a>
              </div>
              {"interestCards" in detailPage ? (
                <div className="self-end space-y-6">
                  <p className="text-lg leading-[1.42] text-white/82 md:text-2xl">
                    {detailPage.text}
                  </p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {detailPage.interestCards.map((card) => (
                      <div
                        key={card.title}
                        className="rounded-3xl border border-white/12 bg-white/[0.035] p-4 shadow-2xl shadow-black/10"
                      >
                        <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                          {card.title}
                        </p>
                        <p className="mt-4 text-sm leading-6 text-white/72">{card.caption}</p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {card.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.14em] text-white/52"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : "routeMap" in detailPage ? (
                <div className="self-end">
                  <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 md:p-7">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_82%_68%,rgba(255,255,255,0.1),transparent_30%)]" />
                    <div className="relative">
                      <div className="mb-8 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.28em] text-white/42">
                        <span>Origin</span>
                        <span>Now</span>
                      </div>
                      <div className="relative grid gap-6 md:grid-cols-4 md:gap-3">
                        <div className="absolute left-[1.05rem] top-5 h-[calc(100%-2.5rem)] w-px bg-gradient-to-b from-white/70 via-white/28 to-white/5 md:left-0 md:right-0 md:top-6 md:mx-auto md:h-px md:w-[calc(100%-3.5rem)] md:bg-gradient-to-r" />
                        {detailPage.routeMap.map((stop, stopIndex) => (
                          <div key={stop.city} className="relative z-10 flex gap-4 md:block">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-xs text-white shadow-[0_0_28px_rgba(255,255,255,0.16)] md:mx-auto">
                              {String(stopIndex + 1).padStart(2, "0")}
                            </div>
                            <div className="pb-2 md:mt-5 md:text-center">
                              <p className="text-xl font-medium text-white/88 md:text-2xl">
                                {stop.city}
                              </p>
                              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/42">
                                {stop.note}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="mt-10 text-lg leading-8 text-white/76 md:text-2xl md:leading-10">
                        {detailPage.text}
                      </p>
                    </div>
                  </div>
                </div>
              ) : "portfolioImages" in detailPage ? (
                <div className="self-end space-y-5">
                  <div className="rounded-3xl border border-white/12 bg-white/[0.035] p-4 shadow-2xl shadow-black/20">
                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/48">
                        图片作品
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      {detailPage.portfolioImages.map((image, imageIndex) => (
                        <button
                          key={image}
                          type="button"
                          onClick={() => setPreviewImage(image)}
                          className="group overflow-hidden rounded-2xl border border-white/10 text-left transition hover:border-white/35"
                          aria-label={`Open AI portfolio image ${imageIndex + 1}`}
                        >
                          <img
                            src={image}
                            alt={`AI portfolio image ${imageIndex + 1}`}
                            className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/12 bg-white/[0.035] p-4 shadow-2xl shadow-black/20">
                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/48">
                        视频作品
                      </p>
                      <p className="mt-3 text-base leading-7 text-white/76 md:text-xl md:leading-9">
                        {detailPage.text}
                      </p>
                    </div>
                    <video
                      src={detailPage.video}
                      controls
                      preload="metadata"
                      poster={assetSrc("/portfolio/ai-short-film-poster.webp")}
                      className="aspect-video w-full rounded-2xl border border-white/10 object-cover"
                    />
                  </div>
                </div>
              ) : "paragraphs" in detailPage ? (
                <div className="self-end space-y-6">
                  {"image" in detailPage && (
                    <img
                      src={detailPage.image}
                      alt="Liz personal introduction"
                      className="w-full rounded-3xl border border-white/12 object-cover shadow-2xl shadow-black/20"
                    />
                  )}
                  <div className="space-y-4 text-sm leading-7 text-white/78 md:text-base md:leading-8">
                    {detailPage.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="self-end text-lg leading-[1.42] text-white/82 md:text-2xl">
                  {detailPage.text}
                </p>
              )}
              {"links" in detailPage && (
                <div className="mt-8 flex flex-wrap gap-3 md:col-start-2">
                  {detailPage.links.map((link) => {
                    const isInternalLink = link.href.startsWith("#");

                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        target={isInternalLink ? undefined : "_blank"}
                        rel={isInternalLink ? undefined : "noreferrer"}
                        className="inline-flex w-fit rounded-full border border-white/15 px-5 py-3 text-xs uppercase tracking-[0.18em] text-white/60 transition-colors hover:border-white/40 hover:text-white"
                      >
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              )}
              {"source" in detailPage && (
                <a
                  href={detailPage.source}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex w-fit rounded-full border border-white/15 px-5 py-3 text-xs uppercase tracking-[0.18em] text-white/60 transition-colors hover:border-white/40 hover:text-white md:col-start-2"
                >
                  {"sourceLabel" in detailPage ? detailPage.sourceLabel : "Read source"}
                </a>
              )}
            </motion.article>
          </section>
        ) : (
          <>
            <section id="home" className="min-h-[64vh] md:min-h-[68vh]" aria-hidden="true" />

            <section className="pb-16 md:pb-24">
              <motion.div {...fadeIn} className="liquid-glass grid gap-5 rounded-3xl p-4 md:grid-cols-5">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl border border-white/10 px-4 py-5 text-xs uppercase tracking-[0.2em] text-white/58 transition-colors hover:border-white/35 hover:text-white"
                  >
                    {item.label}
                  </a>
                ))}
              </motion.div>
            </section>

            <div className="space-y-6 pb-24 md:space-y-8 md:pb-32">
              {sections.map((section, index) => (
                <motion.section
                  id={section.id}
                  key={section.id}
                  {...fadeIn}
                  transition={{ duration: 0.75, delay: index * 0.04, ease: "easeOut" }}
                  className="liquid-glass grid min-h-[360px] gap-8 rounded-3xl p-6 md:grid-cols-[0.72fr_1.28fr] md:p-10"
                >
                  <div className="flex flex-col justify-between gap-10">
                    <div>
                      <p className="text-xs uppercase tracking-[0.32em] text-white/45">
                        {section.number}
                      </p>
                      <h2 className="mt-4 text-3xl font-medium leading-none md:text-4xl">
                        {section.title}
                      </h2>
                    </div>
                    {section.id === "who" ? (
                      <button
                        type="button"
                        onClick={() => setIsPhotoOpen(true)}
                        className="w-fit text-white/70 transition-colors hover:text-white"
                        aria-label="Open Liz photo"
                      >
                        <section.icon size={26} aria-hidden="true" />
                      </button>
                    ) : section.id === "build" ? (
                      <div className="relative w-fit">
                        <button
                          type="button"
                          onClick={() => setIsToolOpen((value) => !value)}
                          className="w-fit text-white/70 transition-colors hover:text-white"
                          aria-label="Open automation tool links"
                          aria-expanded={isToolOpen}
                        >
                          <section.icon size={26} aria-hidden="true" />
                        </button>
                        {isToolOpen && (
                          <div className="liquid-glass mt-4 w-64 rounded-3xl p-4 text-xs text-white/72">
                            <div className="grid gap-2">
                              {toolLinks.map((tool) => (
                                <a
                                  key={tool.label}
                                  href={tool.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full border border-white/10 px-4 py-2 transition-colors hover:border-white/35 hover:text-white"
                                >
                                  {tool.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : section.id === "think" ? (
                      <div className="relative w-fit">
                        <button
                          type="button"
                          onClick={() => setIsLearningOpen((value) => !value)}
                          className="w-fit text-white/70 transition-colors hover:text-white"
                          aria-label="Open AI learning links"
                          aria-expanded={isLearningOpen}
                        >
                          <section.icon size={26} aria-hidden="true" />
                        </button>
                        {isLearningOpen && (
                          <div className="liquid-glass mt-4 w-72 rounded-3xl p-4 text-xs text-white/72">
                            <div className="grid gap-2">
                              {learningLinks.map((link) => (
                                <a
                                  key={link.label}
                                  href={link.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full border border-white/10 px-4 py-2 transition-colors hover:border-white/35 hover:text-white"
                                >
                                  {link.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : section.id === "learning" ? (
                      <div className="relative w-fit">
                        <button
                          type="button"
                          onClick={() => setIsSkillOpen((value) => !value)}
                          className="w-fit text-white/70 transition-colors hover:text-white"
                          aria-label="Open GitHub skill links"
                          aria-expanded={isSkillOpen}
                        >
                          <section.icon size={26} aria-hidden="true" />
                        </button>
                        {isSkillOpen && (
                          <div className="liquid-glass mt-4 w-72 rounded-3xl p-4 text-xs text-white/72">
                            <div className="grid gap-2">
                              {githubSkillLinks.map((link) => (
                                <a
                                  key={link.label}
                                  href={link.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full border border-white/10 px-4 py-2 transition-colors hover:border-white/35 hover:text-white"
                                >
                                  {link.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <section.icon size={24} className="text-white/70" aria-hidden="true" />
                    )}
                  </div>

                  <div className="grid gap-8 md:grid-cols-[1fr_220px] md:items-end">
                    <div>
                      {section.eyebrow && (
                        <p className="text-sm uppercase tracking-[0.24em] text-white/50">
                          {section.eyebrow}
                        </p>
                      )}
                      <p className="max-w-3xl whitespace-pre-line text-lg leading-[1.45] text-white/84 md:text-2xl">
                        {section.text}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {section.id === "who"
                        ? whoLinks.map((item) => (
                            <a
                              key={item.href}
                              href={item.href}
                              className="block rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/58 transition-colors hover:border-white/35 hover:text-white"
                            >
                              {item.label}
                            </a>
                          ))
                        : section.id === "build"
                          ? buildLinks.map((item) => (
                              <a
                                key={item.href}
                                href={item.href}
                                className="block rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/58 transition-colors hover:border-white/35 hover:text-white"
                              >
                                {item.label}
                              </a>
                            ))
                          : section.id === "think"
                            ? thinkLinks.map((item) => (
                                <a
                                  key={item.href}
                                  href={item.href}
                                  className="block rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/58 transition-colors hover:border-white/35 hover:text-white"
                                >
                                  {item.label}
                                </a>
                              ))
                            : section.id === "learning"
                              ? learningDetailLinks.map((item) => (
                                  <a
                                    key={item.href}
                                    href={item.href}
                                    className="block rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/58 transition-colors hover:border-white/35 hover:text-white"
                                  >
                                    {item.label}
                                  </a>
                                ))
                          : section.meta.map((item) => (
                            <p
                              key={item}
                              className="rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/58"
                            >
                              {item}
                            </p>
                          ))}
                    </div>
                  </div>
                </motion.section>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
