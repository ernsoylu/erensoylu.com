export default {
  layout: "layouts/post.njk",
  tags: ["posts"],
  // /blog/posts/my-post.md -> /blog/my-post/
  permalink: "/blog/{{ page.fileSlug }}/",
};
