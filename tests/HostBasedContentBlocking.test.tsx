import {
  CookieBlockingManager,
  blockTrackingScripts,
  unblockPreviouslyBlockedContent,
  setBlockingEnabled,
} from '../src/utils/cookie-blocking';
import { getBlockedHosts, getBlockedKeywords } from '../src/utils/tracker-utils';

// Regression tests for host-based content blocking (fixes the "com.com" /
// junk-keyword over-block: matching by hostname instead of substring).
describe('host-based content blocking', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    setBlockingEnabled(true);
  });

  test('YouTube iframe is blocked when Advertising is declined', () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/abc123';
    document.body.appendChild(iframe);

    const blockedHosts = getBlockedHosts({
      Analytics: true,
      Social: true,
      Advertising: false,
    });
    const observer = blockTrackingScripts(blockedHosts);

    expect(iframe.getAttribute('data-cookie-blocked')).toBe('true');
    expect(iframe.src).toBe('about:blank');

    observer.disconnect();
  });

  test('YouTube iframe is NOT blocked when only Analytics is declined', () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/abc123';
    document.body.appendChild(iframe);

    const blockedHosts = getBlockedHosts({
      Analytics: false,
      Social: true,
      Advertising: true,
    });
    const observer = blockTrackingScripts(blockedHosts);

    expect(iframe.getAttribute('data-cookie-blocked')).toBeNull();
    expect(iframe.src).toBe('https://www.youtube.com/embed/abc123');

    observer.disconnect();
  });

  test('unrelated .com domain is never blocked even when all categories are declined', () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://example.com/widget';
    document.body.appendChild(iframe);

    const blockedHosts = getBlockedHosts({
      Analytics: false,
      Social: false,
      Advertising: false,
    });
    const observer = blockTrackingScripts(blockedHosts);

    expect(iframe.getAttribute('data-cookie-blocked')).toBeNull();
    expect(iframe.src).toBe('https://example.com/widget');

    observer.disconnect();
  });

  test('subdomain of a blocked host is blocked, a lookalike domain is not', () => {
    const subdomainIframe = document.createElement('iframe');
    subdomainIframe.src = 'https://www.youtube.com/embed/abc123';
    document.body.appendChild(subdomainIframe);

    const lookalikeIframe = document.createElement('iframe');
    lookalikeIframe.src = 'https://notyoutube.com/embed/abc123';
    document.body.appendChild(lookalikeIframe);

    const observer = blockTrackingScripts(['youtube.com']);

    expect(subdomainIframe.getAttribute('data-cookie-blocked')).toBe('true');
    expect(lookalikeIframe.getAttribute('data-cookie-blocked')).toBeNull();
    expect(lookalikeIframe.src).toBe('https://notyoutube.com/embed/abc123');

    observer.disconnect();
  });

  test('unblockPreviouslyBlockedContent restores content by hostname, not substring', () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://example.com/widget';
    document.body.appendChild(iframe);

    // Junk keyword-style entry ("com") would have blocked this under the old
    // substring matching; a hostname list must not.
    const observer = blockTrackingScripts(['com.com']);
    expect(iframe.getAttribute('data-cookie-blocked')).toBeNull();
    observer.disconnect();

    // Now actually block it via a matching host, then unblock with a
    // disjoint host list and confirm it is restored.
    const blockObserver = blockTrackingScripts(['example.com']);
    expect(iframe.getAttribute('data-cookie-blocked')).toBe('true');
    blockObserver.disconnect();

    setBlockingEnabled(false);
    unblockPreviouslyBlockedContent(['youtube.com']);

    expect(iframe.getAttribute('data-cookie-blocked')).toBeNull();
    expect(iframe.src).toBe('https://example.com/widget');
  });

  test('full manager path honors category consent (fails on the old keyword matcher)', () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/abc123';
    document.body.appendChild(iframe);

    // Exactly what the provider does: derive both lists from preferences and
    // hand them to the manager. With only Analytics declined, the Analytics
    // keyword set contains "com" (from the com.com entry), which the old
    // substring matcher applied to every .com URL. YouTube is consented here
    // (Advertising accepted), so it must stay.
    const preferences = { Analytics: false, Social: true, Advertising: true };
    const manager = new CookieBlockingManager();
    manager.initialize(getBlockedHosts(preferences), getBlockedKeywords(preferences));

    expect(iframe.getAttribute('data-cookie-blocked')).toBeNull();
    expect(iframe.src).toBe('https://www.youtube.com/embed/abc123');

    manager.cleanup();
  });

  test('tag manager and media CDNs are blocked via their own category lists', () => {
    const gtm = document.createElement('iframe');
    gtm.src = 'https://www.googletagmanager.com/ns.html?id=GTM-XXXX';
    document.body.appendChild(gtm);

    const thumb = document.createElement('iframe');
    thumb.src = 'https://i.ytimg.com/vi/abc123/hqdefault.jpg';
    document.body.appendChild(thumb);

    const observer = blockTrackingScripts(
      getBlockedHosts({ Analytics: false, Social: true, Advertising: false })
    );

    expect(gtm.getAttribute('data-cookie-blocked')).toBe('true');
    expect(thumb.getAttribute('data-cookie-blocked')).toBe('true');

    observer.disconnect();
  });
});
