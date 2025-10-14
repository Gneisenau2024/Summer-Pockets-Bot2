// main.mjs - Discord Botのメインプログラム

// 必要なライブラリを読み込み
import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';

// キャラデータを読み込み
import { characters } from './characters/summer_pockets.js';

// .envファイルから環境変数を読み込み
dotenv.config();

// Discord Botクライアントを作成
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// --- コマンド読み込み ---
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    client.commands.set(command.default.data.name, command.default);
}

// --- Bot起動完了 ---
client.once('ready', () => {
    console.log(`🎉 ${client.user.tag} が正常に起動しました！`);
    console.log(`📊 ${client.guilds.cache.size} つのサーバーに参加中`);
});

// --- メッセージ反応 ---
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();
    let reacted = false;

    for (const char of characters) {
        if (reacted) break;

        if (char.triggers.some(word => content.includes(word))) {
            const line = char.replies[Math.floor(Math.random() * char.replies.length)];
            message.reply(`**${char.name}**：「${line}」`);
            console.log(`🎙 ${char.name} が反応 (${message.author.tag})`);
            reacted = true;
        }
    }
});

// --- スラッシュコマンド反応 ---
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        // コマンド実行
        await command.execute(interaction);
    } catch (error) {
        console.error('❌ コマンド実行エラー:', error);

        // 安全なエラーハンドリング
        try {
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({
                    content: '⚠️ コマンド実行中にエラーが発生しました。',
                });
            } else {
                await interaction.reply({
                    content: '⚠️ コマンド実行中にエラーが発生しました。',
                    flags: MessageFlags.Ephemeral, // 非公開メッセージ
                });
            }
        } catch (innerError) {
            console.error('⚠️ エラー応答にも失敗:', innerError);
        }
    }
});

// --- エラーハンドリング ---
client.on('error', (error) => {
    console.error('❌ Discord クライアントエラー:', error);
});

// --- プロセス終了時の処理 ---
process.on('SIGINT', () => {
    console.log('🛑 Botを終了しています...');
    client.destroy();
    process.exit(0);
});

// --- Discord ログイン ---
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN が .env ファイルに設定されていません！');
    process.exit(1);
}

console.log('🔄 Discord に接続中...');
client.login(process.env.DISCORD_TOKEN)
    .catch(error => {
        console.error('❌ ログインに失敗しました:', error);
        process.exit(1);
    });

// --- Express Webサーバー（Render用） ---
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({
        status: 'Bot is running! 🤖',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.listen(port, () => {
    console.log(`🌐 Web サーバーがポート ${port} で起動しました`);
});

import fetch from "node-fetch";

try {
  const res = await fetch("https://discord.com/api/v10/gateway");
  const data = await res.json();
  console.log("🌐 Discord Gateway に接続成功:", data.url);
} catch (err) {
  console.error("🚫 Discord Gateway への接続失敗:", err);
}
