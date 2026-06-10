import { defineType, defineField } from "sanity";

export default defineType({
  name: "faqItem",
  title: "FAQ Item",
  type: "document",
  fields: [
    defineField({ name: "question", type: "string" }),
    defineField({ name: "answer", type: "text" }),
    defineField({ name: "tag", type: "string", options: { list: ["rentals", "shop"] } }),
    defineField({ name: "sortOrder", type: "number" })
  ]
});
