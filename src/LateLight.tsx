import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  Check,
  ChevronRight,
  Circle,
  Coffee,
  Headphones,
  Library,
  Moon,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  TimerReset,
  Trash2,
  Trees,
  Umbrella,
  Volume2,
  Waves,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Task = {
  id: string;
  title: string;
  note: string;
  minutes: number;
  done: boolean;
};

const initialTasks: Task[] = [
  {
    id: "deep-reading",
    title: "精读论文：注意力机制",
    note: "整理核心概念与问题",
    minutes: 50,
    done: false,
  },
  {
    id: "algorithm",
    title: "机器学习：梯度下降",
    note: "完成推导与例题",
    minutes: 45,
    done: true,
  },
  {
    id: "english",
    title: "英语写作：对比分析",
    note: "写一段学术表达",
    minutes: 30,
    done: false,
  },
];

const ambience = [
  { id: "rain", label: "雨声", icon: Umbrella, tone: "窗外细雨敲着玻璃" },
  { id: "cafe", label: "咖啡馆", icon: Coffee, tone: "低声交谈与杯碟轻响" },
  { id: "library", label: "图书馆", icon: Library, tone: "书页翻动与远处脚步" },
  { id: "forest", label: "森林", icon: Trees, tone: "夜风穿过湿润树叶" },
];

const focusModeSeconds = { focus: 25 * 60, break: 5 * 60 };

