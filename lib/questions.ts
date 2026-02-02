// lib/questions.ts

export interface QuestionOption {
  text: string;
  weight: { SSR: number; SR: number; R: number; N: number };
}

export interface Question {
  id: number;
  question: string;
  options: QuestionOption[];
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    question: '你家毛孩子平时的精神状态是？',
    options: [
      { text: '稳如老狗，气场两米八', weight: { SSR: 1, SR: 1, R: 0, N: 0 } },
      { text: '精明得很，总感觉在算计我', weight: { SSR: 0, SR: 1, R: 1, N: 0 } },
      { text: '普普通通，偶尔发疯', weight: { SSR: 0, SR: 0, R: 1, N: 1 } },
      { text: '精神状态遥遥领先，已经不装了', weight: { SSR: 0, SR: 0, R: 0, N: 2 } },
    ],
  },
  {
    id: 2,
    question: '如果它突然会说话，第一句最可能是？',
    options: [
      { text: '"愚蠢的人类，给本王跪下！"', weight: { SSR: 2, SR: 0, R: 0, N: 0 } },
      { text: '"钱打过来，事情好商量"', weight: { SSR: 0, SR: 2, R: 0, N: 0 } },
      { text: '"今天又要上班吗..."', weight: { SSR: 0, SR: 0, R: 2, N: 0 } },
      { text: '"饭呢？就这？"', weight: { SSR: 0, SR: 0, R: 0, N: 2 } },
    ],
  },
  {
    id: 3,
    question: '它盯着你看的时候，你觉得它在想什么？',
    options: [
      { text: '在思考如何统治世界', weight: { SSR: 1, SR: 1, R: 0, N: 0 } },
      { text: '在计算你还能被利用多久', weight: { SSR: 0, SR: 1, R: 1, N: 0 } },
      { text: '在想今晚吃什么', weight: { SSR: 0, SR: 0, R: 1, N: 1 } },
      { text: '可能什么都没想，脑子空空的', weight: { SSR: 0, SR: 0, R: 0, N: 2 } },
    ],
  },
  {
    id: 4,
    question: '它如果去参加工作，最适合什么岗位？',
    options: [
      { text: 'CEO，天生的领导者', weight: { SSR: 1, SR: 1, R: 0, N: 0 } },
      { text: '销售总监，能把猫粮卖出天价', weight: { SSR: 0, SR: 2, R: 0, N: 0 } },
      { text: '普通员工，混口饭吃', weight: { SSR: 0, SR: 0, R: 2, N: 0 } },
      { text: '失业，但快乐着', weight: { SSR: 0, SR: 0, R: 0, N: 2 } },
    ],
  },
  {
    id: 5,
    question: '用一个词形容它最近的状态？',
    options: [
      { text: '遥遥领先', weight: { SSR: 2, SR: 0, R: 0, N: 0 } },
      { text: '闷声发大财', weight: { SSR: 0, SR: 1, R: 1, N: 0 } },
      { text: '躺平', weight: { SSR: 0, SR: 0, R: 1, N: 1 } },
      { text: '摆烂但没完全摆', weight: { SSR: 0, SR: 0, R: 0, N: 2 } },
    ],
  },
];

// 计算所有答案的权重总和
export function calculateTotalWeight(selectedOptions: number[]): { SSR: number; SR: number; R: number; N: number } {
  const totalWeight = { SSR: 0, SR: 0, R: 0, N: 0 };

  selectedOptions.forEach((optionIndex, questionIndex) => {
    if (QUESTIONS[questionIndex] && QUESTIONS[questionIndex].options[optionIndex]) {
      const weight = QUESTIONS[questionIndex].options[optionIndex].weight;
      totalWeight.SSR += weight.SSR;
      totalWeight.SR += weight.SR;
      totalWeight.R += weight.R;
      totalWeight.N += weight.N;
    }
  });

  // 添加基础概率
  totalWeight.SSR += 5;   // 基础 5%
  totalWeight.SR += 15;   // 基础 15%
  totalWeight.R += 30;    // 基础 30%
  totalWeight.N += 50;    // 基础 50%

  return totalWeight;
}
