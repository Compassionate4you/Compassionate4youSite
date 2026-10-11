import { useEffect, useState } from 'react';
import { fetchSection } from '../services/sectionApi';

export default function useSection(slug) {
  const [state, setState] = useState({ section: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ section: null, loading: true, error: null });
    fetchSection(slug)
      .then((body) => {
        const section = body.section ?? body.data ?? body;
        // Anything that is not a real section (for example an HTML page from the
        // wrong address) is treated as an error instead of crashing the page.
        if (!section || !Array.isArray(section.cards)) {
          throw new Error('The server did not return a card section.');
        }
        if (!cancelled) setState({ section, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ section: null, loading: false, error });
      });
    return () => { cancelled = true; };
  }, [slug]);

  return state;
}