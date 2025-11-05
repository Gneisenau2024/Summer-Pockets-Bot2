import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageFlags
} from 'discord.js';
import { characters } from '../characters/summer_pockets.js';

export default {
  data: new SlashCommandBuilder()
    .setName('responses')
    .setDescription('指定したキャラ、または全キャラの返答一覧を表示します')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('キャラ名またはトリガー語を入力（例：しろは）')
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option.setName('all')
        .setDescription('全キャラを表示します')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const nameInput = interaction.options.getString('name');
    const showAll = interaction.options.getBoolean('all') || false;

    // ──────────────── 個別表示モード ────────────────
    if (!showAll && nameInput) {
      const character = characters.find(c =>
        c.name.includes(nameInput) ||
        c.triggers.some(t => t.includes(nameInput))
      );

      if (!character) {
        await interaction.editReply({
          content: `「${nameInput}」というキャラは見つかりませんでした。`
        });
        return;
      }

      const embed = buildCharacterEmbed(character);
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // ──────────────── 全キャラ表示モード ────────────────
    const embeds = characters.map(buildCharacterEmbed);
    let currentPage = 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('◀ 前へ')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('次へ ▶')
        .setStyle(ButtonStyle.Secondary)
    );

    const message = await interaction.editReply({
      embeds: [embeds[currentPage].setFooter({ text: `ページ 1/${embeds.length}` })],
      components: [row],
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 180_000
    });

    collector.on('collect', async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) {
        await btnInteraction.reply({
          content: 'この操作は実行者のみが行えます。',
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      if (btnInteraction.customId === 'prev') {
        currentPage = (currentPage - 1 + embeds.length) % embeds.length;
      } else if (btnInteraction.customId === 'next') {
        currentPage = (currentPage + 1) % embeds.length;
      }

      await btnInteraction.update({
        embeds: [embeds[currentPage].setFooter({ text: `ページ ${currentPage + 1}/${embeds.length}` })],
        components: [row]
      });
    });

    collector.on('end', async () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        row.components.map(button => ButtonBuilder.from(button).setDisabled(true))
      );
      await message.edit({ components: [disabledRow] });
    });
  }
};

// --- Embed構築関数 ---
function buildCharacterEmbed(character) {
  return new EmbedBuilder()
    .setTitle(`🌻 ${character.name}`)
    .addFields(
      { name: '固定返信', value: character.fixedResponses?.join('\n') || '（登録なし）' },
      { name: '返答パターン', value: character.responses?.join('\n') || '（登録なし）' },
    );
}
