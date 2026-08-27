export default {
  plugins: {
    "postcss-prefix-selector": {
      prefix: ".cookie-manager", // We need to scope all our styles with our own class
      transform(prefix, selector) {
        if (selector.startsWith("html")) return prefix;
        if (selector.startsWith(prefix)) return selector;
        return `${prefix} ${selector}`;
      },
    },
    "tailwindcss/nesting": {},
    tailwindcss: {},
    autoprefixer: {
      // Only add necessary prefixes
      flexbox: "no-2009",
      grid: "autoplace",
    },
    ...(process.env.NODE_ENV === "production"
      ? {
          cssnano: {
            preset: [
              "default",
              {
                discardComments: { removeAll: true },
                normalizeWhitespace: true,
                minifyFontValues: { removeQuotes: true },
                colormin: true,
                reduceIdents: true,
                mergeRules: true,
                mergeLonghand: true,
                discardDuplicates: true,
                discardEmpty: true,
              },
            ],
          },
        }
      : {}),
  },
};
