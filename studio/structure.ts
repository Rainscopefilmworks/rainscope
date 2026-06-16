import type { StructureResolver } from "sanity/structure";

const pageDoc = (S: Parameters<StructureResolver>[0], slug: string, title: string) =>
  S.listItem()
    .title(title)
    .child(S.document().schemaType("page").documentId(`page-${slug}`));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Rainscope CMS")
    .items([
      S.listItem()
        .title("Site")
        .child(
          S.list()
            .title("Site")
            .items([
              S.listItem()
                .title("Site Settings")
                .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
              S.listItem()
                .title("Form Copy")
                .child(S.document().schemaType("formCopy").documentId("formCopy"))
            ])
        ),

      S.divider(),

      S.listItem()
        .title("Pages")
        .child(
          S.list()
            .title("Pages")
            .items([
              pageDoc(S, "landing", "Landing"),
              pageDoc(S, "filmworks", "Filmworks"),
              pageDoc(S, "live", "Live"),
              pageDoc(S, "rentals", "Rentals"),
              pageDoc(S, "shop", "Shop")
            ])
        ),

      S.divider(),

      S.listItem()
        .title("Filmworks")
        .child(
          S.list()
            .title("Filmworks")
            .items([
              S.documentTypeListItem("workReel").title("Work Reels"),
              S.documentTypeListItem("film").title("Films"),
              S.documentTypeListItem("filmworksService").title("Services"),
              S.documentTypeListItem("teamMember").title("Team"),
              S.documentTypeListItem("testimonial").title("Testimonials")
            ])
        ),

      S.listItem()
        .title("Live")
        .child(
          S.list()
            .title("Live")
            .items([
              S.documentTypeListItem("liveService").title("Services"),
              S.documentTypeListItem("liveProject").title("Projects")
            ])
        ),

      S.listItem()
        .title("Rentals & Shop")
        .child(S.documentTypeListItem("faqItem").title("FAQ")),

      S.divider(),

      ...S.documentTypeListItems().filter(
        (item) =>
          ![
            "siteSettings",
            "formCopy",
            "page",
            "workReel",
            "film",
            "filmworksService",
            "teamMember",
            "testimonial",
            "liveService",
            "liveProject",
            "faqItem"
          ].includes(item.getId() ?? "")
      )
    ]);
