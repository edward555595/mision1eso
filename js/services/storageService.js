import { State } from "../core/state.js";

const LOCAL_KEY = "mision1eso_v4_local_progress";

export class StorageService {
  constructor(firebase){ this.firebase = firebase; }

  async watchAuth(){
    if(!this.firebase.configured){
      State.user = null;
      State.profile = {name:"Modo local", role:"local"};
      State.progress = JSON.parse(localStorage.getItem(LOCAL_KEY) || JSON.stringify(State.progress));
      return;
    }
    return new Promise(resolve=>{
      this.firebase.api.onAuthStateChanged(this.firebase.auth, async user=>{
        State.user = user;
        if(user) await this.loadCloud();
        resolve();
      });
    });
  }

  async register(email,password){
    return await this.firebase.api.createUserWithEmailAndPassword(this.firebase.auth,email,password);
  }

  async login(email,password){
    return await this.firebase.api.signInWithEmailAndPassword(this.firebase.auth,email,password);
  }

  async logout(){
    if(this.firebase.configured) await this.firebase.api.signOut(this.firebase.auth);
    State.user = null;
  }

  async loadCloud(){
    const {doc,getDoc,setDoc,serverTimestamp} = this.firebase.api;
    const ref = doc(this.firebase.db,"students",State.user.uid);
    const snap = await getDoc(ref);
    if(snap.exists()){
      const data = snap.data();
      State.profile = data.profile || {name:State.user.email, role:"student"};
      State.progress = data.progress || State.progress;
    } else {
      State.profile = {name:State.user.email, email:State.user.email, role:"student", createdAt:Date.now()};
      await setDoc(ref,{profile:State.profile, progress:State.progress, updatedAt:serverTimestamp()});
    }
  }

  async save(){
    if(this.firebase.configured && State.user){
      const {doc,setDoc,serverTimestamp} = this.firebase.api;
      await setDoc(doc(this.firebase.db,"students",State.user.uid),{
        profile:State.profile || {name:State.user.email, email:State.user.email, role:"student"},
        progress:State.progress,
        updatedAt:serverTimestamp()
      },{merge:true});
    } else {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(State.progress));
    }
  }

  async listStudents(){
    if(!this.firebase.configured || !State.user) return [];
    const {collection,getDocs} = this.firebase.api;
    const snap = await getDocs(collection(this.firebase.db,"students"));
    const arr = [];
    snap.forEach(d=>arr.push({id:d.id,...d.data()}));
    return arr;
  }
}
