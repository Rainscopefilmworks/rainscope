import { defineType, defineField } from "sanity";

const panelFields = [
  defineField({ name: "id", type: "string", title: "ID", description: "filmworks, rentals, or live" }),
  defineField({ name: "title", type: "string" }),
  defineField({ name: "subtitle", type: "string" }),
  defineField({ name: "description", type: "text" }),
  defineField({ name: "href", type: "string", title: "Link" }),
  defineField({ name: "cta", type: "string", title: "Button label" })
];

export default defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({ name: "slug", type: "string", title: "Slug" }),
    defineField({ name: "title", type: "string", title: "Page Title" }),
    defineField({ name: "description", type: "text", title: "Meta Description" }),
    defineField({ name: "heroTagline", type: "string" }),
    defineField({ name: "heroTitle", type: "text" }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "url",
      description: "Full-width hero background image fallback when no hero video is set."
    }),
    defineField({
      name: "heroVideo",
      title: "Hero video",
      type: "url",
      description: "Full-width looping hero background video (mp4). Used on Live and other division pages."
    }),
    defineField({ name: "showreelUrl", type: "url" }),
    defineField({
      name: "panels",
      title: "Landing panels",
      type: "array",
      of: [{ type: "object", fields: panelFields }],
      hidden: ({ document }) => document?.slug !== "landing"
    }),
    defineField({ name: "intro", type: "text" }),
    defineField({ name: "sectionTitle", type: "string" }),
    defineField({ name: "sectionSubtitle", type: "string" }),
    defineField({
      name: "sectionCommercialIntro",
      type: "text",
      title: "Commercial section intro",
      hidden: ({ document }) => document?.slug !== "filmworks"
    }),
    defineField({
      name: "sectionFilmsTitle",
      type: "string",
      title: "Films section title",
      hidden: ({ document }) => document?.slug !== "filmworks"
    }),
    defineField({
      name: "sectionFilmsSubtitle",
      type: "string",
      title: "Films section subtitle",
      hidden: ({ document }) => document?.slug !== "filmworks"
    }),
    defineField({
      name: "sectionFilmsIntro",
      type: "text",
      title: "Films section intro",
      hidden: ({ document }) => document?.slug !== "filmworks"
    }),
    defineField({
      name: "sectionTeamIntro",
      type: "text",
      title: "Team section intro",
      hidden: ({ document }) => document?.slug !== "filmworks"
    }),
    defineField({ name: "showcaseTitle", type: "string" }),
    defineField({ name: "showcaseDescription", type: "text" }),
    defineField({ name: "showcaseVideo", type: "url" })
  ]
});
