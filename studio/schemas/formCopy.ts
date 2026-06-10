import { defineType, defineField } from "sanity";

export default defineType({
  name: "formCopy",
  title: "Form Copy",
  type: "document",
  fields: [
    defineField({ name: "filmworksSuccessTitle", type: "string" }),
    defineField({ name: "filmworksSuccessMessage", type: "text" }),
    defineField({ name: "liveSuccessTitle", type: "string" }),
    defineField({ name: "liveSuccessMessage", type: "text" })
  ]
});
