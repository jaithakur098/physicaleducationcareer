import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, query, where, getDocs,
  orderBy, limit, serverTimestamp, doc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDI7KGUiLBRNGBXQ-k091qerf63NotTHhY",
  authDomain: "pe-exam-hub.firebaseapp.com",
  projectId: "pe-exam-hub",
  storageBucket: "pe-exam-hub.firebasestorage.app",
  messagingSenderId: "14977805637",
  appId: "1:14977805637:web:067f6af55ccd8993a1222c",
  measurementId: "G-S8FJHM2BQ8"
};

let db = null;
try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    console.info("Firebase config placeholder detected. Running in offline demo mode.");
  }
} catch (e) {
  console.warn("Firebase not initialized:", e);
}

// Global engine configuration
let currentChapterConfig = null;
let COLLECTION = "default_results";
let chapterTitle = "Online MCQ Test";
let chapterBadge = "Online Test";
let klassName = "Class 11";
let subjectName = "Physical Education";

// Test State
const TOTAL_Q = 50;
const TIME_LIMIT = 45 * 60; // seconds
const PASS_PCT = 40;
const CERT_PCT = 90;

const state = {
  student: null,
  questions: [],
  current: 0,
  answers: [],
  visited: [],
  startTs: 0,
  timeLeft: TIME_LIMIT,
  timer: null,
  submitted: false,
  tabWarn: 0,
  lastDocId: null,
  rank: "--",
  pct: 0
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const show = id => {
  $$(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

function toast(msg, t = 2500) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), t);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}

function sanitizeInput(s, maxLen = 80) {
  return String(s || "").trim().replace(/[<>]/g, "").slice(0, maxLen);
}

function modal({ title, msg, ok = "OK", cancel = null }) {
  return new Promise(res => {
    $("#mTitle").textContent = title;
    $("#mMsg").textContent = msg;
    $("#mOk").textContent = ok;
    $("#mCancel").style.display = cancel ? "inline-flex" : "none";
    if (cancel) $("#mCancel").textContent = cancel;
    $("#modal").classList.add("active");
    const close = v => {
      $("#modal").classList.remove("active");
      $("#mOk").onclick = null;
      $("#mCancel").onclick = null;
      res(v);
    };
    $("#mOk").onclick = () => close(true);
    $("#mCancel").onclick = () => close(false);
  });
}

// Prevent cheats/exits
document.addEventListener("contextmenu", e => {
  if ($("#screen-test").classList.contains("active")) e.preventDefault();
});

const blockDuringTest = () => $("#screen-test").classList.contains("active");

["copy", "paste", "cut"].forEach(ev => {
  document.addEventListener(ev, e => {
    if (blockDuringTest()) e.preventDefault();
  });
});

document.addEventListener("keydown", e => {
  if (!blockDuringTest()) return;
  if (e.key === "F12") {
    e.preventDefault();
    return;
  }
  const k = (e.key || "").toLowerCase();
  if ((e.ctrlKey || e.metaKey) && ["c", "u", "s", "p", "a", "x"].includes(k)) e.preventDefault();
  if (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(k)) e.preventDefault();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && blockDuringTest() && !state.submitted) {
    state.tabWarn++;
    toast(`â  Tab switch detected (${state.tabWarn}/3). Stay on the test page.`, 3500);
    if (state.tabWarn >= 3) submitTest(true);
  }
});

window.addEventListener("beforeunload", e => {
  if (blockDuringTest() && !state.submitted) {
    e.preventDefault();
    e.returnValue = "";
    return "";
  }
});

function validateForm() {
  let ok = true;
  const name = sanitizeInput($("#fName").value, 50);
  const mobile = $("#fMobile").value.trim();
  const school = sanitizeInput($("#fSchool").value, 80);
  const klass = $("#fClass").value;
  $("#eName").textContent = "";
  $("#eMobile").textContent = "";
  $("#eSchool").textContent = "";
  $("#eClass").textContent = "";
  if (name.length < 3) {
    $("#eName").textContent = "Enter your real full name";
    ok = false;
  } else if (/\d/.test(name)) {
    $("#eName").textContent = "Name cannot contain numbers";
    ok = false;
  } else if (!/^[A-Za-z][A-Za-z\s.'-]{2,}$/.test(name)) {
    $("#eName").textContent = "Use letters only (no fake names)";
    ok = false;
  }
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    $("#eMobile").textContent = "Enter valid 10-digit mobile";
    ok = false;
  }
  if (school.length < 2) {
    $("#eSchool").textContent = "Enter your school name";
    ok = false;
  }
  if (!klass) {
    $("#eClass").textContent = "Select your class";
    ok = false;
  }
  return ok ? { name, mobile, school, class: klass, city: sanitizeInput($("#fCity").value, 40) } : null;
}

