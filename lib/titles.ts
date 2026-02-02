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
  {
    id: 1,
    rarity: 'SSR',
    title: '耄耋·量子神猫',
    petType: 'cat',
    prompt: 'A mystical cat floating in lotus position, wearing a tattered starlight cloak, eyes shooting colorful aurora beams, surrounded by ancient runes and rotating galaxies, divine void atmosphere, ultra detailed, 8k, cinematic lighting',
    description: '"它不是在发呆，它是在通过量子通信查看你银行卡的余额。"'
  },
  {
    id: 2,
    rarity: 'SSR',
    title: '九霄雷霆·寂灭恐惧战神',
    petType: 'dog',
    prompt: 'A fierce dog standing and roaring, wearing black carbon fiber mecha armor, body wrapped in blue high-voltage lightning, background is apocalyptic thunderstorm over city skyline, epic and intimidating, ultra detailed, 8k',
    description: '"它一嗓子下去，方圆十公里的声控灯都要集体加班。"'
  },
  {
    id: 3,
    rarity: 'SSR',
    title: '数字生命0号实验体',
    petType: 'universal',
    prompt: 'A pet with semi-transparent cybernetic body, visible glowing circuits inside, wearing neural connection device on head, standing in cyberspace with flowing green binary code rain background, sci-fi atmosphere, ultra detailed, 8k',
    description: '"肉体只是它的遮羞布，它的灵魂早已在以太坊里买了三套房。"'
  },
  {
    id: 4,
    rarity: 'SSR',
    title: '万界唯一纯爱战士',
    petType: 'universal',
    prompt: 'A pet wearing pure white velvet knight armor, holding a glowing pink crystal heart, standing on blooming electronic roses, background is romantic pink supernova explosion, dreamy and epic, ultra detailed, 8k',
    description: '"它眼里不只有你，还有对这个冷酷世界最单纯的鄙视。"'
  },
  {
    id: 5,
    rarity: 'SSR',
    title: '赛博佛祖·机械降神',
    petType: 'universal',
    prompt: 'A pet in meditation pose with giant glowing gear-shaped halo behind, brushed metal skin texture, cyberpunk lotus pond background with electronic smoke, divine and futuristic, ultra detailed, 8k',
    description: '"电子木鱼敲烂，它也不会原谅你昨天偷吃的那口罐头。"'
  },

  // ==================== SR · 极品精英 (15个，15%概率) ====================
  {
    id: 6,
    rarity: 'SR',
    title: '黑帮教父',
    petType: 'universal',
    prompt: 'A pet in deep black pinstripe suit, wearing sunglasses and holding a gold cigar, sitting in red wood chair, background is vault full of gold bars, dark cinematic film noir lighting, ultra detailed',
    description: '"如果你不按时供奉肉干，它可能会让你"睡个好觉"。"'
  },
  {
    id: 7,
    rarity: 'SR',
    title: '华尔街金牌交易员',
    petType: 'universal',
    prompt: 'A pet in blue shirt with gold-rimmed glasses, paws operating on holographic trading screens, background is midnight Manhattan skyline with green stock charts, professional and wealthy vibe, ultra detailed',
    description: '"它这辈子唯一的投资失误，就是选你当了它的经纪人。"'
  },
  {
    id: 8,
    rarity: 'SR',
    title: '皇家大公爵',
    petType: 'universal',
    prompt: 'A pet wearing red velvet crown with huge ruby necklace, background is golden baroque palace interior, high-end silk texture, noble and arrogant expression, ultra detailed',
    description: '"流淌着最蓝的血，吃着最廉价的猫/狗粮，这就是贵族的矜持。"'
  },
  {
    id: 9,
    rarity: 'SR',
    title: '米其林三星主厨',
    petType: 'universal',
    prompt: 'A pet wearing tall chef hat and white uniform, paws holding golden spatula, background is steamy high-end kitchen, warm and professional atmosphere, ultra detailed',
    description: '"在它看来，你做的饭甚至不如它埋在院子里的那块过期骨头。"'
  },
  {
    id: 10,
    rarity: 'SR',
    title: '优雅永不过时',
    petType: 'cat',
    prompt: 'A cat wearing pearl necklace and lace shawl, aloof expression, background is French afternoon tea garden with sunlight through leaves, elegant and sophisticated, ultra detailed',
    description: '"优雅是它的伪装，其实它只是在想怎么把那个花瓶推下去。"'
  },
  {
    id: 11,
    rarity: 'SR',
    title: '极道·带刀护法',
    petType: 'dog',
    prompt: 'A dog in black kimono with cherry blossom tattoo on back, wooden katana in mouth, background is courtyard with falling red maple leaves, samurai atmosphere, ultra detailed',
    description: '"别看它现在很凶，只要你掏出火腿肠，它能立刻给你表演街舞。"'
  },
  {
    id: 12,
    rarity: 'SR',
    title: '五百强唯一指定继承人',
    petType: 'universal',
    prompt: 'A pet in custom tailored suit standing at private jet door, background is blue sky and clouds, luxury and wealthy atmosphere, confident pose, ultra detailed',
    description: '"它出生的起点，是你这辈子努力的终点——指的是睡觉的时间。"'
  },
  {
    id: 13,
    rarity: 'SR',
    title: '深渊凝视者',
    petType: 'universal',
    prompt: 'A pet in pure black hooded cloak, only glowing red eyes visible, background is dark stairway to hell, gothic horror style, mysterious and creepy, ultra detailed',
    description: '"当你凝视它时，它其实只是在看你头顶那只苍蝇。"'
  },
  {
    id: 14,
    rarity: 'SR',
    title: '重装机械·先遣官',
    petType: 'dog',
    prompt: 'A dog in silver alloy armor with exposed hydraulic mechanical parts, red electronic eye, background is Mars desert base, hard sci-fi style, ultra detailed',
    description: '"全身90%已机械化，剩下10%是对骨头的原始欲望。"'
  },
  {
    id: 15,
    rarity: 'SR',
    title: '高端猎人',
    petType: 'cat',
    prompt: 'A cat in camouflage special forces gear, holding mini night vision device, hiding under tropical rainforest giant leaf, extremely sharp eyes, predator vibe, ultra detailed',
    description: '"作为顶级捕猎者，它目前最大的战绩是抓住了一根红点激光。"'
  },
  {
    id: 16,
    rarity: 'SR',
    title: '歪嘴龙王',
    petType: 'universal',
    prompt: 'A pet in yellow silk Tang suit, showing classic evil smirk expression, background is mansion gate with red envelopes on ground, wealthy Chinese style, ultra detailed',
    description: '"一声令下，十万只家政猫/狗赶来帮它拆家。"'
  },
  {
    id: 17,
    rarity: 'SR',
    title: '数字资产大亨',
    petType: 'universal',
    prompt: 'A pet wearing dollar sign fur coat, floating glowing bitcoins around, diamond sunglasses, nightclub neon light effect, crypto rich vibe, ultra detailed',
    description: '"它在元宇宙拥有一整片草坪，那里禁止所有人类入内。"'
  },
  {
    id: 18,
    rarity: 'SR',
    title: '不败战神',
    petType: 'dog',
    prompt: 'A dog wearing military coat full of medals, sitting on mini tank, background is smoky battlefield ruins, cinematic war movie style, ultra detailed',
    description: '"在它的字典里没有撤退，除非邻居家的藏獒路过。"'
  },
  {
    id: 19,
    rarity: 'SR',
    title: '优雅名媛',
    petType: 'cat',
    prompt: 'A cat in pink Chanel style suit, carrying mini designer bag, background is high-end beauty salon, fashionable and elegant, ultra detailed',
    description: '"每天花18小时洗脸，剩下的时间都在嫌弃你不够精致。"'
  },
  {
    id: 20,
    rarity: 'SR',
    title: '星际领航员',
    petType: 'universal',
    prompt: 'A pet in fitted space suit, determined eyes visible through transparent helmet, background is starry universe cockpit, astronaut explorer vibe, ultra detailed',
    description: '"它的征途是星辰大海，而你的征途是帮它捡屎。"'
  },

  // ==================== R · 平凡众生 (30个，30%概率) ====================
  {
    id: 21,
    rarity: 'R',
    title: '996资深架构师',
    petType: 'universal',
    prompt: 'A pet in programmer plaid shirt, heavy dark circles under eyes, paws on mechanical keyboard, background is blue code rain, tired but dedicated, detailed',
    description: '"代码可以有Bug，但罐头必须是纯肉。"'
  },
  {
    id: 22,
    rarity: 'R',
    title: '疯狂星期四领军人物',
    petType: 'universal',
    prompt: 'A pet wearing KFC bucket as hat, holding big chicken drumstick, red fast food restaurant background, happy and hungry expression, detailed',
    description: '"别跟我谈梦想，今天周四，V我50买个罐头。"'
  },
  {
    id: 23,
    rarity: 'R',
    title: '蒙题大赛金奖',
    petType: 'cat',
    prompt: 'A cat wearing thick glasses, buried under pile of exam papers, extremely confused expression, late night classroom background, student vibe, detailed',
    description: '"三短一长选最长，剩下不会全选C，它深谙此道。"'
  },
  {
    id: 24,
    rarity: 'R',
    title: '精神状态极度稳定',
    petType: 'universal',
    prompt: 'A pet in tie-dye colorful clothes, vacant unfocused eyes, riding inflatable unicorn, distorted rainbow background, chaotic energy, detailed',
    description: '"它疯了，又没完全疯，这种状态在当下被称为"完美"。"'
  },
  {
    id: 25,
    rarity: 'R',
    title: '外卖配送部钻石会员',
    petType: 'dog',
    prompt: 'A dog riding yellow delivery scooter, wearing helmet, background is busy traffic, delivery rider vibe, hardworking expression, detailed',
    description: '"你的餐还没到，是因为它在路边和另一只狗聊起来了。"'
  },
  {
    id: 26,
    rarity: 'R',
    title: '脆皮年轻人代表',
    petType: 'universal',
    prompt: 'A pet covered in band-aids and patches, wearing neck pillow, holding thermos cup, traditional Chinese medicine clinic background, fragile but trying, detailed',
    description: '"跳下沙发都要缓半天，它是懂养生的。"'
  },
  {
    id: 27,
    rarity: 'R',
    title: '全自动摸鱼教练',
    petType: 'cat',
    prompt: 'A cat lying face up on office keyboard, surrounded by milk tea cups, messy office background, ultimate slacker pose, detailed',
    description: '"只要我躺得够平，老板的KPI就追不上我。"'
  },
  {
    id: 28,
    rarity: 'R',
    title: '相亲市场常驻嘉宾',
    petType: 'universal',
    prompt: 'A pet in ill-fitting small suit, holding a rose, awkward and nervous expression, dating scene background, detailed',
    description: '"要求：有房有车，罐头自由，不接受人类作为第三者。"'
  },
  {
    id: 29,
    rarity: 'R',
    title: '刚下飞机·谢绝推销',
    petType: 'universal',
    prompt: 'A pet wearing noise-canceling headphones and sunglasses, pulling silver suitcase, airport terminal background, busy traveler vibe, detailed',
    description: '"忙着去参加国际猫/狗片节，没时间理你。"'
  },
  {
    id: 30,
    rarity: 'R',
    title: '朋友圈文学艺术家',
    petType: 'universal',
    prompt: 'A pet wearing beret, holding vintage camera, background is aesthetic coffee shop, influencer lifestyle, detailed',
    description: '"它发的每条动态，其实都在控诉你没给它买新玩具。"'
  },
  {
    id: 31,
    rarity: 'R',
    title: '早八准时崩溃战神',
    petType: 'universal',
    prompt: 'A pet with messy hair, grabbing alarm clock, chaotic bedroom background, morning rage expression, relatable vibe, detailed',
    description: '"每天早上叫醒它的不是梦想，是快憋不住的尿。"'
  },
  {
    id: 32,
    rarity: 'R',
    title: '互联网活化石',
    petType: 'universal',
    prompt: 'A pet wrapped in old ethernet cables, Windows 95 desktop background with pop-up windows, retro internet vibe, detailed',
    description: '"它见证了互联网的兴起，现在只想看点修狗视频。"'
  },
  {
    id: 33,
    rarity: 'R',
    title: '熬夜修仙协会会长',
    petType: 'universal',
    prompt: 'A pet in Taoist robe, oil lamp in front, cyberpunk Taoist temple at night background, mystical night owl vibe, detailed',
    description: '"不睡觉是为了吸收月亮精华，绝对不是因为下午睡多了。"'
  },
  {
    id: 34,
    rarity: 'R',
    title: '在逃公主/王子(已欠费)',
    petType: 'universal',
    prompt: 'A pet with crooked plastic crown, torn tutu dress, cardboard box castle background, broke royalty aesthetic, detailed',
    description: '"身份是高贵的，口袋是空空的，性格是傲娇的。"'
  },
  {
    id: 35,
    rarity: 'R',
    title: '深度PPT受害者',
    petType: 'universal',
    prompt: 'A pet face pressed against projector, body covered in pie charts, endless meeting room background, corporate trauma vibe, detailed',
    description: '"它能听懂你的所有苦恼，因为它也曾是只社畜。"'
  },
  {
    id: 36,
    rarity: 'R',
    title: '赛博敲木鱼达人',
    petType: 'universal',
    prompt: 'A pet with paws on glowing wooden fish, floating "+1 Merit" text bubbles around, virtual temple background, digital zen vibe, detailed',
    description: '"每天敲一万下，保佑它下辈子投胎做房东。"'
  },
  {
    id: 37,
    rarity: 'R',
    title: '多巴胺穿搭鼻祖',
    petType: 'universal',
    prompt: 'A pet in extremely colorful mismatched outfit, oversized plastic sunglasses, dopamine color wall background, chaotic fashion, detailed',
    description: '"审美比较超前，领先人类大约五百年。"'
  },
  {
    id: 38,
    rarity: 'R',
    title: '孤独等级十级学者',
    petType: 'universal',
    prompt: 'A pet alone on carousel, holding single balloon, empty amusement park background, melancholic but peaceful, detailed',
    description: '"它并不孤独，它只是在享受没有你的清静。"'
  },
  {
    id: 39,
    rarity: 'R',
    title: '早C晚A实践者',
    petType: 'universal',
    prompt: 'A pet with coffee cup in left paw and wine glass in right paw, split morning/night background, work-life balance vibe, detailed',
    description: '"早晨咖啡续命，晚上酒精入眠，生活太难了。"'
  },
  {
    id: 40,
    rarity: 'R',
    title: '逻辑闭环专家',
    petType: 'universal',
    prompt: 'A pet wearing doctoral cap, standing before whiteboard full of complex logic diagrams, intellectual debate pose, detailed',
    description: '"它能逻辑严密地论证：为什么咬碎沙发是你的错。"'
  },
  {
    id: 41,
    rarity: 'R',
    title: '外贸尾单模特',
    petType: 'universal',
    prompt: 'A pet in ill-fitting clothes with weird English labels, fashion show pose but budget aesthetic, detailed',
    description: '"气质这一块，它拿捏得死死的，虽然衣服只要九块九。"'
  },
  {
    id: 42,
    rarity: 'R',
    title: '资深画饼师',
    petType: 'universal',
    prompt: 'A pet giving speech to audience of other pets, background full of glowing "big pie" promises, corporate motivational vibe, detailed',
    description: '"承诺以后带全家去南极看企鹅，目前进度：0%。"'
  },
  {
    id: 43,
    rarity: 'R',
    title: '深夜EMO领军人',
    petType: 'universal',
    prompt: 'A pet sitting by window watching rain, melancholic blue filter, sad aesthetic, emotional night vibe, detailed',
    description: '"雨下得好大，像它想念罐头的泪水一样大。"'
  },
  {
    id: 44,
    rarity: 'R',
    title: '社恐星人办事处',
    petType: 'universal',
    prompt: 'A pet hiding behind curtain showing only half face, party silhouettes in background, introvert energy, detailed',
    description: '"别过来，我们保持灵魂交流就好。"'
  },
  {
    id: 45,
    rarity: 'R',
    title: '反向背锅侠',
    petType: 'universal',
    prompt: 'A pet with "It wasnt me" sign, broken cup in background, innocent but suspicious expression, detailed',
    description: '"证据确凿，但它眼神里的坚定让你怀疑自己。"'
  },
  {
    id: 46,
    rarity: 'R',
    title: '甚至想去扫地的僧人',
    petType: 'universal',
    prompt: 'A pet holding broom bigger than itself, simple cloth robe, humble temple background, zen minimalist vibe, detailed',
    description: '"大隐隐于市，小隐隐于沙发底下。"'
  },
  {
    id: 47,
    rarity: 'R',
    title: 'PPT里的高端人才',
    petType: 'universal',
    prompt: 'A pet with skill radar charts and labels all over body, looking impressive on paper, corporate presentation style, detailed',
    description: '"仅限PPT展示，实际能力：干饭第一名。"'
  },
  {
    id: 48,
    rarity: 'R',
    title: '情绪价值提供商',
    petType: 'universal',
    prompt: 'A pet in warm yellow sweater, surrounded by healing flowers and sunshine, comforting and warm presence, detailed',
    description: '"它唯一的工作就是看着你，让你觉得世界还没塌。"'
  },
  {
    id: 49,
    rarity: 'R',
    title: '互联网游牧民族',
    petType: 'universal',
    prompt: 'A pet with solar panel on back, holding signal searching pole, digital nomad aesthetic, detailed',
    description: '"哪里有WiFi，哪里就是它的家。"'
  },
  {
    id: 50,
    rarity: 'R',
    title: '草台班子核心成员',
    petType: 'universal',
    prompt: 'A pet in shabby costume, standing on wobbly stage center, amateur theater vibe but dedicated, detailed',
    description: '"世界是个草台班子，它是那个最敬业的演员。"'
  },

  // ==================== N · 纯纯废材 (50个，50%概率) ====================
  {
    id: 51,
    rarity: 'N',
    title: '鼠鼠我呀·彻底寄了',
    petType: 'universal',
    prompt: 'A pet wearing gray mouse ears, curled up in worn-out cardboard box, extremely pitiful expression, low quality intentionally, comic style',
    description: '"生活不易，鼠鼠叹气，下辈子不做这种努力。"'
  },
  {
    id: 52,
    rarity: 'N',
    title: '感觉不如原神',
    petType: 'universal',
    prompt: 'A pet in anime merchandise shirt, blank stare holding plastic badge, pixel art background, otaku defeated vibe',
    description: '"万物皆可不如原神，包括它还没吃饱的肚子。"'
  },
  {
    id: 53,
    rarity: 'N',
    title: '村口二傻子',
    petType: 'dog',
    prompt: 'A dog with red ribbon around neck, big red flower on head, tongue hanging out sideways, sunset wheat field background, village idiot aesthetic',
    description: '"它的智商虽然欠费，但它的快乐是无限流量。"'
  },
  {
    id: 54,
    rarity: 'N',
    title: '智商欠费已停机',
    petType: 'universal',
    prompt: 'A pet with spinning colorful funnel on head, clear and stupid eyes, bubble background, maximum derp expression',
    description: '"脑干缺失的美感，在它身上体现得淋漓尽致。"'
  },
  {
    id: 55,
    rarity: 'N',
    title: '垃圾桶包场美食家',
    petType: 'universal',
    prompt: 'A pet wearing watermelon rind as hat, leaning against green trash can, dirty alley background, dumpster diver pride',
    description: '"高端的食材往往只需要最原始的获取方式。"'
  },
  {
    id: 56,
    rarity: 'N',
    title: '被生活反复毒打',
    petType: 'universal',
    prompt: 'A pet covered in cartoon band-aids, messy fur, giant shoe print in background, beaten but not defeated',
    description: '"它没倒下，它只是在原地躺一会儿，顺便撒个娇。"'
  },
  {
    id: 57,
    rarity: 'N',
    title: '真不熟·陌生人',
    petType: 'cat',
    prompt: 'A cat body semi-transparent and fading, distant aloof expression, black and white minimalist background, stranger energy',
    description: '"你以为你是它主人？其实你只是个喂食机器。"'
  },
  {
    id: 58,
    rarity: 'N',
    title: '甚至不敢看余额',
    petType: 'universal',
    prompt: 'A pet covering eyes with paws, ATM screen showing 0.00 in front, cold purple tone, broke anxiety aesthetic',
    description: '"穷得只剩下可爱了，但这玩意儿不能换小鱼干。"'
  },
  {
    id: 59,
    rarity: 'N',
    title: '纯种憨货',
    petType: 'dog',
    prompt: 'A dog mid-run tripping over own feet, park grass background, slapstick comedy pose, maximum goofiness',
    description: '"它进化的时候可能忘了带说明书。"'
  },
  {
    id: 60,
    rarity: 'N',
    title: '只会干饭的饭桶',
    petType: 'universal',
    prompt: 'A pet wearing giant bib, holding oversized wooden spoon, drooling at empty plate, foodie obsession level max',
    description: '"干啥啥不行，干饭第一名，说的就是这位。"'
  },
  {
    id: 61,
    rarity: 'N',
    title: '电子榨菜本人',
    petType: 'universal',
    prompt: 'A pet squeezed inside giant smartphone screen, binge-watching show in background, pixel art style, screen addiction vibe',
    description: '"看它吃饭比你自己吃饭还香，这就是它的价值。"'
  },
  {
    id: 62,
    rarity: 'N',
    title: '抽象派艺术家',
    petType: 'universal',
    prompt: 'A pet splattered with colorful paint all over body, chaotic graffiti wall background, modern art disaster',
    description: '"它拆家不是破坏，是在进行行为艺术创作。"'
  },
  {
    id: 63,
    rarity: 'N',
    title: '由于太笨被踢出神界',
    petType: 'universal',
    prompt: 'A pet falling from clouds, shoe print on butt, confused expression, kicked out of heaven aesthetic',
    description: '"上帝关上了它的门，还顺便焊死了它的窗。"'
  },
  {
    id: 64,
    rarity: 'N',
    title: '哈报社社员',
    petType: 'cat',
    prompt: 'A cat in sloppy intern vest, holding newspaper full of "ha ha ha" text, comedy intern vibe',
    description: '"每天的工作就是哈哈哈哈，笑对狗屁人生。"'
  },
  {
    id: 65,
    rarity: 'N',
    title: '走路先迈左脚的笨蛋',
    petType: 'universal',
    prompt: 'A pet with legs crossed and tangled, three crows flying over head, coordination failure maximum',
    description: '"协调性基本为零，可爱度基本爆表。"'
  },
  {
    id: 66,
    rarity: 'N',
    title: '甚至打不过蟑螂',
    petType: 'universal',
    prompt: 'A pet cowering in corner facing giant cartoon cockroach, trembling with fear, coward but relatable',
    description: '"它是和平主义者，绝对不是因为胆小。"'
  },
  {
    id: 67,
    rarity: 'N',
    title: '躲猫猫第一名(露屁股)',
    petType: 'universal',
    prompt: 'A pet diving into small paper bag, entire lower body sticking out, failed hide and seek champion',
    description: '"掩耳盗铃的当代传人，只要我看不到你，你就没看我。"'
  },
  {
    id: 68,
    rarity: 'N',
    title: '拆家界泥石流',
    petType: 'universal',
    prompt: 'A pet surrounded by torn sofa stuffing, fabric scraps on head, destruction zone background, chaos agent',
    description: '"给它一个支点，它能撬动你整套红木家具。"'
  },
  {
    id: 69,
    rarity: 'N',
    title: '反射弧绕地球三圈',
    petType: 'universal',
    prompt: 'A pet being touched, showing surprised reaction 3 seconds later, slow motion lag effect, buffering brain',
    description: '"它的延迟比你玩外服游戏还要高。"'
  },
  {
    id: 70,
    rarity: 'N',
    title: '傻到深处自然萌',
    petType: 'universal',
    prompt: 'A pet with tilted head, tongue sticking out slightly, pink flower background, pure stupid but adorable energy',
    description: '"虽然脑子里空空如也，但心里全都是你。"'
  },
  {
    id: 71,
    rarity: 'N',
    title: '退堂鼓一级演奏家',
    petType: 'universal',
    prompt: 'A pet backing away slowly with anxious expression, drum kit behind, professional quitter aesthetic',
    description: '"还没开始就已经想放弃了，这是天赋。"'
  },
  {
    id: 72,
    rarity: 'N',
    title: '专业气人小能手',
    petType: 'cat',
    prompt: 'A cat with smug expression, knocked over cup in background, professional annoyance vibes',
    description: '"气你是工作，可爱是副业，两手都要抓。"'
  },
  {
    id: 73,
    rarity: 'N',
    title: '睡神转世',
    petType: 'universal',
    prompt: 'A pet in extremely weird sleeping position, drooling, Z letters floating around, ultimate sleeper',
    description: '"一天睡20小时，剩下4小时用来准备睡觉。"'
  },
  {
    id: 74,
    rarity: 'N',
    title: '摆烂艺术家',
    petType: 'universal',
    prompt: 'A pet lying completely flat like liquid, melting into ground, zero energy remaining, full surrender mode',
    description: '"躺平不是消极，是一种行为艺术。"'
  },
  {
    id: 75,
    rarity: 'N',
    title: '发疯文学代表',
    petType: 'universal',
    prompt: 'A pet with wild eyes, surrounded by floating crazy emoji and text, mental breakdown aesthetic, chaotic energy',
    description: '"精神状态遥遥领先，已经疯成了别人羡慕的样子。"'
  },
  {
    id: 76,
    rarity: 'N',
    title: '底层互害专家',
    petType: 'universal',
    prompt: 'A pet stepping on own tail while walking, self-sabotage pose, unfortunate but funny',
    description: '"伤害性不大，侮辱性极强，主要伤害自己。"'
  },
  {
    id: 77,
    rarity: 'N',
    title: '人类迷惑行为观察员',
    petType: 'universal',
    prompt: 'A pet with magnifying glass, staring at human with confused judgmental expression, researcher vibe',
    description: '"它每天都在研究一个课题：你为什么这么傻。"'
  },
  {
    id: 78,
    rarity: 'N',
    title: '蹭饭界天花板',
    petType: 'universal',
    prompt: 'A pet with pleading eyes, empty bowl in front, professional beggar aesthetic, hungry and shameless',
    description: '"明明刚吃完，但它的眼神在说它三天没吃了。"'
  },
  {
    id: 79,
    rarity: 'N',
    title: '社会性死亡当事人',
    petType: 'universal',
    prompt: 'A pet with embarrassed expression, covering face, spotlight shining down, social death moment',
    description: '"它经历过的尴尬，比你一辈子都多。"'
  },
  {
    id: 80,
    rarity: 'N',
    title: '假装听懂专家',
    petType: 'universal',
    prompt: 'A pet nodding with fake understanding expression, question marks floating around head, pretending to comprehend',
    description: '"它一脸懂了的样子，其实脑子里在想肉干。"'
  },
  {
    id: 81,
    rarity: 'N',
    title: '原地emo选手',
    petType: 'universal',
    prompt: 'A pet sitting in corner with dark cloud over head, emo kid aesthetic, sad for no reason',
    description: '"没有什么事情发生，但它就是突然不开心了。"'
  },
  {
    id: 82,
    rarity: 'N',
    title: '假笑男/女孩',
    petType: 'universal',
    prompt: 'A pet with forced awkward smile, clearly fake happiness, stock photo energy',
    description: '"笑容是假的，但想吃零食的心是真的。"'
  },
  {
    id: 83,
    rarity: 'N',
    title: '精准踩雷专家',
    petType: 'universal',
    prompt: 'A pet stepping on every wrong spot, floor covered in unlucky symbols, misfortune magnet',
    description: '"如果有一滩水，它一定会踩进去。"'
  },
  {
    id: 84,
    rarity: 'N',
    title: '嘴硬王',
    petType: 'cat',
    prompt: 'A cat with stubborn pouty expression, turned away dramatically, maximum tsundere energy',
    description: '"明明很想要抱抱，但就是不说。"'
  },
  {
    id: 85,
    rarity: 'N',
    title: '窝里横冠军',
    petType: 'universal',
    prompt: 'A pet acting tough at home, timid outside, split personality visual, brave indoors only',
    description: '"在家是老虎，出门是猫咪（反过来也成立）。"'
  },
  {
    id: 86,
    rarity: 'N',
    title: '已读不回大师',
    petType: 'cat',
    prompt: 'A cat looking at phone with blank expression, message bubbles ignored, cold shoulder aesthetic',
    description: '"看到了，但是不想理你，很合理。"'
  },
  {
    id: 87,
    rarity: 'N',
    title: '废话文学集大成者',
    petType: 'universal',
    prompt: 'A pet with speech bubbles full of obvious statements, captain obvious energy',
    description: '"听君一席话，如听一席话。"'
  },
  {
    id: 88,
    rarity: 'N',
    title: '什么都想吃协会',
    petType: 'dog',
    prompt: 'A dog drooling looking at everything as food, eyes like scanning mode, always hungry',
    description: '"世界上只有两种东西：能吃的，和还没试过能不能吃的。"'
  },
  {
    id: 89,
    rarity: 'N',
    title: '职业铲屎官指挥家',
    petType: 'universal',
    prompt: 'A pet in conductor pose pointing at human, commanding cleaning duties, boss of the house',
    description: '"它不做事，它只负责指挥你做事。"'
  },
  {
    id: 90,
    rarity: 'N',
    title: '选择困难症晚期',
    petType: 'universal',
    prompt: 'A pet between two food bowls, paralyzed with indecision, brain overload expression',
    description: '"左边是鸡肉味，右边是牛肉味，它已经纠结了半小时。"'
  },
  {
    id: 91,
    rarity: 'N',
    title: '热搜体质',
    petType: 'universal',
    prompt: 'A pet surrounded by floating hot search hashtags, internet famous for no reason aesthetic',
    description: '"做什么都能上热搜，主要是够丑够搞笑。"'
  },
  {
    id: 92,
    rarity: 'N',
    title: '白嫖怪本怪',
    petType: 'universal',
    prompt: 'A pet with shopping cart full of free samples, freeloader pride energy',
    description: '"花钱是不可能花钱的，这辈子不可能花钱的。"'
  },
  {
    id: 93,
    rarity: 'N',
    title: '复读机本机',
    petType: 'universal',
    prompt: 'A pet with same expression repeated multiple times, echo chamber visual',
    description: '"你说什么它就叫什么，工作内容：复读。"'
  },
  {
    id: 94,
    rarity: 'N',
    title: '碰瓷专业户',
    petType: 'universal',
    prompt: 'A pet dramatically lying down pretending to be hurt, scam artist vibes',
    description: '"轻轻碰一下就倒地不起，奥斯卡欠它一座小金人。"'
  },
  {
    id: 95,
    rarity: 'N',
    title: '恐婚恐育代言人',
    petType: 'universal',
    prompt: 'A pet running away from baby toys and wedding rings, escape mode activated',
    description: '"一听到小孩哭声就想原地消失。"'
  },
  {
    id: 96,
    rarity: 'N',
    title: '起床困难综合征',
    petType: 'universal',
    prompt: 'A pet being dragged out of bed, clinging to blanket for dear life, morning struggle',
    description: '"每天起床都像在和床谈一场生离死别的恋爱。"'
  },
  {
    id: 97,
    rarity: 'N',
    title: '人间清醒',
    petType: 'universal',
    prompt: 'A pet with knowing exhausted expression, seen it all energy, wise but tired',
    description: '"看透一切但选择躺平，这就是人间清醒。"'
  },
  {
    id: 98,
    rarity: 'N',
    title: '不想努力了',
    petType: 'universal',
    prompt: 'A pet sitting with white flag of surrender, giving up on everything pose',
    description: '"努力有什么用？不如睡一觉。"'
  },
  {
    id: 99,
    rarity: 'N',
    title: '富婆/富豪收留对象',
    petType: 'universal',
    prompt: 'A pet holding "adopt me" sign with hopeful eyes, sugar baby energy',
    description: '"不想奋斗了，只想被包养。"'
  },
  {
    id: 100,
    rarity: 'N',
    title: '宇宙级显眼包',
    petType: 'universal',
    prompt: 'A pet doing something extremely attention-seeking, spotlight everywhere, main character syndrome',
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
