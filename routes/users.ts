import express from "express";
import axios from "axios";
const router = express.Router();

// GET /api/users/search?q=...&exclude_ids[]=...
router.get("/search", async (req, res) => {
  try {
    const { q, exclude_ids } = req.query;

    // Здесь токен из фронта (Bearer)
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "Нет токена" });

    // Запрос к реальному API
    const response = await axios.get("https://stan-messenger.ru/api/v1/users/search", {
      headers: { Authorization: token },
      params: { q, "exclude_ids[]": exclude_ids },
    });

    res.json(response.data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ message: err.message });
  }
});

export default router;
