const express = require("express");
const mongoose = require("mongoose");
const shortUrl = require("./models/shortUrl");
const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/urlSortener");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.get("/", async (req, res) => {
  const shortUrls = await shortUrl.find();

  res.render("index", { shortUrls: shortUrls });
});

app.post("/shortUrls", async (req, res) => {
  await shortUrl.create({ fullUrl: req.body.fullUrl });
  res.redirect("/");
});

app.get("/:short", async (req, res) => {
  const url = req.params.short;
  const urlData = await shortUrl.findOne({ shortUrl: url });
  if (urlData == null) return res.sendStatus(404);
  urlData.clicks++;
  await urlData.save();
  res.redirect(urlData.fullUrl);
});
app.listen(5000);
