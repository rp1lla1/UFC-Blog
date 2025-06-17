const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrapeAndSaveFights() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.goto("https://www.ufc.com/events", { waitUntil: "networkidle2" });

    const eventLink = await page.$eval("a[href*='/event/']", el => el.href);
    await page.goto(eventLink, { waitUntil: "networkidle2" });
    const eventName = await page.$eval("h1", el => el.innerText.trim());

    const fights = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll(".fight-card .c-listing-fight__content")).slice(0, 3);
      function formatName(name) {
        return name.toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      }
      return rows.map(row => {
        const names = row.querySelectorAll(".c-listing-fight__corner-name");
        const weightText = row.querySelector(".c-listing-fight__class")?.innerText.replace(/\s+/g, " ").trim() || "";
        const weightClass = weightText.replace(/#/g, " #");
        const ranks = weightClass.match(/#\d+/g) || [];
        const rank1 = ranks[0] || "";
        const rank2 = ranks[1] || "";
        const weightLabel = weightClass.replace(/#\d+/g, "").trim();
        const fighter1 = `${formatName(names[0]?.innerText || "")}${rank1 ? " (" + rank1.replace("#", "") + ")" : ""}`;
        const fighter2 = `${formatName(names[1]?.innerText || "")}${rank2 ? " (" + rank2.replace("#", "") + ")" : ""}`;
        const odds = row.querySelectorAll(".c-listing-fight__odds");
        return {
          fighter1,
          fighter2,
          weightClass: weightLabel,
          odds1: odds[0]?.innerText.trim(),
          odds2: odds[1]?.innerText.trim()
        };
      });
    });

    fs.writeFileSync("fights.json", JSON.stringify({ eventName, fights }, null, 2));
    console.log("✅ Fights updated at", new Date().toLocaleString());

  } catch (err) {
    console.error("❌ Scrape failed", err);
  } finally {
    await browser.close();
  }
}

scrapeAndSaveFights();
