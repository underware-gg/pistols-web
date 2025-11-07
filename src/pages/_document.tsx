import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Single SVG favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#0347AD" />
        
        {/* Basic Meta Tags */}
        <meta name="description" content="10 paces, one shot. Whether you are duelling for honour or vengeance, be sure to put the bastard in the dirt. Made with love by Underware.gg" />
        <meta name="keywords" content="pistols, duel, game, blockchain, web3, underware, pistols at dawn" />
        <meta name="author" content="Underware.gg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://pistols.gg" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pistols.gg" />
        <meta property="og:title" content="Pistols at Dawn" />
        <meta property="og:description" content="10 paces, one shot. Whether you are duelling for honour or vengeance, be sure to put the bastard in the dirt. Made with love by Underware.gg" />
        <meta property="og:image" content="https://assets.underware.gg/pistols/splash_og.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Pistols at Dawn" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://pistols.gg" />
        <meta name="twitter:title" content="Pistols at Dawn" />
        <meta name="twitter:description" content="10 paces, one shot. Whether you are duelling for honour or vengeance, be sure to put the bastard in the dirt. Made with love by Underware.gg" />
        <meta name="twitter:image" content="https://assets.underware.gg/pistols/splash_og.jpg" />
        <meta name="twitter:site" content="@underware_gg" />
        <meta name="twitter:creator" content="@underware_gg" />
        
        {/* Additional Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
