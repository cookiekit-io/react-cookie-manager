import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CookieManager, useCookieConsent } from '../src/context/CookieConsentContext';
import { ManageConsent } from '../src/components/ManageConsent';
import { createTFunction } from '../src/utils/translations';
import { resolveCategories, customBlockedDomainsFor } from '../src/utils/categories';
import { deleteCookie, getCookie } from '../src/utils/cookie-utils';

const COOKIE_KEY = 'cookie-consent';
const t = createTFunction();

const Opener = () => {
  const { openPreferencesModal } = useCookieConsent();
  return <button onClick={openPreferencesModal}>open-prefs</button>;
};

describe('custom categories', () => {
  beforeEach(() => deleteCookie(COOKIE_KEY));
  afterEach(() => {
    cleanup();
    deleteCookie(COOKIE_KEY);
  });

  it('renders a custom category in the manage modal alongside built-ins', () => {
    render(
      <ManageConsent
        tFunction={t}
        theme="light"
        onSave={() => {}}
        categories={[{ id: 'marketing', title: 'Marketing', description: 'Offers' }]}
      />
    );
    // Built-ins still present
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Advertising')).toBeInTheDocument();
    // Custom one present
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Offers')).toBeInTheDocument();
  });

  it('overriding a built-in description shows the override', () => {
    render(
      <ManageConsent
        tFunction={t}
        theme="light"
        onSave={() => {}}
        categories={[{ id: 'Analytics', description: 'Custom analytics copy' }]}
      />
    );
    expect(screen.getByText('Custom analytics copy')).toBeInTheDocument();
  });

  it('toggles a custom category and includes it in onSave', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <ManageConsent
        tFunction={t}
        theme="light"
        onSave={onSave}
        categories={[{ id: 'marketing', title: 'Marketing' }]}
      />
    );

    const toggle = screen
      .getByText('Marketing')
      .closest('div')
      ?.parentElement?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    await user.click(toggle);
    expect(toggle.checked).toBe(true);

    await user.click(screen.getByText('Save Preferences'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ marketing: true })
    );
  });

  it('persists a custom category under its id in the cookie on accept', async () => {
    const user = userEvent.setup();
    render(
      <CookieManager categories={[{ id: 'marketing', title: 'Marketing' }]}>
        <div>App</div>
      </CookieManager>
    );

    await user.click(await screen.findByText('Accept'));
    await waitFor(() => expect(getCookie(COOKIE_KEY)).toMatch(/marketing/), {
      timeout: 1500,
    });
    const stored = JSON.parse(getCookie(COOKIE_KEY) as string);
    expect(stored.marketing.consented).toBe(true);
    expect(stored.Analytics.consented).toBe(true);
  });

  it('blocks a declined custom category\'s trackerDomains', () => {
    const resolved = resolveCategories(
      [{ id: 'marketing', title: 'Marketing', trackerDomains: ['ads.example.com'] }],
      undefined,
      t
    );
    // Declined (marketing: false) -> its domains are blocked
    expect(
      customBlockedDomainsFor(resolved, { Analytics: false, Social: false, Advertising: false, marketing: false })
    ).toContain('ads.example.com');
    // Consented -> not blocked
    expect(
      customBlockedDomainsFor(resolved, { Analytics: true, Social: true, Advertising: true, marketing: true })
    ).not.toContain('ads.example.com');
    // No preferences (pre-consent) -> blocked
    expect(customBlockedDomainsFor(resolved, null)).toContain('ads.example.com');
  });
});
