// commands/responses.js
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
    const nameInput = interaction.options.getString('name');
    const showAll = interaction.options.getBoolean('all') || false;

    // ──────────────── 個別表示モード ────────────────
    if (!showAll && nameInput) {
      const character = characters.find(c =>
        c.name.includes(nameInput) ||
        c.triggers.some(t => t.includes(nameInput))
      );

      if (!character) {
        await interaction.reply({
          content: `「${nameInput}」というキャラは見つかりませんでした。`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const embed = buildCharacterEmbed(character);
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral, });
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
      embeds: [embeds[currentPage].setFooter({ text: `ページ 1/${embeds.length}` })],
      components: [row],
      flags: MessageFlags.Ephemeral,
      fetchReply: true
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 180_000 // 3分間操作可能
    });

    collector.on('collect', async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) {
        await btnInteraction.reply({ content: 'この操作は実行者のみが行えます。', flags: MessageFlags.Ephemeral });
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

// ──────────────── Embed作成関数 ────────────────
function buildCharacterEmbed(character) {
  // 固定返信（specificReplies）
  const fixedReplies = character.specificReplies
    ? character.specificReplies.map(s =>
        `🎯 **${Array.isArray(s.trigger) ? s.trigger.join(' / ') : s.trigger}**\n　→ ${Array.isArray(s.reply) ? s.reply.join(' / ') : s.reply}`
      )
    : ['（登録なし）'];

  // 通常返信（replies）
  const normalReplies = character.replies?.length
    ? character.replies.map(r => `💬 ${r}`)
    : ['（登録なし）'];

  return new EmbedBuilder()
    .setColor(0x87CEEB)
    .setTitle(`🎐 ${character.name} の返答一覧`)
    .addFields(
      { name: '🌻 固定返信', value: fixedReplies.join('\n').slice(0, 1024) },
      { name: '💬 返答パターン', value: normalReplies.join('\n').slice(0, 1024) }
    )
    .setFooter({ text: 'Summer Pockets Bot' })
    .setTimestamp();
}
