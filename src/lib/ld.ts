/** Shared schema.org nodes: the Organization and its editor (Person), linked by @id. */
import { site, siteName, absUrl } from './data';

const origin = absUrl('/');
export const ORG_ID = `${origin}#organization`;
export const EDITOR_ID = `${absUrl('/about/')}#editor`;
export const editorName = site.EDITOR_NAME;

export const organizationNode = () => ({
  '@type': 'Organization', '@id': ORG_ID, name: siteName, alternateName: site.SITE_ALTERNATE_NAME, url: origin,
  email: site.CONTACT_EMAIL, logo: absUrl('/favicon.svg'), founder: { '@id': EDITOR_ID }, publishingPrinciples: absUrl('/how-we-verify/'),
  correctionsPolicy: absUrl('/corrections/'),
});
/** Name only: no address, phone, personal email, photo or social profiles. */
export const editorNode = () => ({
  '@type': 'Person', '@id': EDITOR_ID, name: editorName, jobTitle: 'Editor', description: 'Independent researcher',
  url: absUrl('/about/'), worksFor: { '@id': ORG_ID },
});
export const authorRef = () => ({ '@type': 'Person', '@id': EDITOR_ID, name: editorName, url: absUrl('/about/') });

/** Article node for a guide: author is the editor, publisher the Organization. */
export function articleLd(a: { headline: string; path: string; dateModified: string; datePublished?: string; extra?: Record<string, unknown> }) {
  return {
    '@context': 'https://schema.org', '@type': 'Article', headline: a.headline, inLanguage: 'en-US', mainEntityOfPage: absUrl(a.path),
    ...(a.datePublished ? { datePublished: a.datePublished } : {}), dateModified: a.dateModified,
    author: authorRef(), publisher: { '@type': 'Organization', '@id': ORG_ID, name: siteName, url: origin },
    ...(a.extra ?? {}),
  };
}
