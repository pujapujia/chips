require("dotenv").config();
const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  if (!process.env.GITHUB_REPOSITORY || !process.env.CLAIM_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server misconfigured" }),
    };
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
      return {
        statusCode: 200,
        body: JSON.stringify({ claims: [] }),
      };
    }

    if (!response.ok) throw new Error("Failed to fetch claims");

    const data = await response.json();
    const content = JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
    const walletList = Object.keys(content).reverse();

    return {
      statusCode: 200,
      body: JSON.stringify({ claims: walletList }),
    };
  } catch (err) {
    console.error("History fetch error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to load history" }),
    };
  }
};
