const agents = [
  {
    name: "Jett",
    role: "Duelist",
    rarity: "Legendary",
    region: "Korea",
    quote: "Watch this!",
    assets: ["image:jett.png", "sound:jett_ult.wav"],
  },
  {
    name: "Sage",
    role: "Sentinel",
    rarity: "Epic",
    region: "China",
    quote: "You will not kill my allies!",
    assets: ["image:sage.png", "voice:sage_barrier.mp3"],
  },
  {
    name: "Omen",
    role: "Controller",
    rarity: "Epic",
    region: "Unknown",
    quote: "I am everywhere.",
    assets: ["image:omen.png", "sound:omen_ult.wav"],
  },
  {
    name: "Phoenix",
    role: "Duelist",
    rarity: "Rare",
    region: "UK",
    quote: "Just take a seat.",
    assets: ["sound:phoenix_voice.mp3"],
  },
  {
    name: "Killjoy",
    role: "Sentinel",
    rarity: "Rare",
    region: "Germany",
    quote: "Relax, I have it under control.",
    assets: ["image:killjoy.png", "skin:turret_skin.vfx"],
  },
  {
    name: "Sova",
    role: "Initiator",
    rarity: "Common",
    region: "Russia",
    quote: "Nowhere to run!",
    assets: ["image:sova.png"],
  },
  {
    name: "Raze",
    role: "Duelist",
    rarity: "Rare",
    region: "Brazil",
    quote: "Fire in the hole!",
    assets: ["sound:raze_ult.wav"],
  },
  {
    name: "Brimstone",
    role: "Controller",
    rarity: "Common",
    region: "USA",
    quote: "Open up the sky!",
    assets: ["image:brimstone.png"],
  },
];

const rarityWeights = {
  Common: 0.55,
  Rare: 0.25,
  Epic: 0.15,
  Legendary: 0.05,
};

const pityThreshold = 30;
let pityCounter = 0;
const rollLog = [];

const rollLogEl = document.getElementById("roll-log");
const statsGridEl = document.getElementById("stats-grid");
const agentGridEl = document.getElementById("agent-grid");
const pityValueEl = document.getElementById("pity-value");
const featuredEl = document.getElementById("featured-card");
const searchInput = document.getElementById("search-input");
const roleFilter = document.getElementById("role-filter");
const rarityFilter = document.getElementById("rarity-filter");

const rollOneBtn = document.getElementById("roll-one");
const rollTenBtn = document.getElementById("roll-ten");
const resetPityBtn = document.getElementById("reset-pity");
const rotateFeaturedBtn = document.getElementById("rotate-featured");
const clearLogBtn = document.getElementById("clear-log");
const exportLogBtn = document.getElementById("export-log");

const rarityOrder = ["Common", "Rare", "Epic", "Legendary"];

const normalizeWeights = (weights) => {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  return Object.entries(weights).reduce((acc, [key, value]) => {
    acc[key] = value / total;
    return acc;
  }, {});
};

const pickRarity = () => {
  const normalized = normalizeWeights(rarityWeights);
  const roll = Math.random();
  let cumulative = 0;
  for (const [rarity, weight] of Object.entries(normalized)) {
    cumulative += weight;
    if (roll <= cumulative) {
      return rarity;
    }
  }
  return "Legendary";
};

const poolForRarity = (rarity) => {
  const pool = agents.filter((agent) => agent.rarity === rarity);
  return pool.length ? pool : agents;
};

const rollAgent = () => {
  pityCounter += 1;
  let guaranteed = false;
  let rarity = pickRarity();
  if (pityCounter >= pityThreshold) {
    rarity = "Legendary";
    guaranteed = true;
    pityCounter = 0;
  } else if (rarity === "Legendary") {
    pityCounter = 0;
  }
  const candidates = poolForRarity(rarity);
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  return {
    ...pick,
    rarity,
    timestamp: new Date(),
    guaranteed,
  };
};

