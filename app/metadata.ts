import { Metadata } from 'next'

export const siteConfig = {
  name: 'SEI',
  title: 'Sistema Estatal de Investigadores',
  description: 'Plataforma para conectar investigadores y sus proyectos en el estado de Chihuahua',
  url: 'https://sei-chih.com.mx',
  ogImage: '/images/sei-logo.png',
  links: {
    github: 'https://github.com/I2Cprogramacion/SEI',
  },
}

export function createMetadata(
  title?: string,
  description?: string,
  image?: string
): Metadata {
  return {
    title: title ? `${title} | SEI` : 'SEI - Sistema Estatal de Investigadores',
    description: description || siteConfig.description,
    keywords: [
      'investigadores',
      'Chihuahua',
      'investigación',
      'ciencia',
      'proyectos',
      'colaboración',
      'SEI',
      'Sistema Estatal de Investigadores',
    ],
    authors: [
      {
        name: 'SEI',
        url: siteConfig.url,
      },
    ],
    creator: 'SEI',
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      type: 'website',
      locale: 'es_MX',
      url: siteConfig.url,
      title: title ? `${title} | SEI` : siteConfig.title,
      description: description || siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: image || siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title ? `${title} | SEI` : siteConfig.title,
      description: description || siteConfig.description,
      images: [image || siteConfig.ogImage],
      creator: '@SEI_Chihuahua',
    },
    icons: {
      icon: [
        {
          url: '/images/sei-logo.png',
          href: '/images/sei-logo.png',
        },
      ],
      shortcut: '/images/sei-logo.png',
      apple: '/images/sei-logo.png',
    },
    manifest: '/manifest.json',
  }
}
