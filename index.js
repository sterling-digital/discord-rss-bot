require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const Parser = require('rss-parser');
const parser = new Parser();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const FEED_URL = process.env.RSS_FEED_URL;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let latestItem = null;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  const channel = client.channels.cache.get(CHANNEL_ID);

  const checkFeed = async () => {
    const feed = await parser.parseURL(FEED_URL);
    if (!latestItem || feed.items[0].link !== latestItem) {
      latestItem = feed.items[0].link;
      channel.send(`📰 New post: ${feed.items[0].title} - ${feed.items[0].link}`);
    }
  };

  // Check every 5 minutes
  checkFeed();
  setInterval(checkFeed, 5 * 60 * 1000);
});

client.login(TOKEN);
