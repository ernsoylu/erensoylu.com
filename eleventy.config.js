import path from "node:path";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

import addFilters from "./_config/filters.js";
import metadata from "./_data/metadata.js";

export default async function (eleventyConfig) {
  /* ---------------------------------------------------------------- assets */

  // Self-hosted variable font: no third-party request on any page load.
  eleventyConfig.addPassthroughCopy({
    "node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2":
      "fonts/jetbrains-mono-latin.woff2",
    "node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-ext-wght-normal.woff2":
      "fonts/jetbrains-mono-latin-ext.woff2",
    "node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-italic.woff2":
      "fonts/jetbrains-mono-latin-italic.woff2",
  });

  // CSS is a real Eleventy template, so `--serve` and `build` share one path.
  eleventyConfig.addTemplateFormats("css");
  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    useLayouts: false,
    compile: async (inputContent, inputPath) => {
      // Partials (_foo.css) are imported by others, never emitted alone.
      if (path.basename(inputPath).startsWith("_")) return;

      const result = await postcss([tailwindcss()]).process(inputContent, {
        from: inputPath,
      });
      return async () => result.css;
    },
  });

  // Tailwind reads class names out of the templates, so a template edit has to
  // invalidate the stylesheet too.
  eleventyConfig.addWatchTarget("./_includes/");
  eleventyConfig.addWatchTarget("./_config/");

  /* --------------------------------------------------------------- plugins */

  eleventyConfig.addPlugin(syntaxHighlight, { preAttributes: { tabindex: 0 } });

  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "posts", limit: 20 },
    metadata: {
      language: metadata.language,
      title: metadata.title,
      subtitle: metadata.description,
      base: `${metadata.url}/`,
      author: { name: metadata.author.name },
    },
  });

  addFilters(eleventyConfig);

  /* ----------------------------------------------------------- collections */

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByTag("posts").sort((a, b) => b.date - a.date)
  );

  // Every user-facing tag, with its post count, sorted by frequency.
  eleventyConfig.addCollection("tagList", (api) => {
    const counts = new Map();
    for (const item of api.getFilteredByTag("posts")) {
      for (const tag of item.data.tags ?? []) {
        if (tag === "posts") continue;
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    const max = Math.max(1, ...counts.values());
    return [...counts.entries()]
      .map(([tag, count]) => ({
        tag,
        count,
        // Bounded font size (rem): 0.85–1.30, so one prolific tag cannot dominate.
        weight: (0.85 + (max > 1 ? (count - 1) / (max - 1) : 0) * 0.45).toFixed(2),
      }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  });

  /* ------------------------------------------------------------- behaviour */

  // Drafts stay visible in `--serve`, never in a production build.
  eleventyConfig.addPreprocessor("drafts", "*", (data) => {
    if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") return false;
  });

  eleventyConfig.setServerOptions({ showAllHosts: true });
}

export const config = {
  dir: {
    input: "content",
    includes: "../_includes",
    data: "../_data",
    output: "_site",
  },
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
  templateFormats: ["md", "njk", "html", "css"],
};
