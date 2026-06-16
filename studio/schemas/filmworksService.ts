import { defineType, defineField } from "sanity";

export default defineType({
  name: "filmworksService",
  title: "Filmworks Service",
  type: "document",
  fields: [
    defineField({ name: "icon", type: "string" }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "description", type: "text" }),
    defineField({ name: "sortOrder", type: "number" })
  ]
});
