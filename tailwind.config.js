/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            screens: {
                sm: '480px',
            },
            fontFamily: {
                monsterrat: ['var(--font-monsterrat)'],
            },
            fontSize: {
                'body-1': ['20px', '30px'],
                'body-2': ['16px', '20px'],
                'body-3': ['14px', '20px'],
                'body-4': ['20px', '20px'],
                'title-1': ['48px', '60px'],
                'title-2': ['40px', '60px'],
                'title-3': ['32px', '40px'],
                'head-1': ['56px', '60px'],
            },
            colors: {
                'primary-1': '#336C64 ',
                'primary-2': '#5C8983',
                'primary-3': '#85A7A2',
                'primary-4': '#D6E2E0',
                'secondary-1': '#E7A645',
                'secondary-2': '#ECB86A',
                'secondary-3': '#F1CA8F',
                'secondary-4': '#F5DBB5',
                'secondary-5': '#FAEDDA',
                'alert-1': '#E9000E',
                'alert-2': '#EDF3F3',
                'neutral-1': '#151515',
                'neutral-2': '#3C3C3C',
                'neutral-3': '#8A8A8A',
                'neutral-4': '#D0D0D0',
                'neutral-5': '#FFFFFF',
                'neutral-6': '#D1D9D9',
                'neutral-7': '#EDF3F3',
            },
            boxShadow: {
                high: '0px 0px 10px rgba(0, 0, 0, 0.15)',
                low: '0px 0px 4px rgba(0, 0, 0, 0.15)',
            },
            dropShadow: {
                high: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            },
            borderRadius: {
                'rad-1': '4px',
                'rad-2': '8px',
                'rad-3': '10px',
                'rad-4': '12px',
                'rad-5': '16px',
                'rad-6': '26px',
                'rad-7': '20px',
            },
        },
    },
    plugins: [],
};
