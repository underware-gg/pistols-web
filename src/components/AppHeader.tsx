import React from 'react'
import Head from 'next/head'

interface AppHeaderProps {
  title?: string | null;
}

export default function AppHeader({
  title = null,
}: AppHeaderProps) {
	const domain = process.env.SERVER_URL;

	let desc = 'On chain dueling game!';
	let imageUrl = domain + '/images/logo.png';

	return (
		<Head>
      <title key='title'>{title ?? 'Pistols at Dawn'}</title>
      <link rel='icon' href='/favicon.ico' />

      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

			<meta key='social_url' property='og:url' content={'https://underware.gg/'} />
			<meta key='social_title' property='og:title' content={title ?? 'Pistols at Dawn'} />
			<meta key='social_desc' property='og:description' content={desc} />
			<meta key='social_image' property='og:image' content={imageUrl} />
			<meta key='social_image_type' property='og:image:type' content={'image/png'} />

			<meta key='twitter_card' name='twitter:card' content='summary' />
      <meta key='twitter_site' name='twitter:site' content='@underware_gg' />
			<meta key='twitter_image' name="twitter:image" content={imageUrl} />
      <meta key='twitter_creator' name='twitter:creator' content='@underware_gg' />
			<meta key='twitter_description' name="twitter:description" content={desc} />

		</Head>
	);
}

