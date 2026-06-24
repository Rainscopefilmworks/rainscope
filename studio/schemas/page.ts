import { defineType, defineField } from "sanity";

const panelFields = [
  defineField({ name: "id", type: "string", title: "ID", description: "filmworks, rentals, or live" }),
  defineField({ name: "title", type: "string" }),
  defineField({ name: "subtitle", type: "string" }),
  defineField({ name: "description", type: "text" }),
  defineField({ name: "href", type: "string", title: "Link" }),
  defineField({ name: "cta", type: "string", title: "Button label" })
];

const isSlug = (slug: string) => ({ document }: { document?: { slug?: string } }) =>
  document?.slug !== slug;

export default defineType({
  name: "page",
  title: "Page",
  type: "document",
  groups: [
    { name: "seo", title: "SEO" },
    { name: "hero", title: "Hero" },
    { name: "content", title: "Page content" },
    { name: "sections", title: "Sections" }
  ],
  fields: [
    defineField({
      name: "slug",
      type: "string",
      title: "Slug",
      description: "landing, filmworks, live, rentals, or shop",
      group: "seo"
    }),
    defineField({ name: "title", type: "string", title: "Page Title", group: "seo" }),
    defineField({ name: "description", type: "text", title: "Meta Description", group: "seo" }),

    defineField({ name: "heroTagline", type: "string", group: "hero" }),
    defineField({ name: "heroTitle", type: "text", group: "hero" }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "url",
      description: "Full-width hero background image fallback when no hero video is set.",
      group: "hero",
      hidden: ({ document }) => document?.slug !== "live"
    }),
    defineField({
      name: "heroVideo",
      title: "Hero background video",
      type: "url",
      description: "Looping MP4 for the page hero (Filmworks and Live). Also used on the landing page panel.",
      group: "hero",
      hidden: ({ document }) => !["filmworks", "live"].includes(document?.slug ?? "")
    }),
    defineField({
      name: "showreelUrl",
      title: "Showreel link",
      type: "url",
      description: "YouTube or Vimeo URL for the hero showreel button.",
      group: "hero",
      hidden: ({ document }) => document?.slug !== "filmworks"
    }),
    defineField({
      name: "showreelLabel",
      title: "Showreel button label",
      type: "string",
      description: 'e.g. "Watch 2025 Showreel"',
      group: "hero",
      hidden: ({ document }) => document?.slug !== "filmworks"
    }),

    defineField({
      name: "panels",
      title: "Landing panels",
      type: "array",
      of: [{ type: "object", fields: panelFields }],
      group: "content",
      hidden: isSlug("landing")
    }),
    defineField({ name: "intro", type: "text", group: "content" }),
    defineField({ name: "sectionTitle", type: "string", group: "sections" }),
    defineField({ name: "sectionSubtitle", type: "string", group: "sections" }),

    defineField({
      name: "sectionCommercialTitle",
      type: "string",
      title: "Commercial section title",
      group: "sections",
      hidden: ({ document }) => document?.slug !== "filmworks"
    }),
    defineField({
      name: "sectionCommercialIntro",
      type: "text",
      title: "Commercial section intro",
      group: "sections",
      hidden: ({ document }) => document?.slug !== "filmworks"
    }),
    defineField({
      name: "sectionFilmsTitle",
      type: "string",
      title: "Films section title",
      group: "sections",
      hidden: ({ document }) => document?.slug !== "filmworks"
    }),
    defineField({
      name: "sectionFilmsSubtitle",
      type: "string",
      title: "Films section subtitle",
      group: "sections",
      hidden: ({ document }) => document?.slug !== "filmworks"
    }),
    defineField({
      name: "sectionFilmsIntro",
      type: "text",
      title: "Films section intro",
      group: "sections",
      hidden: ({ document }) => document?.slug !== "filmworks"
    }),
    defineField({
      name: "sectionTeamIntro",
      type: "text",
      title: "Team section intro",
      group: "sections",
      hidden: ({ document }) => document?.slug !== "filmworks"
    }),

    defineField({
      name: "showcaseTitle",
      type: "string",
      title: "Showcase section title",
      group: "sections",
      hidden: ({ document }) => document?.slug !== "live"
    }),
    defineField({
      name: "showcaseDescription",
      type: "text",
      title: "Showcase section intro",
      group: "sections",
      hidden: ({ document }) => document?.slug !== "live"
    }),
    defineField({
      name: "showcaseVideo",
      type: "url",
      title: "Showcase video (legacy)",
      description: "Deprecated. Live showcase videos are managed under Live → Projects.",
      group: "sections",
      hidden: ({ document }) => document?.slug !== "live"
    })
  ],
  preview: {
    select: { title: "title", slug: "slug" },
    prepare({ title, slug }) {
      return { title: title || "Untitled page", subtitle: slug };
    }
  }
});
