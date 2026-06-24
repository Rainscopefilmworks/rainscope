import { defineType, defineField } from "sanity";

export default defineType({
  name: "teamMember",
  title: "Team Member",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string" }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "bio", type: "text" }),
    defineField({ name: "image", type: "url" }),
    defineField({ name: "sortOrder", type: "number" })
  ],
  orderings: [{ title: "Sort Order", name: "sortOrder", by: [{ field: "sortOrder", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "role" },
    prepare({ title, subtitle }) {
      return { title: title || "Untitled", subtitle };
    }
  }
});
