import { defineType, defineField } from "sanity";

export default defineType({
  name: "film",
  title: "Film",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "year", type: "string" }),
    defineField({ name: "logline", type: "text" }),
    defineField({ name: "poster", type: "url" }),
    defineField({
      name: "posterWebp",
      title: "Poster (WebP)",
      type: "url",
      description: "Optional WebP version for faster loading."
    }),
    defineField({ name: "youtubeEmbed", type: "url" }),
    defineField({ name: "cast", type: "string" }),
    defineField({ name: "written", type: "string" }),
    defineField({ name: "directed", type: "string" }),
    defineField({ name: "dop", type: "string" }),
    defineField({ name: "designer", type: "string" }),
    defineField({ name: "produced", type: "string" }),
    defineField({ name: "sortOrder", type: "number" })
  ],
  orderings: [{ title: "Sort Order", name: "sortOrder", by: [{ field: "sortOrder", direction: "asc" }] }]
});
