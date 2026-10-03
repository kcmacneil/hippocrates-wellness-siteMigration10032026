'use client';
import { useEffect } from 'react';

// Minimal stand-in for the Elementor menu JS we don't ship.
export default function NavScript() {
  useEffect(() => {
    const closePopups = () => {
      document.querySelectorAll('.hw-popup:not([hidden])').forEach((p) => { p.hidden = true; });
      document.body.classList.remove('hw-popup-open');
    };
    const onKey = (e) => { if (e.key === 'Escape') closePopups(); };
    const onClick = (e) => {
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
    return () => {
      window.removeEventListener('resize', stretch);
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);
  return null;
}
