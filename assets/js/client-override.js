import { getClientBySlug, getClientPublications } from './content-service.js';

async function overrideClientContent() {
  const slug = document.body.dataset.clientSlug;
  if (!slug) return;

  const client = await getClientBySlug(slug);
  if (!client) return;

  // Update Metadata
  document.title = `${client.name} | Caso de estudio Nexo`;
  
  // Update Hero Name
  const h1 = document.querySelector('h1.display-xl');
  if (h1) h1.textContent = client.name;
  
  // Update Breadcrumb
  const breadcrumb = document.querySelector('nav.breadcrumbs li[aria-current="page"]');
  if (breadcrumb) breadcrumb.textContent = client.name;
  
  // Update Eyebrow Category
  const eyebrow = document.querySelector('.case-hero .eyebrow');
  if (eyebrow) eyebrow.textContent = `CASO DE ESTUDIO / ${client.category?.toUpperCase() || ''}`;

  // Update Meta Info
  const caseMeta = document.querySelector('.case-meta');
  if (caseMeta) {
    const metaSpans = caseMeta.querySelectorAll('span');
    if (metaSpans.length >= 3) {
      metaSpans[0].textContent = `Cliente: ${client.name}`;
      metaSpans[1].textContent = `Servicios: ${(client.services || []).join(' · ')}`;
      metaSpans[2].textContent = `Sector: ${client.category || ''} · Año: ${client.year || ''}`;
    }
  }

  // Update Text Sections (Heuristics for legacy pages)
  const leadParagraphs = document.querySelectorAll('.case-section-grid .lead');
  if (leadParagraphs.length >= 2) {
    leadParagraphs[0].textContent = client.summary || leadParagraphs[0].textContent;
    leadParagraphs[1].textContent = client.workDeveloped || client.challenge || leadParagraphs[1].textContent;
  }
}

overrideClientContent();