const renderRollLog = () => {
  rollLogEl.innerHTML = "";
  rollLog.slice().reverse().forEach((entry) => {
    const card = document.createElement("div");
    card.className = `roll-card ${entry.rarity.toLowerCase()}`;
    card.innerHTML = `
      <div>
        <strong>${entry.name}</strong> · ${entry.role}
        <div class="meta">${entry.rarity} · ${entry.region}</div>
      </div>
      <div class="meta">${entry.guaranteed ? "GUARANTEED" : "ROLL"} · ${entry.timestamp.toLocaleTimeString()}</div>
    `;
    rollLogEl.appendChild(card);
  });
};

const renderStats = () => {
  const stats = rarityOrder.reduce((acc, rarity) => {
    acc[rarity] = 0;
    return acc;
  }, {});
  rollLog.forEach((entry) => {
    stats[entry.rarity] = (stats[entry.rarity] || 0) + 1;
  });
  statsGridEl.innerHTML = "";
  const total = rollLog.length || 1;
  rarityOrder.forEach((rarity) => {
    const count = stats[rarity];
    const percent = ((count / total) * 100).toFixed(1);
    const card = document.createElement("div");
    card.className = "stat-card";
    card.innerHTML = `
      <div class="label">${rarity}</div>
      <div class="value">${count}</div>
      <div class="meta">${percent}%</div>
    `;
    statsGridEl.appendChild(card);
  });
};

const renderAgents = () => {
  const query = searchInput.value.trim().toLowerCase();
  const roleValue = roleFilter.value;
  const rarityValue = rarityFilter.value;
  const filtered = agents.filter((agent) => {
    const matchesQuery = agent.name.toLowerCase().includes(query);
    const matchesRole = roleValue === "all" || agent.role === roleValue;
    const matchesRarity = rarityValue === "all" || agent.rarity === rarityValue;
    return matchesQuery && matchesRole && matchesRarity;
  });

  agentGridEl.innerHTML = "";
  filtered.forEach((agent) => {
    const card = document.createElement("div");
    card.className = `agent-card ${agent.rarity.toLowerCase()}`;
    card.innerHTML = `
      <div class="tag">${agent.rarity}</div>
      <strong>${agent.name}</strong>
      <div class="meta">${agent.role} · ${agent.region}</div>
      <div class="asset-list">Assets: ${agent.assets.join(", ")}</div>
      <div class="meta">"${agent.quote}"</div>
    `;
    agentGridEl.appendChild(card);
  });
};

const renderFeatured = () => {
  const pick = agents[Math.floor(Math.random() * agents.length)];
  featuredEl.innerHTML = `
    <strong>${pick.name}</strong>
    <div class="meta">${pick.role} · ${pick.region}</div>
    <div class="meta">${pick.rarity}</div>
    <p>"${pick.quote}"</p>
  `;
};

const updatePity = () => {
  pityValueEl.textContent = `${pityCounter} / ${pityThreshold}`;
};

const handleRolls = (count) => {
  for (let i = 0; i < count; i += 1) {
    rollLog.push(rollAgent());
  }
  renderRollLog();
  renderStats();
  updatePity();
};

rollOneBtn.addEventListener("click", () => handleRolls(1));
rollTenBtn.addEventListener("click", () => handleRolls(10));
resetPityBtn.addEventListener("click", () => {
  pityCounter = 0;
  updatePity();
});
rotateFeaturedBtn.addEventListener("click", renderFeatured);
clearLogBtn.addEventListener("click", () => {
  rollLog.length = 0;
  renderRollLog();
  renderStats();
});
exportLogBtn.addEventListener("click", () => {
  const payload = {
    generatedAt: new Date().toISOString(),
    pityThreshold,
    totalRolls: rollLog.length,
    rolls: rollLog.map((entry) => ({
      name: entry.name,
      rarity: entry.rarity,
      role: entry.role,
      guaranteed: entry.guaranteed,
      time: entry.timestamp.toISOString(),
    })),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "valorant-gacha-log.json";
  link.click();
  URL.revokeObjectURL(url);
});

searchInput.addEventListener("input", renderAgents);
roleFilter.addEventListener("change", renderAgents);
rarityFilter.addEventListener("change", renderAgents);

renderFeatured();
renderAgents();
renderStats();
updatePity();
