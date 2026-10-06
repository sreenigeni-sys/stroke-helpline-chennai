type PageSchema = Record<string, unknown>;

type SeoPage = {
  title: string;
  description: string;
  path: string;
  schema?: PageSchema;
  noindex?: boolean;
};

const SITE_ORIGIN = "https://strokechennai.org";
const SHARE_IMAGE = `${SITE_ORIGIN}/og.jpg`;

export function seoHead({ title, description, path, schema, noindex = false }: SeoPage) {
  const url = new URL(path, SITE_ORIGIN).toString();
  const pageSchema = schema ??
    (!noindex
      ? {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${url}#webpage`,
          url,
          name: title,
          description,
          isPartOf: { "@type": "WebSite", name: "Stroke Helpline Chennai", url: `${SITE_ORIGIN}/` },
          inLanguage: ["en-IN", "ta-IN"],
        }
      : undefined);
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
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: SHARE_IMAGE },
    ],
    links: [{ rel: "canonical", href: url }],
    ...(pageSchema
      ? {
          scripts: [
            {
              type: "application/ld+json",
              children: JSON.stringify(pageSchema),
            },
          ],
        }
      : {}),
  };
}

export const SITE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_ORIGIN}/#organization`,
      name: "Arunai Neuro Foundation",
      url: `${SITE_ORIGIN}/`,
      logo: `${SITE_ORIGIN}/brand/arunai.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      url: `${SITE_ORIGIN}/`,
      name: "Stroke Helpline Chennai",
      publisher: { "@id": `${SITE_ORIGIN}/#organization` },
      inLanguage: ["en-IN", "ta-IN"],
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_ORIGIN}/#webpage`,
      url: `${SITE_ORIGIN}/`,
      name: "Stroke symptoms and hospitals in Chennai",
      description:
        "Start a quick warning-sign check or find Chennai hospital branches. Call 108 for ambulance help. Listings do not confirm current acceptance.",
      isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
      about: { "@type": "Thing", name: "Stroke warning signs and hospital navigation in Chennai" },
      inLanguage: ["en-IN", "ta-IN"],
    },
  ],
};
