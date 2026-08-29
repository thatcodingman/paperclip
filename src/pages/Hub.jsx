import { useState, useEffect, useMemo } from "react";
import { Receipt, Clock, FileText, PlaneTakeoff, Package, ArrowRight, Search } from "lucide-react";
import { fontMono, PaperclipFonts, PaperclipStyles, PaperclipBackdrop, ToolBackgroundArt, StampWrapper, PaperclipStructuredData } from "../components/PaperclipChrome";

const CATEGORIES = [
  { key: "all", label: "ALL" },
  { key: "business", label: "BUSINESS" },
  { key: "freelance", label: "FREELANCE" },
  { key: "retail", label: "RETAIL" },
  { key: "service", label: "SERVICE" },
  { key: "hr", label: "HR" },
];

const ITEMS = [
  { key: "receipt", icon: Receipt, title: "Receipt Generator",
    desc: "Retail, service, rental, or freelance invoice — live calculating, printable, saves your business profile.",
    benefit: "Turn any sale into a professional receipt in seconds.",
    href: "/receipt", categories: ["retail", "service", "freelance"], popular: true, status: null,
    preview: { lines: [60, 90, 40, 75], footer: true, accent: "#863bff" } },
  { key: "timesheet", icon: Clock, title: "Timesheet Generator",
    desc: "Weekly hours by day, auto-totaled, optional hourly pay calculation — printable and profile-aware.",
    benefit: "Log a week's hours and get a clean, payable timesheet.",
    href: "/timesheet", categories: ["hr", "freelance"], popular: false, status: null,
    preview: { grid: true, accent: "#47bfff" } },
  { key: "contract", icon: FileText, title: "Contract Generator",
    desc: "Toggle only the clauses you need — confidentiality, termination, payment terms, and more — and it assembles live.",
    benefit: "Assemble a solid agreement without a lawyer on retainer.",
    href: "/contract", categories: ["business", "freelance"], popular: true, status: null,
    preview: { lines: [95, 88, 92, 60, 80], footer: false, accent: "#F0C93A" } },
  { key: "expense", icon: PlaneTakeoff, title: "Expense Report",
    desc: "Itemized expenses auto-grouped by category with running subtotals, plus a grand total.",
    benefit: "Turn a pile of receipts into one report to submit.",
    href: "/expense", categories: ["business", "freelance"], popular: false, status: null,
    preview: { groups: true, accent: "#4ADE80" } },
  { key: "packing", icon: Package, title: "Packing Slip",
    desc: "What's in the box, no pricing — ship-to address, order reference, and item list.",
    benefit: "Print a clean packing slip before every shipment.",
    href: "/packing", categories: ["retail", "service"], popular: false, status: "NEW",
    preview: { lines: [70, 50, 65], footer: false, accent: "#FB923C" } },
];

const RECENTS_KEY = "papyri-recent-tools";

function recordRecent(key) {
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    let list = raw ? JSON.parse(raw) : [];
    list = list.filter(function (e) { return e.key !== key; });
    list.unshift({ key: key, at: Date.now() });
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(list.slice(0, 3)));
  } catch (e) {}
}

function relativeTime(ms) {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + (mins === 1 ? " minute ago" : " minutes ago");
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + (hours === 1 ? " hour ago" : " hours ago");
  const days = Math.floor(hours / 24);
  return days + (days === 1 ? " day ago" : " days ago");
}

function StatusDot({ status }) {
  if (!status) return null;
  const color = status === "NEW" ? "#FB923C" : "#4ADE80";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 700,
      color: color, textTransform: "uppercase", letterSpacing: 0.5,
      border: "1px solid " + color + "55", borderRadius: 4, padding: "1px 6px 1px 5px",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block" }} />
      {status}
    </span>
  );
}