const memoryLines = [
  "你没有追赶时间，你是在慢慢靠近自己。",
  "今晚的专注很安静，但它确实发生了。",
  "把一页读懂，也是一场温柔的胜利。",
  "灯还亮着，说明你还愿意继续。",
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours} 小时 ${minutes} 分钟` : `${minutes} 分钟`;
}

function useStoredTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = window.localStorage.getItem("latelight-portfolio-tasks");
    return stored ? (JSON.parse(stored) as Task[]) : initialTasks;
  });

  useEffect(() => {
    window.localStorage.setItem("latelight-portfolio-tasks", JSON.stringify(tasks));
  }, [tasks]);

  return [tasks, setTasks] as const;
}

function useAmbientNoise(isPlaying: boolean, mode: string) {
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      sourceRef.current?.stop();
      sourceRef.current = null;
      return;
    }

    const AudioCtor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;

    const context = contextRef.current ?? new AudioCtor();
    contextRef.current = context;
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.58;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = mode === "forest" ? "bandpass" : "lowpass";
    filter.frequency.value =
      mode === "cafe" ? 520 : mode === "library" ? 340 : mode === "forest" ? 900 : 720;
    gain.gain.value = 0.04;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start();
    sourceRef.current = source;

    return () => source.stop();
  }, [isPlaying, mode]);
}

function Glass({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={cx(
        "rounded-[20px] border border-white/15 bg-white/[0.09] shadow-2xl shadow-black/25 backdrop-blur-2xl",
        className,
      )}
    >
      {children}
    </motion.section>
  );
}

export function LateLight({ onBack }: { onBack: () => void }) {
  const [tasks, setTasks] = useStoredTasks();
  const [taskTitle, setTaskTitle] = useState("");
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState(focusModeSeconds.focus);
  const [running, setRunning] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [pomodoros, setPomodoros] = useState(0);
  const [soundMode, setSoundMode] = useState("rain");
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [memoryOpen, setMemoryOpen] = useState(false);
  const activeSound = ambience.find((item) => item.id === soundMode) ?? ambience[0];
  const completedTasks = tasks.filter((task) => task.done).length;
  const memoryLine = useMemo(
    () => memoryLines[(completedTasks + pomodoros) % memoryLines.length],
    [completedTasks, pomodoros],
  );

  useAmbientNoise(soundPlaying, soundMode);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          if (mode === "focus") {
            setPomodoros((value) => value + 1);
            setMemoryOpen(true);
            setMode("break");
            return focusModeSeconds.break;
          }
          setMode("focus");
          return focusModeSeconds.focus;
        }
        if (mode === "focus") setFocusSeconds((value) => value + 1);
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mode, running]);

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;
    setTasks((current) => [
      {
        id: crypto.randomUUID(),
        title,
        note: "今晚的一小步",
        minutes: 25,
        done: false,
      },
      ...current,
    ]);
    setTaskTitle("");
  }

  function resetTimer() {
    setRunning(false);
    setSecondsLeft(focusModeSeconds[mode]);
  }

  return (
    <section className="relative min-h-[calc(100vh-7rem)] overflow-hidden rounded-[2rem] border border-white/10 bg-[#071019] text-stone-100 shadow-2xl shadow-black/40">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/latelight-rainy-library.png')" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,11,0.78),rgba(7,16,25,0.28)_42%,rgba(3,7,11,0.78))]" />
      <div className="relative z-10 grid min-h-[calc(100vh-7rem)] gap-5 p-4 md:p-6 xl:grid-cols-[360px_minmax(420px,1fr)_320px]">
        <div className="flex flex-col gap-5">
          <Glass className="flex h-16 items-center gap-4 px-5">
            <span className="grid size-10 place-items-center rounded-full border border-amber-200/25 bg-amber-100/10 text-amber-100">
              <Sparkles size={19} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold">LateLight - AI 自习室</p>
              <p className="text-xs text-stone-300">Rainy Library</p>
            </div>
            <button
              onClick={onBack}
              className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Back
            </button>
          </Glass>

          <Glass className="p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">今日任务</h2>
                <p className="mt-1 text-sm text-stone-300">{tasks.length} 个任务</p>
              </div>
              <form onSubmit={addTask} className="flex gap-2">
                <input
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="添加任务"
                  className="h-10 w-28 rounded-[16px] border border-white/10 bg-white/10 px-3 text-sm outline-none placeholder:text-stone-400 focus:border-amber-200/40"
                />
                <button className="grid size-10 place-items-center rounded-full bg-stone-100 text-stone-950">
                  <Plus size={17} />
                </button>
              </form>
            </div>

            <div className="max-h-[330px] space-y-1 overflow-auto pr-1">
              {tasks.map((task) => (
                <motion.div
                  layout
                  key={task.id}
                  className="group grid grid-cols-[36px_1fr_auto] items-center gap-3 border-b border-white/10 py-4 last:border-b-0"
                >
                  <button
                    onClick={() =>
                      setTasks((current) =>
                        current.map((item) =>
                          item.id === task.id ? { ...item, done: !item.done } : item,
                        ),
                      )
                    }
                    className={cx(
                      "grid size-8 place-items-center rounded-full border transition",
                      task.done
                        ? "border-emerald-200/50 bg-emerald-200/85 text-stone-950"
                        : "border-white/30 text-stone-300",
                    )}
                  >
                    {task.done ? <Check size={16} /> : <Circle size={12} />}
                  </button>
                  <div className="min-w-0">
                    <p className={cx("truncate text-sm font-semibold", task.done && "text-stone-300 line-through")}>
                      {task.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-stone-400">{task.note}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-300">{task.minutes} 分钟</span>
                    <button
                      onClick={() => setTasks((current) => current.filter((item) => item.id !== task.id))}
                      className="grid size-8 place-items-center rounded-full text-stone-500 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-stone-300">今日目标</span>
                <span>{formatDuration(focusSeconds)} / 6 小时</span>
              </div>
              <div className="h-2 rounded-full bg-white/12">
                <motion.div
                  className="h-full rounded-full bg-amber-100"
                  animate={{ width: `${Math.min((focusSeconds / 21600) * 100, 100)}%` }}
                />
              </div>
            </div>
          </Glass>

          <Glass className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">番茄钟</h2>
              <button onClick={resetTimer} className="grid size-10 place-items-center rounded-full border border-white/15">
                <TimerReset size={17} />
              </button>
            </div>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={secondsLeft}
                initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                className="text-center text-6xl font-semibold"
              >
                {formatTime(secondsLeft)}
              </motion.div>
            </AnimatePresence>
            <div className="mt-5 grid grid-cols-2 gap-2 rounded-[20px] bg-white/10 p-1">
              {(["focus", "break"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setMode(item);
                    setSecondsLeft(focusModeSeconds[item]);
                    setRunning(false);
                  }}
                  className={cx(
                    "rounded-[16px] py-2 text-sm transition",
                    mode === item ? "bg-white text-stone-950" : "text-stone-300",
                  )}
                >
                  {item === "focus" ? "25 专注" : "5 休息"}
                </button>
              ))}
            </div>
            <div className="mt-5 flex justify-center gap-3">
              <button onClick={resetTimer} className="inline-flex h-11 items-center gap-2 rounded-[20px] border border-white/15 px-5 text-sm">
                <RotateCcw size={16} />
                重置
              </button>
              <button onClick={() => setRunning((value) => !value)} className="inline-flex h-11 items-center gap-2 rounded-[20px] bg-stone-100 px-5 text-sm font-medium text-stone-950">
                {running ? <Pause size={17} /> : <Play size={17} />}
                {running ? "暂停" : "开始"}
              </button>
            </div>
          </Glass>
        </div>

        <div className="flex min-h-[560px] flex-col justify-center">
          <Glass className="mx-auto w-full max-w-[590px] p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">专注空间</h1>
                <p className="mt-1 text-sm text-stone-300">12 人在线，安静自习中</p>
              </div>
              <button className="rounded-[16px] border border-white/15 px-4 py-2 text-sm">邀请</button>
            </div>
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <motion.div
                animate={{ scale: running ? [1, 1.04, 1] : 1 }}
                transition={{ duration: 3, repeat: Infinity }}
                className="grid size-20 place-items-center rounded-full border border-white/20 bg-white/10"
              >
                <Moon size={34} className="text-amber-100" />
              </motion.div>
              <h2 className="mt-7 text-4xl font-semibold">专注中</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-stone-300">
                保持专注，沉浸当下。你正在变得更好。
              </p>
              <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-200/10 px-4 py-2 text-sm text-emerald-100">
                <Headphones size={16} />
                {soundPlaying ? `${activeSound.label}播放中` : "等待开始"}
              </div>
            </div>
            <div className="grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
              {["屏蔽干扰 已开启", "消息提醒 已静音", `背景音效 ${activeSound.label}`].map((item) => (
                <div key={item} className="rounded-[18px] bg-white/10 p-4">
                  <p className="text-xs text-stone-400">{item.split(" ")[0]}</p>
                  <p className="mt-1 text-sm text-emerald-100">{item.split(" ")[1]}</p>
                </div>
              ))}
            </div>
          </Glass>
        </div>

        <div className="flex flex-col gap-5">
          <Glass className="flex h-16 items-center justify-between px-4">
            <Waves size={18} />
            <Bell size={18} />
            <span className="rounded-full bg-amber-100 px-3 py-2 text-sm font-semibold text-stone-950">L</span>
            <span className="text-sm text-stone-200">晚上好，Alex</span>
          </Glass>

          <Glass className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">今日专注</h2>
              <span className="rounded-[14px] border border-white/10 px-3 py-1 text-xs text-stone-300">本周</span>
            </div>
            <p className="text-sm text-stone-400">专注时长</p>
            <p className="mt-2 text-3xl font-semibold">{formatDuration(focusSeconds)}</p>
            <div className="mt-6 flex h-24 items-end justify-between border-b border-white/10 pb-3">
              {[28, 44, 62, 78, 52, 68, 88].map((height, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 12 }}
                  animate={{ height }}
                  transition={{ delay: index * 0.06 }}
                  className="w-3 rounded-full bg-stone-200/55"
                />
              ))}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ["完成番茄", pomodoros.toString()],
                ["连续学习", "7 天"],
                ["专注度", "82%"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-stone-400">{label}</p>
                  <p className="mt-1 text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </Glass>

          <Glass className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">AI 学习搭子</h2>
              {chatOpen && (
                <button onClick={() => setChatOpen(false)}>
                  <X size={17} />
                </button>
              )}
            </div>
            <button onClick={() => setChatOpen(true)} className="flex w-full gap-4 text-left">
              <span className="grid size-14 shrink-0 place-items-center rounded-full border border-amber-100/40 bg-[#1b2540]">
                <Sparkles size={21} className="text-amber-100" />
              </span>
              <span>
                <span className="block font-semibold">晚上好，Alex</span>
                <span className="mt-2 block text-sm leading-6 text-stone-300">
                  今天想学习什么呢？我可以帮你制定计划、解释问题，陪你一起进步。
                </span>
              </span>
            </button>
            <AnimatePresence>
              {chatOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="mt-5 space-y-3">
                    {["帮我制定今天的学习计划", "解释一下这个概念", "帮我总结这篇论文"].map((item) => (
                      <button key={item} className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/10 px-4 py-3 text-left text-sm">
                        {item}
                        <ChevronRight size={16} />
                      </button>
                    ))}
                    <div className="flex items-center gap-2 rounded-[16px] border border-white/10 bg-white/10 px-3 py-2">
                      <input
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="有什么想问的吗..."
                        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-500"
                      />
                      <Send size={16} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Glass>
        </div>

        <Glass className="p-5 xl:col-span-3">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="min-w-[230px]">
                <p className="text-lg font-semibold">白噪音</p>
                <p className="mt-1 text-sm text-stone-300">
                  {activeSound.label}，{activeSound.tone}
                </p>
              </div>
              <button
                onClick={() => setSoundPlaying(!soundPlaying)}
                className="inline-flex h-11 w-fit items-center gap-2 rounded-[20px] bg-stone-100 px-5 text-sm text-stone-950"
              >
                {soundPlaying ? <Pause size={17} /> : <Play size={17} />}
                {soundPlaying ? "暂停" : "播放"}
              </button>
              <Volume2 size={18} className="text-stone-300" />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ambience.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSoundMode(item.id);
                      setSoundPlaying(true);
                    }}
                    className={cx(
                      "flex min-w-24 items-center justify-center gap-2 rounded-[18px] border px-4 py-3 text-sm transition",
                      soundMode === item.id
                        ? "border-amber-100/50 bg-amber-100/20 text-amber-50"
                        : "border-white/10 bg-white/10 text-stone-300",
                    )}
                  >
                    <Icon size={17} />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={() => setMemoryOpen(true)}
                className="col-span-2 rounded-[18px] border border-white/10 bg-white/10 px-4 py-3 text-sm"
              >
                生成每日专注回忆
              </button>
            </div>
          </div>
        </Glass>
      </div>

      <AnimatePresence>
        {memoryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-5 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-amber-100/20 bg-[#14110d] p-7 shadow-2xl"
            >
              <div className="absolute inset-0 bg-[url('/images/latelight-rainy-library.png')] bg-cover bg-center opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#14110d]/72 to-[#14110d]" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.28em] text-amber-100/80">Daily Memory</p>
                  <button onClick={() => setMemoryOpen(false)}>
                    <X size={17} />
                  </button>
                </div>
                <h2 className="mt-16 text-4xl font-semibold">每日专注回忆</h2>
                <p className="mt-3 text-stone-300">
                  {new Intl.DateTimeFormat("zh-CN", {
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  }).format(new Date())}
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-[20px] bg-white/10 p-4">
                    <p className="text-xs text-stone-400">今日专注</p>
                    <p className="mt-2 text-xl font-semibold">{formatDuration(focusSeconds)}</p>
                  </div>
                  <div className="rounded-[20px] bg-white/10 p-4">
                    <p className="text-xs text-stone-400">完成任务</p>
                    <p className="mt-2 text-xl font-semibold">{completedTasks} 个</p>
                  </div>
                </div>
                <div className="mt-3 rounded-[20px] bg-white/10 p-4">
                  <p className="text-xs text-stone-400">当前房间主题</p>
                  <p className="mt-2 text-xl font-semibold">Rainy Library 雨夜图书馆</p>
                </div>
                <p className="mt-7 text-lg leading-8 text-amber-50">{memoryLine}</p>
                <button
                  onClick={() => setMemoryOpen(false)}
                  className="mt-7 w-full rounded-[20px] bg-stone-100 px-5 py-3 text-sm font-medium text-stone-950"
                >
                  保存为图片
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
