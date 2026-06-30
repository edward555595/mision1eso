import { State } from "./state.js";
import { Renderer } from "../views/renderer.js";

export const Engine = {
  weekProgress(){
    if(!State.week) return null;
    if(!State.progress.weeks[State.week.id]){
      State.progress.weeks[State.week.id] = {page:0,xp:0,answers:{},results:{},mistakes:{},badges:[]};
    }
    return State.progress.weeks[State.week.id];
  },

  isUnlocked(id){
    if(id==="w1") return true;
    return !!State.progress.unlockedWeeks[id];
  },

  canAdvance(){
    if(!State.week) return true;
    const page = State.week.pages[State.page];
    if(!page || page.type !== "quiz") return true;
    const wp = this.weekProgress();
    return page.questions.every(q=>wp.results[q.id]?.correct);
  },

  norm(v){return String(v||"").trim().toLowerCase().replace(/\s+/g," ").replace(/;/g,",")},

  correct(q,v){
    if(q.free) return String(v||"").trim().length > 10;
    if(q.type==="number"){
      const n = parseFloat(String(v).replace(",","."));
      return !isNaN(n) && Math.abs(n - q.a) <= (q.tolerance || 0.0001);
    }
    if(Array.isArray(q.a)) return q.a.map(x=>this.norm(x)).includes(this.norm(v));
    return this.norm(v) === this.norm(q.a);
  },

  getValue(q){
    if(q.type==="choice"){
      const el = document.querySelector(`input[name="${q.id}"]:checked`);
      return el ? el.value : "";
    }
    return document.getElementById(q.id)?.value || "";
  },

  async check(){
    const page = State.week.pages[State.page];
    const wp = this.weekProgress();
    let missing = [];
    page.questions.forEach(q=>{
      const v = this.getValue(q);
      wp.answers[q.id] = v;
      if(!String(v).trim()) missing.push(q.id);
    });
    if(missing.length){
      missing.forEach(id=>document.getElementById("box_"+id)?.classList.add("unanswered"));
      Renderer.toast("Faltan respuestas.");
      return;
    }

    let all = true, gained = 0;
    page.questions.forEach(q=>{
      const v = wp.answers[q.id];
      const ok = this.correct(q,v);
      const r = wp.results[q.id] || {attempts:0, correct:false, topic:q.topic};
      if(!r.correct) r.attempts++;
      r.correct = ok; r.topic = q.topic;
      wp.results[q.id] = r;

      const box = document.getElementById("box_"+q.id);
      const fb = document.getElementById("fb_"+q.id);
      box.classList.remove("correct","wrong","unanswered");
      box.classList.add(ok ? "correct" : "wrong");
      fb.textContent = ok ? "✅ Correcto." : "❌ Revisa y vuelve a intentarlo.";

      if(ok && !r.xpAwarded){
        const xp = Math.max(2, Math.ceil((q.xp || 10) / r.attempts));
        r.xpAwarded = true;
        wp.xp += xp;
        State.progress.xp += xp;
        gained += xp;
      }
      if(!ok){
        all = false;
        wp.mistakes[q.topic] = (wp.mistakes[q.topic] || 0) + 1;
      }
    });

    if(all){
      if(page.badge && !wp.badges.includes(page.badge)){
        wp.badges.push(page.badge);
        if(!State.progress.badges.includes(page.badge)) State.progress.badges.push(page.badge);
      }
      document.getElementById("feedback").innerHTML = `<div class="box green">✅ Página completada. XP ganado: ${gained}. Ya puedes avanzar.</div>`;
    } else {
      document.getElementById("feedback").innerHTML = `<div class="box red">Aún hay errores. Debes corregir todos.</div>`;
    }
    await State.storage.save();
    Renderer.top();
    Renderer.nav();
  },

  async completeWeek(){
    if(!State.progress.completedWeeks[State.week.id]){
      State.progress.completedWeeks[State.week.id] = true;
      const i = State.course.weeks.findIndex(w=>w.id===State.week.id);
      const next = State.course.weeks[i+1];
      if(next) State.progress.unlockedWeeks[next.id] = true;
      await State.storage.save();
    }
  }
};

window.Engine = Engine;
