---
title: Understanding Chirpy Post Features
date: 2026-04-18 16:00:00 +0000
categories: [Tutorial, Theme]
tags: [chirpy, markdown, features]
pin: true
math: true
mermaid: true
image:
  path: https://picsum.photos/id/1/1200/630
  alt: A sample banner image for the post.
---

The **Chirpy** theme provides a lot of built-in features that make your blog posts interactive and visually appealing. Here are some of the most useful ones:

## 1. Pinned Posts
By adding `pin: true` to the front matter, this post will stay at the top of your homepage list.

## 2. Mermaid Diagrams
Chirpy supports [Mermaid](https://mermaid-js.github.io/mermaid/#/) out of the box. Just set `mermaid: true` and use a code block:

```mermaid
graph TD
  A[Start] --> B{Is it working?}
  B -- Yes --> C[Great!]
  B -- No --> D[Check config]
```

## 3. Mathematical Expressions
With `math: true`, you can render LaTeX formulas like this:

$$
E = mc^2
$$

Or inline like $a^2 + b^2 = c^2$.

## 4. Prompt Boxes (Admonitions)
Chirpy provides beautiful custom boxes to highlight information:

> [!TIP]
> This is a helpful tip to improve your workflow.

> [!WARNING]
> Be careful with this configuration!

> [!IMPORTANT]
> This is a critical piece of information you shouldn't miss.

## 5. Footnotes
You can easily add footnotes to your text[^1].

[^1]: This is the footnote content.

## 6. Task Lists
- [x] Create a blog
- [x] Install Chirpy theme
- [ ] Write 100 posts
