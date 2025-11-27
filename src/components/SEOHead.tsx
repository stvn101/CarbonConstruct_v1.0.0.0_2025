import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
}

const BASE_URL = 'https://carbonconstruct.com.au';
const DEFAULT_IMAGE = `${BASE_URL}/hero-carbon-calc.webp`;
const SITE_NAME = 'CarbonConstruct';

export function SEOHead({
  title,
  description = 'Professional carbon footprint calculator for Scope 1, 2 & 3 emissions. NCC compliant with Green Star and NABERS integration for Australian construction projects.',
  canonicalPath = '/',
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Australian Carbon Emissions Calculator`;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update or create link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Standard meta tags
    setMetaTag('description', description);
    
    // Robots
    if (noIndex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      setMetaTag('robots', 'index, follow');
    }

    // Open Graph tags
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:site_name', SITE_NAME, true);
    setMetaTag('og:locale', 'en_AU', true);

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);

    // Canonical URL
    setLinkTag('canonical', canonicalUrl);

    // Structured data for organization
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: description,
      url: BASE_URL,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'AUD',
        description: 'Free tier available'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '50'
      }
    };

    let scriptElement = document.querySelector('script[type="application/ld+json"]');
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = JSON.stringify(structuredData);

  }, [fullTitle, description, canonicalUrl, ogImage, ogType, noIndex]);

  return null;
}
