// Load articles dynamically from backend
fetch("articles.json")
  .then(res => res.json())
  .then(articles => {
    const list = document.getElementById("article-list");

    // Get the last 5 articles, newest at the top
    const recentArticles = articles.slice(-5).reverse();

    recentArticles.forEach(article => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = article.link;
      a.textContent = article.title;
      li.appendChild(a);
      list.appendChild(li);
    });
  })
  .catch(err => console.error("Failed to load articles:", err));

// Load fight card from backend
fetch("fights.json")
  .then(res => res.json())
  .then(data => {
    const { eventName, fights } = data;

    // Update event title
    const heading = document.getElementById("fight-title");
    heading.textContent = `Upcoming Fight Card: ${eventName}`;

    const tbody = document.getElementById("fight-body");
    fights.forEach(fight => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${fight.fighter1}</td>
        <td>${fight.odds1}</td>
        <td>${fight.weightClass}</td>
        <td>${fight.fighter2}</td>
        <td>${fight.odds2}</td>
      `;
      tbody.appendChild(row);
    });
  })
  .catch(err => {
    console.error("Fight data fetch failed:", err);
    document.getElementById("fight-section").innerHTML += "<p>⚠️ Could not load fight card.</p>";
  });

// Load picks from picks.js
const script = document.createElement("script");
script.src = "picks.js";
script.onload = () => {
  if (typeof picksData !== "undefined") {
    const { total, correct, history } = picksData;
    const winRate = total > 0 ? ((correct / total) * 100).toFixed(1) : "0.0";

    // Update summary text
    const stats = document.getElementById("picks-stats");
    stats.textContent = `Record: ${correct} / ${total} (${winRate}% correct)`;

    // Display only the last 5 picks
    const latest = history.slice(-5);
    const table = document.getElementById("picks-table");
    table.innerHTML = `
      <thead><tr><th>Event</th><th>Matchup</th><th>My Pick</th><th>Result</th></tr></thead>
      <tbody>
        ${latest.map(pick => `
          <tr>
            <td>${pick.event}</td>
            <td>${pick.matchup}</td>
            <td>${pick.pick}</td>
            <td>${pick.result ? "✅" : "❌"}</td>
          </tr>
        `).join("")}
      </tbody>
    `;

    // Draw pie chart for full record
    const ctx = document.getElementById("picks-chart").getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Correct", "Wrong"],
        datasets: [{
          data: [correct, total - correct],
          backgroundColor: ["#4CAF50", "#F44336"]
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: { size: 12 } }
          }
        }
      }
    });
  }
};
document.body.appendChild(script);