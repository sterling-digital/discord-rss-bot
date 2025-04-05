require('dotenv').config();

const http = require('http');
http.createServer(() => {}).listen(3000);

const { REST, Routes, SlashCommandBuilder, Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const Parser = require('rss-parser');
const parser = new Parser();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const FEED_URL = process.env.RSS_FEED_URL;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let latestItem = null;

// 🟢 This runs when the bot logs in
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  const channel = client.channels.cache.get(CHANNEL_ID);

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

  // Start the periodic check
  checkFeed();
  setInterval(checkFeed, 5 * 60 * 1000);
});

// 🟢 Slash command handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'latest') {
    try {
      await interaction.deferReply(); // Acknowledge first, prevents timeouts

      const feed = await parser.parseURL(FEED_URL);
      const item = feed.items[0];

      const embed = new EmbedBuilder()
        .setTitle(item.title || "Latest RSS Item")
        .setURL(item.link)
        .setDescription(item.contentSnippet || "")
        .setTimestamp(new Date(item.pubDate))
        .setFooter({ text: "From RSS Feed" });

      await interaction.editReply({ embeds: [embed] }); // Now send the embed safely
    } catch (err) {
      console.error("Error handling /latest command:", err);
    }
  }
});

// 🟢 Register the slash command
const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  try {
    console.log('🔧 Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      {
        body: [
          new SlashCommandBuilder()
            .setName('latest')
            .setDescription('Post the latest RSS feed item')
            .toJSON()
        ],
      }
    );
    console.log('✅ Slash command registered');
  } catch (err) {
    console.error('Error registering commands:', err);
  }
})();

client.login(TOKEN);
