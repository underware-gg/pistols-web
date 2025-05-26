import 'semantic-ui-css/semantic.min.css'
import '/src/styles/fonts.scss'
import '/src/styles/styles.scss'
import React from 'react'
import { AppProps } from 'next/app'
import Script from 'next/script'

function _app({ Component, pageProps }: AppProps) {
  return (
    <>
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
