// spotifyService.js
import fetch from "node-fetch";

class SpotifyService {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.token = null;
    this.tokenExpiresAt = 0;
  }

  async getToken() {
    const now = Date.now();
    if (this.token && now < this.tokenExpiresAt) return this.token;

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")
      },
      body: "grant_type=client_credentials"
    });
    const data = await res.json();
    this.token = data.access_token;
    this.tokenExpiresAt = now + data.expires_in * 1000 - 10000; // 10 saniye önce yenile
    return this.token;
  }

  async searchTrack(song, artist) {
    const token = await this.getToken();
    const query = encodeURIComponent(`${song} ${artist}`);
    const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;
    
    const res = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    const data = await res.json();
    const track = data.tracks?.items?.[0];
    
    if (!track) return { spotifyLink: "", imageUrl: "", singer: "", song: "" };
    
    return {
      spotifyLink: track.external_urls?.spotify ?? "",
      imageUrl: track.album?.images?.[0]?.url ?? "",
      singer: track.artists?.[0]?.name ?? "",
      song: track.name ?? "" // burada track.album değil track.name olmalı
    };
  }  
}

export default SpotifyService;
