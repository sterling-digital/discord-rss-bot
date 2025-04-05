require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const Parser = require('rss-parser');
const parser = new Parser();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const FEED_URL = process.env.RSS_FEED_URL;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let latestItem = null;

const checkFeed = async () => {
  const feed = await parser.parseURL(FEED_URL);
  if (!latestItem || feed.items[0].link !== latestItem) {
    latestItem = feed.items[0].link;

    const embed = new EmbedBuilder()
      .setTitle(feed.items[0].title || "New RSS Item")
      .setURL(feed.items[0].link)
      .setDescription(feed.items[0].contentSnippet || "")
      .setTimestamp(new Date(feed.items[0].pubDate))
      .setFooter({ text: "From RSS Feed" });

    channel.send({ embeds: [embed] });
  }
};

  // Check every 5 minutes
  checkFeed();
  setInterval(checkFeed, 5 * 60 * 1000);
});

client.login(TOKEN);
