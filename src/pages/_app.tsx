import 'semantic-ui-css/semantic.min.css'
import '/src/styles/fonts.scss'
import '/src/styles/styles.scss'
import React from 'react'
import { AppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'

function _app({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#0347AD" />

        <meta
          key="description"
          name="description"
          content="10 paces, one shot. Whether you are duelling for honour or vengeance, be sure to put the bastard in the dirt. Made with love by Underware.gg"
        />
        <meta name="keywords" content="pistols, duel, game, blockchain, web3, underware, pistols at dawn" />
        <meta name="author" content="Underware.gg" />

        <meta property="og:type" content="website" />
        <meta key="og_url" property="og:url" content="https://pistols.gg" />
        <meta key="og_title" property="og:title" content="Pistols at Dawn" />
        <meta
          key="og_description"
          property="og:description"
          content="10 paces, one shot. Whether you are duelling for honour or vengeance, be sure to put the bastard in the dirt. Made with love by Underware.gg"
        />
        <meta property="og:image" content="https://assets.underware.gg/pistols/splash_og.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Pistols at Dawn" />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta key="twitter_url" name="twitter:url" content="https://pistols.gg" />
        <meta key="twitter_title" name="twitter:title" content="Pistols at Dawn" />
        <meta
          key="twitter_description"
          name="twitter:description"
          content="10 paces, one shot. Whether you are duelling for honour or vengeance, be sure to put the bastard in the dirt. Made with love by Underware.gg"
        />
        <meta name="twitter:image" content="https://assets.underware.gg/pistols/splash_og.jpg" />
        <meta name="twitter:site" content="@underware_gg" />
        <meta name="twitter:creator" content="@underware_gg" />

        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
      </Head>
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-24V4JK1LL7"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-24V4JK1LL7');
          `,
        }}
      />
      <Component {...pageProps} />
    </>
  )
}

export default _app
