const { invoke } = window.__TAURI__.core;
const $ = (s) => document.querySelector(s);
const esc = (t) => t.replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const MODULES = [
  ["pos", "Posición", "Tus coordenadas en pantalla"],
  ["death", "Posición de muerte", "Marca dónde moriste"],
  ["fps", "FPS", "Contador de fotogramas"],
  ["keys", "Keystrokes", "Teclas que pulsas"],
  ["cps", "CPS", "Tus clicks por segundo, solo medición"],
  ["zoom", "Zoom", "Acercar la vista con una tecla"],
  ["clock", "Reloj", "Hora real en pantalla"],
  ["armor", "Armor HUD", "Durabilidad de tu armadura"],
];

const KEY = "aether.v1";
const fresh = () => ({
  active: "p1", closeOnPlay: false,
  profiles: [
    { id: "p1", name: "Survival", mods: { pos: true, death: true, fps: true } },
    { id: "p2", name: "Práctica", mods: { fps: true, cps: true, keys: true } },
  ],
});
let S;
try { S = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch { S = fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
const cur = () => S.profiles.find((p) => p.id === S.active) || S.profiles[0];

function show(view) {
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("on", v.id === view));
  document.querySelectorAll("nav button").forEach((b) => b.classList.toggle("on", b.dataset.view === view));
}
document.querySelectorAll("nav button").forEach((b) => (b.onclick = () => show(b.dataset.view)));

function render() {
  const sel = $("#profileSel");
  sel.innerHTML = S.profiles.map((p) => `<option value="${p.id}" ${p.id === cur().id ? "selected" : ""}>${esc(p.name)}</option>`).join("");
  $("#profileList").innerHTML = S.profiles.map((p) => `
    <li class="${p.id === cur().id ? "act" : ""}"><span>${esc(p.name)}</span>
      <span class="btns"><button data-use="${p.id}">Usar</button>
      ${S.profiles.length > 1 ? `<button data-del="${p.id}">Borrar</button>` : ""}</span></li>`).join("");
  $("#modProfile").textContent = cur().name;
  $("#modGrid").innerHTML = MODULES.map(([id, n, d]) => `
    <label class="mod"><input type="checkbox" data-mod="${id}" ${cur().mods[id] ? "checked" : ""}>
    <span>${n}<small>${d}</small></span></label>`).join("");
  $("#optClose").checked = S.closeOnPlay;
}

$("#profileSel").onchange = (e) => { S.active = e.target.value; save(); render(); };
$("#addProfile").onclick = () => {
  const name = $("#newName").value.trim();
  if (!name) return;
  const id = "p" + Date.now();
  S.profiles.push({ id, name, mods: {} }); S.active = id; $("#newName").value = ""; save(); render();
};
document.addEventListener("click", (e) => {
  const u = e.target.dataset.use, d = e.target.dataset.del;
  if (u) { S.active = u; save(); render(); }
  if (d) { S.profiles = S.profiles.filter((p) => p.id !== d); if (S.active === d) S.active = S.profiles[0].id; save(); render(); }
});
document.addEventListener("change", (e) => {
  if (e.target.dataset.mod) { cur().mods[e.target.dataset.mod] = e.target.checked; save(); }
  if (e.target.id === "optClose") { S.closeOnPlay = e.target.checked; save(); }
});
$("#resetAll").onclick = () => { S = fresh(); save(); render(); };

$("#playBtn").onclick = async () => {
  const m = $("#msg"); m.className = "msg"; m.textContent = "";
  try {
    await invoke("launch_game");
    m.className = "msg ok"; m.textContent = "Abriendo Minecraft…";
    if (S.closeOnPlay) setTimeout(() => window.close(), 1500);
  } catch (err) { m.textContent = String(err); }
};
$("#packBtn").onclick = async () => {
  const m = $("#packMsg"); m.className = "msg";
  try { await invoke("import_pack", { path: $("#packPath").value }); m.className = "msg ok"; m.textContent = "Enviado a Minecraft para instalarse."; }
  catch (err) { m.textContent = String(err); }
};

(async () => {
  render();
  let ok = false;
  try { ok = await invoke("is_installed"); } catch {}
  $("#status").textContent = ok ? "Minecraft Bedrock detectado." : "No encuentro Minecraft Bedrock. Instálalo desde Microsoft Store o Xbox App.";
  $("#playBtn").disabled = !ok;
})();
