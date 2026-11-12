// @vitest-environment happy-dom
/**
 * Guards the alerts signup: our extra script must NEVER block MailerLite's own submit,
 * whatever MailerLite's form looks like (missing state input, no form yet, unexpected markup).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { wireStateField, KEY_DATES_FIELD } from '../src/scripts/signup-loader';

function makeBox(formHtml: string | null, opts: { fixed?: boolean } = {}) {
  document.body.innerHTML = `
    <section class="signup" ${opts.fixed ? 'data-ml-fixed="1"' : ''}>
      <strong data-ml-state-name>your state</strong>
      <div data-ml-state-wrap hidden><select data-ml-state><option value="">Choose</option><option value="CO" selected>Colorado</option><option value="CA">California</option></select></div>
      <div data-ml-keydates-wrap hidden><label><input type="checkbox" data-ml-keydates> Also email me key dates</label></div>
      <div class="ml-embedded">${formHtml ?? ''}</div>
    </section>`;
  const box = document.querySelector<HTMLElement>('section.signup')!;
  return box;
}
/** Stand-in for MailerLite's own handler: records that it ran, what the form held, and whether anything cancelled it. */
function submitAndRecord(form: HTMLFormElement) {
  const seen: { ran: boolean; prevented: boolean; fields: Record<string, string> } = { ran: false, prevented: false, fields: {} };
  form.addEventListener('submit', (e) => {
    seen.ran = true;
    seen.prevented = e.defaultPrevented;
    for (const el of Array.from(form.elements) as HTMLInputElement[]) if (el.name) seen.fields[el.name] = el.value;
    e.preventDefault(); // stop happy-dom from navigating; MailerLite also handles submit itself
  });
  const ev = new Event('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(ev);
  return seen;
}
const FULL = '<form><div class="ml-field-group"><input type="email" name="fields[email]" value="a@b.c"></div><div class="ml-field-group"><input type="text" name="fields[state]"></div><button type="submit">Subscribe</button></form>';
const NO_STATE = '<form><input type="email" name="fields[email]" value="a@b.c"><button type="submit">Subscribe</button></form>';

describe('alerts signup never blocks MailerLite submit', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('submit reaches MailerLite when its form LACKS the state input (unticked)', () => {
    const box = makeBox(NO_STATE); wireStateField(box);
    const seen = submitAndRecord(box.querySelector('form')!);
    expect(seen.ran).toBe(true);
    expect(seen.prevented).toBe(false);
    expect(seen.fields[KEY_DATES_FIELD]).toBeUndefined();
  });

  it('submit reaches MailerLite when its form lacks the state input (ticked) and still sends key_dates=yes', () => {
    const box = makeBox(NO_STATE); wireStateField(box);
    const kd = box.querySelector<HTMLInputElement>('[data-ml-keydates]')!;
    kd.checked = true; kd.dispatchEvent(new Event('change'));
    const seen = submitAndRecord(box.querySelector('form')!);
    expect(seen.ran).toBe(true);
    expect(seen.prevented).toBe(false);
    expect(seen.fields[KEY_DATES_FIELD]).toBe('yes');
  });

  it('full form, unticked: state filled, nothing extra sent', () => {
    const box = makeBox(FULL, { fixed: true }); wireStateField(box);
    const seen = submitAndRecord(box.querySelector('form')!);
    expect(seen.ran && !seen.prevented).toBe(true);
    expect(seen.fields['fields[state]']).toBe('Colorado');
    expect(seen.fields[KEY_DATES_FIELD]).toBeUndefined();
  });

  it('full form, ticked then unticked: key_dates sent only while ticked', () => {
    const box = makeBox(FULL); wireStateField(box);
    const kd = box.querySelector<HTMLInputElement>('[data-ml-keydates]')!;
    expect(kd.checked).toBe(false); // unticked by default
    kd.checked = true; kd.dispatchEvent(new Event('change'));
    expect(submitAndRecord(box.querySelector('form')!).fields[KEY_DATES_FIELD]).toBe('yes');
    kd.checked = false; kd.dispatchEvent(new Event('change'));
    expect(submitAndRecord(box.querySelector('form')!).fields[KEY_DATES_FIELD]).toBeUndefined();
  });

  it('form rendered AFTER wiring (MailerLite loads late): checkbox appears and submit still works', async () => {
    const box = makeBox(null); wireStateField(box);
    expect(box.querySelector<HTMLElement>('[data-ml-keydates-wrap]')!.hidden).toBe(true); // no form yet: no checkbox
    box.querySelector('.ml-embedded')!.innerHTML = NO_STATE;
    await new Promise((r) => setTimeout(r, 0)); // let the MutationObserver run
    expect(box.querySelector<HTMLElement>('[data-ml-keydates-wrap]')!.hidden).toBe(false);
    const seen = submitAndRecord(box.querySelector('form')!);
    expect(seen.ran && !seen.prevented).toBe(true);
  });

  it('unexpected MailerLite markup (old interest-group checkbox present) does not block submit', () => {
    const box = makeBox('<form><input type="email" name="fields[email]"><div class="ml-form-checkboxRow"><label><input type="checkbox" name="groups[]" value="1" required> Key dates</label></div></form>');
    wireStateField(box);
    const seen = submitAndRecord(box.querySelector('form')!);
    expect(seen.ran && !seen.prevented).toBe(true);
    // we no longer touch MailerLite's own controls: nothing of theirs is hidden by our script
    expect(box.querySelector<HTMLElement>('.ml-form-checkboxRow')!.style.display).toBe('');
  });
});
