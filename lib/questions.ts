export type CategoryKey =
  | 'communication' | 'trust' | 'conflict'
  | 'connection' | 'values' | 'boundaries' | 'redflags';

export type QuestionType = 'scale' | 'multi' | 'open';

export interface Question {
  id: number;
  category?: CategoryKey;
  text: string;
  type: QuestionType;
  hint?: string;
  reverse?: boolean;
  critical?: boolean;
  options?: { label: string; value: number }[];
}

export const CATEGORIES: Record<CategoryKey, { title: string; weight: number }> = {
  communication: { title: 'Коммуникация', weight: 1.2 },
  trust:         { title: 'Доверие', weight: 1.2 },
  conflict:      { title: 'Разрешение конфликтов', weight: 1.2 },
  connection:    { title: 'Эмоциональная связь', weight: 1.1 },
  values:        { title: 'Ценности и планы', weight: 1.0 },
  boundaries:    { title: 'Личные границы', weight: 1.0 },
  redflags:      { title: 'Красные флаги', weight: 1.5 },
};

export const CLOSED_QUESTIONS: Question[] = [
  // Коммуникация
  { id: 1, category: 'communication', type: 'scale', text: 'Насколько легко вам говорить с партнёром о своих чувствах?' },
  { id: 2, category: 'communication', type: 'scale', text: 'Когда партнёр расстроен, вы понимаете, что с ним происходит?' },
  { id: 3, category: 'communication', type: 'scale', text: 'Как часто вы замечаете, что партнёр вас не слушает?', reverse: true },

  // Доверие
  { id: 4, category: 'trust', type: 'scale', text: 'Насколько вы уверены, что партнёр вас не обманывает?' },
  { id: 5, category: 'trust', type: 'multi', text: 'Приходилось ли вам тайно проверять телефон или соцсети партнёра?', options: [
    { label: 'Никогда', value: 5 },
    { label: 'Было пару раз', value: 3 },
    { label: 'Иногда', value: 2 },
    { label: 'Регулярно', value: 1 },
  ]},

  // Конфликты
  { id: 6, category: 'conflict', type: 'multi', text: 'Как обычно проходят ваши ссоры?', options: [
    { label: 'Обсуждаем проблему, не переходя на личности', value: 5 },
    { label: 'Иногда срываемся на личности', value: 3 },
    { label: 'Часто переходим на личности и оскорбления', value: 1 },
  ]},
  { id: 7, category: 'conflict', type: 'scale', text: 'Как быстро вы остываете после ссоры?' },
  { id: 8, category: 'conflict', type: 'scale', text: 'Партнёр часто обесценивает ваши чувства во время конфликта?', reverse: true },

  // Связь
  { id: 9,  category: 'connection', type: 'scale', text: 'Как часто вы говорите партнёру слова любви или признательности?' },
  { id: 10, category: 'connection', type: 'scale', text: 'Насколько вы удовлетворены интимной жизнью?' },

  // Ценности
  { id: 11, category: 'values', type: 'scale', text: 'Совпадают ли ваши взгляды на создание семьи и детей?' },
  { id: 12, category: 'values', type: 'scale', text: 'Есть ли у вас общие долгосрочные цели?' },

  // Границы
  { id: 13, category: 'boundaries', type: 'scale', text: 'Можете ли вы сказать «нет» партнёру без страха?' },
  { id: 14, category: 'boundaries', type: 'scale', text: 'Партнёр пытается контролировать ваши встречи или общение?', reverse: true },

  // Красные флаги
  { id: 15, category: 'redflags', type: 'multi', text: 'Поднимал ли партнёр на вас руку или угрожал физической расправой?', critical: true, options: [
    { label: 'Никогда', value: 5 },
    { label: 'Было один раз / угрозы были', value: 1 },
    { label: 'Да, регулярно', value: 0 },
  ]},
  { id: 16, category: 'redflags', type: 'scale', text: 'Партнёр вас оскорбляет или унижает?', reverse: true },
  { id: 17, category: 'redflags', type: 'scale', text: 'Вы чувствуете себя собой рядом с партнёром?' },
];

export const OPEN_QUESTIONS: Question[] = [
  {
    id: 101,
    type: 'open',
    text: 'Что для вас значит «чувствовать себя любимым(ой)» в этих отношениях?',
    hint: 'Не спешите. Это личное — и очень ценное для анализа.',
  },
  {
    id: 102,
    type: 'open',
    text: 'О чём вы хотели бы поговорить с партнёром, но откладываете?',
    hint: 'Даже если не решаетесь сказать вслух — напишите здесь.',
  },
  {
    id: 103,
    type: 'open',
    text: 'Опишите момент, когда вы особенно остро почувствовали близость с партнёром.',
    hint: 'Это поможет увидеть, что для вас по-настоящему важно.',
  },
];

export const ALL_QUESTIONS: Question[] = [...CLOSED_QUESTIONS, ...OPEN_QUESTIONS];