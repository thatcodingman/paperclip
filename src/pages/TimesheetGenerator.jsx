import { useState, useEffect, useMemo, Component } from "react";
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

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
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

function sanitizeNumericInput(value) {
  let v = value.replace(/[^0-9.]/g, "");
  const parts = v.split(".");
  if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
  return v;
}

function fmt(n) { return "$" + (Number(n) || 0).toFixed(2); }
function todayStr() {
  const d = new Date();
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
function sheetNumber() { return "#" + Math.floor(10000 + Math.random() * 89999); }

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("Timesheet Generator crashed:", error, info); }
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

function TimesheetGeneratorInner() {
  const [profile, setProfile] = useState(loadProfile);
  const [editingProfile, setEditingProfile] = useState(!profile.name);
  const [savedFlash, setSavedFlash] = useState(false);
  const [employee, setEmployee] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [hours, setHours] = useState(function () {
    const init = {};
    DAYS.forEach(function (d) { init[d] = ""; });
    return init;
  });
  const [sheetNo] = useState(sheetNumber);
  const [date] = useState(todayStr);
  const [appearance, setAppearance] = useState(loadAppearance);
  const [showAppearance, setShowAppearance] = useState(false);

  useEffect(function () { document.title = "Timesheet Generator — Paperclip"; }, []);

  const tone = PAPER_TONES[appearance.tone];
  const size = SIZES[appearance.size];

  function updateHours(day, value) {
    setHours(function (prev) { return Object.assign({}, prev, { [day]: sanitizeNumericInput(value) }); });
  }

  const totalHours = useMemo(function () {
    return DAYS.reduce(function (sum, d) { return sum + (Number(hours[d]) || 0); }, 0);
  }, [hours]);
  const rateNum = Number(hourlyRate) || 0;
  const totalPay = totalHours * rateNum;

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

  return (
    <PaperclipBackdrop>
      <PaperclipFonts />
      <PaperclipStyles />
      <ToolBackgroundArt glyphs={["◷", "▤", ":", "○"]} />
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
          weekly hours, totaled and printable
        </p>

        {showAppearance && (
          <div style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 4, padding: 12, marginBottom: 16 }}>
            <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 6px", letterSpacing: 0.5 }}>SHEET SIZE</p>
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
            <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: 0, letterSpacing: 0.5 }}>YOUR BUSINESS</p>
            {!editingProfile && (
              <button onClick={function () { setEditingProfile(true); }} style={{ background: "none", border: "none", color: "#8A8A8A", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 10, ...fontMono }}>
                <Edit2 size={11} /> Edit
              </button>
            )}
          </div>
          {editingProfile ? (
            <div>
              <input value={profile.name} onChange={function (e) { setProfile(Object.assign({}, profile, { name: e.target.value })); }}
                placeholder="Business name" style={{ width: "100%", background: "#0A0A0A", border: "1px solid #333", borderRadius: 3,
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
                Same saved profile as the Receipt Generator — set once, used everywhere.
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

        <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 6px" }}>EMPLOYEE</p>
        <input value={employee} onChange={function (e) { setEmployee(e.target.value); }} placeholder="Employee name"
          style={{ width: "100%", background: "#141414", border: "1px solid #2A2A2A", borderRadius: 3, color: "#F5F2E8",
            fontSize: 12, padding: "7px 8px", boxSizing: "border-box", marginBottom: 10, ...fontMono }} />

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 4px" }}>WEEK OF</p>
            <input value={weekStart} onChange={function (e) { setWeekStart(e.target.value); }} type="date" style={{
              width: "100%", background: "#141414", border: "1px solid #2A2A2A", borderRadius: 3, color: "#F5F2E8",
              fontSize: 12, padding: "7px 8px", boxSizing: "border-box", ...fontMono }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 4px" }}>HOURLY RATE $ (optional)</p>
            <input value={hourlyRate} onChange={function (e) { setHourlyRate(sanitizeNumericInput(e.target.value)); }} style={{
              width: "100%", background: "#141414", border: "1px solid #2A2A2A", borderRadius: 3, color: "#F5F2E8",
              fontSize: 12, padding: "7px 8px", boxSizing: "border-box", ...fontMono }} />
          </div>
        </div>

        <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 6px", letterSpacing: 0.5 }}>HOURS PER DAY</p>
        {DAYS.map(function (day) {
          return (
            <div key={day} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ flex: 1, fontSize: 11.5, color: "#CCC", ...fontMono }}>{day}</span>
              <input value={hours[day]} onChange={function (e) { updateHours(day, e.target.value); }}
                placeholder="0" style={{ width: 70, background: "#141414", border: "1px solid #2A2A2A", borderRadius: 3,
                  color: "#F5F2E8", fontSize: 12, padding: "6px 8px", textAlign: "center", boxSizing: "border-box", ...fontMono }} />
            </div>
          );
        })}

        <button onClick={handlePrint} style={{
          width: "100%", marginTop: 14, padding: "12px 0", borderRadius: 4, border: "none", background: "#FFFDF6", color: ink,
          fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, ...fontMono }}>
          <Printer size={14} /> Print / Save as PDF
        </button>
      </div>

      <div>
        <div className="pc-receipt" style={{
          width: size.width, background: tone.paper, color: ink, padding: "28px 22px 0", ...fontMono,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)", transition: "width 0.2s ease, background 0.2s ease",
        }}>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 2px", letterSpacing: 0.5 }}>{profile.name || "Your Business Name"}</p>
            {profile.address && <p style={{ fontSize: 10.5, color: sub, margin: "0 0 2px" }}>{profile.address}</p>}
            {profile.contact && <p style={{ fontSize: 10.5, color: sub, margin: 0 }}>{profile.contact}</p>}
          </div>

          <div style={{ marginBottom: 12, fontSize: 11 }}>
            <p style={{ margin: "0 0 2px", color: sub }}>Employee:</p>
            <p style={{ margin: 0 }}>{employee || "—"}</p>
          </div>

          <div style={{ borderTop: "1px dashed " + tone.line, borderBottom: "1px dashed " + tone.line, padding: "8px 0", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5 }}>
              <span>Timesheet</span>
              <span>{sheetNo}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: sub }}>
              <span>Generated {date}</span>
              {weekStart && <span>Week of {weekStart}</span>}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", fontSize: 10, color: sub, marginBottom: 6, letterSpacing: 0.3 }}>
              <span style={{ flex: 2 }}>DAY</span>
              <span style={{ flex: 1, textAlign: "right" }}>HOURS</span>
            </div>
            {DAYS.map(function (day) {
              return (
                <div key={day} style={{ display: "flex", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ flex: 2 }}>{day}</span>
                  <span style={{ flex: 1, textAlign: "right" }}>{hours[day] || "0"}</span>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: "1px dashed " + tone.line, paddingTop: 10, marginBottom: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 3 }}>
              <span>Total hours</span><span>{totalHours.toFixed(2)}</span>
            </div>
            {rateNum > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, marginTop: 8,
                paddingTop: 8, borderTop: "1px solid " + ink }}>
                <span>TOTAL PAY</span><span style={{ color: stamp }}>{fmt(totalPay)}</span>
              </div>
            )}
          </div>

          <p style={{ textAlign: "center", fontSize: 10, color: sub, margin: "18px 0 10px" }}>
            Signature: ______________________
          </p>
        </div>
        <TornEdge paper={tone.paper} />
      </div>
      </StampWrapper>
    </PaperclipBackdrop>
  );
}

export default function TimesheetGenerator() {
  return (
    <ErrorBoundary>
      <TimesheetGeneratorInner />
    </ErrorBoundary>
  );
}
