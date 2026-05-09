export function scrollToPageSection(hash: string, behavior: ScrollBehavior = 'smooth') {
  if (!hash.startsWith('#')) return false;

  const id = decodeURIComponent(hash.slice(1));
  const target = document.getElementById(id);

  if (!target) return false;

  const topOffset = window.matchMedia('(max-width: 760px)').matches ? 76 : 86;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - topOffset;

  window.scrollTo({ top: Math.max(0, targetTop), behavior });
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
  window.dispatchEvent(new CustomEvent('page-section-scroll', { detail: { id } }));

  return true;
}
