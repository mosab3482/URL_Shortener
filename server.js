const express = require("express");
const mongoose = require("mongoose");
const shortUrl = require("./models/shortUrl");
const { createClient } = require("redis");
const app = express();

const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/urlShortener";
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Redis connection
const redisClient = createClient({ url: REDIS_URL });
redisClient
  .connect()
  .then(() => console.log("Connected to Redis"))
  .catch((err) => console.error("Redis connection error:", err));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.get("/", async (req, res) => {
  try {
    const shortUrls = await shortUrl.find().sort({ createdAt: -1 });

    res.render("index", { shortUrls: shortUrls });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

app.post("/shortUrls", async (req, res) => {
  try {
    if (!req.body.fullUrl) return res.status(400).send("URL is required");
    const urlData = await shortUrl.create({ fullUrl: req.body.fullUrl });
    await redisClient.setEx(urlData.shortUrl, 86400, urlData.fullUrl);
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Could not create short URL");
  }
});

app.get("/:short", async (req, res) => {
  try {
    const url = req.params.short;
    const cachedUrl = await redisClient.get(url);
    if (cachedUrl) {
      console.log("Cache hit: " + url);
      shortUrl
        .findOneAndUpdate({ shortUrl: url }, { $inc: { clicks: 1 } })
        .exec();
      return res.redirect(cachedUrl);
    }
    console.log("Cache miss:", url);
    const urlData = await shortUrl.findOne({ shortUrl: url });
    if (urlData == null) return res.sendStatus(404);
    urlData.clicks++;
    await urlData.save();
    await redisClient.setEx(url, 86400, urlData.fullUrl);
    res.redirect(urlData.fullUrl);
  } catch (err) {
    res.status(500).send("Server error");
  }
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
