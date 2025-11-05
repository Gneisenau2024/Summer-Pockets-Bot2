import { SlashCommandBuilder } from 'discord.js';
import { characters } from '../characters/summer_pockets.js';

export default {
  data: new SlashCommandBuilder()
    .setName('responses')
    .setDescription('指定したキャラの固定返信＋返答パターンを表示します')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('キャラ名またはトリガー語を入力（例：しろは）')
        .setRequired(true)
    ),

  async execute(interaction) {
    const nameInput = interaction.options.getString('name');
    const character = characters.find(c =>
      c.name === nameInput ||
      c.triggers.includes(nameInput)
    );

    if (!character) {
      await interaction.reply({
        content: `「${nameInput}」というキャラは見つかりませんでした。`,
        ephemeral: true
      });
      return;
    }

    const fixed = character.fixedReplies?.length
      ? character.fixedReplies.map(r => `・${r}`).join('\n')
      : '固定返信は登録されていません。';

    const resp = character.responses?.length
      ? character.responses.map(r => `・${r}`).join('\n')
      : '返答パターンは登録されていません。';

    const replyContent = `**${character.name}** の内容：\n\n` +
                         `🔹固定返信：\n${fixed}\n\n` +
                         `🔹返答パターン：\n${resp}`;

    await interaction.reply({
      content: replyContent,
      ephemeral: true
    });
  }
};
