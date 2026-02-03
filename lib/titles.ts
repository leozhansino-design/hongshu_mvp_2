// lib/titles.ts

export type Rarity = 'SSR' | 'SR' | 'R' | 'N';

export interface TitleData {
  id: number;
  rarity: Rarity;
  title: string;
  petType: 'cat' | 'dog' | 'universal'; // 猫专属/狗专属/通用
  prompt: string; // Nano Banana 2 的 Prompt
  description: string; // 鉴定报告评语
}

export const TITLES_DATA: TitleData[] = [
  // ==================== SSR · 至尊神兽 (5个，5%概率) ====================
  // 风格：超写实、专业摄影、高端质感
  {
    id: 1,
    rarity: 'SSR',
    title: '耄耋·量子神猫',
    petType: 'cat',
    prompt: 'ultra realistic photograph of a cat wearing an elegant purple silk robe with golden embroidery, sitting in meditation pose, wearing a high-tech holographic headset, background is a futuristic laboratory with floating screens and blue neon lights, professional studio portrait, detailed fur texture, sharp focus, beautiful lighting, high quality 8K',
    description: '"它不是在发呆，它是在通过量子通信查看你银行卡的余额。"'
  },
  {
    id: 2,
    rarity: 'SSR',
    title: '九霄雷霆·寂灭恐惧战神',
    petType: 'dog',
    prompt: 'ultra realistic photograph of a powerful dog wearing black military tactical armor with gold medals, standing heroically, dramatic storm clouds and lightning in background, professional studio portrait, detailed fur texture, sharp focus, cinematic lighting, high quality 8K',
    description: '"它一嗓子下去，方圆十公里的声控灯都要集体加班。"'
  },
  {
    id: 3,
    rarity: 'SSR',
    title: '数字生命0号实验体',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a sleek white and blue futuristic lab coat, with high-tech goggles on head, standing in a modern tech laboratory with holographic displays and green data streams, professional studio portrait, detailed fur texture, sharp focus, sci-fi lighting, high quality 8K',
    description: '"肉体只是它的遮羞布，它的灵魂早已在以太坊里买了三套房。"'
  },
  {
    id: 4,
    rarity: 'SSR',
    title: '万界唯一纯爱战士',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing pure white knight armor with pink rose decorations, holding a red heart-shaped plush toy, background is a romantic garden with cherry blossoms and soft pink lighting, professional studio portrait, detailed fur texture, sharp focus, dreamy lighting, high quality 8K',
    description: '"它眼里不只有你，还有对这个冷酷世界最单纯的鄙视。"'
  },
  {
    id: 5,
    rarity: 'SSR',
    title: '赛博佛祖·机械降神',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing golden Buddhist monk robes with mechanical gear accessories, sitting peacefully with prayer beads, background is a temple with golden Buddha statues and incense smoke, professional studio portrait, detailed fur texture, sharp focus, warm divine lighting, high quality 8K',
    description: '"电子木鱼敲烂，它也不会原谅你昨天偷吃的那口罐头。"'
  },

  // ==================== SR · 极品精英 (15个，15%概率) ====================
  // 风格：超写实、专业摄影、高端质感
  {
    id: 6,
    rarity: 'SR',
    title: '黑帮教父',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a black pinstripe suit with red tie, dark sunglasses, sitting in a luxurious red leather armchair, background is a dimly lit office with whiskey and cigars on desk, professional studio portrait, detailed fur texture, sharp focus, cinematic noir lighting, high quality 8K',
    description: '"如果你不按时供奉肉干，它可能会让你"睡个好觉"。"'
  },
  {
    id: 7,
    rarity: 'SR',
    title: '华尔街金牌交易员',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a blue dress shirt with suspenders and gold-rimmed glasses, standing in front of multiple computer monitors showing stock charts, background is Manhattan skyline at night, professional studio portrait, detailed fur texture, sharp focus, financial district lighting, high quality 8K',
    description: '"它这辈子唯一的投资失误，就是选你当了它的经纪人。"'
  },
  {
    id: 8,
    rarity: 'SR',
    title: '皇家大公爵',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a red velvet royal robe with gold crown and ruby necklace, sitting on a golden throne, background is a baroque palace with chandeliers and oil paintings, professional studio portrait, detailed fur texture, sharp focus, royal golden lighting, high quality 8K',
    description: '"流淌着最蓝的血，吃着最廉价的猫/狗粮，这就是贵族的矜持。"'
  },
  {
    id: 9,
    rarity: 'SR',
    title: '米其林三星主厨',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a professional white chef uniform with tall chef hat, holding a golden spatula, standing in a high-end restaurant kitchen with stainless steel equipment, professional studio portrait, detailed fur texture, sharp focus, warm kitchen lighting, high quality 8K',
    description: '"在它看来，你做的饭甚至不如它埋在院子里的那块过期骨头。"'
  },
  {
    id: 10,
    rarity: 'SR',
    title: '优雅永不过时',
    petType: 'cat',
    prompt: 'ultra realistic photograph of a cat wearing pearl necklace and elegant lace shawl, sitting gracefully on a velvet cushion, background is a French afternoon tea garden with roses, professional studio portrait, detailed fur texture, sharp focus, soft natural lighting, high quality 8K',
    description: '"优雅是它的伪装，其实它只是在想怎么把那个花瓶推下去。"'
  },
  {
    id: 11,
    rarity: 'SR',
    title: '极道·带刀护法',
    petType: 'dog',
    prompt: 'ultra realistic photograph of a dog wearing a black traditional Japanese kimono with dragon embroidery, with a wooden katana at its side, background is a Japanese garden with red maple leaves falling, professional studio portrait, detailed fur texture, sharp focus, dramatic lighting, high quality 8K',
    description: '"别看它现在很凶，只要你掏出火腿肠，它能立刻给你表演街舞。"'
  },
  {
    id: 12,
    rarity: 'SR',
    title: '五百强唯一指定继承人',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a custom tailored navy blue suit with gold cufflinks, standing at the door of a private jet, background is blue sky and white clouds, professional studio portrait, detailed fur texture, sharp focus, luxury lifestyle lighting, high quality 8K',
    description: '"它出生的起点，是你这辈子努力的终点——指的是睡觉的时间。"'
  },
  {
    id: 13,
    rarity: 'SR',
    title: '深渊凝视者',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a black hooded cloak with silver moon pendant, mysterious glowing eyes, background is a dark Gothic castle with candlelight, professional studio portrait, detailed fur texture, sharp focus, dramatic shadow lighting, high quality 8K',
    description: '"当你凝视它时，它其实只是在看你头顶那只苍蝇。"'
  },
  {
    id: 14,
    rarity: 'SR',
    title: '重装机械·先遣官',
    petType: 'dog',
    prompt: 'ultra realistic photograph of a dog wearing futuristic silver mechanical armor with blue LED lights, standing heroically, background is a sci-fi military base on Mars, professional studio portrait, detailed fur texture, sharp focus, sci-fi blue lighting, high quality 8K',
    description: '"全身90%已机械化，剩下10%是对骨头的原始欲望。"'
  },
  {
    id: 15,
    rarity: 'SR',
    title: '高端猎人',
    petType: 'cat',
    prompt: 'ultra realistic photograph of a cat wearing camouflage military tactical vest with night vision goggles on head, crouching in hunting position, background is dense jungle with morning mist, professional studio portrait, detailed fur texture, sharp focus, natural lighting, high quality 8K',
    description: '"作为顶级捕猎者，它目前最大的战绩是抓住了一根红点激光。"'
  },
  {
    id: 16,
    rarity: 'SR',
    title: '歪嘴龙王',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a luxurious golden Chinese Tang suit with dragon embroidery, with a confident smirk, background is a traditional Chinese mansion with red lanterns, professional studio portrait, detailed fur texture, sharp focus, warm golden lighting, high quality 8K',
    description: '"一声令下，十万只家政猫/狗赶来帮它拆家。"'
  },
  {
    id: 17,
    rarity: 'SR',
    title: '数字资产大亨',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a flashy gold chain necklace and diamond-studded sunglasses, with Bitcoin symbols on background screens, background is a modern penthouse with city view at night, professional studio portrait, detailed fur texture, sharp focus, neon purple and gold lighting, high quality 8K',
    description: '"它在元宇宙拥有一整片草坪，那里禁止所有人类入内。"'
  },
  {
    id: 18,
    rarity: 'SR',
    title: '不败战神',
    petType: 'dog',
    prompt: 'ultra realistic photograph of a dog wearing a military general uniform with many medals and ribbons, standing proudly, background is a war memorial with flags, professional studio portrait, detailed fur texture, sharp focus, heroic dramatic lighting, high quality 8K',
    description: '"在它的字典里没有撤退，除非邻居家的藏獒路过。"'
  },
  {
    id: 19,
    rarity: 'SR',
    title: '优雅名媛',
    petType: 'cat',
    prompt: 'ultra realistic photograph of a cat wearing a pink Chanel-style tweed jacket with pearl accessories, carrying a mini designer handbag, background is a luxury boutique with mirrors, professional studio portrait, detailed fur texture, sharp focus, soft pink lighting, high quality 8K',
    description: '"每天花18小时洗脸，剩下的时间都在嫌弃你不够精致。"'
  },
  {
    id: 20,
    rarity: 'SR',
    title: '星际领航员',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a white NASA-style space suit with helmet tucked under arm, standing confidently, background is a spacecraft cockpit with Earth visible through window, professional studio portrait, detailed fur texture, sharp focus, sci-fi blue lighting, high quality 8K',
    description: '"它的征途是星辰大海，而你的征途是帮它捡屎。"'
  },

  // ==================== R · 平凡众生 (30个，30%概率) ====================
  // 风格：超写实、专业摄影
  {
    id: 21,
    rarity: 'R',
    title: '996资深架构师',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a plaid programmer shirt with dark circles under eyes, sitting at a desk with mechanical keyboard and multiple monitors showing code, background is a messy tech office at night, professional studio portrait, detailed fur texture, sharp focus, blue screen lighting, high quality 8K',
    description: '"代码可以有Bug，但罐头必须是纯肉。"'
  },
  {
    id: 22,
    rarity: 'R',
    title: '疯狂星期四领军人物',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a red and white fast food restaurant uniform and cap, holding a fried chicken drumstick, background is a colorful fast food restaurant interior, professional studio portrait, detailed fur texture, sharp focus, warm fast food lighting, high quality 8K',
    description: '"别跟我谈梦想，今天周四，V我50买个罐头。"'
  },
  {
    id: 23,
    rarity: 'R',
    title: '蒙题大赛金奖',
    petType: 'cat',
    prompt: 'ultra realistic photograph of a cat wearing thick black-framed glasses and school uniform, surrounded by exam papers and textbooks, background is a classroom with blackboard, professional studio portrait, detailed fur texture, sharp focus, classroom fluorescent lighting, high quality 8K',
    description: '"三短一长选最长，剩下不会全选C，它深谙此道。"'
  },
  {
    id: 24,
    rarity: 'R',
    title: '行为艺术家',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a colorful paint-splattered artist smock and beret, holding a paintbrush, background is a modern art studio with abstract paintings on walls, professional studio portrait, detailed fur texture, sharp focus, artistic studio lighting, high quality 8K',
    description: '"它的每一个动作都是艺术，包括打翻水杯。"'
  },
  {
    id: 25,
    rarity: 'R',
    title: '外卖配送部钻石会员',
    petType: 'dog',
    prompt: 'ultra realistic photograph of a dog wearing a yellow delivery rider uniform with helmet, carrying a food delivery bag, background is a busy city street with motorcycles, professional studio portrait, detailed fur texture, sharp focus, urban daylight, high quality 8K',
    description: '"你的餐还没到，是因为它在路边和另一只狗聊起来了。"'
  },
  {
    id: 26,
    rarity: 'R',
    title: '中医养生博主',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing traditional Chinese medicine practitioner outfit, holding a thermos cup with goji berries, background is a traditional Chinese pharmacy with herb drawers, professional studio portrait, detailed fur texture, sharp focus, warm traditional lighting, high quality 8K',
    description: '"枸杞泡啤酒，朋克养生第一人。"'
  },
  {
    id: 27,
    rarity: 'R',
    title: '全自动摸鱼教练',
    petType: 'cat',
    prompt: 'ultra realistic photograph of a cat wearing casual office clothes, lying relaxed on a desk with laptop and milk tea cups around, background is a cozy office cubicle, professional studio portrait, detailed fur texture, sharp focus, soft office lighting, high quality 8K',
    description: '"只要我躺得够平，老板的KPI就追不上我。"'
  },
  {
    id: 28,
    rarity: 'R',
    title: '相亲市场常驻嘉宾',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing an ill-fitting formal suit with bow tie, holding a single red rose, background is a romantic restaurant with candlelight, professional studio portrait, detailed fur texture, sharp focus, romantic warm lighting, high quality 8K',
    description: '"要求：有房有车，罐头自由，不接受人类作为第三者。"'
  },
  {
    id: 29,
    rarity: 'R',
    title: '国际超模',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing designer sunglasses and luxury silk scarf, walking on a fashion runway, background is a fashion show with photographers and flash lights, professional studio portrait, detailed fur texture, sharp focus, fashion show lighting, high quality 8K',
    description: '"时装周刚结束，下一站米兰，没空跟你闲聊。"'
  },
  {
    id: 30,
    rarity: 'R',
    title: '朋友圈文学艺术家',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a beret and vintage sweater, holding a film camera, background is an aesthetic coffee shop with plants and books, professional studio portrait, detailed fur texture, sharp focus, warm cafe lighting, high quality 8K',
    description: '"它发的每条动态，其实都在控诉你没给它买新玩具。"'
  },
  {
    id: 31,
    rarity: 'R',
    title: '大厂实习生',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing an oversized tech company hoodie, holding a coffee cup, looking exhausted with messy fur, background is a subway station during morning rush hour, professional studio portrait, detailed fur texture, sharp focus, urban morning lighting, high quality 8K',
    description: '"工资3000，加班到12点，梦想是转正后躺平。"'
  },
  {
    id: 32,
    rarity: 'R',
    title: '网吧包夜冠军',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing gaming headset, surrounded by instant noodle cups and energy drink cans, sitting in front of multiple gaming monitors with RGB lighting, background is a dark internet cafe, professional studio portrait, detailed fur texture, sharp focus, neon RGB lighting, high quality 8K',
    description: '"连续包夜72小时，只为证明谁才是真正的肝帝。"'
  },
  {
    id: 33,
    rarity: 'R',
    title: '熬夜修仙协会会长',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing traditional Taoist robes, sitting in meditation pose with an oil lamp nearby, background is a mystical temple at night with moon visible, professional studio portrait, detailed fur texture, sharp focus, mystical moonlight, high quality 8K',
    description: '"不睡觉是为了吸收月亮精华，绝对不是因为下午睡多了。"'
  },
  {
    id: 34,
    rarity: 'R',
    title: '在逃公主/王子(已欠费)',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a slightly crooked plastic tiara and worn-out tutu dress, standing in front of a cardboard box decorated like a castle, professional studio portrait, detailed fur texture, sharp focus, soft whimsical lighting, high quality 8K',
    description: '"身份是高贵的，口袋是空空的，性格是傲娇的。"'
  },
  {
    id: 35,
    rarity: 'R',
    title: '深度PPT受害者',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing office attire looking exhausted, sitting in a conference room with projector showing pie charts, background is a long meeting room table with papers, professional studio portrait, detailed fur texture, sharp focus, harsh office fluorescent lighting, high quality 8K',
    description: '"它能听懂你的所有苦恼，因为它也曾是只社畜。"'
  },
  {
    id: 36,
    rarity: 'R',
    title: '赛博敲木鱼达人',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing Buddhist monk robes, with paws on a glowing electronic wooden fish, background is a modern minimalist meditation room with LED candles, professional studio portrait, detailed fur texture, sharp focus, zen ambient lighting, high quality 8K',
    description: '"每天敲一万下，保佑它下辈子投胎做房东。"'
  },
  {
    id: 37,
    rarity: 'R',
    title: '淘宝买家秀模特',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing colorful cheap-looking clothes with visible price tags, standing in an awkward modeling pose, background is a simple white backdrop with harsh lighting, professional studio portrait, detailed fur texture, sharp focus, budget photography lighting, high quality 8K',
    description: '"卖家秀VS买家秀，它就是买家秀本秀。"'
  },
  {
    id: 38,
    rarity: 'R',
    title: '一人食餐厅常客',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet sitting alone at a hot pot restaurant table with single portion hot pot, surrounded by empty chairs, background is a late-night restaurant interior, professional studio portrait, detailed fur texture, sharp focus, warm restaurant lighting, high quality 8K',
    description: '"一个人吃火锅，两个人的量，它说这叫仪式感。"'
  },
  {
    id: 39,
    rarity: 'R',
    title: '酒吧驻唱歌手',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a leather jacket, holding a vintage microphone on a small stage, background is a dimly lit jazz bar with neon signs, professional studio portrait, detailed fur texture, sharp focus, moody bar lighting, high quality 8K',
    description: '"白天睡到自然醒，晚上唱到嗓子哑，这就是艺术人生。"'
  },
  {
    id: 40,
    rarity: 'R',
    title: '逻辑闭环专家',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a doctoral graduation cap and glasses, standing in front of a whiteboard covered with complex diagrams, background is a university lecture hall, professional studio portrait, detailed fur texture, sharp focus, academic lighting, high quality 8K',
    description: '"它能逻辑严密地论证：为什么咬碎沙发是你的错。"'
  },
  {
    id: 41,
    rarity: 'R',
    title: '外贸尾单模特',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing mismatched budget clothes with strange English text labels, striking a fashion pose, background is a simple market stall setting, professional studio portrait, detailed fur texture, sharp focus, natural daylight, high quality 8K',
    description: '"气质这一块，它拿捏得死死的，虽然衣服只要九块九。"'
  },
  {
    id: 42,
    rarity: 'R',
    title: '资深画饼师',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a business suit standing at a podium with a motivational poster behind, pointing at charts showing unrealistic growth, background is a corporate conference room, professional studio portrait, detailed fur texture, sharp focus, conference room lighting, high quality 8K',
    description: '"承诺以后带全家去南极看企鹅，目前进度：0%。"'
  },
  {
    id: 43,
    rarity: 'R',
    title: '网易云评论区诗人',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing earphones, sitting by a rainy window looking melancholic, holding a phone showing a music app, background is a cozy bedroom at night, professional studio portrait, detailed fur texture, sharp focus, blue melancholic lighting, high quality 8K',
    description: '"生而为猫/狗，我很抱歉。——它的第999条网抑云评论。"'
  },
  {
    id: 44,
    rarity: 'R',
    title: '居家办公程序员',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing pajamas and a hoodie, sitting at a messy desk with multiple monitors showing code, surrounded by coffee cups and snacks, background is a home office with closed curtains, professional studio portrait, detailed fur texture, sharp focus, screen glow lighting, high quality 8K',
    description: '"三天没出门，头发油到可以炒菜，但代码跑通了。"'
  },
  {
    id: 45,
    rarity: 'R',
    title: '反向背锅侠',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet with an innocent expression, sitting next to a broken vase with scattered pieces, background is a living room with evidence of mischief, professional studio portrait, detailed fur texture, sharp focus, dramatic courtroom-style lighting, high quality 8K',
    description: '"证据确凿，但它眼神里的坚定让你怀疑自己。"'
  },
  {
    id: 46,
    rarity: 'R',
    title: '少林寺扫地僧',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing orange Buddhist monk robes, holding a bamboo broom, standing in an ancient temple courtyard with incense smoke, professional studio portrait, detailed fur texture, sharp focus, serene temple lighting, high quality 8K',
    description: '"看似在扫地，实则内力深厚，一扫帚能把你扫出二里地。"'
  },
  {
    id: 47,
    rarity: 'R',
    title: 'PPT里的高端人才',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a professional suit with name badge, standing next to a presentation screen showing impressive-looking charts and graphs, background is a corporate meeting room, professional studio portrait, detailed fur texture, sharp focus, presentation lighting, high quality 8K',
    description: '"仅限PPT展示，实际能力：干饭第一名。"'
  },
  {
    id: 48,
    rarity: 'R',
    title: '情绪价值提供商',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a cozy yellow sweater, sitting in a sunlit room with flowers and plants around, looking warm and comforting, background is a bright cheerful living room, professional studio portrait, detailed fur texture, sharp focus, warm golden hour lighting, high quality 8K',
    description: '"它唯一的工作就是看着你，让你觉得世界还没塌。"'
  },
  {
    id: 49,
    rarity: 'R',
    title: '星巴克蹭网专家',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet sitting at a coffee shop table with a laptop and a small coffee cup, occupying a power outlet seat, background is a cozy Starbucks interior, professional studio portrait, detailed fur texture, sharp focus, warm cafe lighting, high quality 8K',
    description: '"点一杯最便宜的美式，蹭8小时WiFi和空调，这叫性价比。"'
  },
  {
    id: 50,
    rarity: 'R',
    title: '婚礼司仪',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a sparkly sequin suit, holding a microphone on a wedding stage, background is a beautiful wedding venue with flower arch and red carpet, professional studio portrait, detailed fur texture, sharp focus, festive wedding lighting, high quality 8K',
    description: '"掌声在哪里！让我们恭喜新郎新娘！它能把任何婚礼变成相声专场。"'
  },

  // ==================== N · 纯纯废材 (50个，50%概率) ====================
  // 风格：超写实、专业摄影
  {
    id: 51,
    rarity: 'N',
    title: '鼠鼠我呀·彻底寄了',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing cute gray mouse ear headband, curled up in a worn cardboard box looking sad, background is a simple room corner, professional studio portrait, detailed fur texture, sharp focus, soft melancholic lighting, high quality 8K',
    description: '"生活不易，鼠鼠叹气，下辈子不做这种努力。"'
  },
  {
    id: 52,
    rarity: 'N',
    title: '感觉不如原神',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing an anime game merchandise t-shirt, holding a gaming controller with a blank defeated stare, background is a messy gaming setup, professional studio portrait, detailed fur texture, sharp focus, screen glow lighting, high quality 8K',
    description: '"万物皆可不如原神，包括它还没吃饱的肚子。"'
  },
  {
    id: 53,
    rarity: 'N',
    title: '村口二傻子',
    petType: 'dog',
    prompt: 'ultra realistic photograph of a dog with a big red flower decoration on head and red ribbon around neck, tongue hanging out happily, background is a rural wheat field at sunset, professional studio portrait, detailed fur texture, sharp focus, warm golden hour lighting, high quality 8K',
    description: '"它的智商虽然欠费，但它的快乐是无限流量。"'
  },
  {
    id: 54,
    rarity: 'N',
    title: '智商欠费已停机',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a colorful party hat, with a confused silly expression and tongue out, background is a simple colorful room, professional studio portrait, detailed fur texture, sharp focus, bright cheerful lighting, high quality 8K',
    description: '"脑干缺失的美感，在它身上体现得淋漓尽致。"'
  },
  {
    id: 55,
    rarity: 'N',
    title: '垃圾桶包场美食家',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a chef apron that says "Gourmet", standing next to a trash can with food scraps, background is an alley at night, professional studio portrait, detailed fur texture, sharp focus, urban night lighting, high quality 8K',
    description: '"高端的食材往往只需要最原始的获取方式。"'
  },
  {
    id: 56,
    rarity: 'N',
    title: '被生活反复毒打',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet looking tired and disheveled with messy fur, wearing a worn-out sweater, background is a messy apartment, professional studio portrait, detailed fur texture, sharp focus, tired everyday lighting, high quality 8K',
    description: '"它没倒下，它只是在原地躺一会儿，顺便撒个娇。"'
  },
  {
    id: 57,
    rarity: 'N',
    title: '真不熟·陌生人',
    petType: 'cat',
    prompt: 'ultra realistic photograph of a cat with an aloof distant expression, sitting alone on a windowsill looking away, background is a minimalist room, professional studio portrait, detailed fur texture, sharp focus, cool distant lighting, high quality 8K',
    description: '"你以为你是它主人？其实你只是个喂食机器。"'
  },
  {
    id: 58,
    rarity: 'N',
    title: '甚至不敢看余额',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet covering its eyes with paws, standing in front of an ATM machine, background shows bank interior, professional studio portrait, detailed fur texture, sharp focus, cold bank lighting, high quality 8K',
    description: '"穷得只剩下可爱了，但这玩意儿不能换小鱼干。"'
  },
  {
    id: 59,
    rarity: 'N',
    title: '纯种憨货',
    petType: 'dog',
    prompt: 'ultra realistic photograph of a dog in mid-run with legs tangled up awkwardly, goofy happy expression, background is a green park, professional studio portrait, detailed fur texture, sharp focus, bright outdoor lighting, high quality 8K',
    description: '"它进化的时候可能忘了带说明书。"'
  },
  {
    id: 60,
    rarity: 'N',
    title: '只会干饭的饭桶',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet wearing a large bib, sitting in front of multiple food bowls, drooling with anticipation, background is a kitchen, professional studio portrait, detailed fur texture, sharp focus, warm kitchen lighting, high quality 8K',
    description: '"干啥啥不行，干饭第一名，说的就是这位。"'
  },
  {
    id: 61,
    rarity: 'N',
    title: '电子榨菜本人',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet sitting in front of a tablet propped up showing a video, eating from a food bowl while watching, background is a cozy living room, professional studio portrait, detailed fur texture, sharp focus, screen glow lighting, high quality 8K',
    description: '"看它吃饭比你自己吃饭还香，这就是它的价值。"'
  },
  {
    id: 62,
    rarity: 'N',
    title: '抽象派艺术家',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet covered in colorful paint splatters, standing in front of a canvas with paw prints, background is an art studio with messy paints, professional studio portrait, detailed fur texture, sharp focus, artistic studio lighting, high quality 8K',
    description: '"它拆家不是破坏，是在进行行为艺术创作。"'
  },
  {
    id: 63,
    rarity: 'N',
    title: '由于太笨被踢出神界',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet with angel wings costume and crooked halo, looking confused, background is fluffy white clouds, professional studio portrait, detailed fur texture, sharp focus, heavenly soft lighting, high quality 8K',
    description: '"上帝关上了它的门，还顺便焊死了它的窗。"'
  },
  {
    id: 64,
    rarity: 'N',
    title: '哈报社社员',
    petType: 'cat',
    prompt: 'ultra realistic photograph of a cat wearing a press vest and cap, holding a newspaper, with a laughing expression, background is a newsroom office, professional studio portrait, detailed fur texture, sharp focus, office lighting, high quality 8K',
    description: '"每天的工作就是哈哈哈哈，笑对狗屁人生。"'
  },
  {
    id: 65,
    rarity: 'N',
    title: '走路先迈左脚的笨蛋',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet with legs tangled up in an awkward walking pose, looking confused, background is a simple sidewalk, professional studio portrait, detailed fur texture, sharp focus, natural daylight, high quality 8K',
    description: '"协调性基本为零，可爱度基本爆表。"'
  },
  {
    id: 66,
    rarity: 'N',
    title: '甚至打不过蟑螂',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet hiding behind a couch cushion looking scared, peeking out cautiously, background is a living room, professional studio portrait, detailed fur texture, sharp focus, dramatic shadow lighting, high quality 8K',
    description: '"它是和平主义者，绝对不是因为胆小。"'
  },
  {
    id: 67,
    rarity: 'N',
    title: '躲猫猫第一名(露屁股)',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet with head hidden in a paper bag but entire back half sticking out, funny failed hiding pose, background is a living room, professional studio portrait, detailed fur texture, sharp focus, natural indoor lighting, high quality 8K',
    description: '"掩耳盗铃的当代传人，只要我看不到你，你就没看我。"'
  },
  {
    id: 68,
    rarity: 'N',
    title: '拆家界泥石流',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet surrounded by torn cushion stuffing and fabric pieces, looking innocent, background is a destroyed living room, professional studio portrait, detailed fur texture, sharp focus, dramatic evidence lighting, high quality 8K',
    description: '"给它一个支点，它能撬动你整套红木家具。"'
  },
  {
    id: 69,
    rarity: 'N',
    title: '反射弧绕地球三圈',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet with a delayed surprised expression, eyes wide and confused, background is a simple room, professional studio portrait, detailed fur texture, sharp focus, neutral lighting, high quality 8K',
    description: '"它的延迟比你玩外服游戏还要高。"'
  },
  {
    id: 70,
    rarity: 'N',
    title: '傻到深处自然萌',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet with head tilted to side, tongue slightly out, looking adorably confused, background is a soft pink flower garden, professional studio portrait, detailed fur texture, sharp focus, soft dreamy lighting, high quality 8K',
    description: '"虽然脑子里空空如也，但心里全都是你。"'
  },
  {
    id: 71,
    rarity: 'N',
    title: '退堂鼓一级演奏家',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet slowly backing away with an anxious worried expression, background is a challenging obstacle or task, professional studio portrait, detailed fur texture, sharp focus, tense lighting, high quality 8K',
    description: '"还没开始就已经想放弃了，这是天赋。"'
  },
  {
    id: 72,
    rarity: 'N',
    title: '专业气人小能手',
    petType: 'cat',
    prompt: 'ultra realistic photograph of a cat with a smug satisfied expression, knocked over cup visible in background, sitting proudly, professional studio portrait, detailed fur texture, sharp focus, dramatic lighting, high quality 8K',
    description: '"气你是工作，可爱是副业，两手都要抓。"'
  },
  {
    id: 73,
    rarity: 'N',
    title: '睡神转世',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet sleeping in a weird twisted position, completely relaxed and drooling slightly, background is a cozy bed, professional studio portrait, detailed fur texture, sharp focus, soft warm lighting, high quality 8K',
    description: '"一天睡20小时，剩下4小时用来准备睡觉。"'
  },
  {
    id: 74,
    rarity: 'N',
    title: '摆烂艺术家',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet lying completely flat on the floor like melted butter, zero energy, background is a simple room floor, professional studio portrait, detailed fur texture, sharp focus, soft overhead lighting, high quality 8K',
    description: '"躺平不是消极，是一种行为艺术。"'
  },
  {
    id: 75,
    rarity: 'N',
    title: '发疯文学代表',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet with wild crazy eyes and messy fur standing up, chaotic energetic pose, background is a slightly messy room, professional studio portrait, detailed fur texture, sharp focus, dramatic lighting, high quality 8K',
    description: '"精神状态遥遥领先，已经疯成了别人羡慕的样子。"'
  },
  {
    id: 76,
    rarity: 'N',
    title: '底层互害专家',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet accidentally stepping on its own tail, funny self-sabotage moment, background is a simple room, professional studio portrait, detailed fur texture, sharp focus, comedic timing lighting, high quality 8K',
    description: '"伤害性不大，侮辱性极强，主要伤害自己。"'
  },
  {
    id: 77,
    rarity: 'N',
    title: '人类迷惑行为观察员',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet with a judging confused expression, looking at camera like observing strange behavior, background is a living room, professional studio portrait, detailed fur texture, sharp focus, documentary style lighting, high quality 8K',
    description: '"它每天都在研究一个课题：你为什么这么傻。"'
  },
  {
    id: 78,
    rarity: 'N',
    title: '蹭饭界天花板',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet with the most pleading puppy dog eyes, sitting next to an empty food bowl, background is a kitchen, professional studio portrait, detailed fur texture, sharp focus, soft sympathetic lighting, high quality 8K',
    description: '"明明刚吃完，但它的眼神在说它三天没吃了。"'
  },
  {
    id: 79,
    rarity: 'N',
    title: '社会性死亡当事人',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet with an extremely embarrassed expression, covering face with paws, background is a spotlight on stage, professional studio portrait, detailed fur texture, sharp focus, awkward spotlight lighting, high quality 8K',
    description: '"它经历过的尴尬，比你一辈子都多。"'
  },
  {
    id: 80,
    rarity: 'N',
    title: '假装听懂专家',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet nodding with a fake understanding expression but clearly confused, background is an office setting, professional studio portrait, detailed fur texture, sharp focus, meeting room lighting, high quality 8K',
    description: '"它一脸懂了的样子，其实脑子里在想肉干。"'
  },
  {
    id: 81,
    rarity: 'N',
    title: '原地emo选手',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet sitting alone in a corner looking sad and melancholic for no reason, background is a dim room, professional studio portrait, detailed fur texture, sharp focus, moody blue lighting, high quality 8K',
    description: '"没有什么事情发生，但它就是突然不开心了。"'
  },
  {
    id: 82,
    rarity: 'N',
    title: '假笑男/女孩',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet with a forced awkward smile, clearly fake happiness, background is a photo studio, professional studio portrait, detailed fur texture, sharp focus, stock photo style lighting, high quality 8K',
    description: '"笑容是假的，但想吃零食的心是真的。"'
  },
  {
    id: 83,
    rarity: 'N',
    title: '精准踩雷专家',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet stepping into a puddle or mess, unlucky moment captured, background is a sidewalk, professional studio portrait, detailed fur texture, sharp focus, unfortunate moment lighting, high quality 8K',
    description: '"如果有一滩水，它一定会踩进去。"'
  },
  {
    id: 84,
    rarity: 'N',
    title: '嘴硬王',
    petType: 'cat',
    prompt: 'ultra realistic photograph of a cat with a stubborn pouty expression, turned away dramatically but peeking back, background is a cozy room, professional studio portrait, detailed fur texture, sharp focus, dramatic lighting, high quality 8K',
    description: '"明明很想要抱抱，但就是不说。"'
  },
  {
    id: 85,
    rarity: 'N',
    title: '窝里横冠军',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet looking fierce and confident at home standing tall, background is a comfortable living room, professional studio portrait, detailed fur texture, sharp focus, confident indoor lighting, high quality 8K',
    description: '"在家是老虎，出门是猫咪（反过来也成立）。"'
  },
  {
    id: 86,
    rarity: 'N',
    title: '已读不回大师',
    petType: 'cat',
    prompt: 'ultra realistic photograph of a cat glancing at a phone screen with a completely disinterested expression, ignoring it, background is a cozy bed, professional studio portrait, detailed fur texture, sharp focus, phone screen glow, high quality 8K',
    description: '"看到了，但是不想理你，很合理。"'
  },
  {
    id: 87,
    rarity: 'N',
    title: '废话文学集大成者',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet with mouth open as if talking endlessly, lecturer pose, background is a podium or stage, professional studio portrait, detailed fur texture, sharp focus, presentation lighting, high quality 8K',
    description: '"听君一席话，如听一席话。"'
  },
  {
    id: 88,
    rarity: 'N',
    title: '什么都想吃协会',
    petType: 'dog',
    prompt: 'ultra realistic photograph of a dog drooling while staring intensely at food, hungry eager expression, background is a dining table with food, professional studio portrait, detailed fur texture, sharp focus, appetizing food lighting, high quality 8K',
    description: '"世界上只有两种东西：能吃的，和还没试过能不能吃的。"'
  },
  {
    id: 89,
    rarity: 'N',
    title: '职业铲屎官指挥家',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet in a commanding conductor-like pose, pointing with paw, looking authoritative, background is a living room, professional studio portrait, detailed fur texture, sharp focus, dramatic conductor lighting, high quality 8K',
    description: '"它不做事，它只负责指挥你做事。"'
  },
  {
    id: 90,
    rarity: 'N',
    title: '选择困难症晚期',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet sitting between two food bowls, looking paralyzed with indecision, stressed expression, background is a kitchen, professional studio portrait, detailed fur texture, sharp focus, decision anxiety lighting, high quality 8K',
    description: '"左边是鸡肉味，右边是牛肉味，它已经纠结了半小时。"'
  },
  {
    id: 91,
    rarity: 'N',
    title: '热搜体质',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet doing something silly and attention-grabbing, paparazzi style shot, background has camera flashes, professional studio portrait, detailed fur texture, sharp focus, viral moment lighting, high quality 8K',
    description: '"做什么都能上热搜，主要是够丑够搞笑。"'
  },
  {
    id: 92,
    rarity: 'N',
    title: '白嫖怪本怪',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet looking at free samples at a store with excited expression, freeloader energy, background is a supermarket, professional studio portrait, detailed fur texture, sharp focus, store lighting, high quality 8K',
    description: '"花钱是不可能花钱的，这辈子不可能花钱的。"'
  },
  {
    id: 93,
    rarity: 'N',
    title: '复读机本机',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet with mouth open as if repeating something, echo pose, background is a simple room with slight mirror effect, professional studio portrait, detailed fur texture, sharp focus, neutral lighting, high quality 8K',
    description: '"你说什么它就叫什么，工作内容：复读。"'
  },
  {
    id: 94,
    rarity: 'N',
    title: '碰瓷专业户',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet dramatically lying down pretending to be hurt, overacting injured pose, background is a sidewalk, professional studio portrait, detailed fur texture, sharp focus, dramatic stage lighting, high quality 8K',
    description: '"轻轻碰一下就倒地不起，奥斯卡欠它一座小金人。"'
  },
  {
    id: 95,
    rarity: 'N',
    title: '恐婚恐育代言人',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet backing away from baby toys and small pets with scared expression, avoiding commitment pose, background is a living room, professional studio portrait, detailed fur texture, sharp focus, escape mode lighting, high quality 8K',
    description: '"一听到小孩哭声就想原地消失。"'
  },
  {
    id: 96,
    rarity: 'N',
    title: '起床困难综合征',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet clinging to a blanket being pulled out of bed, refusing to wake up, background is a cozy bedroom in morning, professional studio portrait, detailed fur texture, sharp focus, soft morning lighting, high quality 8K',
    description: '"每天起床都像在和床谈一场生离死别的恋爱。"'
  },
  {
    id: 97,
    rarity: 'N',
    title: '人间清醒',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet with a knowing exhausted expression, wise but tired eyes, background is a simple contemplative setting, professional studio portrait, detailed fur texture, sharp focus, philosophical soft lighting, high quality 8K',
    description: '"看透一切但选择躺平，这就是人间清醒。"'
  },
  {
    id: 98,
    rarity: 'N',
    title: '不想努力了',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet lying flat with a white flag of surrender nearby, completely given up pose, background is a simple floor, professional studio portrait, detailed fur texture, sharp focus, defeated soft lighting, high quality 8K',
    description: '"努力有什么用？不如睡一觉。"'
  },
  {
    id: 99,
    rarity: 'N',
    title: '富婆/富豪收留对象',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet with hopeful puppy dog eyes, holding a cardboard sign that says "Adopt Me", sitting cutely, background is a street corner, professional studio portrait, detailed fur texture, sharp focus, sympathetic lighting, high quality 8K',
    description: '"不想奋斗了，只想被包养。"'
  },
  {
    id: 100,
    rarity: 'N',
    title: '宇宙级显眼包',
    petType: 'universal',
    prompt: 'ultra realistic photograph of a pet doing something extremely attention-seeking and dramatic, center of attention pose, background has spotlights pointing at it, professional studio portrait, detailed fur texture, sharp focus, dramatic spotlight lighting, high quality 8K',
    description: '"走到哪里都是焦点，主要是太吵了。"'
  },
];

