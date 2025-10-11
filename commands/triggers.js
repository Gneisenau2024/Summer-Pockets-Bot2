// commands/triggers.js
import { SlashCommandBuilder } from 'discord.js';
import { characters } from '../characters/summer_pockets.js';

export default {
  data: new SlashCommandBuilder()
    .setName('triggers')
    .setDescription('各キャラクターのトリガーワード一覧を表示します。'),

  async execute(interaction) {
    // キャラごとのトリガー一覧を整形
    const triggerText = characters.map(c => {
      return `**${c.name}**\n${c.triggers.map(t => `・${t}`).join('\n')}`;
    }).join('\n\n');

    // Discordの1メッセージ上限対策
    if (triggerText.length > 2000) {
      await interaction.reply({
        content: 'トリガー一覧が長すぎます。キャラを絞って確認してください。',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    await interaction.reply({
      content: `🎯 **登録されているトリガーワード一覧**\n\n${triggerText}`,
    });
  },
};
