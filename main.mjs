// main.mjs - Discord Botのメインプログラム

// 必要なライブラリを読み込み
import { Client, GatewayIntentBits, Collection, Events, MessageFlags } from 'discord.js';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';

// キャラデータを読み込み
import { characters } from './characters/summer_pockets.js';

//起動時の一瞬のエラーだけ無視
process.on('unhandledRejection', (err) => {
  if (!err) return;
  if (err.code === 10062) return; // Unknown interaction
  if (err.code === 40060) return; // Interaction already acknowledged
  console.error('🚨 Unhandled Rejection:', err);
});

// --- 直前の返信を記録するマップ（キャラ名ごと） ---
const lastReplies = new Map();

/**
 * 同じセリフを連続で出さないランダム返信選択関数
 */
function getRandomReply(charName, replies) {
    const list = Array.isArray(replies) ? replies : [replies];
    const last = lastReplies.get(charName);

    let candidates = list.filter(r => r !== last);
    if (candidates.length === 0) candidates = list;

    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    lastReplies.set(charName, selected);

    return selected;
}

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
client.once('clientReady', () => {
    console.log(`🎉 ${client.user.tag} が正常に起動しました！`);
    console.log(`📊 ${client.guilds.cache.size} つのサーバーに参加中`);
});

client.on('messageCreate', (message) => { 
    if (message.author.bot) return; 

    // --- メッセージを小文字化＆空白削除 ---
    const content = message.content.toLowerCase().replace(/\s/g, ''); 
    let reacted = false; 

    for (const char of characters) { 
        if (reacted) break; 

        // --- 特定文章チェック（部分一致 & 複数トリガー対応） --- 
        const specific = char.specificReplies?.find(item => {
            if (Array.isArray(item.trigger)) {
                // triggerが配列ならどれかにマッチすればOK
                return item.trigger.some(t =>
                    content.includes(t.toLowerCase().replace(/\s/g, '')));
            } else {
                
                // --- 特別条件: じゃんけん系 ---
        if (item.trigger === 'じゃんけん') { 
                    // 有効パターン（空白削除版）
                    const validJanken = ['じゃんけん', 'じゃんけん✊', 'じゃんけん✋', 'じゃんけん✌️'].map(v =>v.toLowerCase().replace(/\s/g, '')
                    );
                    return validJanken.includes(content); 
        }

        // それ以外は部分一致
        return content.includes(item.trigger.toLowerCase().replace(/\s/g, ''));   
    }   
});

        if (specific) {  
            const replyText = getRandomReply(char.name, specific.reply); 
            message.reply(`**${char.name}**：「${replyText}」`);  
            console.log(`${char.name} が特定文章に反応 (${message.author.tag})`);  
            reacted = true;  
            break;  
        }  

        // --- 通常ランダム返信（完全一致） --- 
        if (char.triggers.some(word => content === word.toLowerCase())) {  
            const line = getRandomReply(char.name, char.replies); 
            message.reply(`**${char.name}**：「${line}」`);  
            console.log(`🎙 ${char.name} がランダム反応（完全一致） (${message.author.tag})`);  
            reacted = true;  
            break;  
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
