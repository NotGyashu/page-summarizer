// tailwind.config.js

module.exports = {
  mode: "jit", // Just-in-Time mode for Tailwind CSS
  purge: ["./src/**/*.html", "./src/**/*.js"], // Purge unused styles in production
  darkMode: false, // or 'media' or 'class'
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
  variants: {
    extend: {},
  },
  plugins: [],
};


 
