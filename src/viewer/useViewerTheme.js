import { useSyncExternalStore } from 'react';

/** Follows document.documentElement.dataset.theme ('dark' | 'light'), which the app's theme toggle sets. */
function subscribe(callback) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}
const read = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

export default function useViewerTheme() {
  return useSyncExternalStore(subscribe, read, () => 'dark');
}