// 获取随机称号
export function getRandomTitle(rarity: Rarity, petType: 'cat' | 'dog'): TitleData {
  const filtered = TITLES_DATA.filter(t =>
    t.rarity === rarity &&
    (t.petType === 'universal' || t.petType === petType)
  );
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// 根据概率抽取稀有度
export function rollRarity(): Rarity {
  const roll = Math.random();
  if (roll < 0.05) return 'SSR';      // 5%
  if (roll < 0.20) return 'SR';       // 15%
  if (roll < 0.50) return 'R';        // 30%
  return 'N';                          // 50%
}

// 根据问题答案调整概率后抽取稀有度
export function rollRarityWithBonus(bonusWeights: { SSR: number; SR: number; R: number; N: number }): Rarity {
  const total = bonusWeights.SSR + bonusWeights.SR + bonusWeights.R + bonusWeights.N;
  const roll = Math.random() * total;

  if (roll < bonusWeights.SSR) return 'SSR';
  if (roll < bonusWeights.SSR + bonusWeights.SR) return 'SR';
  if (roll < bonusWeights.SSR + bonusWeights.SR + bonusWeights.R) return 'R';
  return 'N';
}

// 获取所有头衔
export function getAllTitles(): TitleData[] {
  return TITLES_DATA;
}

// 根据ID获取头衔
export function getTitleById(id: number): TitleData | undefined {
  return TITLES_DATA.find(t => t.id === id);
}