async function alreadyAttempted(mobile) {
  if (!db) return false;
  try {
    const q = query(collection(db, COLLECTION), where("mobile", "==", mobile), limit(1));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (e) {
    console.warn("Attempt check failed:", e);
    return false;
  }
}

// Initialise MCQ Engine with dynamic chapter
async function initEngine() {
  const params = new URLSearchParams(window.location.search);
  const klass = params.get("class") || "class11";
  const subject = params.get("subject") || "physical-education";
  const chapter = params.get("chapter") || "chapter1";

  if (!window.chaptersConfig || !window.chaptersConfig[klass] || !window.chaptersConfig[klass][subject] || !window.chaptersConfig[klass][subject][chapter]) {
    await modal({ title: "Configuration Error", msg: `The specified test configuration (Class: ${klass}, Subject: ${subject}, Chapter: ${chapter}) was not found. Please verify the URL parameters.` });
    return;
  }

  currentChapterConfig = window.chaptersConfig[klass][subject][chapter];
  COLLECTION = currentChapterConfig.collection;
  chapterTitle = currentChapterConfig.title;
  chapterBadge = currentChapterConfig.badge;
  
  if (klass === "class11") {
    klassName = "Class 11";
  } else if (klass === "class12") {
    klassName = "Class 12";
  }
  
  // Format Subject name nicely
  subjectName = subject.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  // Load questionBank from data file dynamically (checking localStorage first)
  try {
    const localKey = `cbse_questions_${klass}_${subject}_${chapter}`;
    const localData = localStorage.getItem(localKey);
    if (localData) {
      window.questionBank = JSON.parse(localData);
      console.log(`Loaded ${window.questionBank.length} questions from localStorage for key ${localKey}`);
    } else {
      const response = await fetch(`../data/${klass}/${subject}/${chapter}.js`);
      if (!response.ok) throw new Error("Could not fetch question bank file.");
      let text = await response.text();
      text = text.replace(/const\s+questionBank\s*=/g, "window.questionBank =");
      const scriptEl = document.createElement("script");
      scriptEl.text = text;
      document.head.appendChild(scriptEl);
    }
  } catch (err) {
    console.error("Failed to load dynamic chapter:", err);
    await modal({ title: "Loading Error", msg: "Failed to load the question bank file. Please check your internet connection." });
    return;
  }

  // Update DOM with chapter information
  document.title = `${klassName} ${subjectName} â ${chapterTitle} Online Test`;
  $("#chapterMetaBadge").innerHTML = `<i class="fa-solid fa-graduation-cap"></i> ${chapterBadge}`;
  $("#chapterTestTopBadge").innerHTML = `<i class="fa-solid fa-book"></i> ${chapterBadge} Test`;
  
  // Custom styled heading for intro
  const titleParts = chapterTitle.split("&");
  if (titleParts.length > 1) {
    $("#chapterHeading").innerHTML = `${escapeHtml(titleParts[0])} & <span class="accent">${escapeHtml(titleParts[1])}</span>`;
  } else {
    $("#chapterHeading").innerHTML = escapeHtml(chapterTitle);
  }

  // Set default selection in form
  const classSel = $("#fClass");
  if (klass === "class11") classSel.value = "Class 11";
  else if (klass === "class12") classSel.value = "Class 12";

  // Load Leaderboard
  loadLeaderboard();
}

// Start test button click handler
$("#startBtn").addEventListener("click", async () => {
  const data = validateForm();
  if (!data) return;
  const btn = $("#startBtn");
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking...';
  try {
    if (!window.questionBank || !window.questionBank.length) {
      await modal({ title: "Coming Soon", msg: "Questions for this chapter are being added. Please check again soon." });
      return;
    }
    const done = await alreadyAttempted(data.mobile);
    if (done) {
      await modal({ title: "Already Attempted", msg: "This mobile number has already attempted this chapter test. Only one attempt is allowed per mobile." });
      return;
    }
    state.student = data;
    buildQuestions();
    show("screen-test");
    startTimer();
    renderQuestion();
    requestFullScreenSafe();
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-play"></i> Start Test';
  }
});

function requestFullScreenSafe() {
  try {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  } catch (e) {}
}

function buildQuestions() {
  if (!window.questionBank || !window.questionBank.length) {
    toast("No questions found in this chapter.");
    return;
  }
  const picked = shuffle(window.questionBank).slice(0, TOTAL_Q);
  state.questions = picked.map(q => {
    const optsWithIdx = q.options.map((o, i) => ({ o, i }));
    const shuffled = shuffle(optsWithIdx);
    return {
      question: q.question,
      options: shuffled.map(x => x.o),
      correct: shuffled.findIndex(x => x.i === q.answer)
    };
  });
  state.answers = Array(TOTAL_Q).fill(-1);
  state.visited = Array(TOTAL_Q).fill(false);
  state.current = 0;
  state.startTs = Date.now();
  state.submitted = false;
  state.tabWarn = 0;
  state.timeLeft = TIME_LIMIT;
  buildPalette();
}

function buildPalette() {
  const p = $("#palette");
  p.innerHTML = "";
  for (let i = 0; i < TOTAL_Q; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "p-btn";
    b.textContent = i + 1;
    b.addEventListener("click", () => {
      state.current = i;
      renderQuestion();
    });
    p.appendChild(b);
  }
}

function updatePalette() {
  const btns = $$("#palette .p-btn");
  btns.forEach((b, i) => {
    b.classList.remove("current", "answered", "visited");
    if (state.answers[i] !== -1) b.classList.add("answered");
    else if (state.visited[i]) b.classList.add("visited");
    if (i === state.current) b.classList.add("current");
  });
}

function renderQuestion() {
  const i = state.current;
  const q = state.questions[i];
  if (!q) return;
  state.visited[i] = true;
  $("#qNum").textContent = `Question ${i + 1} of ${TOTAL_Q}`;
  $("#qText").textContent = q.question;
  const box = $("#qOptions");
  box.innerHTML = "";
  q.options.forEach((opt, idx) => {
    const el = document.createElement("label");
    el.className = "opt" + (state.answers[i] === idx ? " selected" : "");
    const inp = document.createElement("input");
    inp.type = "radio";
    inp.name = "opt";
    inp.value = idx;
    if (state.answers[i] === idx) inp.checked = true;
    const sp = document.createElement("span");
    sp.textContent = opt;
    el.appendChild(inp);
    el.appendChild(sp);
    inp.addEventListener("change", () => {
      state.answers[i] = idx;
      $$("#qOptions .opt").forEach(o => o.classList.remove("selected"));
      el.classList.add("selected");
      updateProgress();
      updatePalette();
    });
    box.appendChild(el);
  });
  $("#prevBtn").disabled = i === 0;
  $("#nextBtn").style.display = i === TOTAL_Q - 1 ? "none" : "inline-flex";
  $("#submitBtn").style.display = i === TOTAL_Q - 1 ? "inline-flex" : "none";
  updateProgress();
  updatePalette();
}

function updateProgress() {
  const ans = state.answers.filter(a => a !== -1).length;
  $("#attCount").textContent = ans;
  $("#remCount").textContent = TOTAL_Q - ans;
  $("#progFill").style.width = ((ans / TOTAL_Q) * 100) + "%";
}

$("#prevBtn").addEventListener("click", () => {
  if (state.current > 0) {
    state.current--;
    renderQuestion();
  }
});

$("#nextBtn").addEventListener("click", () => {
  if (state.current < TOTAL_Q - 1) {
    state.current++;
    renderQuestion();
  }
});

$("#clearBtn").addEventListener("click", () => {
  state.answers[state.current] = -1;
  renderQuestion();
});

$("#submitBtn").addEventListener("click", async () => {
  const ans = state.answers.filter(a => a !== -1).length;
  const ok = await modal({
    title: "Submit Test?",
    msg: `You have answered ${ans} of ${TOTAL_Q} questions. Submit your final answers now?`,
    ok: "Submit",
    cancel: "Cancel"
  });
  if (ok) submitTest(false);
});

$("#togglePalette").addEventListener("click", () => {
  const b = $("#paletteBox");
  b.style.display = b.style.display === "none" ? "block" : "none";
});

function startTimer() {
  clearInterval(state.timer);
  updateTimerDisp();
  state.timer = setInterval(() => {
    state.timeLeft--;
    updateTimerDisp();
    if (state.timeLeft <= 60) $("#timer").classList.add("warn");
    if (state.timeLeft <= 0) {
      clearInterval(state.timer);
      submitTest(true);
    }
  }, 1000);
}

function updateTimerDisp() {
  const t = Math.max(0, state.timeLeft);
  const m = Math.floor(t / 60), s = t % 60;
  $("#timer").innerHTML = `<i class="fa-regular fa-clock"></i> ${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

async function submitTest(auto) {
  if (state.submitted) return;
  state.submitted = true;
  clearInterval(state.timer);
  try {
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  } catch (e) {}
  
  let correct = 0;
  state.questions.forEach((q, i) => {
    if (state.answers[i] === q.correct) correct++;
  });
  const attempted = state.answers.filter(a => a !== -1).length;
  const wrong = state.answers.filter((a, i) => a !== -1 && a !== state.questions[i].correct).length;
  const pct = Math.round((correct / TOTAL_Q) * 100);
  const taken = Math.floor((Date.now() - state.startTs) / 1000);
  const tStr = `${Math.floor(taken / 60)}:${String(taken % 60).padStart(2, "0")}`;
  const result = pct >= PASS_PCT ? "Pass" : "Fail";
  state.pct = pct;
  state.rank = "--";
  
  $("#sTotal").textContent = TOTAL_Q;
  $("#sCorrect").textContent = correct;
  $("#sWrong").textContent = wrong;
  $("#sPct").textContent = pct + "%";
  $("#sTime").textContent = tStr;
  $("#sRank").textContent = "--";
  $("#sStatus").textContent = result;
  $("#sName").textContent = state.student.name;
  
  const banner = $("#resBanner");
  banner.classList.toggle("fail", result === "Fail");
  $("#resStatus").textContent = result === "Pass" ? "ð Congratulations!" : "Keep Practicing";
  $("#resMsg").textContent = auto ? "Test auto-submitted (time over or rule violation)." : "Your responses have been recorded.";
  $("#certBtn").style.display = pct >= CERT_PCT ? "inline-flex" : "none";
  show("screen-result");
  
  const payload = {
    name: state.student.name,
    mobile: state.student.mobile,
    school: state.student.school,
    class: state.student.class,
    city: state.student.city || "",
    score: correct,
    correct: correct,
    wrong: wrong,
    attempted: attempted,
    percentage: pct,
    timeTaken: taken,
    status: "pending",
    result: result,
    autoSubmitted: !!auto,
    tabWarnings: state.tabWarn,
    createdAt: serverTimestamp()
  };
  
  try {
    const localAttempts = JSON.parse(localStorage.getItem("cbse_attempts") || "[]");
    localAttempts.push({
      name: state.student.name,
      mobile: state.student.mobile,
      school: state.student.school,
      class: state.student.class,
      city: state.student.city || "",
      score: correct,
      total: TOTAL_Q,
      percentage: pct,
      timeTaken: taken,
      result: result,
      type: "MCQ",
      chapterBadge: chapterBadge,
      date: new Date().toISOString()
    });
    localStorage.setItem("cbse_attempts", JSON.stringify(localAttempts));
  } catch (e) {
    console.warn("Could not save local attempt:", e);
  }

  saveAndRank(payload, pct, taken).catch(err => {
    console.warn("Background save error:", err);
  });
}

async function saveAndRank(payload, pct, taken) {
  if (!db) {
    $("#sRank").textContent = "--";
    toast("Offline mode: result not sent to leaderboard.");
    return;
  }
  try {
    const ref = await addDoc(collection(db, COLLECTION), payload);
    state.lastDocId = ref.id;
  } catch (e) {
    console.warn("Save failed:", e);
    toast("Could not save result online. Please check your connection.");
    return;
  }
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    let r = 1;
    snap.forEach(d => {
      if (d.id === state.lastDocId) return;
      const v = d.data() || {};
      if ((v.status || "pending") !== "approved") return;
      const vp = Number(v.percentage) || 0;
      const vt = Number(v.timeTaken) || 0;
      if (vp > pct || (vp === pct && vt < taken)) r++;
    });
    state.rank = r;
    $("#sRank").textContent = r;
  } catch (e) {
    console.warn("Rank query failed:", e);
    $("#sRank").textContent = "--";
  }
  loadLeaderboard();
}

$("#reviewBtn").addEventListener("click", () => {
  const list = $("#reviewList");
  list.innerHTML = "";
  state.questions.forEach((q, i) => {
    const userAns = state.answers[i];
    const div = document.createElement("div");
    div.className = "review-item";
    const head = document.createElement("div");
    head.innerHTML = `<span class="q-num">Q${i + 1}</span>`;
    const qt = document.createElement("div");
    qt.className = "qt";
    qt.textContent = q.question;
    div.appendChild(head);
    div.appendChild(qt);
    q.options.forEach((o, idx) => {
      const op = document.createElement("div");
      let cls = "r-opt r-mute", tag = "";
      if (idx === q.correct) {
        cls = "r-opt r-correct";
        tag = " â Correct Answer";
      } else if (idx === userAns && userAns !== q.correct) {
        cls = "r-opt r-wrong";
        tag = " â Your Answer";
      }
      op.className = cls;
      op.textContent = o + tag;
      div.appendChild(op);
    });
    if (userAns === -1) {
      const sk = document.createElement("div");
      sk.className = "r-opt r-skip";
      sk.textContent = "Not Attempted";
      div.appendChild(sk);
    }
    list.appendChild(div);
  });
  show("screen-review");
});

$("#backResult").addEventListener("click", () => show("screen-result"));
$("#lbBtn").addEventListener("click", () => {
  show("screen-intro");
  loadLeaderboard();
});

$("#shareBtn").addEventListener("click", async () => {
  const text = `I scored ${state.pct}% in ${klassName} ${subjectName} â ${chapterTitle} Test on Physical Education Career! ð`;
  const url = window.location.href;
  try {
    if (navigator.share) {
      await navigator.share({ title: "PE Career Test Result", text, url });
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast("Result link copied to clipboard!");
    }
  } catch (e) {}
});

$("#certBtn").addEventListener("click", () => {
  $("#cName").textContent = state.student.name;
  $("#cPct").textContent = $("#sPct").textContent;
  $("#cCorrect").textContent = $("#sCorrect").textContent;
  $("#cDate").textContent = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const certId = (state.lastDocId ? state.lastDocId.slice(-6) : Math.random().toString(36).slice(-6)).toUpperCase();
  $("#cId").textContent = "PEC-" + certId;
  
  // Set certificate template text dynamically
  $("#certBodyText").innerHTML = `for outstanding performance in the <b>${escapeHtml(klassName)} ${escapeHtml(subjectName)} â ${escapeHtml(chapterTitle)}</b> online test, securing <b id="cPct">${state.pct}%</b> with <b id="cCorrect">${$("#sCorrect").textContent}</b> correct answers out of 50.`;
  show("screen-cert");
});

$("#backFromCert").addEventListener("click", () => show("screen-result"));
$("#printCertBtn").addEventListener("click", downloadCertificatePDF);

async function downloadCertificatePDF() {
  const btn = $("#printCertBtn");
  const origHtml = btn.innerHTML;
  if (typeof html2canvas === "undefined" || !(window.jspdf && window.jspdf.jsPDF)) {
    toast("Certificate libraries still loading, please retry in a moment.");
    return;
  }
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparing...';
  try {
    const node = document.getElementById("certificateArea");
    const canvas = await html2canvas(node, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      windowWidth: node.scrollWidth
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4"
    });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pw / canvas.width, ph / canvas.height);
    const w = canvas.width * ratio, h = canvas.height * ratio;
    pdf.addImage(imgData, "JPEG", (pw - w) / 2, (ph - h) / 2, w, h);
    const safeName = (state.student && state.student.name ? state.student.name : "Student").replace(/[^A-Za-z0-9_-]+/g, "_");
    const filename = `${safeName}_Certificate.pdf`;
    try {
      pdf.save(filename);
    } catch (e) {
      const blobUrl = pdf.output("bloburl");
      window.open(blobUrl, "_blank");
    }
  } catch (e) {
    console.warn("Certificate PDF error:", e);
    toast("Could not generate PDF. Please try again.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = origHtml;
  }
}

async function loadLeaderboard() {
  const box = $("#leaderboard");
  if (!box) return;
  if (!db) {
    box.innerHTML = '<p style="opacity:.7;font-size:13px">Leaderboard unavailable (offline demo mode).</p>';
    return;
  }
  box.innerHTML = '<p style="opacity:.7;font-size:13px">Loading leaderboard...</p>';
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const rows = [];
    snap.forEach(d => {
      const v = d.data() || {};
      if ((v.status || "pending") !== "approved") return;
      rows.push({
        name: v.name || v.Name || "Student",
        school: v.school || v.School || "",
        mobile: v.mobile || v.Mobile || "",
        percentage: Number(v.percentage ?? v.Percentage ?? 0) || 0,
        timeTaken: Number(v.timeTaken ?? v.TimeTakenSec ?? 0) || 0
      });
    });
    if (!rows.length) {
      box.innerHTML = '<p style="opacity:.7;font-size:13px">No verified students yet.</p>';
      return;
    }
    rows.sort((a, b) => (b.percentage - a.percentage) || (a.timeTaken - b.timeTaken));
    const top = rows.slice(0, 10);
    box.innerHTML = "";
    top.forEach((v, idx) => {
      const m = Math.floor(v.timeTaken / 60), sec = v.timeTaken % 60;
      const row = document.createElement("div");
      row.className = "lb-row";
      if (state.student && v.mobile === state.student.mobile) row.classList.add("me");
      row.innerHTML = `
        <div class="rk">${idx + 1}</div>
        <div>
          <div class="nm">${escapeHtml(v.name)}</div>
          <div class="sch">${escapeHtml(v.school)}</div>
        </div>
        <div style="text-align:right">
          <div class="sc">${escapeHtml(String(v.percentage))}%</div>
          <div class="sch">${m}:${String(sec).padStart(2, "0")}</div>
        </div>`;
      box.appendChild(row);
    });
  } catch (e) {
    console.warn("Leaderboard load failed:", e);
    box.innerHTML = '<p style="opacity:.7;font-size:13px">No verified students yet.</p>';
  }
}

// ===== Admin Section =====
const ADMIN_USER = "admin", ADMIN_PASS = "admin123";
let admData = [], admFiltered = [];
let admLoggedIn = false;

function openAdmin() {
  show("screen-admin");
  if (admLoggedIn) {
    $("#admLoginBox").style.display = "none";
    $("#admDashBox").style.display = "block";
    admLoad();
  } else {
    $("#admLoginBox").style.display = "block";
    $("#admDashBox").style.display = "none";
    $("#admErr").textContent = "";
  }
}

$("#adminLink").addEventListener("click", openAdmin);
window.addEventListener("hashchange", () => {
  if (location.hash === "#admin") openAdmin();
});
if (location.hash === "#admin") setTimeout(openAdmin, 50);

$("#admBackBtn").addEventListener("click", () => {
  location.hash = "";
  show("screen-intro");
});

$("#admLoginBtn").addEventListener("click", () => {
  const u = $("#admUser").value.trim(), p = $("#admPass").value;
  if (u === ADMIN_USER && p === ADMIN_PASS) {
    admLoggedIn = true;
    try {
      sessionStorage.setItem("pec_admin", "1");
    } catch (e) {}
    $("#admPass").value = "";
    $("#admErr").textContent = "";
    $("#admLoginBox").style.display = "none";
    $("#admDashBox").style.display = "block";
    admLoad();
  } else {
    $("#admErr").textContent = "Invalid username or password.";
  }
});

$("#admLogoutBtn").addEventListener("click", () => {
  admLoggedIn = false;
  try {
    sessionStorage.removeItem("pec_admin");
  } catch (e) {}
  $("#admLoginBox").style.display = "block";
  $("#admDashBox").style.display = "none";
  $("#admUser").value = "";
  $("#admPass").value = "";
});

$("#admRefreshBtn").addEventListener("click", admLoad);
try {
  if (sessionStorage.getItem("pec_admin") === "1") admLoggedIn = true;
} catch (e) {}

async function admLoad() {
  const tbody = $("#admRows");
  tbody.innerHTML = '<tr><td colspan="13" class="adm-empty">Loading...</td></tr>';
  if (!db) {
    tbody.innerHTML = '<tr><td colspan="13" class="adm-empty">Database unavailable (offline mode).</td></tr>';
    return;
  }
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    admData = [];
    snap.forEach(d => {
      const v = d.data() || {};
      admData.push({
        id: d.id,
        name: v.name ?? v.Name ?? "",
        mobile: v.mobile ?? v.Mobile ?? "",
        school: v.school ?? v.School ?? "",
        class: v.class ?? v.Class ?? "",
        city: v.city ?? "",
        score: Number(v.score ?? v.Score ?? 0) || 0,
        correct: Number(v.correct ?? 0) || 0,
        wrong: Number(v.wrong ?? 0) || 0,
        attempted: Number(v.attempted ?? 0) || 0,
        percentage: Number(v.percentage ?? v.Percentage ?? 0) || 0,
        timeTaken: Number(v.timeTaken ?? v.TimeTakenSec ?? 0) || 0,
        status: (v.status ?? v.Status ?? "pending"),
        result: v.result ?? "",
        autoSubmitted: !!v.autoSubmitted,
        tabWarnings: Number(v.tabWarnings || 0) || 0,
        createdAt: v.createdAt || null
      });
    });
    admData.sort((a, b) => {
      const ta = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });
    
    const approved = admData.filter(x => x.status === "approved")
      .slice().sort((a, b) => ((b.percentage || 0) - (a.percentage || 0)) || ((a.timeTaken || 0) - (b.timeTaken || 0)));
    const rankMap = {};
    approved.forEach((x, i) => rankMap[x.id] = i + 1);
    admData.forEach(x => {
      x._rank = rankMap[x.id] || "-";
    });
    admRenderStats();
    admApplyFilters();
  } catch (e) {
    console.warn("Admin load failed:", e);
    tbody.innerHTML = '<tr><td colspan="13" class="adm-empty">Could not load data. Please refresh.</td></tr>';
  }
}

function admRenderStats() {
  const total = admData.length;
  const passed = admData.filter(x => x.result === "Pass").length;
  const failed = admData.filter(x => x.result === "Fail").length;
  const avg = total ? Math.round(admData.reduce((s, x) => s + (Number(x.percentage) || 0), 0) / total) : 0;
  const certs = admData.filter(x => (Number(x.percentage) || 0) >= CERT_PCT).length;
  $("#stTotal").textContent = total;
  $("#stPass").textContent = passed;
  $("#stFail").textContent = failed;
  $("#stAvg").textContent = avg + "%";
  $("#stCert").textContent = certs;
}

["fltSearch", "fltStatus", "fltResult", "fltPct", "fltDate"].forEach(id => {
  document.getElementById(id).addEventListener("input", admApplyFilters);
  document.getElementById(id).addEventListener("change", admApplyFilters);
});

$("#fltClear").addEventListener("click", () => {
  ["fltSearch", "fltStatus", "fltResult", "fltPct", "fltDate"].forEach(id => document.getElementById(id).value = "");
  admApplyFilters();
});

function admDateStr(v) {
  try {
    const d = v && v.toDate ? v.toDate() : (v ? new Date(v) : null);
    if (!d || isNaN(d)) return "-";
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch (e) {
    return "-";
  }
}

function admDateISO(v) {
  try {
    const d = v && v.toDate ? v.toDate() : (v ? new Date(v) : null);
    if (!d || isNaN(d)) return "";
    return d.toISOString().slice(0, 10);
  } catch (e) {
    return "";
  }
}

function admApplyFilters() {
  const q = ($("#fltSearch").value || "").trim().toLowerCase();
  const st = $("#fltStatus").value, rs = $("#fltResult").value;
  const minP = Number($("#fltPct").value) || 0;
  const dt = $("#fltDate").value;
  admFiltered = admData.filter(x => {
    if (q) {
      const hay = `${x.name || ""} ${x.mobile || ""} ${x.school || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (st && x.status !== st) return false;
    if (rs && x.result !== rs) return false;
    if (minP && (Number(x.percentage) || 0) < minP) return false;
    if (dt && admDateISO(x.createdAt) !== dt) return false;
    return true;
  });
  admRenderTable();
}

