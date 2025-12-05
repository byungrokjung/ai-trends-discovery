/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 감성적인 갈색/회색 톤
        primary: {
          DEFAULT: '#6B5B4B',    // 따뜻한 갈색
          hover: '#5A4A3C',
          light: '#F5F0EA',      // 아주 연한 베이지
          lighter: '#FAF7F4',    // 거의 흰색에 가까운 베이지
          dark: '#4A3C2F',
          accent: '#8B7355',     // 밝은 갈색 포인트
        },
        secondary: {
          DEFAULT: '#3E3E3E',    // 차콜 그레이
          light: '#5E5E5E',
          lighter: '#7E7E7E',
          lightest: '#9E9E9E',
          dark: '#2E2E2E',
        },
        accent: {
          DEFAULT: '#D4A574',    // 골드 브라운 포인트
          light: '#E0BC91',
          dark: '#B8935F',
          warm: '#E8D5C4',       // 따뜻한 베이지 톤
          blue: '#7B8FA6',       // 차분한 블루그레이
          purple: '#9B8B9B',     // 부드러운 퍼플그레이
          orange: '#D4876A',     // 부드러운 테라코타
          green: '#8B9B7A',      // 올리브 그린
        },
        gray: {
          50: '#FAFAF8',         // 약간의 따뜻함이 있는 그레이
          100: '#F5F5F3',
          200: '#EEEEE9',
          300: '#E0E0D8',
          400: '#BDBDB0',
          500: '#9E9E90',
          600: '#757568',
          700: '#616155',
          800: '#424239',
          900: '#2C2C26',
          950: '#1A1A16',
        },
        background: {
          DEFAULT: '#FEFDFB',    // 아주 살짝 베이지가 섞인 흰색
          secondary: '#FAF8F5',  // 따뜻한 배경색
          tertiary: '#F5F2ED',   // 연한 베이지 배경
          card: '#FFFFFF',       // 카드는 깨끗한 흰색
        },
        text: {
          primary: '#2C2C26',    // 거의 검은색에 가까운 갈색
          secondary: '#4A483E',  // 중간 갈색
          tertiary: '#6B6859',   // 연한 갈색
          disabled: '#9E9E90',
        },
        border: {
          DEFAULT: '#E5E2DD',    // 연한 베이지 보더
          light: '#F0EDE8',
          dark: '#D0CCC5',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'sans-serif'],
        serif: ['Noto Serif KR', 'serif'],
        display: ['Gowun Batang', 'Noto Serif KR', 'serif'], // 감성적인 디스플레이 폰트
      },
      fontSize: {
        // 감성적인 타이포그래피 스케일
        'display-lg': ['3.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '300' }],
        'display': ['2.75rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '300' }],
        'title-lg': ['2.25rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '400' }],
        'title': ['1.875rem', { lineHeight: '1.4', fontWeight: '500' }],
        'subtitle': ['1.5rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-lg': ['1.125rem', { lineHeight: '1.8' }],
        'body': ['1rem', { lineHeight: '1.75' }],
        'small': ['0.875rem', { lineHeight: '1.6' }],
        'caption': ['0.813rem', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      maxWidth: {
        'article': '680px', // 브런치 아티클 최대 너비
        'wide': '1024px',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}