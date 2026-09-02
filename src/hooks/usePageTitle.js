import { useEffect } from 'react';

/**
 * Custom hook to dynamically set document title
 * @param {string} title 
 */
export default function usePageTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | ScrapConnect`;
    } else {
      document.title = 'ScrapConnect — Sell Scrap. Find Buyers.';
    }
  }, [title]);
}
