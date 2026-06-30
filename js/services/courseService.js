export const CourseService = {
  async loadManifest(){
    const res = await fetch("./data/course-manifest.json", {cache:"no-store"});
    return await res.json();
  },
  async loadWeek(weekMeta){
    const res = await fetch(weekMeta.file, {cache:"no-store"});
    return await res.json();
  }
};
