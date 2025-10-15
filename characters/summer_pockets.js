// characters/summer_pockets.js

export const characters = [
    {
        name: '鳴瀬しろは',
        triggers: ['しろは', 'しろはちゃん','しろは！'],
        replies: [
            '……うん<:Shiroha:1414220695474536500>',
            '……呼んだ？<a:Shiroha:1415269977002348589>',
            '……ふわぁ……ねむい',
            '……スイカバー、食べたい',
            '……!?',
            '……どすこいっ！',
            '……何してるの',
            '……ふーん',
            '……変なひと'
        ],
        // 特定の文章に対する固定返信
        specificReplies: [
            { trigger: ['スイカバー','すいかばー'], reply: ['食べたい…','くれるの？'] },
            { trigger: 'れいだーん', reply: 'れいげんやちこなれっ！' },
            { trigger: 'たぬき', reply: 'たばかったな' },
            { trigger: '釣れる？', reply: 'ぼちぼちです' },
            { trigger: 'ぼっち', reply: 'ぼっち言い過ぎ...' },
            { trigger: '', reply: '' },
            { trigger: '', reply: '' },
            { trigger: '', reply: '' },
            { trigger: '', reply: '' },
            { trigger: '', reply: '' },
        ],
    },
    {
        name: '久島鴎',
        triggers: ['かもめ', '鴎', '船', '冒険','鴎ちゃん','かもめちゃん'],
        replies: [
            'よーそろー！🌊',
            '行こう、世界の果てまで！',
            '鴎は今日も元気です！☀️',
            '風が、気持ちいいね！<a:Kamome:1423896551113232546>',
            'めぇー<:Kamome:1422216090532188220>',
            'ふふっ、来たね！それじゃあ、今日も元気よく、冒険にしゅっぱ～つ！'
        ],
        // 特定の文章に対する固定返信
        specificReplies: [
            { trigger: 'かもめぇ', reply: 'ちっさいぇをつけて呼ばないで欲しい！' },
            { trigger: 'むごっほ', reply: '出た！謎の発作むごっほ！' },
            { trigger: '', reply: '' },
            { trigger: '', reply: '' },
            { trigger: '', reply: '' },
            { trigger: '', reply: '' },
            { trigger: '', reply: '' },
        ],
    },
    {
        name: '空門蒼',
        triggers: ['蒼','あお'],
        replies: [
            'え、そ、それって…',
            'ん〜もう朝〜？',
            'おはよう',
            'エロちゃうわ！',
            'ええ',
            'かき氷〜',
        ],
        // 特定の文章に対する固定返信
        specificReplies: [
            { trigger: 'あっエロ本', reply: ['ど、どこどこ？'] },
            { trigger: 'おはよう蒼', reply: ['最初は優しくお願いしますー！','手篭めにするつもり！？'] },
            { trigger: '', reply: '' },
            { trigger: '', reply: '' },
            { trigger: '', reply: '' },
        ],
    },
    {
        name: '水織静久',
        triggers: ['しずく', '水織', 'お姉ちゃん'],
        replies: [
            'だめですよ、夜更かしは',
            'ふふっ、ちゃんとご飯食べました？',
            '……優しくしますね',
        ],
    },
    {
        name: '紬ヴェンダース',
        triggers: ['つむぎ', '紬ー', 'パリングルス', '約束','君はムテキなのー？'],
        replies: [
            'パリングルスはムテキでーす！',
            'ムテキでーす！',
            'むぎゅ？',
            '最後まで笑顔です！',
            'むぎゅぅ～',
        ],
    },
];
