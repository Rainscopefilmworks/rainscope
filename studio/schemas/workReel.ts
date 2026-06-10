import { defineType, defineField } from "sanity";

export default defineType({
  name: "workReel",
  title: "Work Reel",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "category", type: "string" }),
    defineField({ name: "description", type: "text" }),
    defineField({
      name: "preview",
      title: "Preview video (grid loop)",
      type: "url",
      description: "Short MP4 loop shown in the gallery. Use the full video URL if no separate preview exists."
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
    defineField({ name: "sortOrder", type: "number" })
  ]
});
