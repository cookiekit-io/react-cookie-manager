import { readFileSync } from 'node:fs';
import { getBlockedHosts } from '../src/utils/tracker-utils';

// Regression test for issue #21: the raw tracker domains (some of which are
// cryptominer/malware domains) must not appear verbatim in the source that
// gets bundled, but must still be returned decoded at runtime.
describe('tracker list obfuscation (#21)', () => {
  test('source file does not contain malware domains verbatim', () => {
    const src = readFileSync('src/utils/trackers.ts', 'utf8');
    expect(src).not.toContain('hostingcloud.racing');
    expect(src).not.toContain('coinhive');
    expect(src).not.toContain('crypto-loot.com');
    // A common analytics domain should also not be present in plaintext.
    expect(src).not.toContain('google-analytics.com');
  });

  test('getBlockedHosts decodes domains back to plaintext at runtime', () => {
    const hosts = getBlockedHosts(null);
    expect(hosts).toContain('google-analytics.com');
    expect(hosts).toContain('clarity.ms');
    // No host should still look base64-encoded (e.g. contain "==" padding).
    expect(hosts.some((h) => h.includes('=='))).toBe(false);
  });
});
