const LOCALE = "en-GB";

const DATE_FULL = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "long",
  timeZone: "UTC",
});
const DATE_SHORT = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const MONTH_YEAR = new Intl.DateTimeFormat(LOCALE, {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Weekday initials, Monday first, for the calendar header. */
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${JSON.stringify(value)}`);
  }
  return date;
}

/** Tags that drive the build rather than describe a post. */
const RESERVED_TAGS = new Set(["all", "posts", "post"]);

export default function addFilters(eleventyConfig) {
  eleventyConfig.addFilter("readableDate", (v) => (v ? DATE_FULL.format(toDate(v)) : ""));
  eleventyConfig.addFilter("shortDate", (v) => (v ? DATE_SHORT.format(toDate(v)) : ""));
  eleventyConfig.addFilter("monthYear", (v) => (v ? MONTH_YEAR.format(toDate(v)) : ""));

  // <time datetime> and sitemap <lastmod> both want YYYY-MM-DD.
  eleventyConfig.addFilter("htmlDateString", (v) =>
    v ? toDate(v).toISOString().slice(0, 10) : ""
  );

  eleventyConfig.addFilter("absoluteUrl", (url, base) => new URL(url, base).href);

  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || n === 0) return [];
    return n < 0 ? array.slice(n) : array.slice(0, n);
  });

  eleventyConfig.addFilter("filterTagList", (tags = []) =>
    tags.filter((tag) => !RESERVED_TAGS.has(tag))
  );

  eleventyConfig.addFilter("postCalendar", postCalendar);
}

/**
 * Group posts into month-by-month calendar grids, newest month first.
 * Weeks start on Monday; leading/trailing cells are `null` so the template can
 * render a plain 7-column grid without doing any date maths itself.
 */
export function postCalendar(posts = [], limit = Infinity) {
  const byMonth = new Map();

  for (const post of posts) {
    const date = toDate(post.date);
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key).push(post);
  }

  const months = [...byMonth.keys()].sort().reverse().slice(0, limit);

  return months.map((key) => {
    const [year, month] = key.split("-").map(Number);
    const first = new Date(Date.UTC(year, month - 1, 1));
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    // getUTCDay(): 0 = Sunday. Shift so Monday === 0.
    const offset = (first.getUTCDay() + 6) % 7;

    const postsByDay = new Map();
    for (const post of byMonth.get(key)) {
      const day = toDate(post.date).getUTCDate();
      if (!postsByDay.has(day)) postsByDay.set(day, []);
      postsByDay.get(day).push(post);
    }

    const cells = [
      ...Array(offset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        return { day, posts: postsByDay.get(day) ?? [] };
      }),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    return {
      key,
      date: first,
      count: byMonth.get(key).length,
      weeks,
    };
  });
}