function admRenderTable() {
  const tbody = $("#admRows");
  if (!admFiltered.length) {
    tbody.innerHTML = '<tr><td colspan="13" class="adm-empty">No records match the filters.</td></tr>';
    return;
  }
  tbody.innerHTML = "";
  admFiltered.forEach((x, i) => {
    const tt = Number(x.timeTaken) || 0;
    const tStr = `${Math.floor(tt / 60)}:${String(tt % 60).padStart(2, "0")}`;
    const tr = document.createElement("tr");
    const certBtn = (Number(x.percentage) || 0) >= CERT_PCT ?
      `<button data-act="cert" data-id="${x.id}" title="View Certificate"><i class="fa-solid fa-award"></i></button>
       <button data-act="certdl" data-id="${x.id}" title="Download Certificate"><i class="fa-solid fa-file-arrow-down"></i></button>` : "";
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${escapeHtml(x.name || "-")}</td>
      <td>${escapeHtml(x.mobile || "-")}</td>
      <td>${escapeHtml(x.school || "-")}</td>
      <td>${escapeHtml(x.class || "-")}</td>
      <td><b>${escapeHtml(String(x.percentage || 0))}%</b></td>
      <td>${escapeHtml(String(x.score || 0))}/${TOTAL_Q}</td>
      <td>${tStr}</td>
      <td>${x._rank || "-"}</td>
      <td><span class="pill ${x.result === "Pass" ? "adm-pill-pass" : "adm-pill-fail"}">${escapeHtml(x.result || "-")}</span></td>
      <td><span class="pill adm-pill-${escapeHtml(x.status || "pending")}">${escapeHtml(x.status || "pending")}</span></td>
      <td>${admDateStr(x.createdAt)}</td>
      <td class="adm-act">
        <button data-act="view" data-id="${x.id}" title="View Result"><i class="fa-solid fa-eye"></i></button>
        ${certBtn}
        <button class="a-approve" data-act="approve" data-id="${x.id}" title="Approve"><i class="fa-solid fa-check"></i></button>
        <button class="a-reject"  data-act="reject"  data-id="${x.id}" title="Reject"><i class="fa-solid fa-ban"></i></button>
        <button class="a-del"     data-act="delete"  data-id="${x.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll("button[data-act]").forEach(btn => {
    btn.addEventListener("click", () => admAction(btn.dataset.act, btn.dataset.id));
  });
}

