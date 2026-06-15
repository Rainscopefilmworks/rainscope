import { defineType, defineField } from "sanity";

export default defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "quote", type: "text", validation: (rule) => rule.required() }),
    defineField({ name: "image", type: "url", validation: (rule) => rule.required() }),
    defineField({
      name: "tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Filmworks", value: "filmworks" },
          { title: "Rentals", value: "rentals" },
          { title: "Live", value: "live" },
          { title: "Shop", value: "shop" }
        ]
      },
      description: "Which pages should show this testimonial."
    }),
    defineField({ name: "sortOrder", type: "number" })
  ],
  orderings: [
    {
      title: "Sort order",
      name: "sortOrderAsc",
      by: [{ field: "sortOrder", direction: "asc" }]
    }
  ],
  preview: {
    select: { title: "name", subtitle: "quote" }
  }
});
