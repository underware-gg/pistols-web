import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Single SVG favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#0347AD" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
