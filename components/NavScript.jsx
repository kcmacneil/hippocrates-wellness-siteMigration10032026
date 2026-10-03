'use client';
import { useEffect } from 'react';

// Minimal interactivity to replace Elementor's frontend JS for nav menus:
// mobile hamburger toggle + tap-to-open submenus.
export default function NavScript() {
  useEffect(() => {
    const onClick = (e) => {
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
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
