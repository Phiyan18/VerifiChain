module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find the rule using source-map-loader and exclude lucide-react from it
      const rules = webpackConfig.module && webpackConfig.module.rules;
      if (Array.isArray(rules)) {
        const oneOfRule = rules.find((rule) => Array.isArray(rule.oneOf));
        if (oneOfRule && Array.isArray(oneOfRule.oneOf)) {
          const sourceMapRule = oneOfRule.oneOf.find(
            (rule) =>
              rule &&
              rule.enforce === "pre" &&
              rule.loader &&
              typeof rule.loader === "string" &&
              rule.loader.includes("source-map-loader")
          );

          if (sourceMapRule) {
            const existingExclude = sourceMapRule.exclude || [];
            sourceMapRule.exclude = [
              ...(Array.isArray(existingExclude) ? existingExclude : [existingExclude]),
              /node_modules[\\/]lucide-react[\\/]/
            ];
          }
        }
      }

      return webpackConfig;
    },
  },
};


