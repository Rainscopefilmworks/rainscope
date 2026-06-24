import type { StructureBuilder, StructureResolver } from "sanity/structure";

const singleton = (S: StructureBuilder, type: string, id: string, title: string) =>
  S.listItem()
    .id(id)
    .title(title)
    .child(
      S.document()
        .schemaType(type)
        .documentId(id)
        .title(title)
    );

// List item id is the slug; document id stays page-{slug} (seeded singleton ids).
const pageSingleton = (S: StructureBuilder, slug: string, title: string) =>
  S.listItem()
    .id(slug)
    .title(title)
    .child(
      S.document()
        .schemaType("page")
        .documentId(`page-${slug}`)
        .title(title)
    );

export const structure: StructureResolver = (S) =>
  S.list()
    .id("root")
    .title("Rainscope CMS")
    .items([
      S.listItem()
        .id("site")
        .title("Site")
        .child(
          S.list()
            .id("site-list")
            .title("Site")
            .items([
              singleton(S, "siteSettings", "siteSettings", "Site Settings"),
              singleton(S, "formCopy", "formCopy", "Form Copy")
            ])
        ),

      S.divider(),

      S.listItem()
        .id("pages")
        .title("Pages")
        .child(
          S.list()
            .id("pages-list")
            .title("Pages")
            .items([
              pageSingleton(S, "landing", "Landing"),
              pageSingleton(S, "filmworks", "Filmworks"),
              pageSingleton(S, "live", "Live"),
              pageSingleton(S, "rentals", "Rentals"),
              pageSingleton(S, "shop", "Shop")
            ])
        ),

      S.divider(),

      S.listItem()
        .id("filmworks")
        .title("Filmworks")
        .child(
          S.list()
            .id("filmworks-list")
            .title("Filmworks")
            .items([
              S.documentTypeListItem("workReel")
                .id("workReels")
                .title("Work Reels"),
              S.documentTypeListItem("film").id("films").title("Films"),
              S.documentTypeListItem("filmworksService")
                .id("filmworksServices")
                .title("Services"),
              S.documentTypeListItem("teamMember").id("team").title("Team"),
              S.documentTypeListItem("testimonial")
                .id("testimonials")
                .title("Testimonials")
            ])
        ),

      S.listItem()
        .id("live")
        .title("Live")
        .child(
          S.list()
            .id("live-list")
            .title("Live")
            .items([
              S.documentTypeListItem("liveService")
                .id("liveServices")
                .title("Services"),
              S.documentTypeListItem("liveProject")
                .id("liveProjects")
                .title("Projects")
            ])
        ),

      S.listItem()
        .id("rentals-shop")
        .title("Rentals & Shop")
        .child(
          S.documentTypeListItem("faqItem").id("faq").title("FAQ")
        )
    ]);
