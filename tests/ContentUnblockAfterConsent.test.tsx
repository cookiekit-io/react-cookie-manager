import {
  blockTrackingScripts,
  setBlockingEnabled,
  unblockPreviouslyBlockedContent,
} from '../src/utils/cookie-blocking';

describe('content unblocking after consent', () => {
  const YT = 'https://www.youtube.com/embed/abc123';

  afterEach(() => {
    // Reset DOM and re-enable blocking for isolation
    document.body.innerHTML = '';
    setBlockingEnabled(true);
  });

  test('restores previously blocked iframe without page refresh', () => {
    const iframe = document.createElement('iframe');
    iframe.src = YT;
    document.body.appendChild(iframe);

    const observer = blockTrackingScripts(['youtube.com']);

    // Sanity: iframe is blocked and wrapped
    expect(iframe.getAttribute('data-cookie-blocked')).toBe('true');
    expect(iframe.src).toBe('about:blank');
    const wrapperBefore = iframe.parentElement as HTMLElement | null;
    expect(wrapperBefore).not.toBeNull();

    // Simulate consent granted: disable blocking and unblock existing items
    setBlockingEnabled(false);
    observer.disconnect();
    unblockPreviouslyBlockedContent([]);

    // Iframe should be restored
    expect(iframe.getAttribute('data-cookie-blocked')).toBeNull();
    expect(iframe.getAttribute('data-original-src')).toBeNull();
    expect(iframe.src).toBe(YT);

    // Wrapper should be removed (iframe re-inserted in wrapper's place)
    const parent = iframe.parentElement as HTMLElement | null;
    expect(parent).not.toBeNull();
    // Wrapper should no longer contain the iframe
    if (wrapperBefore) {
      expect(wrapperBefore.contains(iframe)).toBe(false);
      // And wrapper should no longer be in DOM
      expect(document.body.contains(wrapperBefore)).toBe(false);
    }
  });

  test('newly added iframe after consent is not blocked', () => {
    // Start with active blocker (simulating earlier init), then consent
    const observer = blockTrackingScripts(['youtube.com']);
    setBlockingEnabled(false);
    observer.disconnect();
    unblockPreviouslyBlockedContent([]);

    const iframe = document.createElement('iframe');
    iframe.src = YT;
    document.body.appendChild(iframe);

    // Should not be altered
    expect(iframe.getAttribute('data-cookie-blocked')).toBeNull();
    expect(iframe.src).toBe(YT);
  });
});


