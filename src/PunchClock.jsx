// PunchClock.jsx — Standalone Timesheet + Check-In
// McMillan Water Treatment · AquaField Suite
// Works on Android Chrome — no ?. or ?? operators
import { useState, useMemo, useEffect } from "react";
var C = {
  bg:"#0a0a0a", surface:"#111111", card:"#1a1a1a", cardAlt:"#222222",
  border:"#2a2a2a", borderHi:"#3a3a3a",
  green:"#4ade80", greenDim:"#4ade8015", greenMid:"#4ade8030",
  red:"#f87171", redDim:"#f8717115",
  blue:"#60a5fa", blueDim:"#60a5fa15", blueMid:"#60a5fa30",
  orange:"#fb923c", orangeDim:"#fb923c15",
  yellow:"#fbbf24", yellowDim:"#fbbf2415",
  text:"#f5f5f5", soft:"#888888", muted:"#444444",
};
var SHOP_NUMBER = "+19092007203";
var STORAGE_KEY = "punchclock_entries";
var CLOCKEDIN_KEY = "punchclock_clockedin";
var css = "\n  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');\n  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}\n  body{background:" + C.bg + ";color:" + C.text + ";font-family:'IBM Plex Sans',sans-serif;font-size:14px;}\n  ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:" + C.border + ";border-radius:4px;}\n  @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}\n  @keyframes pulseGreen{0%,100%{box-shadow:0 0 0 0 #4ade8044}50%{box-shadow:0 0 0 12px #4ade8000}}\n  @keyframes pulseRed{0%,100%{box-shadow:0 0 0 0 #f8717144}50%{box-shadow:0 0 0 12px #f8717100}}\n  .fade{animation:fadeUp .25s ease both;}\n\n  .clock-btn{width:100%;padding:22px;border-radius:16px;border:none;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;font-weight:700;font-size:20px;transition:all .2s;letter-spacing:.3px;-webkit-tap-highlight-color:transparent;}\n  .clock-btn:active{transform:scale(.97);}\n  .clock-in-btn{background:" + C.green + ";color:#0a0a0a;animation:pulseGreen 2s infinite;}\n  .clock-out-btn{background:" + C.red + ";color:#0a0a0a;animation:pulseRed 2s infinite;}\n\n  .checkin-panel{background:#111;border:1px solid #1e1e1e;border-radius:12px;margin-bottom:16px;overflow:hidden;}\n  .checkin-header{padding:13px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;-webkit-tap-highlight-color:transparent;}\n  .checkin-body{padding:12px 14px 14px;border-top:1px solid #1e1e1e;}\n  .checkin-area-btn{flex:1;padding:12px 8px;border-radius:10px;border:1px solid;font-family:'IBM Plex Sans',sans-serif;font-weight:700;font-size:13px;cursor:pointer;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center;gap:6px;}\n\n  .clocked-in-indicator{background:" + C.greenDim + ";border:1px solid " + C.green + "44;border-radius:12px;padding:14px 16px;margin-bottom:12px;display:flex;align-items:center;gap:10px;}\n\n  .day-row{padding:12px 16px;border-bottom:1px solid " + C.border + "22;display:flex;align-items:center;gap:10px;}\n  .day-row:last-child{border-bottom:none;}\n\n  .period-header{padding:10px 16px;background:" + C.cardAlt + ";border-bottom:1px solid " + C.border + ";border-top:1px solid " + C.border + ";display:flex;justify-content:space-between;align-items:center;}\n\n  .tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;font-family:'IBM Plex Mono',monospace;letter-spacing:.5px;text-transform:uppercase;}\n  .tag-green{background:" + C.greenDim + ";color:" + C.green + ";border:1px solid " + C.green + "33;}\n  .tag-blue{background:" + C.blueDim + ";color:" + C.blue + ";border:1px solid " + C.blue + "33;}\n  .tag-yellow{background:" + C.yellowDim + ";color:" + C.yellow + ";border:1px solid " + C.yellow + "33;}\n  .tag-red{background:" + C.redDim + ";color:" + C.red + ";border:1px solid " + C.red + "33;}\n\n  .btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:6px 12px;border-radius:7px;border:none;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:11px;transition:all .15s;-webkit-tap-highlight-color:transparent;}\n  .btn:active{transform:scale(.96);}\n  .btn-ghost{background:transparent;color:" + C.soft + ";border:1px solid " + C.border + ";}\n  .btn-red{background:" + C.redDim + ";color:" + C.red + ";border:1px solid " + C.red + "33;}\n\n  .modal-bg{position:fixed;inset:0;background:#000000bb;z-index:200;display:flex;align-items:flex-end;justify-content:center;}\n  .modal{background:" + C.card + ";border:1px solid " + C.borderHi + ";border-radius:20px 20px 0 0;padding:24px;width:100%;max-width:500px;}\n\n  input[type=time]{background:" + C.cardAlt + ";border:1px solid " + C.border + ";color:" + C.text + ";border-radius:8px;padding:10px 12px;font-family:'IBM Plex Mono',monospace;font-size:16px;outline:none;width:100%;}\n  input[type=date]{background:" + C.cardAlt + ";border:1px solid " + C.border + ";color:" + C.text + ";border-radius:8px;padding:10px 12px;font-family:'IBM Plex Mono',monospace;font-size:14px;outline:none;width:100%;}\n";
// ── Pay period logic ───────────────────────────────────────────────────────────
var ANCHOR = new Date("2026-02-15T00:00:00");
function getPeriodIndex(date) {
  var d = new Date(date);
  var msPerDay = 86400000;
  var diff = d - ANCHOR;
  return Math.floor(diff / (14 * msPerDay));
}
function getPeriodStart(index) {
  var msPerDay = 86400000;
  return new Date(ANCHOR.getTime() + index * 14 * msPerDay);
}
function getPeriodEnd(index) {
  var msPerDay = 86400000;
  return new Date(ANCHOR.getTime() + (index + 1) * 14 * msPerDay - msPerDay);
}
function getPayDate(index) {
  var end = getPeriodEnd(index);
  var msPerDay = 86400000;
  var day = end.getDay();
  var daysUntilFriday = (5 - day + 7) % 7 || 7;
  return new Date(end.getTime() + daysUntilFriday * msPerDay);
}
function fmtShortDate(d) {
  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months[d.getMonth()] + " " + d.getDate();
}
function getPeriodLabel(date) {
  var idx = getPeriodIndex(date);
  var start = getPeriodStart(idx);
  var end = getPeriodEnd(idx);
  var year = end.getFullYear();
  return fmtShortDate(start) + " – " + fmtShortDate(end) + ", " + year;
}
function getPeriodKey(date) {
  return "period-" + getPeriodIndex(date);
}
function fmtTime(dateStr) {
  if (!dateStr) return "--:--";
  var d = new Date(dateStr);
  var h = d.getHours();
  var m = String(d.getMinutes()).padStart(2, "0");
  var ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return h + ":" + m + " " + ampm;
}
function fmtDate(dateStr) {
  var d = new Date(dateStr);
  var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return days[d.getDay()] + " " + months[d.getMonth()] + " " + d.getDate();
}
function calcHours(clockIn, clockOut, clockInAdj, clockOutAdj) {
  if (!clockIn || !clockOut) return null;
  var inTime = new Date(clockIn);
  var outTime = new Date(clockOut);
  var adjIn = clockInAdj ? new Date(inTime.getTime() + 30 * 60000) : inTime;
  var adjOut = clockOutAdj ? new Date(outTime.getTime() - 30 * 60000) : outTime;
  var diffHours = (adjOut - adjIn) / 3600000;
  var total = diffHours - 0.5;
  return total > 0 ? total : 0;
}
function fmtHours(h) {
  if (h === null || h === undefined) return "--";
  var hrs = Math.floor(h);
  var mins = Math.round((h - hrs) * 60);
  if (mins === 0) return hrs + "h";
  return hrs + "h " + mins + "m";
}
function roundTo2(n) {
  return Math.round(n * 100) / 100;
}
function loadEntries() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return [];
}
function saveEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch(e) {}
}
function loadClockedIn() {
  try {
    var raw = localStorage.getItem(CLOCKEDIN_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}
function saveClockedIn(val) {
  try {
    if (val) {
      localStorage.setItem(CLOCKEDIN_KEY, JSON.stringify(val));
    } else {
      localStorage.removeItem(CLOCKEDIN_KEY);
    }
  } catch(e) {}
}
// ── Check-In Panel ─────────────────────────────────────────────────────────────
function CheckInPanel(props) {
  var [sent, setSent] = useState(false);
  var [location, setLocation] = useState("");
  var [testMode, setTestMode] = useState(false);
  function sendCheckin() {
    if (!location.trim()) return;
    var num = testMode ? "+19093688500" : SHOP_NUMBER;
    var body = "Good morning, will be in " + location.trim() + " today";
    window.location.href = "sms:" + num + "?body=" + encodeURIComponent(body);
    setSent(true);
    setOpen(false);
  }
  return (
    <div className="checkin-panel fade">
      <div style={{padding:"13px 16px", display:"flex", alignItems:"center", gap:8}}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={sent ? C.green : C.blue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span style={{fontSize:13, fontWeight:600, color: sent ? C.green : C.text}}>
          {sent ? "Checked in" : "Check In"}
        </span>
      </div>
      <div className="checkin-body">
        <div style={{fontSize:10, color:C.soft, fontFamily:"'IBM Plex Mono',monospace", letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:10}}>
          Where are you today?
        </div>
        <div style={{display:"flex", gap:8}}>
          <input type="text" value={location} onChange={function(e) { setLocation(e.target.value); }}
            placeholder="e.g. Las Vegas, Bullhead City..."
            style={{flex:1, padding:"12px 14px", borderRadius:10, border:"1px solid #ffffff22", background:"#1a1a1a", color:C.text, fontFamily:"'IBM Plex Sans',sans-serif", fontSize:14, outline:"none"}} />
          <button
            onClick={sendCheckin}
            disabled={!location.trim()}
            style={{padding:"12px 18px", borderRadius:10, border:"1px solid #60a5fa44", background: location.trim() ? "#60a5fa18" : "transparent", color: location.trim() ? "#60a5fa" : C.muted, fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:700, fontSize:13, cursor: location.trim() ? "pointer" : "not-allowed", WebkitTapHighlightColor:"transparent"}}>
            Send
          </button>
        </div>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10}}>
          <div style={{fontSize:10, color: testMode ? C.orange : C.muted, fontFamily:"'IBM Plex Mono',monospace"}}>
            {testMode ? "TEST — sending to your phone" : "opens Messages pre-filled"}
          </div>
          <button onClick={function() { setTestMode(function(t) { return !t; }); }}
            style={{background:"none", border:"none", cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color: testMode ? C.orange : "#2a2a2a", letterSpacing:"1px", padding:"2px 6px", WebkitTapHighlightColor:"transparent"}}>
            {testMode ? "TEST" : "test"}
          </button>
        </div>
      </div>
    </div>
  );
}
// ── Main App ───────────────────────────────────────────────────────────────────
export default function PunchClock() {
  var [entries, setEntries] = useState(function() { return loadEntries(); });
  var [clockedIn, setClockedIn] = useState(function() { return loadClockedIn(); });
  var [clockInPrompt, setClockInPrompt] = useState(false);
  var [clockOutPrompt, setClockOutPrompt] = useState(false);
  var [editModal, setEditModal] = useState(null);
  var [editTime, setEditTime] = useState("");
  var [addModal, setAddModal] = useState(false);
  var [addDate, setAddDate] = useState("");
  var [addInTime, setAddInTime] = useState("");
  var [addOutTime, setAddOutTime] = useState("");
  // Persist entries
  useEffect(function() {
    saveEntries(entries);
  }, [entries]);
  // Persist clockedIn
  useEffect(function() {
    saveClockedIn(clockedIn);
  }, [clockedIn]);
  function doClockIn(adjusted) {
    if (clockedIn) return;
    var now = new Date();
    var ts = now.toISOString();
    var id = Date.now();
    setEntries(function(prev) { return prev.concat([{ id: id, clockIn: ts, clockOut: null, clockInAdj: !!adjusted, clockOutAdj: false }]); });
    setClockedIn({ id: id, time: ts });
    setClockInPrompt(false);
  }
  function doClockOut(adjusted) {
    if (!clockedIn) return;
    var now = new Date();
    var ts = now.toISOString();
    var cid = clockedIn.id;
    setEntries(function(prev) {
      return prev.map(function(e) {
        return e.id === cid ? Object.assign({}, e, { clockOut: ts, clockOutAdj: !!adjusted }) : e;
      });
    });
    setClockedIn(null);
    setClockOutPrompt(false);
  }
  function handleDelete(id) {
    setEntries(function(prev) { return prev.filter(function(e) { return e.id !== id; }); });
    if (clockedIn && clockedIn.id === id) {
      setClockedIn(null);
    }
  }
  function handleAddEntry() {
    if (!addDate || !addInTime) return;
    var inDate = new Date(addDate + "T" + addInTime + ":00");
    var outDate = addOutTime ? new Date(addDate + "T" + addOutTime + ":00") : null;
    var id = Date.now();
    setEntries(function(prev) {
      return prev.concat([{ id: id, clockIn: inDate.toISOString(), clockOut: outDate ? outDate.toISOString() : null, clockInAdj: true, clockOutAdj: true }]);
    });
    setAddModal(false);
    setAddDate("");
    setAddInTime("");
    setAddOutTime("");
  }
  function openEdit(entry, field) {
    var time = field === "clockIn" ? entry.clockIn : entry.clockOut;
    if (!time) return;
    var d = new Date(time);
    var hh = String(d.getHours()).padStart(2, "0");
    var mm = String(d.getMinutes()).padStart(2, "0");
    setEditTime(hh + ":" + mm);
    setEditModal({ entry: entry, field: field });
  }
  function saveEdit() {
    if (!editModal || !editTime) return;
    var parts = editTime.split(":");
    var hh = Number(parts[0]);
    var mm = Number(parts[1]);
    var original = new Date(editModal.field === "clockIn" ? editModal.entry.clockIn : editModal.entry.clockOut);
    original.setHours(hh, mm, 0, 0);
    var eid = editModal.entry.id;
    var field = editModal.field;
    setEntries(function(prev) {
      return prev.map(function(e) {
        if (e.id === eid) {
          var updated = Object.assign({}, e);
          updated[field] = original.toISOString();
          return updated;
        }
        return e;
      });
    });
    setEditModal(null);
  }
  var grouped = useMemo(function() {
    var g = {};
    entries.forEach(function(e) {
      var key = getPeriodKey(e.clockIn);
      if (!g[key]) g[key] = { key: key, label: getPeriodLabel(e.clockIn), entries: [] };
      g[key].entries.push(e);
    });
    return Object.values(g).sort(function(a, b) { return b.key.localeCompare(a.key); });
  }, [entries]);
  var now = new Date();
  var currentPeriodKey = getPeriodKey(now.toISOString());
  var currentPeriod = grouped.find(function(g) { return g.key === currentPeriodKey; });
  var currentHours = currentPeriod
    ? currentPeriod.entries.reduce(function(sum, e) { return sum + (calcHours(e.clockIn, e.clockOut, e.clockInAdj, e.clockOutAdj) || 0); }, 0)
    : 0;
  var isClockedIn = !!clockedIn;
  return (
    <>
      <style>{css}</style>
      <div style={{minHeight:"100vh", background:C.bg}}>
        {/* TOPBAR */}
        <div style={{background:C.surface, borderBottom:"1px solid " + C.border, padding:"14px 20px", position:"sticky", top:0, zIndex:100}}>
          <div style={{maxWidth:500, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
            <div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:C.blue}}>PUNCHCLOCK</div>
              <div style={{fontSize:10, color:C.muted}}>McMillan Water Treatment · Bi-Weekly</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:20, color: isClockedIn ? C.green : C.text}}>
                {fmtHours(roundTo2(currentHours))}
              </div>
              <div style={{fontSize:10, color:C.muted}}>this period</div>
            </div>
          </div>
        </div>
        <div style={{maxWidth:500, margin:"0 auto", padding:"20px 16px"}}>
          {/* CLOCKED IN INDICATOR */}
          {isClockedIn && (
            <div className="clocked-in-indicator fade">
              <div style={{width:10, height:10, borderRadius:"50%", background:C.green, flexShrink:0}}></div>
              <div>
                <div style={{fontWeight:700, fontSize:14, color:C.green}}>Clocked In</div>
                <div style={{fontSize:12, color:C.soft}}>Since {fmtTime(clockedIn.time)}</div>
              </div>
            </div>
          )}
          {/* CLOCK BUTTON */}
          <div style={{marginBottom:16}}>
            {!isClockedIn ? (
              <button className="clock-btn clock-in-btn" onClick={function() { setClockInPrompt(true); }}>
                Clock In
              </button>
            ) : (
              <button className="clock-btn clock-out-btn" onClick={function() { setClockOutPrompt(true); }}>
                Clock Out
              </button>
            )}
          </div>
          {/* CHECK-IN PANEL — always visible */}
          <CheckInPanel />
          {/* ADD PAST ENTRY */}
          <div style={{textAlign:"center", marginBottom:16}}>
            <button className="btn btn-ghost" style={{fontSize:12}} onClick={function() { setAddModal(true); }}>
              + Add Past Entry
            </button>
          </div>
          {/* MATH EXPLAINER */}
          <div style={{background:C.card, border:"1px solid " + C.border, borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:11, color:C.soft, lineHeight:1.8}}>
            <span style={{color:C.text, fontWeight:600}}>Auto deductions: </span>
            +30 min drive to work · -30 min lunch · -30 min drive home
          </div>
          {/* EMPTY STATE */}
          {entries.length === 0 && (
            <div style={{textAlign:"center", padding:"60px 20px", color:C.muted}}>
              <div style={{fontWeight:600, color:C.soft, marginBottom:4}}>No entries yet</div>
              <div style={{fontSize:12}}>Hit Clock In to start your first day</div>
            </div>
          )}
          {/* PAY PERIODS */}
          {grouped.map(function(period) {
            var totalHours = period.entries.reduce(function(sum, e) { return sum + (calcHours(e.clockIn, e.clockOut, e.clockInAdj, e.clockOutAdj) || 0); }, 0);
            var isCurrentPeriod = period.key === currentPeriodKey;
            var overtime = totalHours > 80;
            return (
              <div key={period.key} className="fade" style={{background:C.card, border:"1px solid " + (isCurrentPeriod ? C.blue + "44" : C.border), borderRadius:12, overflow:"hidden", marginBottom:14}}>
                <div className="period-header">
                  <div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color: isCurrentPeriod ? C.blue : C.text}}>
                      {period.label}
                    </div>
                    <div style={{fontSize:11, color:C.muted, marginTop:2}}>
                      {period.entries.filter(function(e) { return e.clockOut; }).length} days worked · Pay: {fmtShortDate(getPayDate(getPeriodIndex(period.entries[0].clockIn)))}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:18, color: overtime ? C.yellow : C.green}}>
                      {fmtHours(roundTo2(totalHours))}
                    </div>
                    {overtime && <span className="tag tag-yellow">OT</span>}
                    {isCurrentPeriod && !overtime && <span className="tag tag-blue">Current</span>}
                  </div>
                </div>
                {period.entries.slice().sort(function(a, b) { return new Date(b.clockIn) - new Date(a.clockIn); }).map(function(entry) {
                  var hours = calcHours(entry.clockIn, entry.clockOut, entry.clockInAdj, entry.clockOutAdj);
                  var isActive = clockedIn && clockedIn.id === entry.id;
                  var adjIn = (entry.clockIn && entry.clockInAdj) ? new Date(new Date(entry.clockIn).getTime() + 30 * 60000) : null;
                  var adjOut = (entry.clockOut && entry.clockOutAdj) ? new Date(new Date(entry.clockOut).getTime() - 30 * 60000) : null;
                  return (
                    <div key={entry.id} className="day-row">
                      <div style={{minWidth:80}}>
                        <div style={{fontSize:12, fontWeight:600, color: isActive ? C.green : C.text}}>{fmtDate(entry.clockIn)}</div>
                        {isActive && <div style={{fontSize:10, color:C.green}}>Active</div>}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex", gap:6, alignItems:"center", fontSize:11, fontFamily:"'IBM Plex Mono',monospace"}}>
                          <span style={{color:C.green, cursor:"pointer", borderBottom:"1px dashed " + C.green + "44"}}
                            onClick={function() { openEdit(entry, "clockIn"); }}>
                            {fmtTime(entry.clockIn)}
                          </span>
                          <span style={{color:C.muted}}>→</span>
                          <span style={{color: entry.clockOut ? C.red : C.muted, cursor: entry.clockOut ? "pointer" : "default", borderBottom: entry.clockOut ? "1px dashed " + C.red + "44" : "none"}}
                            onClick={function() { if (entry.clockOut) openEdit(entry, "clockOut"); }}>
                            {entry.clockOut ? fmtTime(entry.clockOut) : "---"}
                          </span>
                        </div>
                        {(adjIn || adjOut) && (
                          <div style={{fontSize:10, color:C.muted, marginTop:2}}>
                            Adj: {adjIn ? fmtTime(adjIn.toISOString()) : fmtTime(entry.clockIn)} → {adjOut ? fmtTime(adjOut.toISOString()) : (entry.clockOut ? fmtTime(entry.clockOut) : "---")}
                          </div>
                        )}
                      </div>
                      <div style={{textAlign:"right", minWidth:50}}>
                        {hours !== null ? (
                          <div style={{fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:14, color: hours >= 10 ? C.yellow : C.text}}>
                            {fmtHours(roundTo2(hours))}
                          </div>
                        ) : (
                          <div style={{fontSize:12, color:C.muted}}>—</div>
                        )}
                      </div>
                      <button className="btn btn-ghost" style={{padding:"4px 8px", fontSize:12, color:C.muted}} onClick={function() { handleDelete(entry.id); }}>x</button>
                    </div>
                  );
                })}
                <div style={{padding:"10px 16px", background:C.cardAlt, borderTop:"1px solid " + C.border, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <span style={{fontSize:11, color:C.muted, fontFamily:"'IBM Plex Mono',monospace", textTransform:"uppercase", letterSpacing:".8px"}}>Period Total</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:16, color: overtime ? C.yellow : C.green}}>
                    {roundTo2(totalHours)} hrs
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* CLOCK IN PROMPT */}
      {clockInPrompt && (
        <div className="modal-bg" onClick={function() { setClockInPrompt(false); }}>
          <div className="modal" onClick={function(e) { e.stopPropagation(); }}>
            <div style={{fontWeight:700, fontSize:16, marginBottom:4}}>Clock In</div>
            <div style={{fontSize:12, color:C.soft, marginBottom:24}}>Is your first store 30+ minutes away?</div>
            <div style={{display:"flex", flexDirection:"column", gap:10}}>
              <button className="btn" style={{padding:"16px", background:C.green, color:"#000", fontWeight:700, fontSize:15, borderRadius:12}}
                onClick={function() { doClockIn(true); }}>
                Clock in from home (30+ min drive to first store)
              </button>
              <button className="btn" style={{padding:"16px", background:C.cardAlt, color:C.text, fontWeight:600, fontSize:15, borderRadius:12, border:"1px solid " + C.border}}
                onClick={function() { doClockIn(false); }}>
                Clock in at store (store is -30 mins away)
              </button>
            </div>
            <button className="btn btn-ghost" style={{width:"100%", marginTop:12, padding:"10px"}} onClick={function() { setClockInPrompt(false); }}>Cancel</button>
          </div>
        </div>
      )}
      {/* CLOCK OUT PROMPT */}
      {clockOutPrompt && (
        <div className="modal-bg" onClick={function() { setClockOutPrompt(false); }}>
          <div className="modal" onClick={function(e) { e.stopPropagation(); }}>
            <div style={{fontWeight:700, fontSize:16, marginBottom:4}}>Clock Out</div>
            <div style={{fontSize:12, color:C.soft, marginBottom:24}}>Is your last store 30+ minutes from home?</div>
            <div style={{display:"flex", flexDirection:"column", gap:10}}>
              <button className="btn" style={{padding:"16px", background:C.red, color:"#000", fontWeight:700, fontSize:15, borderRadius:12}}
                onClick={function() { doClockOut(true); }}>
                Clock out (store was 30+ mins away)
              </button>
              <button className="btn" style={{padding:"16px", background:C.cardAlt, color:C.text, fontWeight:600, fontSize:15, borderRadius:12, border:"1px solid " + C.border}}
                onClick={function() { doClockOut(false); }}>
                Clock out (store was -30 mins away)
              </button>
            </div>
            <button className="btn btn-ghost" style={{width:"100%", marginTop:12, padding:"10px"}} onClick={function() { setClockOutPrompt(false); }}>Cancel</button>
          </div>
        </div>
      )}
      {addModal && (
        <div className="modal-bg" onClick={function() { setAddModal(false); }}>
          <div className="modal" onClick={function(e) { e.stopPropagation(); }}>
            <div style={{fontWeight:700, fontSize:16, marginBottom:4}}>Add Past Entry</div>
            <div style={{fontSize:12, color:C.soft, marginBottom:20}}>Forgot to clock in or out? Enter it manually.</div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11, color:C.soft, fontWeight:600, textTransform:"uppercase", letterSpacing:".6px", marginBottom:6}}>Date</div>
              <input type="date" value={addDate} onChange={function(e) { setAddDate(e.target.value); }} />
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11, color:C.soft, fontWeight:600, textTransform:"uppercase", letterSpacing:".6px", marginBottom:6}}>Clock In Time</div>
              <input type="time" value={addInTime} onChange={function(e) { setAddInTime(e.target.value); }} />
            </div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11, color:C.soft, fontWeight:600, textTransform:"uppercase", letterSpacing:".6px", marginBottom:6}}>Clock Out Time <span style={{color:C.muted, fontWeight:400}}>(optional)</span></div>
              <input type="time" value={addOutTime} onChange={function(e) { setAddOutTime(e.target.value); }} />
            </div>
            {addDate && addInTime && addOutTime && (
              <div style={{background:"#1a2a1a", border:"1px solid #4ade8033", borderRadius:8, padding:"10px 12px", marginBottom:16, fontSize:12, color:C.green}}>
                Hours: {(function() {
                  var h = calcHours(new Date(addDate + "T" + addInTime).toISOString(), new Date(addDate + "T" + addOutTime).toISOString(), true, true);
                  return h ? fmtHours(roundTo2(h)) : "--";
                })()}
              </div>
            )}
            <div style={{display:"flex", gap:10}}>
              <button className="btn btn-ghost" style={{flex:1, padding:"10px"}} onClick={function() { setAddModal(false); }}>Cancel</button>
              <button className="btn" style={{flex:1, padding:"10px", background:C.green, color:"#000", fontWeight:700}} onClick={handleAddEntry}>Save Entry</button>
            </div>
          </div>
        </div>
      )}
      {/* EDIT TIME MODAL */}
      {editModal && (
        <div className="modal-bg" onClick={function() { setEditModal(null); }}>
          <div className="modal" onClick={function(e) { e.stopPropagation(); }}>
            <div style={{fontWeight:700, fontSize:16, marginBottom:4}}>
              Edit {editModal.field === "clockIn" ? "Clock In" : "Clock Out"} Time
            </div>
            <div style={{fontSize:12, color:C.soft, marginBottom:20}}>
              {fmtDate(editModal.entry.clockIn)} · tap time to edit
            </div>
            <input type="time" value={editTime} onChange={function(e) { setEditTime(e.target.value); }} style={{marginBottom:20}} />
            <div style={{display:"flex", gap:10}}>
              <button className="btn btn-ghost" style={{flex:1, padding:"10px"}} onClick={function() { setEditModal(null); }}>Cancel</button>
              <button className="btn" style={{flex:1, padding:"10px", background:C.blue, color:"#000", fontWeight:700}} onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
