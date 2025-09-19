// server.mjs или server.js (ESM)
import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = 3001;

// Разрешаем фронту обращаться к серверу
app.use(cors());
app.use(express.json());

app.get("/api/users/search", async (req, res) => {
  try {
    const { q, exclude_ids } = req.query;
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Нет токена Bearer" });
    }

    const response = await axios.get("https://stan-messenger.ru/api/v1/users/search", {
      headers: { Authorization: token },
      params: { q, "exclude_ids[]": exclude_ids },
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(err.response?.status || 500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});