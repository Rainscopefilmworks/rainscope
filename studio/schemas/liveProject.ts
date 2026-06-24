import { defineType, defineField } from "sanity";

export default defineType({
  name: "liveProject",
  title: "Live Project",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "category", type: "string" }),
    defineField({ name: "description", type: "text" }),
    defineField({
      name: "thumbnail",
      title: "Grid thumbnail (image)",
      type: "url",
      description: "Shown in the grid when no preview video is set."
    }),
    defineField({
      name: "preview",
      title: "Preview video (grid loop)",
      type: "url",
      description: "Short MP4 loop shown in the grid. Falls back to thumbnail or first gallery image."
    }),
    defineField({
      name: "video",
      title: "Full video (MP4)",
      type: "url",
      description: "Played in the modal when no YouTube embed is set."
    }),
    defineField({
      name: "embed",
      title: "YouTube embed URL",
      type: "url",
      description: "Optional. If set, opens in the modal instead of the MP4."
    }),
    defineField({
      name: "images",
      title: "Gallery images",
      type: "array",
      of: [{ type: "url" }],
      description: "Shown in the modal when no video or embed is set. Can include multiple photos."
    }),
    defineField({ name: "sortOrder", type: "number" })
  ],
  orderings: [{ title: "Sort Order", name: "sortOrder", by: [{ field: "sortOrder", direction: "asc" }] }],
  preview: {
    select: { title: "title", subtitle: "category" },
    prepare({ title, subtitle }) {
      return { title: title || "Untitled project", subtitle };
    }
  }
});
