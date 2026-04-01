import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#FFFFFF",
        canvas: "#F5F5F5",
        border: "#E5E5E5",
        text: "#1E1E1E",
        "text-secondary": "#6B6B6B",
        "text-tertiary": "#999999",
        primary: "#0D99FF",
        "primary-light": "#E8F4FD",
        success: "#14AE5C",
        "success-light": "#E8F8EF",
        warning: "#F2A20C",
        "warning-light": "#FEF6E0",
        danger: "#F24822",
        "danger-light": "#FDE8E4",
        purple: "#7B61FF",
        "purple-light": "#F0ECFF",
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
