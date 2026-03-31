export interface Video {
  id: string;
  title: string;
  category: string;
  type: "upload" | "embed";
  url: string;
  createdAt: string;
}

export function saveVideo(video: Video): void {
  const videos = JSON.parse(localStorage.getItem("untamedVideos") || "[]");
  videos.push(video);
  localStorage.setItem("untamedVideos", JSON.stringify(videos));
}

export function getVideos(): Video[] {
  return JSON.parse(localStorage.getItem("untamedVideos") || "[]");
}
