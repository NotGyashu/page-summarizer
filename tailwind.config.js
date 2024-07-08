// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust the path according to your project structure
  ],
  theme: {
    extend: {
      backgroundImage: {
        "custom-gradient1":
          "linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(82,10,10,1) 50%, rgba(252,176,69,1) 100%)",
        "custom-gradient2":
          "radial-gradient(circle, rgba(255,140,0,1) 73%, rgba(252,189,70,1) 100%)",
      },
    },
  },
  plugins: [],
};
