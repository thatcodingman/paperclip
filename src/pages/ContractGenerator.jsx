import { useState, useEffect, Component } from "react";
import { Printer, Save, Edit2, Check, Settings, ArrowLeft } from "lucide-react";
import { ink, sub, stamp, bg, fontMono, PaperclipFonts, PaperclipStyles, PaperclipBackdrop, ToolBackgroundArt, StampWrapper } from "../components/PaperclipChrome";

const PAPER_TONES = {
  cream: { label: "Cream", paper: "#FFFDF6", line: "#D8D4C8" },
  white: { label: "Bright White", paper: "#FFFFFF", line: "#E0E0E0" },
  kraft: { label: "Kraft", paper: "#EFE3C8", line: "#D6C49E" },
};
const SIZES = {
  narrow: { label: "Narrow (58mm)", width: 250 },
  standard: { label: "Standard (80mm)", width: 320 },
  wide: { label: "Full Page", width: 420 },
};

const PROFILE_KEY = "paperclip-profile-v1";
const APPEARANCE_KEY = "paperclip-appearance-v1";

function loadProfile() {
  try { const raw = window.localStorage.getItem(PROFILE_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
  return { name: "", address: "", contact: "" };
}
function loadAppearance() {
  try { const raw = window.localStorage.getItem(APPEARANCE_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
  return { size: "standard", tone: "cream" };
}
function saveAppearance(val) {
  try { window.localStorage.setItem(APPEARANCE_KEY, JSON.stringify(val)); } catch (e) {}
}

function todayStr() {
  const d = new Date();
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
function docNumber() { return "#" + Math.floor(10000 + Math.random() * 89999); }

// Each clause is its own self-contained paragraph, toggled independently —
// this is what lets the document actually change shape instead of just
// filling in a fixed template.
const CLAUSES = {
  confidentiality: {
    label: "Confidentiality",
    text: function (p) { return "Both parties agree to keep confidential any non-public information shared during the course of this agreement, and not to disclose it to third parties without prior written consent."; },
  },
  termination: {
    label: "Termination",
    text: function (p) { return "Either party may terminate this agreement with " + (p.noticeDays || "14") + " days' written notice. Work completed up to the termination date remains payable."; },
  },
  payment: {
    label: "Payment terms",
    text: function (p) { return "Payment is due " + (p.terms || "within 15 days") + " of invoice date. Late payments may be subject to a reasonable late fee as permitted by law."; },
  },
  liability: {
    label: "Limitation of liability",
    text: function (p) { return "Neither party shall be liable for indirect, incidental, or consequential damages arising from this agreement, beyond the total value of fees paid under it."; },
  },
  governingLaw: {
    label: "Governing law",
    text: function (p) { return "This agreement shall be governed by the laws of " + (p.state || "the applicable state") + ", without regard to its conflict of law principles."; },
  },
};

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("Contract Generator crashed:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: "flex", justifyContent: "center", background: bg, padding: "40px 16px" }}>
          <div style={{ width: 380, background: "#FFFDF6", color: ink, borderRadius: 4, padding: "30px 24px", ...fontMono, textAlign: "center" }}>
            <p style={{ fontSize: 15, margin: "0 0 8px", fontWeight: 700 }}>Something went wrong</p>
            <p style={{ fontSize: 12, color: sub, margin: "0 0 16px" }}>A refresh usually fixes it.</p>
            <button onClick={function () { window.location.reload(); }} style={{
              background: ink, border: "none", color: "#FFFDF6", padding: "8px 18px", borderRadius: 3,
              fontSize: 12, cursor: "pointer", ...fontMono }}>Refresh</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function TornEdge({ paper }) {
  return (
    <div style={{
      height: 12, background: "repeating-linear-gradient(-45deg, " + paper + " 0, " + paper + " 5px, " + bg + " 5px, " + bg + " 10px)",
      marginTop: -1,
    }} />
  );
}

function ContractGeneratorInner() {
  const [profile, setProfile] = useState(loadProfile);
  const [editingProfile, setEditingProfile] = useState(!profile.name);
  const [savedFlash, setSavedFlash] = useState(false);
  const [partyB, setPartyB] = useState("");
  const [scope, setScope] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [noticeDays, setNoticeDays] = useState("14");
  const [terms, setTerms] = useState("within 15 days");
  const [state, setState] = useState("");
  const [activeClauses, setActiveClauses] = useState({
    confidentiality: true, termination: true, payment: true, liability: false, governingLaw: false,
  });
  const [docNo] = useState(docNumber);
  const [date] = useState(todayStr);
  const [appearance, setAppearance] = useState(loadAppearance);
  const [showAppearance, setShowAppearance] = useState(false);

  useEffect(function () { document.title = "Contract Generator — Paperclip"; }, []);

  const tone = PAPER_TONES[appearance.tone];
  const size = SIZES[appearance.size];

  function toggleClause(key) {
    setActiveClauses(function (prev) { return Object.assign({}, prev, { [key]: !prev[key] }); });
  }
  function saveProfile() {
    try { window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (e) {}
    setEditingProfile(false);
    setSavedFlash(true);
    setTimeout(function () { setSavedFlash(false); }, 1500);
  }
  function applyAppearance(next) {
    const merged = Object.assign({}, appearance, next);
    setAppearance(merged);
    saveAppearance(merged);
  }
  function handlePrint() { window.print(); }

  const clauseParams = { noticeDays: noticeDays, terms: terms, state: state };
  const activeList = Object.entries(CLAUSES).filter(function (e) { return activeClauses[e[0]]; });

  return (
    <PaperclipBackdrop>
      <PaperclipFonts />
      <PaperclipStyles />
      <ToolBackgroundArt glyphs={["§", "¶", "©", "✓"]} />
      <StampWrapper>
      <div className="pc-no-print" style={{ width: 340 }}>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#8A8A8A",
          textDecoration: "none", fontSize: 11, marginBottom: 14, ...fontMono }}>
          <ArrowLeft size={13} /> BACK
        </a>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <p style={{ ...fontMono, fontSize: 20, fontWeight: 700, color: "#F5F2E8", letterSpacing: 0.5, margin: 0 }}>
            PAPERCLIP
          </p>
          <button onClick={function () { setShowAppearance(!showAppearance); }} aria-label="Appearance settings" style={{
            background: showAppearance ? "#222" : "none", border: "1px solid #333", borderRadius: 4,
            color: "#8A8A8A", padding: "6px 8px", cursor: "pointer" }}>
            <Settings size={13} />
          </button>
        </div>
        <p style={{ ...fontMono, fontSize: 11, color: "#8A8A8A", margin: "0 0 16px" }}>
          a simple agreement — toggle only the clauses you need
        </p>

        {showAppearance && (
          <div style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 4, padding: 12, marginBottom: 16 }}>
            <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 6px", letterSpacing: 0.5 }}>DOCUMENT SIZE</p>
            <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
              {Object.entries(SIZES).map(function (entry) {
                const key = entry[0]; const s = entry[1];
                const active = appearance.size === key;
                return (
                  <button key={key} onClick={function () { applyAppearance({ size: key }); }} style={{
                    flex: 1, padding: "6px 4px", fontSize: 10, borderRadius: 3, cursor: "pointer", ...fontMono,
                    background: active ? "#FFFDF6" : "#0A0A0A", color: active ? ink : "#8A8A8A",
                    border: "1px solid " + (active ? "#FFFDF6" : "#333") }}>{s.label}</button>
                );
              })}
            </div>
            <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 6px", letterSpacing: 0.5 }}>PAPER TONE</p>
            <div style={{ display: "flex", gap: 5 }}>
              {Object.entries(PAPER_TONES).map(function (entry) {
                const key = entry[0]; const t = entry[1];
                const active = appearance.tone === key;
                return (
                  <button key={key} onClick={function () { applyAppearance({ tone: key }); }} style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    padding: "6px 4px", fontSize: 10, borderRadius: 3, cursor: "pointer", ...fontMono,
                    background: active ? "#222" : "#0A0A0A", color: active ? "#F5F2E8" : "#8A8A8A",
                    border: "1px solid " + (active ? "#555" : "#333") }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.paper, border: "1px solid #555", flexShrink: 0 }} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 4, padding: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: 0, letterSpacing: 0.5 }}>PARTY A (YOU)</p>
            {!editingProfile && (
              <button onClick={function () { setEditingProfile(true); }} style={{ background: "none", border: "none", color: "#8A8A8A", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 10, ...fontMono }}>
                <Edit2 size={11} /> Edit
              </button>
            )}
          </div>
          {editingProfile ? (
            <div>
              <input value={profile.name} onChange={function (e) { setProfile(Object.assign({}, profile, { name: e.target.value })); }}
                placeholder="Your name / business name" style={{ width: "100%", background: "#0A0A0A", border: "1px solid #333", borderRadius: 3,
                  color: "#F5F2E8", fontSize: 12, padding: "7px 8px", boxSizing: "border-box", marginBottom: 6, ...fontMono }} />
              <input value={profile.address} onChange={function (e) { setProfile(Object.assign({}, profile, { address: e.target.value })); }}
                placeholder="Address" style={{ width: "100%", background: "#0A0A0A", border: "1px solid #333", borderRadius: 3,
                  color: "#F5F2E8", fontSize: 12, padding: "7px 8px", boxSizing: "border-box", marginBottom: 6, ...fontMono }} />
              <input value={profile.contact} onChange={function (e) { setProfile(Object.assign({}, profile, { contact: e.target.value })); }}
                placeholder="Phone or email" style={{ width: "100%", background: "#0A0A0A", border: "1px solid #333", borderRadius: 3,
                  color: "#F5F2E8", fontSize: 12, padding: "7px 8px", boxSizing: "border-box", marginBottom: 8, ...fontMono }} />
              <button onClick={saveProfile} style={{
                width: "100%", padding: "8px 0", borderRadius: 3, border: "none", background: "#FFFDF6", color: ink,
                fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, ...fontMono }}>
                {savedFlash ? <Check size={12} /> : <Save size={12} />} {savedFlash ? "Saved" : "Save profile"}
              </button>
              <p style={{ fontSize: 9.5, color: "#666", margin: "8px 0 0", lineHeight: 1.5 }}>
                Same saved profile as the other tools.
              </p>
            </div>
          ) : (
            <div style={{ ...fontMono, fontSize: 11.5, color: "#F5F2E8", lineHeight: 1.6 }}>
              <p style={{ margin: 0 }}>{profile.name || "—"}</p>
              <p style={{ margin: 0, color: "#AAA" }}>{profile.address}</p>
              <p style={{ margin: 0, color: "#AAA" }}>{profile.contact}</p>
            </div>
          )}
        </div>

        <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 6px" }}>PARTY B</p>
        <input value={partyB} onChange={function (e) { setPartyB(e.target.value); }} placeholder="Other party's name"
          style={{ width: "100%", background: "#141414", border: "1px solid #2A2A2A", borderRadius: 3, color: "#F5F2E8",
            fontSize: 12, padding: "7px 8px", boxSizing: "border-box", marginBottom: 10, ...fontMono }} />

        <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 6px" }}>EFFECTIVE DATE</p>
        <input value={effectiveDate} onChange={function (e) { setEffectiveDate(e.target.value); }} type="date"
          style={{ width: "100%", background: "#141414", border: "1px solid #2A2A2A", borderRadius: 3, color: "#F5F2E8",
            fontSize: 12, padding: "7px 8px", boxSizing: "border-box", marginBottom: 10, ...fontMono }} />

        <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 6px" }}>SCOPE OF WORK</p>
        <textarea value={scope} onChange={function (e) { setScope(e.target.value); }} rows={3}
          placeholder="Briefly describe the work or service..."
          style={{ width: "100%", background: "#141414", border: "1px solid #2A2A2A", borderRadius: 3, color: "#F5F2E8",
            fontSize: 12, padding: "7px 8px", boxSizing: "border-box", marginBottom: 16, resize: "vertical", ...fontMono }} />

        <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 8px", letterSpacing: 0.5 }}>CLAUSES TO INCLUDE</p>
        {Object.entries(CLAUSES).map(function (entry) {
          const key = entry[0]; const c = entry[1];
          const active = activeClauses[key];
          return (
            <button key={key} onClick={function () { toggleClause(key); }} style={{
              display: "flex", alignItems: "center", gap: 8, background: "none", border: "none",
              cursor: "pointer", padding: "5px 0", width: "100%" }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, border: "1px solid " + (active ? "#F5F2E8" : "#333"),
                background: active ? "#2A2A2A" : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {active && <Check size={10} color="#F5F2E8" />}
              </div>
              <span style={{ fontSize: 12, color: active ? "#F5F2E8" : "#8A8A8A", ...fontMono, textAlign: "left" }}>{c.label}</span>
            </button>
          );
        })}

        {activeClauses.termination && (
          <div style={{ marginTop: 10 }}>
            <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 4px" }}>NOTICE PERIOD (DAYS)</p>
            <input value={noticeDays} onChange={function (e) { setNoticeDays(e.target.value.replace(/[^0-9]/g, "")); }}
              style={{ width: "100%", background: "#141414", border: "1px solid #2A2A2A", borderRadius: 3, color: "#F5F2E8",
                fontSize: 12, padding: "7px 8px", boxSizing: "border-box", ...fontMono }} />
          </div>
        )}
        {activeClauses.payment && (
          <div style={{ marginTop: 10 }}>
            <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 4px" }}>PAYMENT DUE</p>
            <input value={terms} onChange={function (e) { setTerms(e.target.value); }}
              style={{ width: "100%", background: "#141414", border: "1px solid #2A2A2A", borderRadius: 3, color: "#F5F2E8",
                fontSize: 12, padding: "7px 8px", boxSizing: "border-box", ...fontMono }} />
          </div>
        )}
        {activeClauses.governingLaw && (
          <div style={{ marginTop: 10, marginBottom: 16 }}>
            <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 4px" }}>STATE / JURISDICTION</p>
            <input value={state} onChange={function (e) { setState(e.target.value); }} placeholder="e.g. California"
              style={{ width: "100%", background: "#141414", border: "1px solid #2A2A2A", borderRadius: 3, color: "#F5F2E8",
                fontSize: 12, padding: "7px 8px", boxSizing: "border-box", ...fontMono }} />
          </div>
        )}

        <button onClick={handlePrint} style={{
          width: "100%", marginTop: 16, padding: "12px 0", borderRadius: 4, border: "none", background: "#FFFDF6", color: ink,
          fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, ...fontMono }}>
          <Printer size={14} /> Print / Save as PDF
        </button>

        <p style={{ fontSize: 9, color: "#666", textAlign: "center", marginTop: 14, lineHeight: 1.5, ...fontMono }}>
          Not a substitute for legal advice. For anything high-stakes, have a lawyer review it.
        </p>
      </div>

      <div>
        <div className="pc-receipt" style={{
          width: size.width, background: tone.paper, color: ink, padding: "28px 22px 0", ...fontMono,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)", transition: "width 0.2s ease, background 0.2s ease",
        }}>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 2px" }}>SERVICE AGREEMENT</p>
            <p style={{ fontSize: 10, color: sub, margin: 0 }}>{docNo} · {date}</p>
          </div>

          <div style={{ borderTop: "1px dashed " + tone.line, borderBottom: "1px dashed " + tone.line, padding: "10px 0", marginBottom: 14, fontSize: 11 }}>
            <p style={{ margin: "0 0 4px" }}><strong>Party A:</strong> {profile.name || "—"}</p>
            <p style={{ margin: "0 0 4px" }}><strong>Party B:</strong> {partyB || "—"}</p>
            {effectiveDate && <p style={{ margin: 0 }}><strong>Effective:</strong> {effectiveDate}</p>}
          </div>

          {scope && (
            <div style={{ marginBottom: 14, fontSize: 11.5, lineHeight: 1.6 }}>
              <p style={{ margin: "0 0 4px", fontWeight: 700 }}>Scope of Work</p>
              <p style={{ margin: 0, color: sub }}>{scope}</p>
            </div>
          )}

          {activeList.map(function (entry) {
            const key = entry[0]; const c = entry[1];
            return (
              <div key={key} style={{ marginBottom: 12, fontSize: 11, lineHeight: 1.6 }}>
                <p style={{ margin: "0 0 3px", fontWeight: 700 }}>{c.label}</p>
                <p style={{ margin: 0, color: sub }}>{c.text(clauseParams)}</p>
              </div>
            );
          })}

          <div style={{ borderTop: "1px dashed " + tone.line, paddingTop: 16, marginTop: 6 }}>
            <p style={{ fontSize: 10.5, color: sub, margin: "0 0 24px" }}>Signatures</p>
            <p style={{ fontSize: 10.5, margin: "0 0 20px" }}>Party A: ______________________</p>
            <p style={{ fontSize: 10.5, margin: "0 0 10px" }}>Party B: ______________________</p>
          </div>
        </div>
        <TornEdge paper={tone.paper} />
      </div>
      </StampWrapper>
    </PaperclipBackdrop>
  );
}

export default function ContractGenerator() {
  return (
    <ErrorBoundary>
      <ContractGeneratorInner />
    </ErrorBoundary>
  );
}
