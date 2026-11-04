// DT-622 Sprint 8
// Preston Ball
// Hook resolving card sections and cards aligned with SectionStorageService and CardStorageService

import { useEffect, useState } from 'react';
import { SectionStorageService } from '../services/sectionStorageService';
import { CardStorageService } from '../services/cardStorageService';
import { fetchSection } from '../services/sectionApi';

export default function useSection(slug) {
  const [state, setState] = useState({ section: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    async function resolveSection() {
      try {
        // First check SectionStorageService (aligned with Content Editor)
        let sec = SectionStorageService.getSectionById(slug);
        if (!sec) {
          await SectionStorageService.loadFromDatabase();
          sec = SectionStorageService.getSectionById(slug);
        }

        if (sec) {
          const cardIds = sec.content?.cardIds || [];
          let cards = cardIds.map((id) => CardStorageService.getCardById(id)).filter(Boolean);
          if (cards.length === 0 && Array.isArray(sec.content?.cards)) {
            cards = sec.content.cards;
          }
          if (cards.length === 0 && cardIds.length > 0) {
            await CardStorageService.loadFromDatabase();
            cards = cardIds.map((id) => CardStorageService.getCardById(id)).filter(Boolean);
          }

          if (!cancelled) {
            setState({
              section: {
                id: sec.id,
                title: sec.content?.header || sec.content?.title || sec.id,
                columns: Number(sec.content?.gridCols || 3),
                cards,
              },
              loading: false,
              error: null,
            });
            return;
          }
        }

        // Fallback to sectionApi if not in CMS tables
        const body = await fetchSection(slug);
        const section = body.section ?? body.data ?? body;
        if (!section || !Array.isArray(section.cards)) {
          throw new Error('The server did not return a card section.');
        }
        if (!cancelled) setState({ section, loading: false, error: null });
      } catch (err) {
        if (!cancelled) setState({ section: null, loading: false, error: err });
      }
    }

    resolveSection();

    return () => { cancelled = true; };
  }, [slug]);

  return state;
}