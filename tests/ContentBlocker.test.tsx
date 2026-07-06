import { blockTrackingScripts } from '../src/utils/cookie-blocking';

describe('content-blocker', () => {
  test('replaces matching iframe with placeholder wrapper', () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/abc123';
    document.body.appendChild(iframe);

    const observer = blockTrackingScripts(['youtube.com']);

    // The iframe should now be wrapped and modified
    const wrappers = document.querySelectorAll('div');
    expect(wrappers.length).toBeGreaterThan(0);
    expect(iframe.getAttribute('data-cookie-blocked')).toBe('true');
    expect(iframe.src).toBe('about:blank');

    observer.disconnect();
  });
});


