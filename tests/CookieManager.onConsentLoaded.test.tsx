import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CookieManager } from '../src/context/CookieConsentContext';
import { setCookie, deleteCookie } from '../src/utils/cookie-utils';

const COOKIE_KEY = 'cookie-consent';

// Tests for the onConsentLoaded callback (issue #42): it should fire exactly
// once on mount with the consent restored from storage (or null when none).
describe('onConsentLoaded (#42)', () => {
  beforeEach(() => deleteCookie(COOKIE_KEY));
  afterEach(() => {
    cleanup();
    deleteCookie(COOKIE_KEY);
  });

  it('fires once on mount with null when no consent is stored', () => {
    const onConsentLoaded = vi.fn();

    render(
      <CookieManager onConsentLoaded={onConsentLoaded}>
        <div>App</div>
      </CookieManager>
    );

    expect(onConsentLoaded).toHaveBeenCalledTimes(1);
    expect(onConsentLoaded).toHaveBeenCalledWith(null);
  });

  it('fires once on mount with the persisted consent', () => {
    const now = new Date().toISOString();
    setCookie(
      COOKIE_KEY,
      JSON.stringify({
        Analytics: { consented: true, timestamp: now },
        Social: { consented: false, timestamp: now },
        Advertising: { consented: false, timestamp: now },
      }),
      365
    );

    const onConsentLoaded = vi.fn();

    render(
      <CookieManager onConsentLoaded={onConsentLoaded}>
        <div>App</div>
      </CookieManager>
    );

    expect(onConsentLoaded).toHaveBeenCalledTimes(1);
    const consent = onConsentLoaded.mock.calls[0][0];
    expect(consent).not.toBeNull();
    expect(consent.Analytics.consented).toBe(true);
    expect(consent.Social.consented).toBe(false);
    expect(consent.Advertising.consented).toBe(false);
  });
});
