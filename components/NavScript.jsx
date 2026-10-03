'use client';
import { useEffect } from 'react';

// Minimal stand-in for the Elementor menu/form JS we don't ship.
export default function NavScript() {
  useEffect(() => {
    const closePopups = () => {
      document.querySelectorAll('.hw-popup:not([hidden])').forEach((p) => { p.hidden = true; });
      document.body.classList.remove('hw-popup-open');
    };
    // Live theme's hw-video-js: [data-hw-video] posters open the Vimeo player in a lightbox.
    let lightbox = null;
    let lightboxOpener = null;
    const closeVideo = () => {
      if (!lightbox) return;
      lightbox.remove();
      lightbox = null;
      document.documentElement.style.overflow = '';
      lightboxOpener?.focus();
      lightboxOpener = null;
    };
    const openVideo = (url, opener) => {
      if (!/^https:\/\//.test(url || '')) return;
      closeVideo();
      lightboxOpener = opener;
      lightbox = document.createElement('div');
      lightbox.className = 'hw-lightbox';
      lightbox.setAttribute('role', 'dialog');
      lightbox.setAttribute('aria-modal', 'true');
      lightbox.setAttribute('aria-label', 'Video');
      lightbox.innerHTML = '<div class="hw-lightbox__box"><button type="button" class="hw-lightbox__chiudi" aria-label="Close the video">&#10005;</button><div class="hw-lightbox__frame"></div></div>';
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.title = 'Video';
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      lightbox.querySelector('.hw-lightbox__frame').appendChild(iframe);
      document.body.appendChild(lightbox);
      document.documentElement.style.overflow = 'hidden';
      lightbox.querySelector('.hw-lightbox__chiudi').focus();
    };
    // Live theme's hw-tst-js: [data-hw-scelta] list items switch the visible testimonial slot.
    const showTestimonial = (group, index) => {
      if (!group) return;
      const items = group.querySelectorAll('.hw-tst__voce');
      const slots = group.querySelectorAll('.hw-tst__slot');
      items.forEach((item, i) => {
        item.classList.toggle('is-on', i === index);
        item.setAttribute('aria-current', i === index ? 'true' : 'false');
        if (slots[i]) slots[i].hidden = i !== index;
      });
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { closeVideo(); closePopups(); return; }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const choice = e.target.closest?.('[data-hw-scelta]');
      if (!choice) return;
      const items = [...choice.closest('[data-hw-tst]').querySelectorAll('.hw-tst__voce')];
      const i = items.indexOf(choice);
      const next = (i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
      showTestimonial(choice.closest('[data-hw-tst]'), next);
      items[next].focus();
      e.preventDefault();
    };
    const onClick = (e) => {
      const poster = e.target.closest('[data-hw-video]');
      if (poster) {
        openVideo(poster.getAttribute('data-hw-video'), poster);
        return;
      }
      if (e.target.closest('.hw-lightbox__chiudi') || e.target.classList.contains('hw-lightbox')) {
        closeVideo();
        return;
      }
      const choice = e.target.closest('[data-hw-scelta]');
      if (choice) {
        showTestimonial(choice.closest('[data-hw-tst]'), Number(choice.getAttribute('data-hw-scelta')));
        return;
      }
      const opener = e.target.closest('a[href^="#popup-"]');
      if (opener) {
        const popup = document.getElementById(opener.getAttribute('href').slice(1));
        if (popup) {
          e.preventDefault();
          popup.hidden = false;
          document.body.classList.add('hw-popup-open');
          return;
        }
      }
      if (e.target.closest('.hw-popup-close') || e.target.classList.contains('hw-popup')) {
        closePopups();
        return;
      }
      const popupLink = e.target.closest('.hw-popup a[href]');
      const expandable = popupLink?.parentElement.classList.contains('menu-item-has-children')
        && !popupLink.parentElement.classList.contains('submenu-open');
      if (popupLink && !expandable) closePopups();
      const nToggle = e.target.closest('.e-n-menu-toggle');
      if (nToggle) {
        const open = nToggle.getAttribute('aria-expanded') !== 'true';
        nToggle.setAttribute('aria-expanded', String(open));
        return;
      }
      const nIcon = e.target.closest('.e-n-menu-dropdown-icon');
      if (nIcon) {
        e.preventDefault();
        const li = nIcon.closest('.e-n-menu-item');
        const open = !li.classList.contains('submenu-open');
        li.parentElement.querySelectorAll('.e-n-menu-item.submenu-open').forEach((o) => {
          o.classList.remove('submenu-open');
          o.querySelector('.e-n-menu-dropdown-icon')?.setAttribute('aria-expanded', 'false');
        });
        li.classList.toggle('submenu-open', open);
        nIcon.setAttribute('aria-expanded', String(open));
        return;
      }
      const toggle = e.target.closest('.elementor-menu-toggle');
      if (toggle) {
        const nav = toggle.parentElement?.querySelector('.elementor-nav-menu--dropdown, nav');
        toggle.classList.toggle('elementor-active');
        if (nav) nav.classList.toggle('menu-open');
      }
      const item = e.target.closest('.menu-item-has-children > a');
      if (item && window.innerWidth <= 1024) {
        const li = item.parentElement;
        if (!li.classList.contains('submenu-open')) {
          e.preventDefault();
          li.classList.add('submenu-open');
        }
      }
    };
    // Elementor Pro forms (kept from the live markup) post to /api/contact, with
    // Elementor's default in-place success/error messages.
    const FORM_MESSAGES = {
      success: 'Your submission was successful.',
      danger: 'Your submission failed because of an error.',
    };
    const fieldLabel = (form, el) => {
      const own = el.id && form.querySelector(`label[for="${el.id}"]`);
      const group = el.closest('.elementor-field-group')?.querySelector('.elementor-field-label');
      const text = (el.type === 'checkbox' || el.type === 'radio') ? (group || own) : (own || group);
      return (text?.textContent || el.placeholder || el.name).replace(/\*/g, '').trim();
    };
    const formPayload = (form) => {
      const fields = new Map();
      form.querySelectorAll('input, select, textarea').forEach((el) => {
        if (!el.name || ['submit', 'button', 'hidden'].includes(el.type)) return;
        if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
        const value = el.value.trim();
        if (!value) return;
        const key = el.name.replace(/^form_fields\[([^\]]*)\].*$/, '$1');
        const f = fields.get(key) || { label: fieldLabel(form, el), type: el.type, values: [] };
        f.values.push(el.tagName === 'SELECT' ? el.selectedOptions[0].text.trim() : value);
        fields.set(key, f);
      });
      const pick = (test) => [...fields].filter(([k, f]) => test(k, f)).map(([, f]) => f.values.join(', '));
      return {
        name: pick((k) => /name/i.test(k)).join(' '),
        email: pick((k, f) => f.type === 'email' || /email/i.test(k))[0] || '',
        subject: `${form.getAttribute('name') || 'Enquiry'} – ${document.title}`,
        message: [...fields.values()].map((f) => `${f.label}: ${f.values.join(', ')}`).join('\n'),
      };
    };
    const onSubmit = async (e) => {
      const form = e.target.closest?.('form.elementor-form');
      if (!form) return;
      e.preventDefault();
      if (form.classList.contains('elementor-form-waiting')) return;
      form.querySelectorAll('.elementor-message').forEach((m) => m.remove());
      form.classList.add('elementor-form-waiting');
      const button = form.querySelector('[type="submit"]');
      if (button) button.disabled = true;
      let status = 'danger';
      try {
        const res = await fetch('/api/contact/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formPayload(form)),
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok && body.ok) status = 'success';
      } catch { /* network error: show the error message */ }
      form.classList.remove('elementor-form-waiting');
      if (button) button.disabled = false;
      if (status === 'success') form.reset();
      const msg = document.createElement('div');
      // Live runs Elementor's inline-SVG icon mode: success gets the SVG check, not the eicons glyph.
      msg.className = `elementor-message elementor-message-${status}${status === 'success' ? ' elementor-message-svg' : ''}`;
      msg.setAttribute('role', 'alert');
      msg.textContent = FORM_MESSAGES[status];
      form.appendChild(msg);
    };
    // Full-width mega-menu panels, as Elementor's JS does via --stretch-* vars.
    const stretch = () => {
      const width = document.documentElement.clientWidth;
      document.querySelectorAll('.e-n-menu-content').forEach((c) => {
        const parent = c.offsetParent || c.parentElement;
        const left = parent ? parent.getBoundingClientRect().left : 0;
        c.style.setProperty('--stretch-left', `${-left}px`);
        c.style.setProperty('--stretch-right', 'auto');
        c.style.setProperty('--stretch-width', `${width}px`);
      });
    };
    stretch();
    window.addEventListener('resize', stretch);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    document.addEventListener('submit', onSubmit);
    return () => {
      window.removeEventListener('resize', stretch);
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('submit', onSubmit);
      closeVideo();
    };
  }, []);
  return null;
}
