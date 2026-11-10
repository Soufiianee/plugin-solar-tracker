/**
 * MailerLite embedded form, loaded on demand.
 *  - The universal script is injected only when a page actually shows the form (never site-wide).
 *  - Our own state <select> fills MailerLite's free-text "State" field (fields[state]).
 *    The select stays hidden unless that field is found, so nothing breaks if the form changes.
 */
declare global { interface Window { ml?: (...a: unknown[]) => void } }

let injected = false;
export function loadMailerLite(account: string) {
  if (injected) return;
  injected = true;
  const w = window as Window & { ml?: any };
  w.ml = w.ml || function (...args: unknown[]) { ((w.ml as any).q = (w.ml as any).q || []).push(args); };
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://assets.mailerlite.com/js/universal.js';
  document.head.appendChild(s);
  w.ml('account', account);
}

/** Wire our state dropdown to the MailerLite form inside `box`. Safe to call more than once. */
export function wireStateField(box: HTMLElement) {
  const sel = box.querySelector<HTMLSelectElement>('select[data-ml-state]');
  const wrap = box.querySelector<HTMLElement>('[data-ml-state-wrap]');
  const embed = box.querySelector<HTMLElement>('.ml-embedded');
  if (!sel || !wrap || !embed || box.dataset.wired) return;
  box.dataset.wired = '1';
  const sync = () => {
    const field = embed.querySelector<HTMLInputElement>('input[name="fields[state]"]');
    if (!field) return false;
    // hide MailerLite's own free-text state box; our dropdown replaces it
    const holder = field.closest<HTMLElement>('.ml-field-group') ?? field;
    holder.style.display = 'none';
    field.value = sel.value ? sel.options[sel.selectedIndex].text : '';
    wrap.hidden = false;
    return true;
  };
  sel.addEventListener('change', sync);
  embed.addEventListener('submit', () => sync(), true);
  if (!sync()) {
    const mo = new MutationObserver(() => { if (sync()) mo.disconnect(); });
    mo.observe(embed, { childList: true, subtree: true });
  }
}
