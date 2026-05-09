export type BootLine = {
  label: string;
  status: 'OK' | '..';
};

export type BadgeIdentity = {
  id: string;
  name: string;
  role: string;
  description: string;
  meta: {
    id: string;
    role: string;
    status: string;
  };
};

export type WorkCard = {
  id: string;
  title: string;
  meta: string;
  description: string;
  ascii: string[];
};

export const bootLines: BootLine[] = [
  { label: 'initializing ascii layer', status: 'OK' },
  { label: 'loading identity', status: '..' },
  { label: 'compiling interface', status: '..' },
  { label: 'stabilizing signal', status: '..' }
];

export const asciiSymbols = ['.', ':', ';', '/', '\\', '|', '_', '-', '+', '*', '#', '[', ']', '}', '0', '1', 'x'];

export const backgroundGlyphs = [
  '.',
  ':',
  ';',
  '/',
  '\\',
  '|',
  '_',
  '-',
  '+',
  '*',
  '#',
  '[',
  ']',
  '}',
  '0',
  '1',
  'x'
];

export const codeFragments = [
  'const',
  'return',
  'async',
  'await',
  'props',
  'className',
  '<main />',
  '</div>',
  'npm run dev',
  'def',
  '--mono',
  'grid',
  'seed',
  'signal',
  'identity',
  'render()',
  'pointer',
  'badge',
  'system'
];

export const badgeIdentities: BadgeIdentity[] = [
  {
    id: 'sergey',
    name: 'SERGEY SMIRNOV',
    role: 'Разработка · Архитектура · Логика',
    description: 'Собирает техническую основу проекта, отвечает за код, структуру, надёжность и реализацию.',
    meta: {
      id: '01',
      role: 'DEV / SYSTEMS',
      status: 'ONLINE'
    }
  },
  {
    id: 'yan',
    name: 'YAN ZYRYANOV',
    role: 'Интерфейсы · Дизайн · Визуал',
    description: 'Проектирует внешний вид, интерфейсы, композицию, детали и визуальный язык продукта.',
    meta: {
      id: '02',
      role: 'UI / VISUAL',
      status: 'ONLINE'
    }
  }
];

export const workCards: WorkCard[] = [
  {
    id: 'interface-systems',
    title: 'Лендинг',
    meta: 'WEB / PRODUCT',
    description: 'Собираем первый экран, структуру, адаптив и выразительный фронтенд под запуск продукта или идеи.',
    ascii: ['┌────────────┐', '│ UI / FLOW  │', '│ 01 → 02 →  │', '└────────────┘']
  },
  {
    id: 'brand-motion',
    title: 'Интерфейс',
    meta: 'UI / SYSTEM',
    description: 'Проектируем понятные пользовательские сценарии и превращаем их в живые веб-интерфейсы.',
    ascii: ['╭────────────╮', '│ SM × ZY    │', '│ SIGNAL: OK │', '╰────────────╯']
  },
  {
    id: 'launch-builds',
    title: 'Дизайн-система',
    meta: 'VISUAL / CODE',
    description: 'Настраиваем визуальный язык, компоненты и правила, чтобы продукт выглядел цельно.',
    ascii: ['[ build ]', '[ test  ]', '[ ship  ]', '[ live  ]']
  }
];
