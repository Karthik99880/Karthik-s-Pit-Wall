import { useEffect } from 'react';

/**
 * Per-route <title> and <meta name="description">. Crawlers that execute JS
 * (Googlebot does, on its second pass) pick these up, so each route gets its
 * own keyword surface instead of every page inheriting the index.html defaults.
 */
export function useDocumentMeta(title: string, description: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    let created = false;
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = 'description';
      document.head.appendChild(tag);
      created = true;
    }
    const prevDesc = tag.content;
    tag.content = description;

    return () => {
      document.title = prevTitle;
      if (created) tag?.remove();
      else if (tag) tag.content = prevDesc;
    };
  }, [title, description]);
}
