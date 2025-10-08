// index.js
import express from "express";
import cors from "cors";
import { OpenAI } from "openai";
import SpotifyService from "./spotifyService.js";
import YouTubeService from "./youTubeService.js";
import dotenv from "dotenv";
dotenv.config();

// ---------------
// Config
// ---------------
const app = express();
const port = 3000;

// CORS (SwiftUI uygulamasının API'ye erişebilmesi için)
app.use(cors());
app.use(express.json());

// OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Spotify ve YouTube servisleri (clientId, clientSecret ve apiKey kendi bilgilerinle değiştir)
const spotifyService = new SpotifyService(  process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);
const youtubeService = new YouTubeService(process.env.YOUTUBE_API_KEY);

// ---------------
// API Endpoint
// ---------------
app.post("/api/song", async (req, res) => {
  const { Mood, MoodDsc } = req.body;

  const prompt = `
  User's mood: ${Mood}, description: ${MoodDsc}.
  Suggest only a single song.
  
  Rules:
  - Format: 'Artist;Song' (write nothing else).
  - Artist name and song title must never be the same.
  - Only give real, verifiable artist-song matches.
  - Only suggest songs you are sure about.
  - Always suggest exactly one song, do not leave it blank.
  - Make sure Artist and Song should be available and searchable on Youtube and 
  Spotify.
  `;
  

  try {
    // 1️⃣ OpenAI'den şarkıyı al
    const response = await openai.responses.create({
      model: "gpt-4.1-nano",
      input: prompt
    });

    const text = response.output_text ?? "Cevap alınamadı";
    const parts = text.split(";").map(p => p.trim());
    const tempSinger = parts[0] ?? "";
    const tempSong = parts[1] ?? "";

    // 2️⃣ Spotify üzerinden doğru link ve görsel al
    const { spotifyLink, imageUrl, singer, song } = await spotifyService.searchTrack(tempSong, tempSinger);

    // 3️⃣ YouTube üzerinden doğru link al
    const youtubeLink = await youtubeService.searchVideo(song, singer);

    // 4️⃣ JSON olarak döndür
    const songDetail = {
      singer,
      song,
      imageUrl,
      spotifyLink,
      youtubeLink
    };

    res.json({ songDetail });

  } catch (error) {
    console.error("API hatası:", error);
    res.status(500).json({ error: "API hatası" });
  }
});

// ---------------
// Server Start
// ---------------
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
