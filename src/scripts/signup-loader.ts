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

/**
 * Wire our own controls (state dropdown, key-dates checkbox) to the MailerLite form inside `box`.
 *
 * SAFETY RULES (tests/signup-loader.test.ts):
 *  - Nothing here may ever block MailerLite's own submit: no preventDefault, no stopPropagation, and every
 *    piece of our logic runs inside try/catch, so a missing or renamed MailerLite input can't break signups.
 *  - fields[state]: we fill MailerLite's own State input if the form has one; if not, we send nothing extra.
 *  - fields[key_dates]: our checkbox, unticked by default. Ticked -> we add a hidden input
 *    fields[key_dates]="yes" to MailerLite's form; unticked -> the input is removed, so nothing is sent.
 *    No dependency on any MailerLite group or field input.
 */
export const KEY_DATES_FIELD = 'fields[key_dates]';
const safe = (fn: () => void) => { try { fn(); } catch { /* never let our extras break the form */ } };

export function wireStateField(box: HTMLElement) {
  const embed = box.querySelector<HTMLElement>('.ml-embedded');
  if (!embed || box.dataset.wired) return;
  box.dataset.wired = '1';
  const sel = box.querySelector<HTMLSelectElement>('select[data-ml-state]');
  const wrap = box.querySelector<HTMLElement>('[data-ml-state-wrap]');
  const kd = box.querySelector<HTMLInputElement>('input[data-ml-keydates]');
  const kdWrap = box.querySelector<HTMLElement>('[data-ml-keydates-wrap]');
  if (kd) kd.checked = false; // unticked by default, always

  const syncState = () => safe(() => {
    const field = embed.querySelector<HTMLInputElement>('input[name="fields[state]"]');
    if (!field || !sel) return;
    const holder = field.closest<HTMLElement>('.ml-field-group') ?? field; // MailerLite's free-text box; our dropdown replaces it
    holder.style.display = 'none';
    field.value = sel.value ? sel.options[sel.selectedIndex].text : '';
    if (wrap && !box.dataset.mlFixed) wrap.hidden = false; // state pages: fixed state, dropdown stays hidden
  });
  const syncKeyDates = () => safe(() => {
    const form = embed.querySelector<HTMLFormElement>('form');
    if (!form || !kd) return;
    if (kdWrap) kdWrap.hidden = false; // show our checkbox once MailerLite's form is on the page
    const existing = form.querySelector<HTMLInputElement>(`input[type="hidden"][name="${KEY_DATES_FIELD}"][data-ours]`);
    if (kd.checked && !existing) {
      const h = document.createElement('input');
      h.type = 'hidden'; h.name = KEY_DATES_FIELD; h.value = 'yes'; h.dataset.ours = '1';
      form.appendChild(h);
    } else if (!kd.checked && existing) existing.remove();
  });
  const syncAll = () => { syncState(); syncKeyDates(); };

  safe(() => {
    const name = box.querySelector<HTMLElement>('[data-ml-state-name]');
    sel?.addEventListener('change', () => { safe(() => { if (name) name.textContent = sel.value ? sel.options[sel.selectedIndex].text : 'your state'; }); syncAll(); });
    kd?.addEventListener('change', syncKeyDates);
    // capture phase: runs just before MailerLite's own submit handler; it only fills inputs and never cancels
    embed.addEventListener('submit', syncAll, true);
    syncAll();
    if (!embed.querySelector('form')) {
      const mo = new MutationObserver(() => { if (embed.querySelector('form')) { mo.disconnect(); syncAll(); } });
      mo.observe(embed, { childList: true, subtree: true });
    }
  });
}