async function admAction(act, id) {
  const row = admData.find(x => x.id === id);
  if (!row) return;
  try {
    if (act === "view") {
      await modal({
        title: "Result â " + (row.name || ""),
        msg: `Score: ${row.score}/${TOTAL_Q}\nCorrect: ${row.correct}  Wrong: ${row.wrong}\nPercentage: ${row.percentage}%\nResult: ${row.result}\nTime: ${row.timeTaken || 0}s\nMobile: ${row.mobile}\nSchool: ${row.school}\nClass: ${row.class}\nStatus: ${row.status}`
      });
      return;
    }
    if (act === "cert" || act === "certdl") {
      state.student = { name: row.name, mobile: row.mobile, school: row.school, class: row.class, city: row.city || "" };
      state.lastDocId = row.id;
      state.pct = row.percentage;
      $("#cName").textContent = row.name || "";
      $("#cPct").textContent = (row.percentage || 0) + "%";
      $("#cCorrect").textContent = row.correct || 0;
      $("#cDate").textContent = admDateStr(row.createdAt);
      $("#cId").textContent = "PEC-" + (row.id || "").slice(-6).toUpperCase();
      
      // Dynamic certificate text
      $("#certBodyText").innerHTML = `for outstanding performance in the <b>${escapeHtml(klassName)} ${escapeHtml(subjectName)} â ${escapeHtml(chapterTitle)}</b> online test, securing <b id="cPct">${row.percentage}%</b> with <b id="cCorrect">${row.correct}</b> correct answers out of 50.`;
      
      if (act === "cert") {
        show("screen-cert");
      } else {
        show("screen-cert");
        setTimeout(downloadCertificatePDF, 250);
      }
      return;
    }
    if (act === "approve") {
      await updateDoc(doc(db, COLLECTION, id), { status: "approved" });
      row.status = "approved";
      toast("Approved");
    } else if (act === "reject") {
      await updateDoc(doc(db, COLLECTION, id), { status: "rejected" });
      row.status = "rejected";
      toast("Rejected");
    } else if (act === "delete") {
      const ok = await modal({ title: "Delete Student?", msg: "This permanently removes the record.", ok: "Delete", cancel: "Cancel" });
      if (!ok) return;
      await deleteDoc(doc(db, COLLECTION, id));
      admData = admData.filter(x => x.id !== id);
      toast("Deleted");
    }
    admRenderStats();
    admApplyFilters();
  } catch (e) {
    console.warn("Admin action failed:", e);
    toast("Action failed. Please try again.");
  }
}

