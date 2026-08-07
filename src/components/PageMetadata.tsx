import Head from 'next/head'

interface PageMetadataProps {
  title: string;
  description: string;
  canonicalUrl: string;
}

export default function PageMetadata({
  title,
  description,
  canonicalUrl,
}: PageMetadataProps) {
  return (
    <Head>
      <title key="title">{title}</title>
      <meta key="description" name="description" content={description} />
      <link key="canonical" rel="canonical" href={canonicalUrl} />

      <meta key="og_url" property="og:url" content={canonicalUrl} />
      <meta key="og_title" property="og:title" content={title} />
      <meta key="og_description" property="og:description" content={description} />

      <meta key="twitter_url" name="twitter:url" content={canonicalUrl} />
      <meta key="twitter_title" name="twitter:title" content={title} />
      <meta key="twitter_description" name="twitter:description" content={description} />
    </Head>
  )
}
