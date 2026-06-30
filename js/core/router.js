import { State } from "./state.js";
import { Renderer } from "../views/renderer.js";
import { Engine } from "./engine.js";
import { CourseService } from "../services/courseService.js";

export const Router = {
  bind(){
    document.getElementById("prevBtn").onclick = ()=>this.prev();
    document.getElementById("nextBtn").onclick = ()=>this.next();
    document.getElementById("homeBtn").onclick = ()=>this.home();
  },
  login(){ Renderer.login(); },
  home(){ State.week=null; State.page=0; Renderer.home(); },
  async loadWeek(id){
    const meta = State.course.weeks.find(w=>w.id===id);
    if(!meta || meta.placeholder || !Engine.isUnlocked(id)) return;
    State.week = await CourseService.loadWeek(meta);
    const wp = Engine.weekProgress();
    State.page = wp.page || 0;
    Renderer.week();
  },
  async next(){
    if(!Engine.canAdvance()){ Renderer.toast("Primero acierta todos los ejercicios."); return; }
    if(State.week && State.page < State.week.pages.length-1){
      State.page++;
      Engine.weekProgress().page = State.page;
      await State.storage.save();
      Renderer.week();
    }
  },
  async prev(){
    if(State.week && State.page>0){
      State.page--;
      Engine.weekProgress().page = State.page;
      await State.storage.save();
      Renderer.week();
    }
  }
};

window.Router = Router;
