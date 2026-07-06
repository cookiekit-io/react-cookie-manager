import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CookieManager, useCookieConsent } from '../src/context/CookieConsentContext';

const Consumer = () => {
  const { openPreferencesModal, showConsentBanner } = useCookieConsent();
  return (
    <div>
      <button onClick={openPreferencesModal}>Open Prefs</button>
      <button onClick={showConsentBanner}>Show Banner</button>
    </div>
  );
};

describe('CookieManager context', () => {
  beforeEach(() => {
    // Reset cookies so each test starts from a clean consent state
    document.cookie.split(';').forEach(c => {
      const eqPos = c.indexOf('=');
      const name = eqPos > -1 ? c.slice(0, eqPos) : c;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  });

  test('openPreferencesModal shows manage modal when consent exists', async () => {
    const user = userEvent.setup();
    render(
      <CookieManager showManageButton>
        <Consumer />
      </CookieManager>
    );

    // Accept first to create consent
    await user.click(await screen.findByText('Accept'));

    // Wait for accept delay to persist consent
    await waitFor(() => expect(document.cookie).toMatch(/cookie-consent=/), { timeout: 1500 });

    // Use context to open prefs (now that consent exists)
    await user.click(screen.getByText('Open Prefs'));

    // Manage UI title should be visible
    expect(await screen.findByText('Cookie Preferences')).toBeInTheDocument();
  });

  test('cancelling manage does not reopen the consent banner when consent already exists', async () => {
    const user = userEvent.setup();
    render(
      <CookieManager showManageButton>
        <Consumer />
      </CookieManager>
    );

    // Accept first to create consent
    await user.click(await screen.findByText('Accept'));
    await waitFor(() => expect(document.cookie).toMatch(/cookie-consent=/), { timeout: 1500 });

    // Open the manage modal via the context, then cancel it
    await user.click(screen.getByText('Open Prefs'));
    expect(await screen.findByText('Cookie Preferences')).toBeInTheDocument();
    await user.click(screen.getByText('Cancel'));

    // The manage modal should close without bringing back the initial banner
    await waitFor(() => {
      expect(screen.queryByText('Cookie Preferences')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('We use cookies')).not.toBeInTheDocument();
  });

  test('cancelling manage reopens the consent banner when no consent decision exists yet', async () => {
    const user = userEvent.setup();
    render(
      <CookieManager showManageButton>
        <Consumer />
      </CookieManager>
    );

    // No consent yet: the initial banner is showing. Open manage from it.
    expect(await screen.findByText('We use cookies')).toBeInTheDocument();
    await user.click(screen.getByText('Manage Cookies'));
    expect(await screen.findByText('Cookie Preferences')).toBeInTheDocument();
    await user.click(screen.getByText('Cancel'));

    // The initial banner should come back so the user still has to choose.
    expect(await screen.findByText('We use cookies')).toBeInTheDocument();
  });
});


