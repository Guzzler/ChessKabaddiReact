/** @type {import('tailwindcss').Config} */
export default {
darkMode: ["class"],
content: [
"./index.html",
"./src/**/*.{ts,tsx}",
],
theme: {
container: { center: true, padding: "1.25rem" },
extend: {
colors: {
brand: {
50: "#f2f7ff",
100: "#e6efff",
200: "#cbe0ff",
300: "#9fc3ff",
400: "#6aa1ff",
500: "#3f82ff",
600: "#1b66f5",
700: "#124dd1",
800: "#103ea6",
900: "#0f367f"
}
},
boxShadow: {
soft: "0 10px 30px rgba(0,0,0,.08)",
glow: "0 0 0 6px rgba(63,130,255,.15)",
},
borderRadius: { '2xl': '1.25rem' },
animation: { 'enter': 'enter .25s ease-out' },
keyframes: {
enter: {
'0%': { opacity: 0, transform: 'translateY(6px) scale(.98)' },
'100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
}
}
},
},
plugins: [],
};