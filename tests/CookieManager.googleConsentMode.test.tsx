import React from 'react';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CookieManager } from '../src/context/CookieConsentContext';
import { setCookie, deleteCookie } from '../src/utils/cookie-utils';

const COOKIE_KEY = 'cookie-consent';
const w = window as any;

const entries = () => (w.dataLayer || []).map((a: any) => Array.from(a));
const consentEntries = (action: string) =>
  entries().filter((e: any[]) => e[0] === 'consent' && e[1] === action);

describe('CookieManager googleConsentMode', () => {
  beforeEach(() => {
    deleteCookie(COOKIE_KEY);
    w.dataLayer = [];
    delete w.gtag;
  });

  afterEach(() => {
    cleanup();
    deleteCookie(COOKIE_KEY);
    delete w.dataLayer;
    delete w.gtag;
  });

  it('queues a denied default on mount when no consent is stored', () => {
    render(
      <CookieManager googleConsentMode>
        <div>App</div>
      </CookieManager>
    );

    const defaults = consentEntries('default');
    expect(defaults).toHaveLength(1);
    expect(defaults[0][2].analytics_storage).toBe('denied');
    // No update yet — user hasn't decided.
    expect(consentEntries('update')).toHaveLength(0);
  });

  it('pushes an update granting analytics/ads on accept', async () => {
    const user = userEvent.setup();
    render(
      <CookieManager googleConsentMode>
        <div>App</div>
      </CookieManager>
    );

    await user.click(await screen.findByText('Accept'));

    // The consent buttons fire after a short close animation.
    await waitFor(() => expect(consentEntries('update').length).toBeGreaterThanOrEqual(1), {
      timeout: 1500,
    });
    const updates = consentEntries('update');
    const state = updates[updates.length - 1][2];
    expect(state.analytics_storage).toBe('granted');
    expect(state.ad_storage).toBe('granted');
  });

  it('pushes an all-denied update on decline', async () => {
    const user = userEvent.setup();
    render(
      <CookieManager googleConsentMode>
        <div>App</div>
      </CookieManager>
    );

    await user.click(await screen.findByText('Decline'));

    await waitFor(() => expect(consentEntries('update').length).toBeGreaterThanOrEqual(1), {
      timeout: 1500,
    });
    const updates = consentEntries('update');
    const state = updates[updates.length - 1][2];
    expect(state.analytics_storage).toBe('denied');
    expect(state.ad_storage).toBe('denied');
  });

  it('emits default + update reflecting stored consent on mount', () => {
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

    render(
      <CookieManager googleConsentMode>
        <div>App</div>
      </CookieManager>
    );

    expect(consentEntries('default')).toHaveLength(1);
    const updates = consentEntries('update');
    expect(updates).toHaveLength(1);
    expect(updates[0][2].analytics_storage).toBe('granted');
    expect(updates[0][2].ad_storage).toBe('denied');
  });

  it('does nothing to dataLayer when googleConsentMode is omitted', () => {
    render(
      <CookieManager>
        <div>App</div>
      </CookieManager>
    );
    expect(w.dataLayer).toHaveLength(0);
  });
});
