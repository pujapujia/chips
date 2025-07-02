require("dotenv").config();
const fetch = require("node-fetch");

module.exports = async (req, res) => {
  if (!process.env.GITHUB_REPOSITORY || !process.env.CLAIM_TOKEN) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const GITHUB_API_URL = `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/contents/claims.json`;
  const GITHUB_TOKEN = process.env.CLAIM_TOKEN;

  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "chips-faucet",
      },
    });

    if (response.status === 404) {
      return res.json({ claims: [] });
    }

    if (!response.ok) throw new Error("Failed to fetch claims");

    const data = await response.json();
    const content = JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
    const walletList = Object.keys(content).reverse();
    res.json({ claims: walletList });
  } catch (err) {
    console.error("History fetch error:", err.message);
    res.status(500).json({ error: "Failed to load history" });
  }
};
