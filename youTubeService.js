// youtubeService.js
import fetch from "node-fetch";

class YouTubeService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async searchVideo(song, artist) {
    const query = encodeURIComponent(`${song} ${artist}`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${this.apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    const videoId = data.items?.[0]?.id?.videoId;
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : "";
  }
}

export default YouTubeService;
