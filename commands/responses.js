// commands/responses.js
import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
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
    const nameInput = interaction.options.getString('name');
    const showAll = interaction.options.getBoolean('all') || false;

    // ──────────────── 個別表示モード ────────────────
    if (!showAll && nameInput) {
      const character = characters.find(c =>
        c.name.includes(nameInput) || c.triggers.includes(nameInput)
      );

      if (!character) {
        await interaction.reply({
          content: `「${nameInput}」というキャラは見つかりませんでした。`,
          ephemeral: true
        });
        return;
      }

      const embed = buildCharacterEmbed(character);
      await interaction.reply({ embeds: [embed], ephemeral: true });
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

    const message = await interaction.reply({
      embeds: [embeds[currentPage]],
      components: [row],
      ephemeral: true,
      fetchReply: true
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000 // 1分間操作可能
    });

    collector.on('collect', async (btnInteraction) => {
      if (btnInteraction.customId === 'prev') {
        currentPage = (currentPage - 1 + embeds.length) % embeds.length;
      } else if (btnInteraction.customId === 'next') {
        currentPage = (currentPage + 1) % embeds.length;
      }

      await btnInteraction.update({
        embeds: [embeds[currentPage].setFooter({
          text: `Summer Pockets Bot | ページ ${currentPage + 1}/${embeds.length}`
        })],
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

// ──────────────── Embed作成関数 ────────────────
function buildCharacterEmbed(character) {
  const fixed = character.fixedReplies?.length
    ? character.fixedReplies.map(r => `・${r}`).join('\n')
    : '（登録なし）';

  const resp = character.responses?.length
    ? character.responses.map(r => `・${r}`).join('\n')
    : '（登録なし）';

  return new EmbedBuilder()
    .setColor(0x87CEEB)
    .setTitle(`🎐 ${character.name} の返答一覧`)
    .addFields(
      { name: '🌻 固定返信', value: fixed.slice(0, 1024) },
      { name: '💬 返答パターン', value: resp.slice(0, 1024) }
    )
    .setFooter({ text: `Summer Pockets Bot` })
    .setTimestamp();
}
