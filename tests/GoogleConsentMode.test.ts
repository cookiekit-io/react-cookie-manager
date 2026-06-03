import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  mapConsentToSignals,
  setGoogleConsentDefault,
  updateGoogleConsent,
} from '../src/utils/google-consent-mode';

describe('mapConsentToSignals', () => {
  it('grants all mapped signals when every category is consented', () => {
    const signals = mapConsentToSignals({
      Analytics: true,
      Social: true,
      Advertising: true,
    });
    expect(signals).toEqual({
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      personalization_storage: 'granted',
      functionality_storage: 'granted',
      security_storage: 'granted',
    });
  });

  it('denies advertising/analytics/personalization when declined, keeps essentials granted', () => {
    const signals = mapConsentToSignals({
      Analytics: false,
      Social: false,
      Advertising: false,
    });
    expect(signals.analytics_storage).toBe('denied');
    expect(signals.ad_storage).toBe('denied');
    expect(signals.ad_user_data).toBe('denied');
    expect(signals.ad_personalization).toBe('denied');
    expect(signals.personalization_storage).toBe('denied');
    // Essentials always granted.
    expect(signals.functionality_storage).toBe('granted');
    expect(signals.security_storage).toBe('granted');
  });

  it('maps advertising-only consent correctly', () => {
    const signals = mapConsentToSignals({
      Analytics: false,
      Social: false,
      Advertising: true,
    });
    expect(signals.analytics_storage).toBe('denied');
    expect(signals.ad_storage).toBe('granted');
    expect(signals.ad_user_data).toBe('granted');
    expect(signals.ad_personalization).toBe('granted');
    expect(signals.personalization_storage).toBe('denied');
  });

  it('honors custom mapping overrides', () => {
    const signals = mapConsentToSignals(
      { Analytics: false, Social: false, Advertising: true },
      { mapping: { personalization_storage: 'Advertising' } }
    );
    expect(signals.personalization_storage).toBe('granted');
  });
});

describe('dataLayer pushes', () => {
  const w = window as any;

  beforeEach(() => {
    w.dataLayer = [];
    delete w.gtag;
  });

  afterEach(() => {
    delete w.dataLayer;
    delete w.gtag;
  });

  // gtag pushes the raw `arguments` object; normalize to a plain array.
  const pushed = () => w.dataLayer.map((a: any) => Array.from(a));

  it('setGoogleConsentDefault pushes a denied default with wait_for_update', () => {
    setGoogleConsentDefault();
    const entries = pushed();
    expect(entries).toHaveLength(1);
    const [command, action, state] = entries[0];
    expect(command).toBe('consent');
    expect(action).toBe('default');
    expect(state.analytics_storage).toBe('denied');
    expect(state.ad_storage).toBe('denied');
    expect(state.functionality_storage).toBe('granted');
    expect(state.security_storage).toBe('granted');
    expect(state.wait_for_update).toBe(500);
  });

  it('setGoogleConsentDefault honors waitForUpdate and url_passthrough', () => {
    setGoogleConsentDefault({ waitForUpdate: 1000, urlPassthrough: true });
    const entries = pushed();
    expect(entries[0][2].wait_for_update).toBe(1000);
    expect(entries).toContainEqual(['set', 'url_passthrough', true]);
  });

  it('updateGoogleConsent pushes an update with mapped values', () => {
    updateGoogleConsent({ Analytics: true, Social: false, Advertising: false });
    const entries = pushed();
    expect(entries).toHaveLength(1);
    const [command, action, state] = entries[0];
    expect(command).toBe('consent');
    expect(action).toBe('update');
    expect(state.analytics_storage).toBe('granted');
    expect(state.ad_storage).toBe('denied');
  });

  it('reuses an existing window.gtag when present', () => {
    const calls: any[] = [];
    w.gtag = (...args: any[]) => calls.push(args);
    updateGoogleConsent({ Analytics: true, Social: true, Advertising: true });
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe('consent');
    expect(calls[0][1]).toBe('update');
    // Nothing pushed directly to dataLayer when gtag exists.
    expect(w.dataLayer).toHaveLength(0);
  });
});