function admExportRows() {
  return admFiltered.map((x, i) => ({
    "#": i + 1,
    Name: x.name || "",
    Mobile: x.mobile || "",
    School: x.school || "",
    Class: x.class || "",
    City: x.city || "",
    Score: x.score || 0,
    Correct: x.correct || 0,
    Wrong: x.wrong || 0,
    Attempted: x.attempted || 0,
    Percentage: x.percentage || 0,
    TimeTakenSec: x.timeTaken || 0,
    Rank: x._rank || "",
    Result: x.result || "",
    Status: x.status || "",
    AutoSubmitted: x.autoSubmitted ? "Yes" : "No",
    TabWarnings: x.tabWarnings || 0,
    Date: admDateStr(x.createdAt)
  }));
}

$("#expCsv").addEventListener("click", () => {
  const rows = admExportRows();
  if (!rows.length) {
    toast("No data to export");
    return;
  }
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => {
    const v = String(r[h] == null ? "" : r[h]).replace(/"/g, '""');
    return /[",\n]/.test(v) ? `"${v}"` : v;
  }).join(","))].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  admDownloadBlob(blob, `${COLLECTION}_results_${Date.now()}.csv`);
});

$("#expXlsx").addEventListener("click", () => {
  if (typeof XLSX === "undefined") {
    toast("Excel library loading, retry...");
    return;
  }
  const rows = admExportRows();
  if (!rows.length) {
    toast("No data to export");
    return;
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");
  XLSX.writeFile(wb, `${COLLECTION}_results_${Date.now()}.xlsx`);
});

$("#expPdf").addEventListener("click", () => {
  try {
    if (!(window.jspdf && window.jspdf.jsPDF)) {
      toast("PDF library loading, retry...");
      return;
    }
    const rows = admExportRows();
    if (!rows.length) {
      toast("No data to export");
      return;
    }
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    pdf.setFontSize(14);
    pdf.text(`${klassName} ${subjectName} ${chapterTitle} â Admin Report`, 40, 40);
    pdf.setFontSize(9);
    const cols = ["#", "Name", "Mobile", "School", "Class", "%", "Score", "Time", "Rank", "Result", "Status", "Date"];
    const xs = [40, 70, 180, 250, 360, 400, 430, 470, 510, 540, 580, 640];
    let y = 70;
    pdf.setFont(undefined, "bold");
    cols.forEach((c, i) => pdf.text(String(c), xs[i], y));
    pdf.setFont(undefined, "normal");
    y += 14;
    rows.forEach((r, i) => {
      if (y > 560) {
        pdf.addPage();
        y = 40;
      }
      const tt = Number(r.TimeTakenSec) || 0;
      const vals = [
        i + 1,
        (r.Name || "").slice(0, 18),
        r.Mobile,
        (r.School || "").slice(0, 16),
        r.Class,
        r.Percentage + "%",
        r.Score,
        `${Math.floor(tt / 60)}:${String(tt % 60).padStart(2, "0")}`,
        r.Rank,
        r.Result,
        r.Status,
        r.Date
      ];
      vals.forEach((v, j) => pdf.text(String(v == null ? "" : v), xs[j], y));
      y += 13;
    });
    pdf.save(`${COLLECTION}_results_${Date.now()}.pdf`);
  } catch (e) {
    console.warn("PDF export failed:", e);
  }
});

function admDownloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 200);
}

// Initialise everything
$("#yr").textContent = new Date().getFullYear();
initEngine();
