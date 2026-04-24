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
  await shortUrl.create({ full: req.body.fullUrl });
  res.redirect("/");
});

app.listen(5000);
