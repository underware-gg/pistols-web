import 'semantic-ui-css/semantic.min.css'
import '/src/styles/fonts.scss'
import '/src/styles/styles.scss'
import React from 'react'
import { AppProps } from 'next/app'

function _app({ Component, pageProps }: AppProps) {
  return (
    <Component {...pageProps} />
  )
}

export default _app