// A tiny stylized document thumbnail hinting at what each generator
// produces — not a real render, just enough shape/rhythm to be
// recognizable at a glance (a receipt's itemized list vs. a contract's
// dense paragraphs vs. a timesheet's grid, etc).
function DocPreview({ item }) {
  const p = item.preview;
  return (
    <div style={{
      width: 128, background: "#FAFAF6", borderRadius: 4, padding: "12px 12px",
      boxShadow: "0 12px 28px rgba(0,0,0,0.45)", border: "1px solid #00000010",
    }}>
      <div style={{ width: 22, height: 4, borderRadius: 2, background: p.accent, marginBottom: 10 }} />
      {p.lines && p.lines.map(function (w, i) {
        return <div key={i} style={{ width: w + "%", height: 5, borderRadius: 2, background: "#DAD6C8", marginBottom: 6 }} />;
      })}
      {p.footer && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <div style={{ width: "45%", height: 7, borderRadius: 2, background: p.accent, opacity: 0.7 }} />
        </div>
      )}
      {p.grid && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginTop: 2 }}>
          {Array.from({ length: 9 }).map(function (_, i) {
            return <div key={i} style={{ height: 10, borderRadius: 2, background: i % 4 === 0 ? p.accent + "55" : "#DAD6C8" }} />;
          })}
        </div>
      )}
      {p.groups && (
        <div>
          {[0, 1, 2].map(function (g) {
            return (
              <div key={g} style={{ marginBottom: 8 }}>
                <div style={{ width: 14, height: 4, borderRadius: 2, background: p.accent, opacity: 0.6, marginBottom: 4 }} />
                <div style={{ width: "85%", height: 5, borderRadius: 2, background: "#DAD6C8", marginBottom: 3 }} />
                <div style={{ width: "60%", height: 5, borderRadius: 2, background: "#DAD6C8" }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ToolCard({ item, hovered, setHovered, variant }) {
  const Icon = item.icon;
  const isHovered = hovered === item.key;
  const featured = variant === "featured";
  return (
    <div style={{ position: "relative" }}
      onMouseEnter={function () { setHovered(item.key); }}
      onMouseLeave={function () { setHovered(null); }}>
      <a href={item.href} onClick={function () { recordRecent(item.key); }}
        style={{
          display: "block", textDecoration: "none", color: "inherit",
          background: isHovered ? "#181818" : "#141414",
          border: "1px solid " + (isHovered ? (featured ? "#F0C93A" : "#F5F2E8") : "#2A2A2A"),
          borderRadius: 6, padding: featured ? "18px 18px" : "16px 16px",
          marginBottom: featured ? 0 : 12,
          transition: "border-color 0.2s ease, transform 0.2s ease, background 0.2s ease",
          transform: isHovered ? "translateY(-3px)" : "translateY(0)",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: featured ? 44 : 38, height: featured ? 44 : 38, borderRadius: 4,
            background: isHovered ? "#25201a" : "#1F1F1F",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            transition: "background 0.2s ease, transform 0.2s ease",
            transform: isHovered ? "scale(1.06)" : "scale(1)",
          }}>
            <Icon size={featured ? 20 : 17} color={isHovered ? "#F0C93A" : "#F5F2E8"} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: featured ? 15 : 14, fontWeight: 700 }}>{item.title}</span>
              <StatusDot status={item.status} />
            </div>
          </div>
          {!featured && (
            <ArrowRight size={15} color={isHovered ? "#F5F2E8" : "#8A8A8A"}
              style={{ transition: "transform 0.2s ease", transform: isHovered ? "translateX(3px)" : "translateX(0)" }} />
          )}
        </div>
        <p style={{ fontSize: featured ? 12.5 : 12.5, color: isHovered ? "#B8B8B8" : "#8A8A8A", margin: "10px 0 0", lineHeight: 1.5, transition: "color 0.2s ease" }}>
          {featured ? item.benefit : item.desc}
        </p>
        {featured && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12,
            fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: isHovered ? "#F0C93A" : "#F5F2E8",
            transition: "color 0.2s ease",
          }}>
            OPEN
            <ArrowRight size={13} style={{ transition: "transform 0.2s ease", transform: isHovered ? "translateX(3px)" : "translateX(0)" }} />
          </div>
        )}
      </a>
      <div className="pc-hub-preview" style={{
        position: "absolute", top: 0, left: "100%", marginLeft: 14,
        opacity: isHovered ? 1 : 0, transform: isHovered ? "translateX(0)" : "translateX(-6px)",
        transition: "opacity 0.18s ease, transform 0.18s ease", pointerEvents: "none",
      }}>
        <DocPreview item={item} />
      </div>
    </div>
  );
}

export default function Hub() {
  const [hovered, setHovered] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [recents, setRecents] = useState([]);

  useEffect(function () { document.title = "Papyri — Receipts & Invoices"; }, []);
  useEffect(function () {
    try {
      const raw = window.localStorage.getItem(RECENTS_KEY);
      if (raw) setRecents(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const filtered = useMemo(function () {
    const q = query.trim().toLowerCase();
    return ITEMS.filter(function (item) {
      const matchesQuery = !q || item.title.toLowerCase().indexOf(q) !== -1 || item.desc.toLowerCase().indexOf(q) !== -1;
      const matchesCategory = category === "all" || item.categories.indexOf(category) !== -1;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  const isBrowsing = !query.trim() && category === "all";
  const popularItems = ITEMS.filter(function (i) { return i.popular; });
  const recentItems = recents
    .map(function (r) { return { entry: r, item: ITEMS.filter(function (i) { return i.key === r.key; })[0] }; })
    .filter(function (r) { return r.item; });

  return (
    <PaperclipBackdrop>
      <PaperclipFonts />
      <PaperclipStructuredData
        name="Papyri"
        description="Free browser-only paperwork tools: a receipt/invoice generator, timesheet generator, contract generator, expense report, and packing slip generator. No signup, nothing ever leaves your browser."
        path="/"
      />
      <PaperclipStyles />
      <style>{"\
        .pc-hub-preview { display: none; }\
        @media (min-width: 900px) { .pc-hub-preview { display: block; } }\
        .pc-hub-popular-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }\
        @media (min-width: 560px) { .pc-hub-popular-grid { grid-template-columns: 1fr 1fr; } }\
        .pc-hub-cat::-webkit-scrollbar { display: none; }\
      "}</style>
      <ToolBackgroundArt glyphs={["$", "#", "%", "="]} />
      <StampWrapper>
        <div style={{ width: 460, maxWidth: "100%", ...fontMono }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#F5F2E8", letterSpacing: 0.5, margin: "0 0 6px" }}>
            PAPYRI
          </p>
          <p style={{ fontSize: 13, color: "#8A8A8A", margin: "0 0 26px", lineHeight: 1.5 }}>
            receipts, invoices, and paperwork — generated instantly
          </p>

          <div style={{ position: "relative", marginBottom: 14 }}>
            <Search size={14} color="#666" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={query}
              onChange={function (e) { setQuery(e.target.value); }}
              placeholder="What do you need to create?"
              style={{
                width: "100%", boxSizing: "border-box", background: "#141414", border: "1px solid #2A2A2A",
                borderRadius: 6, padding: "10px 12px 10px 34px", color: "#F5F2E8", fontSize: 13, ...fontMono,
                outline: "none",
              }}
            />
          </div>

          <div className="pc-hub-cat" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 18 }}>
            {CATEGORIES.map(function (c) {
              const active = category === c.key;
              return (
                <button key={c.key} onClick={function () { setCategory(c.key); }}
                  style={{
                    flexShrink: 0, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, ...fontMono,
                    color: active ? "#0A0A0A" : "#8A8A8A", background: active ? "#F5F2E8" : "transparent",
                    border: "1px solid " + (active ? "#F5F2E8" : "#2A2A2A"), borderRadius: 4,
                    padding: "5px 10px", cursor: "pointer", transition: "all 0.15s ease",
                  }}>
                  {c.label}
                </button>
              );
            })}
          </div>

          {isBrowsing && recentItems.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 8px" }}>Recently Used</p>
              {recentItems.map(function (r) {
                return (
                  <a key={r.item.key} href={r.item.href} onClick={function () { recordRecent(r.item.key); }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none",
                      color: "#B8B8B8", fontSize: 12, padding: "7px 10px", border: "1px solid #232323",
                      borderRadius: 5, marginBottom: 6, background: "#111",
                    }}>
                    <span>{r.item.title}</span>
                    <span style={{ color: "#555", fontSize: 10.5 }}>{relativeTime(r.entry.at)}</span>
                  </a>
                );
              })}
            </div>
          )}

          {isBrowsing && (
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 8px" }}>Popular Tools</p>
              <div className="pc-hub-popular-grid">
                {popularItems.map(function (item) {
                  return <ToolCard key={item.key} item={item} hovered={hovered} setHovered={setHovered} variant="featured" />;
                })}
              </div>
            </div>
          )}

          <p style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 8px" }}>
            {isBrowsing ? "All Tools" : filtered.length + " result" + (filtered.length === 1 ? "" : "s")}
          </p>

          {filtered.length === 0 && (
            <div style={{ border: "1px dashed #2A2A2A", borderRadius: 6, padding: "20px 14px", textAlign: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#666", margin: 0 }}>Nothing matches "{query}" — try a different word or category.</p>
            </div>
          )}

          {filtered.map(function (item) {
            return <ToolCard key={item.key} item={item} hovered={hovered} setHovered={setHovered} />;
          })}

          {isBrowsing && (
            <div style={{ border: "1px dashed #2A2A2A", borderRadius: 6, padding: "12px 14px", textAlign: "center", marginTop: 4, marginBottom: 16 }}>
              <p style={{ fontSize: 10.5, color: "#666", margin: 0 }}>more paperwork tools coming</p>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <a href="/about" style={{ fontSize: 10, color: "#666", textDecoration: "none" }}>About</a>
            <a href="/contact" style={{ fontSize: 10, color: "#666", textDecoration: "none" }}>Contact</a>
            <a href="/faq" style={{ fontSize: 10, color: "#666", textDecoration: "none" }}>FAQ</a>
            <a href="/rss.xml" style={{ fontSize: 10, color: "#666", textDecoration: "none" }}>RSS</a>
            <a href="/privacy" style={{ fontSize: 10, color: "#666", textDecoration: "none" }}>Privacy</a>
            <a href="/terms" style={{ fontSize: 10, color: "#666", textDecoration: "none" }}>Terms</a>
          </div>
        </div>
      </StampWrapper>
    </PaperclipBackdrop>
  );
}
