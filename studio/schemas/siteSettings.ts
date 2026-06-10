import { defineType, defineField, defineArrayMember } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "siteName", type: "string", title: "Site Name" }),
    defineField({ name: "domain", type: "url", title: "Domain URL" }),
    defineField({ name: "tagline", type: "string", title: "Tagline" }),
    defineField({ name: "contactEmail", type: "string", title: "Contact Email" }),
    defineField({ name: "contactLocation", type: "string", title: "Contact Location" }),
    defineField({ name: "footerAbout", type: "text", title: "Footer About" }),
    defineField({ name: "footerTagline", type: "string", title: "Footer Tagline" }),
    defineField({ name: "copyrightYear", type: "number", title: "Copyright Year" }),
    defineField({
      name: "nav",
      type: "array",
      title: "Navigation",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", type: "string" }),
            defineField({ name: "href", type: "string" }),
            defineField({ name: "slug", type: "string" })
          ]
        })
      ]
    })
  ]
});
