"use client";

import { FormEvent, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import CyberBackground from "./cyber-background";

type ProjectId = "rcc" | "evergreen" | "multisite" | "hr";
type AppId = "projects" | "about" | "resume" | "contact" | "terminal" | ProjectId;
type WindowMode = "open" | "minimizing" | "minimized" | "closing";

type Project = {
  id: ProjectId;
  code: string;
  title: string;
  filename: string;
  group: "live" | "development" | "collaborative";
  status: string;
  summary: string;
  stack: string[];
  details: string[];
  demo?: {
    src: string;
    description: string;
    address: string;
    title: string;
  };
  sections?: Array<{
    label: string;
    paragraphs?: string[];
    bullets?: string[];
  }>;
};

type WindowState = {
  id: AppId;
  title: string;
  mode: WindowMode;
  maximized: boolean;
  fresh: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
};

const projects: Project[] = [
  {
    id: "rcc",
    code: "RCC",
    title: "Renewal Command Center",
    filename: "Renewal_Command_Center.app",
    group: "live",
    status: "LIVE",
    summary: "A real-time business intelligence dashboard giving Customer Success leadership a live view of the entire SaaS renewal pipeline without opening Salesforce.",
    stack: ["Python", "Flask", "Salesforce", "SOQL", "Chart.js", "Azure", "GPT-4.1"],
    details: [
      "Tracks T-30 through T-145 renewal milestones and flags accounts that are behind pace.",
      "Cross-references customer risk, revenue, and overdue AR exposure in one read-only view.",
      "Supports team, owner, quarter, and multi-currency filtering with CSV export and finance forecasting.",
      "Protected with SSO-based OAuth 2.0 and deployed automatically to Azure.",
    ],
    demo: {
      src: "/rcc-demo.html",
      description: "Explore the Renewal Command Center with synthetic portfolio data.",
      address: "secure-demo://renewal-command-center",
      title: "Interactive Renewal Command Center demonstration",
    },
    sections: [
      {
        label: "WHY I BUILT IT",
        paragraphs: [
          "I built the Renewal Command Center from scratch to give Advantive's Customer Success leadership a live view of the entire SaaS renewal pipeline — without ever opening Salesforce.",
          "Before the RCC existed, CS managers had no centralized way to monitor renewal health across their teams. Tracking pipeline momentum, identifying at-risk accounts, or understanding whether the team was on pace for the quarter meant manually pulling Salesforce reports or relying on weekly spreadsheet updates. The RCC replaced that process with an always-current view that refreshes automatically every 10 minutes.",
        ],
      },
      {
        label: "WHAT IT DOES",
        paragraphs: [
          "The dashboard connects to Salesforce through OAuth 2.0 and runs a series of SOQL queries to build a complete picture of the renewal pipeline. Every open renewal is classified as On Track, Follow Up, At Risk, Action Required, or Closed based on its close date and activity. Confidence and pace indicators show whether an account is trending toward a win or beginning to slip.",
          "The CS Leadership view combines a milestone distribution chart, KPI strip for total ARR, weighted pipeline, and close-rate pace, plus a filterable table of every renewal. Managers can sort by milestone, confidence, days to close, ARR, or owner; filter by direct reports and quarter; drill into a single account; and open the Salesforce opportunity directly from its row.",
          "The Pipeline window provides a live 90-day or quarter-filtered stage-by-stage ARR breakdown. Owner Rollup lets a manager select themselves and see their team's full book of business in one aggregated panel.",
        ],
      },
      {
        label: "TECHNICAL HIGHLIGHTS",
        bullets: [
          "OAuth 2.0 authentication through Advantive's SSO — no passwords stored and no Salesforce access required for end users.",
          "SOQL with absolute date ranges calculated per quarter so Q3, Q4, and future quarters always reflect the real calendar.",
          "Chart.js milestone visualizations with dark/light theme awareness; charts fully re-render on theme toggle rather than simply recoloring.",
          "localStorage persistence keeps the selected window, quarter, dark mode, and owner filter across page refreshes.",
          "Deployed to Azure App Service from a dedicated azure-deploy branch using GitHub Actions CI/CD.",
          "Read-only by design — the dashboard never writes a record back to Salesforce.",
        ],
      },
    ],
  },
  {
    id: "evergreen",
    code: "ERC",
    title: "Evergreen Renewal Center",
    filename: "Evergreen_Renewal_Center.app",
    group: "live",
    status: "LIVE",
    summary: "A real-time readiness dashboard showing which evergreen renewals can move forward.",
    stack: ["Python", "Flask", "SOQL", "Chart.js", "Azure"],
    details: [
      "Runs six validation rules across dates, ARR math, legal entities, approval state, and decreases.",
      "Groups ready and blocked opportunities by owner with direct quote links and searchable filters.",
      "Pairs a production dashboard with a Custom GPT for natural-language readiness questions.",
      "Uses SSO authentication, multi-currency Salesforce data, and automated deployment.",
    ],
    sections: [
      {
        label: "WHY I BUILT IT",
        paragraphs: [
          "The Evergreen Renewal Center is a real-time dashboard and AI agent I built to manage Advantive's evergreen renewal pipeline — the subset of contracts that auto-renew on a monthly basis. Unlike standard renewals, evergreen opportunities require a specific set of approval conditions to be met before a CSM can submit them, and there was no centralized way to know which opportunities were actually ready versus which ones were blocked and why.",
          "Before this tool, CSMs had to open each evergreen opportunity in Salesforce individually, manually verify the approval conditions, and track their own list of what was ready to submit. With books of business spanning dozens of monthly opportunities, this was slow, inconsistent, and easy to let slip.",
        ],
      },
      {
        label: "WHAT IT DOES",
        paragraphs: [
          "The dashboard pulls all open evergreen opportunities from Salesforce and runs each one through a six-condition validation engine. An opportunity is only classified as Ready to Submit when it clears every check:",
        ],
        bullets: [
          "Close date is not overdue",
          "ARR math is correct — the renewal ARR matches the expected delta from the current contract",
          "Subsidiary is populated",
          "Revenue entity is populated",
          "Approval status is not already pending or approved",
          "ARR is not decreasing unexpectedly",
        ],
      },
      {
        label: "READINESS WORKFLOW",
        paragraphs: [
          "Any opportunity that fails a check lands in the Needs Attention tab with specific issue badges — Math Fail, Missing Subsidiary, ARR Decrease — so the CSM knows exactly what to fix rather than having to investigate blind.",
          "The main dashboard gives CS leadership a full-portfolio view: KPI cards showing total open evergreen opportunities, Ready count and ARR, Needs Attention count, and overdue count. A bar chart breaks down Ready ARR by CSM, and an owner summary table lets a manager click any representative's row to filter the entire view down to their book of business.",
          "The Ready tab organizes actionable opportunities by owner with a pre-approval checklist and direct Salesforce links for one-click submission. A ChatGPT Custom GPT layers on top for CSMs who prefer querying in natural language — for example, ‘Which of my evergreen opportunities are ready this week?’ — and returns a structured checklist based on live data.",
        ],
      },
      {
        label: "TECHNICAL HIGHLIGHTS",
        bullets: [
          "OAuth 2.0 through Advantive SSO — the token is cached to Azure persistent storage so CSMs do not need to re-authenticate every session",
          "Multi-currency support — all ARR values are normalized to USD regardless of the opportunity's native currency",
          "Scoped SOQL — only pulls opportunities where auto-renew is approved, quote term is one month, and billing frequency is monthly or monthly-in-advance; no noise from the broader pipeline",
          "Deployed on Azure App Service with gunicorn and GitHub Actions CI/CD via a dedicated evergreen-azure-deploy branch",
          "Read-only — never writes a single record to Salesforce",
        ],
      },
    ],
  },
  {
    id: "multisite",
    code: "MSP",
    title: "Multi-Site Pre-Flight Agent",
    filename: "Multi_Site_Pre_Flight.app",
    group: "live",
    status: "LIVE",
    summary: "A validation dashboard that checks every child opportunity before a consolidated multi-site renewal is generated.",
    stack: ["Python", "Flask", "Salesforce", "Custom GPT", "OAuth + PKCE"],
    details: [
      "Checks close dates, accounts, addresses, contact roles, payment terms, and ARR reconciliation.",
      "Shows the exact fields and child opportunities responsible for every warning or failure.",
      "Classifies accounts as Ready, Close to Ready, or Needs Attention and exports a PDF report.",
      "Uses the same rules across a Custom GPT and Flask interface with read-only authentication.",
    ],
    demo: {
      src: "/multisite-demo.html",
      description: "Run the Multi-Site Pre-Flight workflow with synthetic account and opportunity data.",
      address: "secure-demo://multi-site-pre-flight",
      title: "Interactive Multi-Site Pre-Flight demonstration",
    },
    sections: [
      {
        label: "WHY I BUILT IT",
        paragraphs: [
          "I built the Multi-Site Pre-Flight tool to solve a high-friction problem in Advantive's renewal process. When a customer has multiple sites on separate Salesforce opportunities, generating one consolidated renewal requires every child opportunity to be in a specific, consistent state.",
          "Before this tool, CSMs could begin generating a multi-site renewal only to discover that one site had the wrong billing address, the close dates did not align, or a Bill-To account was missing. The dashboard surfaces those issues before the CSM starts the generation process.",
        ],
      },
      {
        label: "WHAT IT DOES",
        paragraphs: [
          "The tool connects to Salesforce, identifies open renewal opportunities belonging to multi-site parent accounts, and evaluates every child opportunity together instead of forcing the CSM to open each record individually.",
        ],
        bullets: [
          "C1 — Date Alignment: all child opportunities must share the same close date.",
          "C2 — Bill-To Account: all opportunities must reference the same billing entity.",
          "C3 — Billing Address: every opportunity must share a populated billing address.",
          "C4 — Shipping Address: each site must have its own shipping address populated.",
          "C5 — Contact Role: each opportunity should have an IT Technical Buyer role; this is warn-only and does not block generation.",
          "C6 — Payment Terms: all primary quotes must have consistent payment terms.",
        ],
      },
      {
        label: "READINESS CLASSIFICATION",
        paragraphs: [
          "Each parent account is classified as Ready, Close to Ready, Needs Attention, or Completed. CSMs can immediately see which accounts are actionable today and which need cleanup first. Expanding an account reveals the child opportunities, every check result, and the exact reason for each warning or failure.",
        ],
      },
      {
        label: "TECHNICAL HIGHLIGHTS",
        bullets: [
          "OAuth 2.0 + PKCE Salesforce authentication through the browser with no backend credential storage.",
          "Six-check validation engine with tiered severity: hard failures block readiness, C5 is warn-only, and C6 can demote an account without blocking Close to Ready.",
          "Clickable heatmap shows check-failure frequency across the portfolio and filters the table to a selected issue type.",
          "Collapsible sections and expandable rows let CSMs focus on the readiness tier that matters without scrolling through noise.",
          "Dark/light theme system built with layered CSS and toggled without a page reload.",
        ],
      },
    ],
  },
  {
    id: "hr",
    code: "HRC",
    title: "HR Calibration Summary Agent",
    filename: "HR_Calibration_Agent.app",
    group: "collaborative",
    status: "COLLABORATIVE",
    summary: "A governed HR workflow that converts calibration transcripts into review-ready drafts.",
    stack: ["Custom GPT", "SharePoint", "Python", "DOCX", "Human Review"],
    details: [
      "Matches transcript mentions to an approved census and creates one structured summary per employee.",
      "Captures positive and cautionary themes, score discussions, outcomes, and unresolved items.",
      "Maintains scoped history and routes ambiguous cases into an HR review queue.",
      "Never assigns ratings, invents decisions, or shares employee data outside the approved workflow.",
    ],
  },
];

const appTitles: Record<AppId, string> = {
  projects: "Projects",
  about: "About_Me.txt",
  resume: "Resume.txt",
  contact: "Contact.exe",
  terminal: "Terminal",
  rcc: "Renewal Command Center",
  evergreen: "Evergreen Renewal Center",
  multisite: "Multi-Site Pre-Flight Agent",
  hr: "HR Calibration Summary Agent",
};

const defaultRects: Record<AppId, { x: number; y: number; width: number; height: number }> = {
  projects: { x: 190, y: 84, width: 820, height: 560 },
  about: { x: 260, y: 118, width: 690, height: 500 },
  resume: { x: 120, y: 42, width: 1120, height: 760 },
  contact: { x: 390, y: 120, width: 500, height: 455 },
  terminal: { x: 225, y: 110, width: 760, height: 470 },
  rcc: { x: 120, y: 42, width: 1180, height: 760 },
  evergreen: { x: 120, y: 42, width: 1180, height: 760 },
  multisite: { x: 120, y: 42, width: 1180, height: 760 },
  hr: { x: 275, y: 115, width: 730, height: 530 },
};

const bootLines = [
  "JONRAEOS BIOS v1.0.7 // SECURE BOOT ENABLED",
  "CPU integrity check................... PASS",
  "Memory scan..................... 32768 MB OK",
  "Loading hardened kernel modules....... OK",
  "Mounting encrypted portfolio volume... OK",
  "Firewall policy..................... ACTIVE",
  "VPN tunnel....................... CONNECTED",
  "[AUTHENTICATED] Welcome back, jonrae.",
];

function AppGlyph({ type, compact = false }: { type: AppId | "folder"; compact?: boolean }) {
  const glyphType = projects.some((project) => project.id === type) ? "project" : type;
  return <span className={`app-glyph glyph-${glyphType}${compact ? " is-compact" : ""}`} aria-hidden="true"><i /></span>;
}

function WindowChrome({
  windowState,
  onFocus,
  onMinimize,
  onMaximize,
  onClose,
  onDragStart,
  onResizeStart,
  children,
}: {
  windowState: WindowState;
  onFocus: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onDragStart: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onResizeStart: (event: ReactPointerEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}) {
  const style = windowState.maximized
    ? { zIndex: windowState.z }
    : { left: windowState.x, top: windowState.y, width: windowState.width, height: windowState.height, zIndex: windowState.z };

  return (
    <section
      className={`os-window mode-${windowState.mode}${windowState.maximized ? " is-maximized" : ""}${windowState.fresh ? " is-fresh" : ""}`}
      style={style}
      onPointerDown={onFocus}
      aria-label={`${windowState.title} window`}
    >
      <div className="window-titlebar" onPointerDown={onDragStart} onDoubleClick={onMaximize}>
        <div className="window-identity"><AppGlyph type={windowState.id} compact /><span>{windowState.title}</span></div>
        <div className="window-controls" onPointerDown={(event) => event.stopPropagation()}>
          <button type="button" onClick={onMinimize} aria-label={`Minimize ${windowState.title}`}><span>−</span></button>
          <button type="button" onClick={onMaximize} aria-label={`${windowState.maximized ? "Restore" : "Maximize"} ${windowState.title}`}><span>□</span></button>
          <button className="close-control" type="button" onClick={onClose} aria-label={`Close ${windowState.title}`}><span>×</span></button>
        </div>
      </div>
      <div className="window-content">{children}</div>
      {!windowState.maximized ? <div className="resize-handle" onPointerDown={onResizeStart} aria-hidden="true" /> : null}
    </section>
  );
}

export default function Home() {
  const [locked, setLocked] = useState(true);
  const [lockExit, setLockExit] = useState(false);
  const [booting, setBooting] = useState(true);
  const [bootExit, setBootExit] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<AppId | null>(null);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [startOpen, setStartOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [clock, setClock] = useState(new Date());
  const [explorerFolder, setExplorerFolder] = useState<Project["group"]>("live");
  const [selectedFile, setSelectedFile] = useState<ProjectId | null>(null);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "JonraeOS Secure Terminal [Version 1.0.7]",
    "[AUTHENTICATED] Identity verified.",
    "Welcome back, jonrae.",
    "Security context: PORTFOLIO_READ_ONLY // encrypted session",
    "Type 'help' to see available commands.",
  ]);
  const [systemToast, setSystemToast] = useState<string | null>(null);
  const zRef = useRef(20);
  const dragRef = useRef<{ id: AppId; startX: number; startY: number; originX: number; originY: number } | null>(null);
  const resizeRef = useRef<{ id: AppId; startX: number; startY: number; width: number; height: number } | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const unlock = () => {
    setLockExit(true);
    setTimeout(() => { setLocked(false); setLockExit(false); }, 600);
  };

  useEffect(() => {
    if (!locked) return;
    const handleKey = () => unlock();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [locked]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setBooting(false);
      return;
    }
    const exitTimer = window.setTimeout(() => setBootExit(true), 2550);
    const finishTimer = window.setTimeout(() => setBooting(false), 2950);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [terminalLines]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (dragRef.current) {
        const drag = dragRef.current;
        const maxX = Math.max(0, window.innerWidth - 260);
        const maxY = Math.max(0, window.innerHeight - 115);
        const nextX = Math.min(maxX, Math.max(-80, drag.originX + event.clientX - drag.startX));
        const nextY = Math.min(maxY, Math.max(0, drag.originY + event.clientY - drag.startY));
        setWindows((current) => current.map((item) => item.id === drag.id ? { ...item, x: nextX, y: nextY } : item));
      }
      if (resizeRef.current) {
        const resize = resizeRef.current;
        const nextWidth = Math.min(window.innerWidth - 24, Math.max(360, resize.width + event.clientX - resize.startX));
        const nextHeight = Math.min(window.innerHeight - 80, Math.max(260, resize.height + event.clientY - resize.startY));
        setWindows((current) => current.map((item) => item.id === resize.id ? { ...item, width: nextWidth, height: nextHeight } : item));
      }
    };
    const stop = () => {
      dragRef.current = null;
      resizeRef.current = null;
      document.body.classList.remove("is-dragging");
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  const showToast = (message: string) => {
    setSystemToast(message);
    window.setTimeout(() => setSystemToast(null), 1800);
  };

  const focusWindow = (id: AppId) => {
    zRef.current += 1;
    setWindows((current) => current.map((item) => item.id === id ? { ...item, z: zRef.current } : item));
  };

  const openApp = (id: AppId) => {
    setStartOpen(false);
    setContextMenu(null);
    zRef.current += 1;
    setWindows((current) => {
      const existing = current.find((item) => item.id === id);
      if (existing) return current.map((item) => item.id === id ? { ...item, mode: "open", z: zRef.current, fresh: false } : item);
      const base = defaultRects[id];
      const cascade = current.length % 4;
      const centerLargeWindow = (id === "resume" || id === "rcc" || id === "evergreen" || id === "multisite") && window.innerWidth >= 700;
      const width = centerLargeWindow ? Math.min(base.width, window.innerWidth - 64) : Math.min(base.width, window.innerWidth - 28);
      const height = centerLargeWindow ? Math.min(base.height, window.innerHeight - 112) : Math.min(base.height, window.innerHeight - 92);
      return [...current, {
        id,
        title: appTitles[id],
        mode: "open",
        maximized: window.innerWidth < 700,
        fresh: true,
        x: centerLargeWindow ? Math.round((window.innerWidth - width) / 2) : base.x + cascade * 22,
        y: centerLargeWindow ? Math.max(18, Math.round((window.innerHeight - 68 - height) / 2)) : base.y + cascade * 18,
        width,
        height,
        z: zRef.current,
      }];
    });
    window.setTimeout(() => setWindows((current) => current.map((item) => item.id === id ? { ...item, fresh: false } : item)), 240);
  };

  const minimizeWindow = (id: AppId) => {
    setWindows((current) => current.map((item) => item.id === id ? { ...item, mode: "minimizing" } : item));
    window.setTimeout(() => setWindows((current) => current.map((item) => item.id === id ? { ...item, mode: "minimized" } : item)), 170);
  };

  const closeWindow = (id: AppId) => {
    setWindows((current) => current.map((item) => item.id === id ? { ...item, mode: "closing" } : item));
    window.setTimeout(() => setWindows((current) => current.filter((item) => item.id !== id)), 150);
  };

  const toggleMaximize = (id: AppId) => {
    setWindows((current) => current.map((item) => item.id === id ? { ...item, maximized: !item.maximized, z: ++zRef.current } : item));
  };

  const taskbarToggle = (id: AppId) => {
    const target = windows.find((item) => item.id === id);
    if (!target) return;
    if (target.mode === "minimized") openApp(id);
    else if (target.z === Math.max(...windows.filter((item) => item.mode === "open").map((item) => item.z), 0)) minimizeWindow(id);
    else focusWindow(id);
  };

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>, item: WindowState) => {
    if (item.maximized || (event.target as HTMLElement).closest("button")) return;
    event.preventDefault();
    focusWindow(item.id);
    dragRef.current = { id: item.id, startX: event.clientX, startY: event.clientY, originX: item.x, originY: item.y };
    document.body.classList.add("is-dragging");
  };

  const beginResize = (event: ReactPointerEvent<HTMLDivElement>, item: WindowState) => {
    event.preventDefault();
    event.stopPropagation();
    focusWindow(item.id);
    resizeRef.current = { id: item.id, startX: event.clientX, startY: event.clientY, width: item.width, height: item.height };
    document.body.classList.add("is-dragging");
  };

  const runCommand = (event: FormEvent) => {
    event.preventDefault();
    const raw = terminalInput.trim();
    const command = raw.toLowerCase().replace(/\s+/g, " ");
    const next = [`jonrae@secure-workspace:~$ ${raw}`];
    if (!command) {
      setTerminalLines((current) => [...current, ...next]);
    } else if (command === "help") {
      next.push("Available: help · ls projects · open [resume|rcc|evergreen|multisite|hr] · about · contact · clear · whoami");
    } else if (command === "ls projects") {
      next.push("rcc/  evergreen/  multisite/  hr/");
    } else if (command === "about") {
      next.push("Cybersecurity student at the University of South Florida · GPA 3.93 · Class of 2028.");
    } else if (command === "contact") {
      next.push("Email: jonraesmall@gmail.com");
      next.push("LinkedIn: linkedin.com/in/jonraesmall");
      next.push("GitHub: github.com/Jrae7");
    } else if (command === "whoami") {
      next.push("Jonrae Small — Cybersecurity Student & Systems Builder");
    } else if (command === "clear") {
      setTerminalLines([]);
      setTerminalInput("");
      return;
    } else if (command.startsWith("open ")) {
      const target = command.slice(5) as AppId;
      if (target === "resume") {
        next.push("Opening Resume.txt...");
        window.setTimeout(() => openApp("resume"), 80);
      } else
      if (["rcc", "evergreen", "multisite", "hr"].includes(target)) {
        next.push(`Opening ${appTitles[target]}...`);
        window.setTimeout(() => openApp(target), 80);
      } else {
        next.push(`file not found: ${command.slice(5)}`);
      }
    } else {
      next.push(`command not found: ${raw}`);
    }
    setTerminalLines((current) => [...current, ...next]);
    setTerminalInput("");
  };

  const renderWindowContent = (id: AppId) => {
    if (id === "projects") {
      const folderProjects = projects.filter((project) => project.group === explorerFolder);
      return (
        <div className="explorer-layout">
          <aside className="explorer-sidebar">
            <p className="sidebar-label">Favorites</p>
            {([
              ["live", "Live Deployments"],
              ["development", "In Development"],
              ["collaborative", "Collaborative"],
            ] as const).map(([folder, label]) => (
              <button key={folder} type="button" className={explorerFolder === folder ? "is-active" : ""} onClick={() => { setExplorerFolder(folder); setSelectedFile(null); }}>
                <AppGlyph type="folder" compact /><span>{label}</span><i>{projects.filter((project) => project.group === folder).length}</i>
              </button>
            ))}
            <div className="sidebar-system"><span>◈</span><p><strong>Portfolio Drive</strong><small>4 items · Secure</small></p></div>
          </aside>
          <main className="explorer-main">
            <div className="explorer-toolbar"><button type="button" aria-label="Back">‹</button><button type="button" aria-label="Forward">›</button><div><span>JonraeOS</span><i>/</i><strong>{explorerFolder === "live" ? "Live Deployments" : explorerFolder === "development" ? "In Development" : "Collaborative"}</strong></div></div>
            <div className="files-meta"><span>{folderProjects.length} {folderProjects.length === 1 ? "item" : "items"}</span><span>Double-click a file to open</span></div>
            <div className="file-grid">
              {folderProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={`project-file${selectedFile === project.id ? " is-selected" : ""}`}
                  onClick={() => setSelectedFile(project.id)}
                  onDoubleClick={() => openApp(project.id)}
                  onKeyDown={(event) => { if (event.key === "Enter") openApp(project.id); }}
                >
                  <span className="file-icon"><i>{project.code}</i></span>
                  <strong>{project.filename}</strong>
                  <small>{project.status}</small>
                </button>
              ))}
            </div>
          </main>
        </div>
      );
    }

    if (id === "about") {
      const lines = [
        "ABOUT_ME.TXT",
        "",
        "Jonrae Small",
        "Cybersecurity Student · University of South Florida",
        "",
        "I am a cybersecurity student who learns by building, competing,",
        "and solving real technical problems. I enjoy programming, network",
        "security, ethical hacking, and turning ideas into useful tools.",
        "",
        "Degree: B.S. in Cybersecurity — Expected May 2028",
        "Academic standing: 3.93 GPA · Dean's List (2 semesters)",
        "Location: Tampa, Florida",
        "Campus life: USF CyberHerd · Whitehatters · NSBE",
        "Hands-on learning: CTFs, hackathons, security labs, and projects",
        "Campus role: Facilities Supervisor · USF Campus Recreation",
        "Current focus: Growing as a security-minded engineer",
      ];
      return <div className="text-editor"><div className="editor-tab"><span>About_Me.txt</span><i>×</i></div><div className="editor-body">{lines.map((line, index) => <div className="editor-line" key={`${index}-${line}`}><span>{index + 1}</span><p>{line || "\u00a0"}</p></div>)}</div><footer>Ln 15, Col 57 <span>UTF-8</span><span>Plain Text</span></footer></div>;
    }

    if (id === "resume") {
      return (
        <div className="text-editor resume-editor">
          <div className="editor-tab"><span>Resume.txt</span><i>×</i></div>
          <div className="resume-document">
            <header><p>JONRAE SMALL</p><span>Cybersecurity Student · Tampa, Florida</span></header>
            <div className="resume-contact-line"><a href="mailto:jonraesmall@gmail.com">jonraesmall@gmail.com</a><span>·</span><a href="https://www.linkedin.com/in/jonraesmall" target="_blank" rel="noreferrer">linkedin.com/in/jonraesmall</a></div>
            <section>
              <h3>EDUCATION</h3>
              <div className="resume-heading"><strong>Bachelor of Science in Cybersecurity</strong><span>May 2028</span></div>
              <p>University of South Florida | Tampa, FL | GPA: 3.93 | Dean&apos;s List (2 Semesters)</p>
            </section>
            <section>
              <h3>SKILLS</h3>
              <p><strong>Programming Languages:</strong> Python, C, JavaScript, HTML, CSS</p>
              <p><strong>Cloud &amp; DevOps:</strong> Microsoft Azure App Service, Git, GitHub, CI/CD via GitHub Actions</p>
              <p><strong>Cybersecurity &amp; Networking:</strong> Wireshark, Nmap, John the Ripper, Burp Suite, Shodan, SSH &amp; Key-Based Authentication</p>
              <p><strong>APIs &amp; Authentication:</strong> OAuth 2.0 + PKCE, Salesforce REST API, SOQL, REST API Integration, Data Parsing</p>
              <p><strong>Frameworks &amp; Libraries:</strong> Flask, Tailwind CSS</p>
              <p><strong>AI/ML:</strong> LLM Integration, Intent Parsing</p>
            </section>
            <section>
              <h3>WORK EXPERIENCE</h3>
              <div className="resume-entry">
                <div className="resume-heading"><strong>AI &amp; Business Systems Intern — Advantive LLC</strong><span>Jun 2026 – Present</span></div>
                <ul>
                  <li>Designed and deployed 3 full-stack production dashboards (Renewal Command Center, Multi-Site Pre-Flight Agent, Evergreen Renewal Center) used daily by CS, RevOps, and Finance teams, saving stakeholders hours of manual reporting per week.</li>
                  <li>Implemented OAuth 2.0 with PKCE for secure Salesforce API authentication across all tools, navigating enterprise SSO constraints and eliminating credential-based access.</li>
                  <li>Built Flask REST API backends, wrote complex SOQL queries against live Salesforce data, and deployed applications to Microsoft Azure App Service with automated CI/CD via GitHub Actions.</li>
                  <li>Applied access control best practices by designing all integrations as read-only, ensuring data integrity and minimizing security exposure across production systems.</li>
                </ul>
              </div>
              <div className="resume-entry">
                <div className="resume-heading"><strong>Information Network Specialist Assistant — TransJamaica Highway</strong><span>May 2023 – Jul 2023</span></div>
                <ul><li>Supported network infrastructure monitoring, troubleshooting connectivity issues, and hardware configuration across multiple toll booth locations.</li></ul>
              </div>
              <div className="resume-entry">
                <div className="resume-heading"><strong>Facilities Supervisor — University of South Florida, Campus Recreation Center</strong><span>Sep 2025 – Present</span></div>
                <ul><li>Supervises facilities and fitness staff, ensuring efficient daily operations of the recreation center.</li></ul>
              </div>
            </section>
            <section>
              <h3>PROJECTS</h3>
              <div className="resume-entry"><div className="resume-heading"><strong>Canvas Copilot — Hack USF (24-Hour Hackathon)</strong></div><ul><li>Built an AI academic assistant integrating Google Gemini for natural language querying of Canvas LMS data and Azure Custom Vision for real-time study space detection.</li><li>Applied full-stack development and multi-API integration (Canvas, Azure, Google) with a Tailwind CSS UI under hackathon time constraints.</li></ul></div>
              <div className="resume-entry"><div className="resume-heading"><strong>Code Path — Mitigating Ransomware Risk in Business</strong></div><ul><li>Developed a 4-layer cybersecurity framework to prevent, detect, and recover from ransomware attacks, incorporating EDR, Air-Gapped Backup (3-2-1-1 Rule), and phishing mitigation strategies.</li></ul></div>
              <div className="resume-entry"><div className="resume-heading"><strong>Code Path — Password Crack-a-thon</strong></div><ul><li>Cracked 500+ of 1,000 leaked password hashes using John the Ripper with wordlists, custom rules, and mask attacks; documented security takeaways including entropy, salting, and slow hashing algorithms.</li></ul></div>
            </section>
            <section>
              <h3>CLUBS &amp; ORGANIZATIONS</h3>
              <div className="resume-entry"><div className="resume-heading"><strong>USF CyberHerd — Competitive Cybersecurity Team</strong><span>Fall 2025 – Present</span></div><ul><li>Selected member of USF&apos;s elite competitive cybersecurity team, to compete in red/blue team exercises, CTF challenges, and national-level cybersecurity competitions against top-tier universities.</li></ul></div>
              <div className="resume-entry"><div className="resume-heading"><strong>Whitehatters Computer Security Club — Member</strong><span>Sep 2025 – Present</span></div><ul><li>Engage in weekly CTF practices and hands-on labs (web, crypto, forensics).</li></ul></div>
              <div className="resume-entry"><div className="resume-heading"><strong>National Society of Black Engineers (NSBE)</strong><span>Nov 2024 – Present</span></div><ul><li>Attend chapter meetings and professional-development sessions; prepare for conferences and career fairs.</li></ul></div>
            </section>
          </div>
          <footer>Resume.txt <span>UTF-8</span><span>Plain Text</span></footer>
        </div>
      );
    }

    if (id === "contact") {
      return <div className="contact-app"><div className="contact-orb"><span>@</span></div><p className="utility-label">SECURE CONTACT UTILITY</p><h2>Let&apos;s connect.</h2><div className="contact-links"><a href="mailto:jonraesmall@gmail.com"><span>EMAIL</span><strong>jonraesmall@gmail.com</strong><i>↗</i></a><a href="https://www.linkedin.com/in/jonraesmall" target="_blank" rel="noreferrer"><span>LINKEDIN</span><strong>/in/jonraesmall</strong><i>↗</i></a><a href="https://github.com/Jrae7" target="_blank" rel="noreferrer"><span>GITHUB</span><strong>/Jrae7</strong><i>↗</i></a></div><button type="button" onClick={() => { window.location.href = "mailto:jonraesmall@gmail.com"; }}>Send Message <span>↗</span></button></div>;
    }

    if (id === "terminal") {
      return <div className="terminal-app" onClick={() => document.getElementById("terminal-command")?.focus()}><div className="terminal-history">{terminalLines.map((line, index) => <p key={`${index}-${line}`} className={`${line.startsWith("jonrae@") ? "command-line" : ""}${line.startsWith("[AUTHENTICATED]") ? " auth-line" : ""}`}>{line}</p>)}<div ref={terminalEndRef} /></div><form onSubmit={runCommand}><label htmlFor="terminal-command">jonrae@secure-workspace:<span>~</span>$</label><input id="terminal-command" autoComplete="off" spellCheck={false} value={terminalInput} onChange={(event) => setTerminalInput(event.target.value)} aria-label="Terminal command" /></form></div>;
    }

    const project = projects.find((item) => item.id === id);
    if (!project) return null;
    return (
      <article className="project-detail">
        <header><div className="project-app-icon">{project.code}</div><div><p>PROJECT FILE // {project.filename}</p><h2>{project.title}</h2><span className={`status-badge status-${project.group}`}>{project.status}</span></div></header>
        {project.demo ? (
          <section className="project-demo">
            <div className="demo-section-heading"><div><p className="detail-label">INTERACTIVE DEMO</p><span>{project.demo.description}</span></div><a href={project.demo.src} target="_blank" rel="noreferrer">OPEN FULL DEMO ↗</a></div>
            <div className="demo-frame-shell">
              <div className="demo-browser-bar"><span><i /><i /><i /></span><p>{project.demo.address}</p><strong>DEMO MODE</strong></div>
              <iframe src={project.demo.src} title={project.demo.title} loading="lazy" sandbox="allow-scripts allow-same-origin" />
            </div>
          </section>
        ) : null}
        <section><p className="detail-label">OVERVIEW</p><p className="project-summary">{project.summary}</p></section>
        <section><p className="detail-label">TECHNOLOGY STACK</p><div className="project-tags">{project.stack.map((item) => <span key={item}>{item}</span>)}</div></section>
        {project.sections ? project.sections.map((section) => (
          <section className="project-narrative" key={section.label}>
            <p className="detail-label">{section.label}</p>
            {section.paragraphs?.map((paragraph) => <p className="narrative-copy" key={paragraph}>{paragraph}</p>)}
            {section.bullets ? <ul>{section.bullets.map((detail) => <li key={detail}>{detail}</li>)}</ul> : null}
          </section>
        )) : <section><p className="detail-label">KEY CAPABILITIES</p><ul>{project.details.map((detail) => <li key={detail}>{detail}</li>)}</ul></section>}
        <footer><span>Last modified: 2026</span><span>Read-only portfolio file</span></footer>
      </article>
    );
  };

  const desktopApps: { id: AppId; label: string }[] = [
    { id: "projects", label: "Projects" },
    { id: "about", label: "About_Me.txt" },
    { id: "resume", label: "Resume.txt" },
    { id: "contact", label: "Contact.exe" },
    { id: "terminal", label: "Terminal" },
  ];

  if (locked) {
    return (
      <main className={`lock-screen${lockExit ? " is-exiting" : ""}`} onClick={unlock}>
        <div className="lock-bg"><CyberBackground /></div>
        <div className="lock-content">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="lock-avatar"><img src="/signature.png" alt="Jonrae Small signature" /></div>
          <h1 className="lock-name">Jonrae Small</h1>
          <p className="lock-role">Cybersecurity Student</p>
          <p className="lock-portfolio">Portfolio</p>
          <div className="lock-prompt">
            <span className="lock-prompt-dot" /><span className="lock-prompt-dot" /><span className="lock-prompt-dot" />
            <p>PRESS ANY KEY TO UNLOCK</p>
          </div>
        </div>
        <div className="lock-version">JonraeOS v1.0 // SECURE WORKSPACE</div>
      </main>
    );
  }

  if (booting) {
    return (
      <main className={`boot-screen${bootExit ? " is-exiting" : ""}`}>
        <div className="boot-mark"><span>JS</span><i /></div>
        <div className="boot-console">{bootLines.map((line, index) => <p key={line} style={{ "--boot-order": index } as React.CSSProperties}>{line}</p>)}</div>
        <div className="boot-progress"><i /><span>BOOTING SECURE WORKSPACE</span></div>
      </main>
    );
  }

  return (
    <main
      className="desktop-shell"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          setSelectedIcon(null);
          setStartOpen(false);
          setContextMenu(null);
        }
      }}
      onContextMenu={(event) => {
        if ((event.target as HTMLElement).closest(".os-window, .taskbar, .desktop-icon")) return;
        event.preventDefault();
        setStartOpen(false);
        setContextMenu({ x: Math.min(event.clientX, window.innerWidth - 220), y: Math.min(event.clientY, window.innerHeight - 190) });
      }}
    >
      <CyberBackground />
      <div className="desktop-brand" aria-hidden="true"><span>JONRAE</span><strong>OS</strong><p>SECURE WORKSPACE // v1.0</p></div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/signature.png" alt="" className="desktop-signature" aria-hidden="true" />

      <section className="desktop-icons" aria-label="Desktop applications">
        {desktopApps.map((app) => (
          <button
            key={app.id}
            type="button"
            className={`desktop-icon${selectedIcon === app.id ? " is-selected" : ""}`}
            onClick={() => setSelectedIcon(app.id)}
            onDoubleClick={() => openApp(app.id)}
            onKeyDown={(event) => { if (event.key === "Enter") openApp(app.id); }}
          >
            <AppGlyph type={app.id} /><span>{app.label}</span>
          </button>
        ))}
      </section>

      <section className="window-layer" aria-label="Open applications">
        {windows.filter((item) => item.mode !== "minimized").map((item) => (
          <WindowChrome
            key={item.id}
            windowState={item}
            onFocus={() => focusWindow(item.id)}
            onMinimize={() => minimizeWindow(item.id)}
            onMaximize={() => toggleMaximize(item.id)}
            onClose={() => closeWindow(item.id)}
            onDragStart={(event) => beginDrag(event, item)}
            onResizeStart={(event) => beginResize(event, item)}
          >
            {renderWindowContent(item.id)}
          </WindowChrome>
        ))}
      </section>

      {startOpen ? (
        <section className="start-menu" aria-label="JonraeOS applications">
                    <header><div className="start-avatar">JS</div><div><strong>Jonrae Small</strong><span>Cybersecurity Student</span></div></header>
          <p className="start-label">APPLICATIONS</p>
          <div className="start-apps">{desktopApps.map((app) => <button key={app.id} type="button" onClick={() => openApp(app.id)}><AppGlyph type={app.id} /><span>{app.label}</span></button>)}</div>
          <footer><span><i /> System secure</span><button type="button" onClick={() => { setStartOpen(false); showToast("JonraeOS session remains active"); }}>⌁</button></footer>
        </section>
      ) : null}

      {contextMenu ? (
        <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} role="menu">
          <button type="button" role="menuitem" onClick={() => { setContextMenu(null); setSelectedIcon(null); showToast("Desktop refreshed"); }}><span>↻</span>Refresh Desktop</button>
          <button type="button" role="menuitem" onClick={() => openApp("terminal")}><span>›_</span>Open Terminal</button>
          <i />
          <button type="button" role="menuitem" onClick={() => openApp("about")}><span>ⓘ</span>About JonraeOS</button>
        </div>
      ) : null}

      {systemToast ? <div className="system-toast"><i />{systemToast}</div> : null}

      <nav className="taskbar" aria-label="JonraeOS taskbar">
        <button className={`start-button${startOpen ? " is-active" : ""}`} type="button" onClick={() => { setStartOpen((current) => !current); setContextMenu(null); }} aria-label="Open start menu">JS</button>
        <div className="taskbar-divider" />
        <div className="taskbar-apps">
          {windows.map((item) => (
            <button key={item.id} type="button" className={`${item.mode === "minimized" ? "is-minimized" : ""}${item.z === Math.max(...windows.map((entry) => entry.z), 0) && item.mode === "open" ? " is-active" : ""}`} onClick={() => taskbarToggle(item.id)} title={item.title}>
              <AppGlyph type={item.id} compact /><span>{item.title}</span><i />
            </button>
          ))}
        </div>
        <div className="system-tray" aria-label="System status">
          <div className="security-statuses" aria-label="Security tools active">
            <span><i />FIREWALL: ACTIVE</span>
            <span><i />VPN: CONNECTED</span>
            <button type="button" className="tray-lock" onClick={() => setLocked(true)} title="Lock screen"><i />LOCK SCREEN</button>
          </div>
          <span className="tray-wifi" aria-label="Wi-Fi connected"><i /><i /><i /></span>
          <span className="tray-battery" aria-label="Battery charged"><i /></span>
          <time dateTime={clock.toISOString()}><strong>{clock.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</strong><small>{clock.toLocaleDateString([], { month: "numeric", day: "numeric", year: "numeric" })}</small></time>
        </div>
      </nav>
    </main>
  );
}
