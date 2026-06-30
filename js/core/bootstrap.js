import { FirebaseService } from "../services/firebaseService.js";
import { CourseService } from "../services/courseService.js";
import { StorageService } from "../services/storageService.js";
import { Router } from "./router.js";
import { State } from "./state.js";

export const Bootstrap = {
  async start(){
    State.firebase = await FirebaseService.init();
    State.course = await CourseService.loadManifest();
    State.storage = new StorageService(State.firebase);

    await State.storage.watchAuth();

    Router.bind();

    if (State.user || State.profile?.role === "local") {
      Router.home();
    } else {
      Router.login();
    }
  }
};
