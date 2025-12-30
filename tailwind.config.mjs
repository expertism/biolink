/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        fontFamily: {
            custom: ['annabel', 'sans-serif'],
        },
        extend: {},
    },
    plugins: [],
}

export default config;