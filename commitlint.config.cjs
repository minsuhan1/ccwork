/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  // 본문 최소 줄 수는 기본 규칙에 없어 커스텀 규칙으로 추가
  plugins: [
    {
      rules: {
        'body-min-lines': ({ body }, _when, value = 2) => {
          const lines = (body || '')
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);
          return [
            lines.length >= value,
            `본문(body)은 최소 ${value}줄 이상 작성해야 합니다 (현재 ${lines.length}줄)`,
          ];
        },
      },
    },
  ],
  rules: {
    // 커밋 제목(첫 줄) 최대 72자 — GitHub/git log에서 잘리지 않는 길이
    'header-max-length': [2, 'always', 72],
    // 제목 필수
    'subject-empty': [2, 'never'],
    // 본문 필수 + 헤더와 본문 사이 빈 줄 필수(본문이 올바로 파싱되도록)
    'body-empty': [2, 'never'],
    'body-leading-blank': [2, 'always'],
    // 본문 최소 2줄
    'body-min-lines': [2, 'always', 2],
    // 프로젝트에서 쓰는 init 타입 추가 (기본 타입 + init)
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'init',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
  },
};
