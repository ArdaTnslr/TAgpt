const $ = (id) => document.getElementById(id);
const chatEl = $("chat"), messagesEl = $("messages"), welcomeEl = $("welcome");
const promptEl = $("prompt"), fileInput = $("fileInput");
let messages = [];
let pendingFiles = [];
let busy = false;

function saveChat() {
  try { localStorage.setItem("tagpt-chat", JSON.stringify(messages.slice(-40))); } catch {}
}
function loadChat() {
  try { messages = JSON.parse(localStorage.getItem("tagpt-chat") || "[]"); } catch { messages = []; }
  renderMessages();
}
function scrollBottom() { chatEl.scrollTop = chatEl.scrollHeight; }
function addMessage(role, content, meta = "") {
  messages.push({ role, content });
  renderMessages();
  if (meta) {
    const last = messagesEl.lastElementChild;
    if (last) { const m = document.createElement("div"); m.className = "message-meta"; m.textContent = meta; last.querySelector(".message-body").append(m); }
  }
  saveChat();
}
function renderMessages() {
  messagesEl.replaceChildren();
  welcomeEl.classList.toggle("hidden", messages.length > 0);
  for (const msg of messages) {
    const row = document.createElement("div"); row.className = `message ${msg.role}`;
    const avatar = document.createElement("div"); avatar.className = "avatar"; avatar.textContent = msg.role === "user" ? "DU" : "TA";
    const body = document.createElement("div"); body.className = "message-body";
    // Text-only rendering avoids executing HTML returned by the model.
    body.textContent = msg.content;
    row.append(avatar, body);
    if (msg.role === "assistant" && "speechSynthesis" in window) {
      const speak = document.createElement("button");
      speak.className = "speak-btn"; speak.type = "button"; speak.textContent = "🔊 Vorlesen";
      speak.setAttribute("aria-label", "Antwort vorlesen");
      speak.onclick = () => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(msg.content);
        utterance.lang = "de-DE";
        window.speechSynthesis.speak(utterance);
      };
      body.append(document.createElement("br"), speak);
    }
    messagesEl.append(row);
  }
  scrollBottom();
}
function showTyping() {
  const row = document.createElement("div"); row.className = "message"; row.id = "typing";
  const avatar = document.createElement("div"); avatar.className = "avatar"; avatar.textContent = "TA";
  const body = document.createElement("div"); body.className = "message-body typing"; body.textContent = "TAgpt denkt nach…";
  row.append(avatar, body); messagesEl.append(row); scrollBottom();
}
function showError(text) {
  const row = document.createElement("div"); row.className = "message";
  const avatar = document.createElement("div"); avatar.className = "avatar"; avatar.textContent = "!";
  const body = document.createElement("div"); body.className = "message-body"; body.textContent = text;
  row.append(avatar, body); messagesEl.append(row); scrollBottom();
}
async function sendMessage(text) {
  const content = (text ?? promptEl.value).trim();
  if (!content || busy) return;
  busy = true; $("sendBtn").disabled = true;
  promptEl.value = ""; resizePrompt();
  const submittedFiles = [...pendingFiles];
  pendingFiles = []; renderFileChips();
  messages.push({ role: "user", content: content + (submittedFiles.length ? "\n\n[Angehängte Dateien: " + submittedFiles.map(f => f.name).join(", ") + "]" : "") });
  renderMessages(); saveChat(); showTyping();
  try {
    const form = new FormData();
    form.append("messages", JSON.stringify(messages.slice(-16)));
    form.append("useWeb", String($("webToggle").checked));
    submittedFiles.forEach(f => form.append("files", f, f.name));
    const response = await fetch("/api/chat", { method: "POST", body: form });
    const data = await response.json();
    $("typing")?.remove();
    if (!response.ok) throw new Error(data.error || "Anfrage fehlgeschlagen.");
    messages.push({ role: "assistant", content: data.answer });
    renderMessages(); saveChat();
  } catch (err) {
    $("typing")?.remove(); showError(err.message || "Verbindungsfehler.");
  } finally {
    busy = false; $("sendBtn").disabled = false; promptEl.focus();
  }
}
function resizePrompt() { promptEl.style.height = "auto"; promptEl.style.height = Math.min(promptEl.scrollHeight, 180) + "px"; }
function renderFileChips() {
  $("fileChips").replaceChildren();
  pendingFiles.forEach((file, i) => {
    const chip = document.createElement("span"); chip.className = "file-chip";
    chip.textContent = `${file.name} `;
    const remove = document.createElement("button"); remove.textContent = "×"; remove.className = "text-btn"; remove.type = "button";
    remove.onclick = () => { pendingFiles.splice(i, 1); renderFileChips(); };
    chip.append(remove); $("fileChips").append(chip);
  });
}
async function refreshMemory() {
  try {
    const r = await fetch("/api/memory"); const data = await r.json();
    $("memoryCount").textContent = data.memories.length;
    $("memoryList").replaceChildren();
    if (!data.memories.length) {
      const empty = document.createElement("div"); empty.className = "empty-memory"; empty.textContent = "Noch keine Einträge. Du kannst hier oder im Chat Informationen speichern."; $("memoryList").append(empty);
    }
    data.memories.forEach(item => {
      const row = document.createElement("div"); row.className = "memory-item";
      const span = document.createElement("span"); span.textContent = item.text;
      const del = document.createElement("button"); del.textContent = "Löschen"; del.onclick = async () => { await fetch("/api/memory/" + encodeURIComponent(item.id), { method: "DELETE" }); refreshMemory(); };
      row.append(span, del); $("memoryList").append(row);
    });
  } catch {}
}
async function checkHealth() {
  try {
    const r = await fetch("/api/health"); const d = await r.json();
    $("statusText").textContent = d.configured ? "Verbunden · " + d.model : "API-Schlüssel fehlt";
    document.querySelector(".status-dot").classList.toggle("online", d.configured);
    $("modelLabel").textContent = d.model || "KI-Assistent";
  } catch { $("statusText").textContent = "Server nicht erreichbar"; }
}
$("chatForm").addEventListener("submit", e => { e.preventDefault(); sendMessage(); });
promptEl.addEventListener("input", resizePrompt);
promptEl.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
$("newChat").onclick = () => { messages = []; saveChat(); renderMessages(); pendingFiles = []; renderFileChips(); $("prompt").focus(); document.querySelector(".sidebar").classList.remove("open"); };
$("clearChat").onclick = () => { if (confirm("Diesen Chat wirklich leeren?")) { messages = []; saveChat(); renderMessages(); } };
$("fileInput").addEventListener("change", e => {
  const incoming = [...e.target.files];
  if (pendingFiles.length + incoming.length > 4) alert("Maximal 4 Dateien pro Nachricht.");
  pendingFiles = [...pendingFiles, ...incoming].slice(0, 4);
  if (pendingFiles.some(f => f.size > 8 * 1024 * 1024)) { alert("Dateien dürfen maximal 8 MB groß sein."); pendingFiles = pendingFiles.filter(f => f.size <= 8 * 1024 * 1024); }
  renderFileChips(); e.target.value = "";
});
document.querySelectorAll("[data-prompt]").forEach(btn => btn.addEventListener("click", () => sendMessage(btn.dataset.prompt)));
$("memoryToggle").onclick = () => { $("memoryPanel").classList.toggle("hidden"); refreshMemory(); };
$("closeMemory").onclick = () => $("memoryPanel").classList.add("hidden");
$("memoryForm").addEventListener("submit", async e => {
  e.preventDefault(); const input = $("memoryInput"); if (!input.value.trim()) return;
  const r = await fetch("/api/memory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: input.value.trim() }) });
  const d = await r.json(); if (!r.ok) return alert(d.error || "Speichern fehlgeschlagen.");
  input.value = ""; refreshMemory();
});
$("mobileMenu").onclick = () => document.querySelector(".sidebar").classList.toggle("open");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  $("voiceBtn").title = "Spracherkennung wird in diesem Browser nicht unterstützt.";
  $("voiceBtn").style.opacity = ".5";
} else {
  $("voiceBtn").addEventListener("click", () => {
    const recognition = new SpeechRecognition();
    recognition.lang = "de-DE"; recognition.interimResults = false; recognition.maxAlternatives = 1;
    $("voiceBtn").textContent = "🎙 Hört zu…";
    recognition.onresult = e => { promptEl.value = (promptEl.value + " " + e.results[0][0].transcript).trim(); resizePrompt(); promptEl.focus(); };
    recognition.onerror = () => {};
    recognition.onend = () => { $("voiceBtn").innerHTML = '🎙 <span>Sprache</span>'; };
    recognition.start();
  });
}
loadChat(); checkHealth(); refreshMemory();
