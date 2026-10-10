import { useEffect, useState } from 'react';
import { fetchSection } from '../services/sectionApi';

export default function useSection(slug) {
  const [state, setState] = useState({ section: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ section: null, loading: true, error: null });
    fetchSection(slug)
      .then((body) => {
        if (!cancelled) setState({ section: body.section ?? body.data ?? body, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ section: null, loading: false, error });
      });
    return () => { cancelled = true; };
  }, [slug]);

  return state;
}