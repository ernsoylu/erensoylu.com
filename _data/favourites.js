/**
 * Drives both /favourites/ (the card index) and every /favourites/<slug>/ page.
 * Adding a category is one entry here — no template changes.
 *
 * item: { name, by?, year?, note?, url? }
 */
export default [
  {
    slug: "music",
    title: "Music",
    blurb: "Records I keep coming back to, mostly while soldering.",
    byLabel: "by",
    items: [
      { name: "Machine Head", by: "Deep Purple", year: 1978, note: "Two instruments, eight minutes, nothing wasted. The piece I put on when a problem needs quiet." },
      { name: "Metallica (Black)", by: "Metallica", year: 1959, note: "Recorded almost entirely in first takes. It sounds like people listening to each other." },
      { name: "The Number of the Beast", by: "Iron Maiden", year: 1982, note: "Untitled tracks, no landmarks. Perfect for long debugging sessions." },
      { name: "Led Zeppelin I", by: "Led Zeppelin", year: 1976, note: "A whole hour built from one repeating idea that never quite repeats." },
      { name: "Dunya Yalan Soyluyor", by: "Mor ve Otesi", year: 1911, note: "Late romanticism at the exact moment it decided to become something else." },
    ],
  },
  {
    slug: "movies",
    title: "Movies",
    blurb: "Films where the craft is the point, not the packaging.",
    byLabel: "dir.",
    items: [
      { name: "Stalker", by: "Andrei Tarkovsky", year: 1979, note: "Three men walk toward a room that grants wishes and spend the film not entering it." },
      { name: "In the Mood for Love", by: "Wong Kar-wai", year: 2000, note: "Every frame is composed like a painting and every scene withholds the obvious one." },
      { name: "Le Samouraï", by: "Jean-Pierre Melville", year: 1967, note: "Almost no dialogue. The whole character is in how he straightens his hat." },
      { name: "The Conversation", by: "Francis Ford Coppola", year: 1974, note: "A film about an engineer who understands his instruments better than his life." },
      { name: "Chungking Express", by: "Wong Kar-wai", year: 1994, note: "Two loosely joined stories that have no business working together, and do." },
    ],
  },
  {
    slug: "books",
    title: "Books",
    blurb: "Fiction and non-fiction that changed how I look at something.",
    byLabel: "by",
    items: [
      { name: "The Design of Everyday Things", by: "Don Norman", year: 1988, note: "Once you've read it you cannot un-see a badly designed door, or a badly designed API." },
      { name: "Thinking in Systems", by: "Donella Meadows", year: 2008, note: "The clearest explanation I know of why fixing the obvious thing often makes it worse." },
      { name: "The Master and Margarita", by: "Mikhail Bulgakov", year: 1967, note: "The devil visits Moscow and the bureaucracy is the part that frightens him." },
      { name: "Ways of Seeing", by: "John Berger", year: 1972, note: "Thirty pages in and you're looking at every image differently. Still true fifty years on." },
      { name: "The Pragmatic Programmer", by: "Hunt & Thomas", year: 1999, note: "Aged better than almost anything else on the shelf, because it is about habits, not tools." },
      { name: "Snow", by: "Orhan Pamuk", year: 2002, note: "A poet stuck in a snowed-in town while everyone argues about what the country is." },
    ],
  },
  {
    slug: "tv-series",
    title: "TV Series",
    blurb: "Shows worth the hours they ask for.",
    byLabel: "created by",
    items: [
      { name: "The Wire", by: "David Simon", year: 2002, note: "A show about institutions, disguised as a show about police. Season four is the best thing on this list." },
      { name: "Chernobyl", by: "Craig Mazin", year: 2019, note: "The most honest television ever made about what happens when engineering truth meets politics." },
      { name: "Better Call Saul", by: "Gilligan & Gould", year: 2015, note: "Somehow more patient and more devastating than the show it came from." },
      { name: "Severance", by: "Dan Erickson", year: 2022, note: "Office design as horror. The production design alone earns its place." },
      { name: "Halt and Catch Fire", by: "Cantwell & Rogers", year: 2014, note: "The rare tech show that understands the work is never the interesting part — the people are." },
    ],
  },
  {
    slug: "frameworks",
    title: "Frameworks",
    blurb: "Tools I reach for without having to think about it.",
    items: [
      { name: "Eleventy", note: "Does one thing, does not invent a component model, gets out of the way. This site runs on it.", url: "https://www.11ty.dev/" },
      { name: "Zephyr RTOS", note: "The first embedded RTOS where the build system and driver model felt designed rather than accreted.", url: "https://zephyrproject.org/" },
      { name: "Embassy", note: "Async Rust on a microcontroller that actually makes sense. Still slightly amazed it works.", url: "https://embassy.dev/" },
      { name: "FastAPI", note: "Type hints doing real work. The generated docs alone save a week per project.", url: "https://fastapi.tiangolo.com/" },
      { name: "Tailwind CSS", note: "I resisted it for years and was wrong. Constraint beats a blank stylesheet.", url: "https://tailwindcss.com/" },
    ],
  },
  {
    slug: "programming-languages",
    title: "Programming Languages",
    blurb: "Ranked by how often I am glad I picked them, not by how much I enjoy arguing about them.",
    items: [
      { name: "Rust", note: "The borrow checker is a colleague who reviews every line at 3am and is never tired. Worth the argument.", url: "https://www.rust-lang.org/" },
      { name: "Go", note: "Boring on purpose. I can read code I wrote two years ago, which is the whole feature.", url: "https://go.dev/" },
      { name: "C", note: "Still the language the hardware speaks. Everything else on a microcontroller is a negotiation with it." },
      { name: "Python", note: "The fastest path from an idea to knowing whether the idea was any good." },
      { name: "Zig", note: "Comptime is the most interesting idea in systems languages this decade. Watching it closely.", url: "https://ziglang.org/" },
    ],
  },
];
