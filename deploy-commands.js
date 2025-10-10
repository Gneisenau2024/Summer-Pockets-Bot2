import 'dotenv/config'; // まず dotenv を読み込む
import { REST, Routes } from 'discord.js';
import fs from 'fs';

(async () => {
  const TOKEN = process.env.DISCORD_TOKEN;  // .env の名前に合わせる
  const CLIENT_ID = process.env.CLIENT_ID;
  const GUILD_ID = process.env.GUILD_ID;

  console.log('TOKEN:', TOKEN);
  console.log('CLIENT_ID:', CLIENT_ID);
  console.log('GUILD_ID:', GUILD_ID);

  const commands = [];
  const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = (await import(`./commands/${file}`)).default;
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    console.log('⏳ スラッシュコマンドを登録中...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('✅ コマンド登録完了！');
  } catch (error) {
    console.error(error);
  }
})();
