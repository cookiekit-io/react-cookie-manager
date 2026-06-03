import { blockTrackingRequests, restoreOriginalRequests } from '../src/utils/cookie-blocking';

// Regression test for issue #41: navigator.sendBeacon (used by GA and Microsoft
// Clarity) must be blocked for declined trackers.
describe('request-blocker sendBeacon (#41)', () => {
  const realSendBeacon = navigator.sendBeacon;

  beforeAll(() => {
    if (typeof navigator.sendBeacon !== 'function') {
      // jsdom may not implement sendBeacon; provide a stub that "sends".
      // @ts-expect-error - assigning stub
      navigator.sendBeacon = () => true;
    }
  });

  afterEach(() => {
    restoreOriginalRequests();
  });

  afterAll(() => {
    navigator.sendBeacon = realSendBeacon;
  });

  test('blocks sendBeacon to blocked hosts and lets others through', () => {
    const delivered: string[] = [];
    // Replace the underlying implementation so we can observe pass-through.
    // @ts-expect-error - assigning stub
    navigator.sendBeacon = (url: string) => {
      delivered.push(url.toString());
      return true;
    };

    blockTrackingRequests(['clarity.ms']);

    // Blocked host: must not reach the underlying implementation.
    const blockedResult = navigator.sendBeacon('https://c.clarity.ms/collect');
    expect(blockedResult).toBe(true); // queued/no-op to avoid caller errors
    expect(delivered).not.toContain('https://c.clarity.ms/collect');

    // Allowed host: must pass through.
    navigator.sendBeacon('https://good.example/beacon');
    expect(delivered).toContain('https://good.example/beacon');
  });
});
