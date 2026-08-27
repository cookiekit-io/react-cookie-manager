import { cookieThemePresets } from "react-cookie-manager";
import "./ThemeOverview.css";

export function ThemeOverview() {
  return (
    <main className="theme-overview">
      <header className="theme-overview-header">
        <div>
          <p>react-cookie-manager</p>
          <h1>12 themes. One prop.</h1>
        </div>
        <code>{'<CookieManager theme="forest" />'}</code>
      </header>

      <div className="theme-overview-grid">
        {cookieThemePresets.map((preset, index) => (
          <article
            className="cookie-manager theme-overview-card"
            data-cookie-theme={preset.name}
            data-color-scheme={preset.colorScheme}
            key={preset.name}
          >
            <div className="rcm-surface theme-overview-surface">
              <div className="theme-overview-meta">
                <span className="rcm-badge">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <code className="rcm-subtle">theme=&quot;{preset.name}&quot;</code>
              </div>
              <h2 className="rcm-title">{preset.label}</h2>
              <p className="rcm-message">{preset.description}</p>
              <div className="theme-overview-toggle-row">
                <span className="rcm-message">Analytics</span>
                <span className="rcm-toggle theme-overview-toggle" aria-hidden="true">
                  <span />
                </span>
              </div>
              <div className="theme-overview-actions">
                <button className="rcm-button-secondary" type="button">
                  Decline
                </button>
                <button className="rcm-button-primary" type="button">
                  Accept all
                </button>
              </div>
              <button className="rcm-button-outline theme-overview-manage" type="button">
                Manage preferences
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
