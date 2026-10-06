type PageSchema = Record<string, unknown>;

export type BreadcrumbItem = {
  name: string;
  url: string;
};

type SeoPage = {
  title: string;
  description: string;
  path: string;
  schema?: PageSchema;
  breadcrumbs?: BreadcrumbItem[];
  noindex?: boolean;
};

export const SITE_ORIGIN = "https://strokechennai.org";
const SHARE_IMAGE = `${SITE_ORIGIN}/og.jpg`;
const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

const SITE_ORGANIZATION_SCHEMA: PageSchema = {
  "@type": "MedicalOrganization",
  "@id": ORGANIZATION_ID,
  name: "Arunai Neuro Foundation",
  url: `${SITE_ORIGIN}/`,
  logo: `${SITE_ORIGIN}/brand/arunai.png`,
};

const SITE_WEBSITE_SCHEMA: PageSchema = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: `${SITE_ORIGIN}/`,
  name: "Stroke Helpline Chennai",
  publisher: { "@id": ORGANIZATION_ID },
  inLanguage: ["en-IN", "ta-IN"],
};

function isPageNode(node: PageSchema) {
  const type = node["@type"];
  const types = Array.isArray(type) ? type : [type];
  return types.some((value) => value === "WebPage" || value === "CollectionPage" || value === "MedicalWebPage");
}

function addSiteEntities(
  schema: PageSchema,
  url: string,
  title: string,
  breadcrumbs?: BreadcrumbItem[],
): PageSchema {
  const sourceGraph = Array.isArray(schema["@graph"])
    ? (schema["@graph"] as PageSchema[])
    : [schema];
  const graph = [...sourceGraph];

  if (!graph.some((node) => node["@id"] === ORGANIZATION_ID)) {
    graph.unshift(SITE_ORGANIZATION_SCHEMA);
  }
  if (!graph.some((node) => node["@id"] === WEBSITE_ID)) {
    const organizationIndex = graph.findIndex((node) => node["@id"] === ORGANIZATION_ID);
    graph.splice(organizationIndex + 1, 0, SITE_WEBSITE_SCHEMA);
  }

  const pageIndex = graph.findIndex(
    (node) => isPageNode(node) && (node["@id"] === `${url}#webpage` || node.url === url),
  );
  const breadcrumbId = breadcrumbs?.length ? `${url}#breadcrumb` : undefined;

  if (pageIndex >= 0) {
    const page = graph[pageIndex];
    graph[pageIndex] = {
      ...page,
      isPartOf: page.isPartOf ?? { "@id": WEBSITE_ID },
      publisher: page.publisher ?? { "@id": ORGANIZATION_ID },
      ...(breadcrumbId ? { breadcrumb: { "@id": breadcrumbId } } : {}),
    };
  }

  if (breadcrumbs?.length && breadcrumbId) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        ...breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
        {
          "@type": "ListItem",
          position: breadcrumbs.length + 1,
          name: title,
          item: url,
        },
      ],
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export function seoHead({
  title,
  description,
  path,
  schema,
  breadcrumbs,
  noindex = false,
}: SeoPage) {
  const url = new URL(path, SITE_ORIGIN).toString();
  const pageSchema =
    schema ??
    (!noindex
      ? {
          "@type": "WebPage",
          "@id": `${url}#webpage`,
          url,
          name: title,
          description,
          isPartOf: { "@id": WEBSITE_ID },
          inLanguage: ["en-IN", "ta-IN"],
        }
      : undefined);
  const structuredData = pageSchema && !noindex ? addSiteEntities(pageSchema, url, title, breadcrumbs) : undefined;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      ...(noindex ? [{ name: "robots", content: "noindex,nofollow" }] : []),
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Stroke Helpline Chennai" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: SHARE_IMAGE },
      { property: "og:image:alt", content: "Stroke Assist Chennai logo" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: SHARE_IMAGE },
      { name: "twitter:image:alt", content: "Stroke Assist Chennai logo" },
    ],
    links: [{ rel: "canonical", href: url }],
    ...(structuredData
      ? {
          scripts: [
            {
              type: "application/ld+json",
              children: JSON.stringify(structuredData),
            },
          ],
        }
      : {}),
  };
}

export const SITE_SCHEMA: PageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    SITE_ORGANIZATION_SCHEMA,
    SITE_WEBSITE_SCHEMA,
    {
      "@type": "WebPage",
      "@id": `${SITE_ORIGIN}/#webpage`,
      url: `${SITE_ORIGIN}/`,
      name: "Stroke symptoms and hospitals in Chennai",
      description:
        "Start a quick warning-sign check or find Chennai hospital branches. Listings do not confirm current acceptance.",
      isPartOf: { "@id": WEBSITE_ID },
      publisher: { "@id": ORGANIZATION_ID },
      about: { "@type": "Thing", name: "Stroke warning signs and hospital navigation in Chennai" },
      inLanguage: ["en-IN", "ta-IN"],
    },
  ],
};
