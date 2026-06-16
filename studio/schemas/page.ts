import { defineType, defineField } from "sanity";

export default defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({ name: "slug", type: "string", title: "Slug" }),
    defineField({ name: "title", type: "string", title: "Page Title" }),
    defineField({ name: "description", type: "text", title: "Meta Description" }),
    defineField({ name: "heroTagline", type: "string" }),
    defineField({ name: "heroTitle", type: "text" }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "url",
      description: "Full-width hero background image fallback when no hero video is set."
    }),
    defineField({
      name: "heroVideo",
      title: "Hero video",
      type: "url",
      description: "Full-width looping hero background video (mp4). Used on Live and other division pages."
    }),
    defineField({ name: "showreelUrl", type: "url" }),
    defineField({ name: "sectionTitle", type: "string" }),
    defineField({ name: "sectionSubtitle", type: "string" }),
    defineField({ name: "intro", type: "text" }),
    defineField({ name: "showcaseTitle", type: "string" }),
    defineField({ name: "showcaseDescription", type: "text" }),
    defineField({ name: "showcaseVideo", type: "url" })
  ]
});
