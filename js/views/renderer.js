import { State } from "../core/state.js";
import { Engine } from "../core/engine.js";
import { Router } from "../core/router.js";

export const Renderer = {
  screen: document.getElementById("screen"),

  toast(msg){
    const t=document.createElement("div");
    t.className="toast";
    t.textContent=msg;
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),2300);
  },

  top(){
    document.getElementById("userLabel").textContent = State.profile?.name || State.user?.email || "Sin sesión";
    document.getElementById("xpLabel").textContent = State.progress.xp || 0;
    document.getElementById("badgeLabel").textContent = State.progress.badges?.length || 0;
  },

  nav(){
    document.getElementById("prevBtn").disabled = !State.week || State.page===0;
    document.getElementById("nextBtn").disabled = !State.week || State.page>=State.week.pages.length-1 || !Engine.canAdvance();
  },

  login(){
    this.top();
    this.screen.className = "screen hero";
    this.screen.innerHTML = `
      <h2>Acceso</h2>
      <p>Accede con tu correo y contraseña. Si tu usuario es profesor, entrarás directamente al panel docente.</p>
      <div class="grid">
        <div class="card">
          <h3>Alumno / Profesor</h3>
          <input id="email" type="email" placeholder="Email" autocomplete="username">
          <div style="display:flex; gap:8px; align-items:center;">
            <input id="password" type="password" placeholder="Contraseña" autocomplete="current-password" style="flex:1;">
            <button class="action secondary" type="button" onclick="Renderer.togglePassword()">Ver</button>
          </div>
          <button class="action" onclick="Renderer.doLogin()">Entrar</button>
          <button class="action secondary" onclick="Renderer.doRegister()">Crear cuenta</button>
          <div id="authFeedback" class="box red" style="display:none"></div>
        </div>
        <div class="card">
          <h3>Profesor</h3>
          <p>Inicia sesión con el usuario cuyo UID esté configurado como administrador.</p>
          <button class="action secondary" onclick="Renderer.teacher()">Panel profesor</button>
        </div>
      </div>`;
    document.getElementById("prevBtn").disabled = true;
    document.getElementById("nextBtn").disabled = true;
    document.getElementById("homeBtn").disabled = true;
  },

  togglePassword(){
    const input = document.getElementById("password");
    if(!input) return;
    input.type = input.type === "password" ? "text" : "password";
  },

  async doLogin(){
    if(!State.firebase.configured){
      const fb = document.getElementById("authFeedback");
      fb.style.display = "block";
      fb.textContent = "Firebase no está configurado. Revisa firebase/firebase-config.js en GitHub.";
      return;
    }

    const fb = document.getElementById("authFeedback");

    try{
      fb.style.display = "none";

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if(!email || !password) throw {code:"custom/empty"};

      await State.storage.login(email, password);
      await State.storage.loadCloud();

      if(State.firebase.adminUids.includes(State.user.uid)){
        await Renderer.teacher();
      } else {
        Router.home();
      }

    }catch(e){
      fb.style.display = "block";
      fb.textContent = "No se pudo iniciar sesión: " + this.authError(e);
    }
  },

  async doRegister(){
    if(!State.firebase.configured){
      const fb = document.getElementById("authFeedback");
      fb.style.display = "block";
      fb.textContent = "Firebase no está configurado. Revisa firebase/firebase-config.js en GitHub.";
      return;
    }

    const fb = document.getElementById("authFeedback");

    try{
      fb.style.display = "none";

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if(!email || !password) throw {code:"custom/empty"};

      await State.storage.register(email, password);
      await State.storage.loadCloud();

      if(State.firebase.adminUids.includes(State.user.uid)){
        await Renderer.teacher();
      } else {
        Router.home();
      }

    }catch(e){
      fb.style.display = "block";
      fb.textContent = "No se pudo crear la cuenta: " + this.authError(e);
    }
  },

  authError(e){
    const code = e?.code || "";
    if(code.includes("email-already-in-use")) return "ese correo ya está registrado. Pulsa Entrar.";
    if(code.includes("invalid-email")) return "el correo no tiene formato válido.";
    if(code.includes("weak-password")) return "la contraseña debe tener al menos 6 caracteres.";
    if(code.includes("operation-not-allowed")) return "en Firebase no está habilitado Correo electrónico/contraseña.";
    if(code.includes("network-request-failed")) return "problema de conexión.";
    if(code.includes("custom/empty")) return "debes escribir email y contraseña.";
    if(code.includes("unauthorized-domain")) return "el dominio de GitHub Pages no está autorizado en Firebase Authentication.";
    if(code.includes("invalid-credential")) return "correo o contraseña incorrectos, o el usuario no existe en este proyecto Firebase.";
    return e?.message || "error desconocido.";
  },

  async local(){
    this.toast("El modo local está desactivado. Debes crear cuenta o iniciar sesión.");
  },

  home(){
    if(State.firebase?.configured && !State.user){
      this.login();
      return;
    }
    this.top();
    this.screen.className = "screen hero";
    const cards = State.course.weeks.map(w=>{
      const unlocked = Engine.isUnlocked(w.id) && !w.placeholder;
      const done = !!State.progress.completedWeeks[w.id];
      return `<div class="card ${done?'done':''} ${!unlocked?'locked':''}">
        <h3>Semana ${w.number}</h3>
        <p><b>${w.title}</b></p>
        <p>${done?'✅ Completada':unlocked?'🟢 Disponible':'🔒 Bloqueada'}</p>
        <button class="action" ${unlocked?`onclick="Router.loadWeek('${w.id}')"`:'disabled'}>${done?'Revisar':'Empezar'}</button>
      </div>`;
    }).join("");
    this.screen.innerHTML = `
      <h2>Plan de 10 semanas</h2>
      <p>El sistema recuerda qué semanas has completado y desbloquea la siguiente automáticamente.</p>
      <div class="grid">${cards}</div>
      <button class="action secondary" onclick="Renderer.teacher()">Panel profesor</button>
      <button class="action danger" onclick="Renderer.logout()">Cerrar sesión</button>`;
    this.nav();
  },

  week(){
    this.top();
    const page = State.week.pages[State.page];
    const wp = Engine.weekProgress();
    this.screen.className = "screen " + (page.cls || "");
    if(page.type==="content" || page.type==="final"){
      const startButton = (page.type === "content" && State.page === 0)
        ? `<button class="action success" onclick="Router.next()">Comenzar diagnóstico</button>`
        : "";
      this.screen.innerHTML = `<h2>${page.title}</h2>${page.html}${startButton}${page.type==='final'?`
        <button class="action" onclick="Renderer.mentor()">Ver panel del mentor</button>
        <button class="action secondary" onclick="Renderer.downloadReport()">Descargar informe</button>
        <div id="mentor"></div>`:''}`;
      if(page.type==="final") Engine.completeWeek();
    } else {
      this.screen.innerHTML = `<h2>${page.title}</h2><p>${page.intro||""}</p>
        <div class="box blue"><b>🔒 Regla:</b> responde y acierta todo para avanzar.</div>
        ${page.questions.map((q,i)=>this.question(q,i,wp)).join("")}
        <button class="action" onclick="Engine.check()">Corregir página</button>
        <div id="feedback"></div>`;
    }
    this.nav();
  },

  question(q,i,wp){
    const saved = wp.answers[q.id] || "";
    const r = wp.results[q.id];
    const cls = r?.correct ? " correct" : "";
    if(q.type==="choice"){
      return `<div class="question${cls}" id="box_${q.id}"><b>${i+1}. ${q.q}</b>
        ${q.opts.map(o=>`<label><input type="radio" name="${q.id}" value="${o}" onchange="Renderer.capture('${q.id}',this.value)" ${saved===o?'checked':''}> ${o}</label>`).join("")}
        <div id="fb_${q.id}">${r?.correct?'✅ Correcto':''}</div></div>`;
    }
    return `<div class="question${cls}" id="box_${q.id}"><b>${i+1}. ${q.q}</b>
      <input type="text" value="${saved}" oninput="Renderer.capture('${q.id}',this.value)" id="${q.id}">
      <div id="fb_${q.id}">${r?.correct?'✅ Correcto':''}</div></div>`;
  },

  async capture(id,v){
    Engine.weekProgress().answers[id]=v;
    await State.storage.save();
  },

  mentor(){
    const wp = Engine.weekProgress();
    const rows = Object.entries(wp.results).map(([id,r])=>`<tr><td>${id}</td><td>${r.topic}</td><td>${r.attempts}</td><td>${r.correct?'✅':'❌'}</td></tr>`).join("");
    const mistakes = Object.entries(wp.mistakes).map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join("") || `<tr><td colspan="2">Sin errores</td></tr>`;
    document.getElementById("mentor").innerHTML = `
      <h3>Panel del mentor</h3>
      <table class="table"><tr><th>XP semana</th><td>${wp.xp}</td></tr><tr><th>Insignias</th><td>${wp.badges.join(", ")}</td></tr></table>
      <h3>Errores por tema</h3><table class="table"><tr><th>Tema</th><th>Errores</th></tr>${mistakes}</table>
      <h3>Intentos por ejercicio</h3><table class="table"><tr><th>Ejercicio</th><th>Tema</th><th>Intentos</th><th>Estado</th></tr>${rows}</table>`;
  },

  downloadReport(){
    const wp = Engine.weekProgress();
    const blob = new Blob([JSON.stringify({week:State.week.title, progress:wp}, null, 2)],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`informe_${State.week.id}.json`;
    a.click();
  },

  async teacher(){
    this.top();
    if(!State.firebase.configured){
      this.screen.className="screen";
      this.screen.innerHTML=`<h2>Panel profesor</h2><div class="box red">Firebase no está configurado.</div>`;
      return;
    }
    if(!State.user || !State.firebase.adminUids.includes(State.user.uid)){
      this.screen.className="screen";
      this.screen.innerHTML=`<h2>Panel profesor</h2><div class="box red">No tienes permisos de profesor.</div>`;
      return;
    }
    const students = await State.storage.listStudents();
    const rows = students.map(s=>{
      const p=s.progress||{};
      return `<tr><td>${s.profile?.name||s.profile?.email||s.id}</td><td>${p.xp||0}</td><td>${Object.keys(p.completedWeeks||{}).length}/10</td><td>${(p.badges||[]).length}</td></tr>`;
    }).join("");
    this.screen.className="screen";
    this.screen.innerHTML=`<h2>Panel profesor</h2><table class="table"><tr><th>Alumno</th><th>XP</th><th>Semanas</th><th>Insignias</th></tr>${rows}</table>`;
    this.nav();
  },

  async logout(){
    await State.storage.logout();
    location.reload();
  }
};

window.Renderer = Renderer;
