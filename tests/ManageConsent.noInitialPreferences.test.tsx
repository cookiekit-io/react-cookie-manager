import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ManageConsent } from '../src/components/ManageConsent';
import { createTFunction } from '../src/utils/translations';

const t = createTFunction();

// Regression test for issues #43 and #40: when no `initialPreferences` prop is
// provided, the default object must not be recreated each render (which made
// toggles un-clickable and caused "Maximum update depth exceeded").
describe('ManageConsent without initialPreferences', () => {
  test('toggles can be enabled and saved when initialPreferences is omitted', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <ManageConsent
        tFunction={t}
        theme="light"
        onSave={onSave}
        cookieCategories={{ Analytics: true, Social: true, Advertising: false }}
      />
    );

    const analyticsTitle = screen.getByText('Analytics');
    const analyticsToggle = analyticsTitle
      .closest('div')
      ?.parentElement?.querySelector('input[type="checkbox"]') as HTMLInputElement;

    expect(analyticsToggle).toBeInTheDocument();
    expect(analyticsToggle.checked).toBe(false);

    await user.click(analyticsToggle);

    // The toggle must actually flip on (it previously snapped back to false).
    expect(analyticsToggle.checked).toBe(true);

    await user.click(screen.getByText('Save Preferences'));

    expect(onSave).toHaveBeenCalledWith({
      Analytics: true,
      Social: false,
      Advertising: false,
    });
  });
});
