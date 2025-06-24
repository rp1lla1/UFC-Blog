// generate-articles.js
const fs = require("fs");
const path = require("path");

const articlesDir = path.join(__dirname, "articles");
const outputPath = path.join(__dirname, "articles.json");

const files = fs.readdirSync(articlesDir);

const articles = files
  .filter(file => file.endsWith(".html"))
  .map(file => ({
    title: file.replace(".html", "").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    link: `articles/${file}`
  }));

fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2));
console.log("✅ articles.json generated");

