import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  blockTrackingScripts,
  setBlockingTranslationFunction,
} from '../src/utils/cookie-blocking';
import { createTFunction } from '../src/utils/translations';

// Tests for the translatable blocked-content placeholder (issue #39).
describe('blocked-content placeholder translations (#39)', () => {
  let observer: MutationObserver | null = null;

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    observer?.disconnect();
    observer = null;
    setBlockingTranslationFunction(null);
    document.body.innerHTML = '';
  });

  const addBlockableIframe = () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/abc123';
    document.body.appendChild(iframe);
    return iframe;
  };

  it('uses the provided translations in the placeholder', () => {
    const t = createTFunction({
      blockedContentTitle: 'Contenu bloqué',
      blockedContentButtonText: 'Gérer les cookies',
    });
    setBlockingTranslationFunction(t);

    addBlockableIframe();
    observer = blockTrackingScripts(['youtube.com']);

    const html = document.body.innerHTML;
    expect(html).toContain('Contenu bloqué');
    expect(html).toContain('Gérer les cookies');
    // The English default title must not leak through when overridden.
    expect(html).not.toContain('Content Blocked');
  });

  it('falls back to English defaults when no translation function is set', () => {
    setBlockingTranslationFunction(null);

    addBlockableIframe();
    observer = blockTrackingScripts(['youtube.com']);

    const html = document.body.innerHTML;
    expect(html).toContain('Content Blocked');
    expect(html).toContain('Manage Cookie Settings');
  });
});
