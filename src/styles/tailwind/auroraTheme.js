const plugin = require("tailwindcss/plugin");

const linear = (stops) => ({
  backgroundImage: `linear-gradient(135deg, ${stops.join(", ")})`,
});

module.exports = plugin(({ addUtilities }) => {
  const gradientUtilities = {
    ".bg-aurora-amber": linear([
      "#FEF3C7 0%",
      "#FFF7ED 50%",
      "#FFE4E6 100%",
    ]),
    ".bg-aurora-emerald": linear([
      "#D1FAE5 0%",
      "#ECFDF5 55%",
      "#CCFBF1 100%",
    ]),
    ".bg-aurora-indigo": linear([
      "#E0E7FF 0%",
      "#F0F9FF 55%",
      "#F3E8FF 100%",
    ]),
    ".bg-aurora-violet": linear([
      "#EDE9FE 0%",
      "#FAF5FF 55%",
      "#DBEAFE 100%",
    ]),
    ".bg-aurora-teal": linear([
      "#CCFBF1 0%",
      "#ECFDF5 55%",
      "#D1FAE5 100%",
    ]),
    ".bg-aurora-slatewave": linear([
      "#F1F5F9 0%",
      "rgba(248, 250, 252, 0.9) 50%",
      "rgba(219, 234, 254, 0.6) 100%",
    ]),
    ".bg-aurora-shell": linear([
      "rgba(248, 250, 252, 0.96) 0%",
      "rgba(255, 255, 255, 0.95) 55%",
      "rgba(226, 254, 243, 0.78) 100%",
    ]),
    ".bg-aurora-mist": linear([
      "#FFFFFF 0%",
      "rgba(248, 250, 252, 0.95) 60%",
      "#F1F5F9 100%",
    ]),
  };

  const glowUtilities = {
    ".glow-aurora-amber": { backgroundColor: "rgba(251, 191, 36, 0.4)" },
    ".glow-aurora-emerald": { backgroundColor: "rgba(16, 185, 129, 0.35)" },
    ".glow-aurora-indigo": { backgroundColor: "rgba(99, 102, 241, 0.35)" },
    ".glow-aurora-violet": { backgroundColor: "rgba(129, 140, 248, 0.35)" },
    ".glow-aurora-teal": { backgroundColor: "rgba(45, 212, 191, 0.35)" },
    ".glow-aurora-slate": { backgroundColor: "rgba(148, 163, 184, 0.35)" },
  };

  const shapeUtilities = {
    ".rounded-aurora": { borderRadius: "24px" },
  };

  addUtilities({ ...gradientUtilities, ...glowUtilities, ...shapeUtilities });
});
