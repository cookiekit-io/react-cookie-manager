import {
  cookieThemePresets,
  useCookieConsent,
  type CookieTheme,
} from "react-cookie-manager";
import { useEffect, useState, type ChangeEvent } from "react";
import "./App.css";

interface AppProps {
  activeTheme: CookieTheme;
  onSelectTheme: (theme: CookieTheme) => void;
}

function App({ activeTheme, onSelectTheme }: AppProps) {
  const { showConsentBanner, detailedConsent } = useCookieConsent();
  const [consentStatus, setConsentStatus] = useState("Not set");

  useEffect(() => {
    setConsentStatus(
      detailedConsent?.Advertising.consented ? "Accepted" : "Not accepted",
    );
  }, [detailedConsent]);

  const selectTheme = (event: ChangeEvent<HTMLSelectElement>) => {
    onSelectTheme(event.target.value as CookieTheme);
  };

  return (
    <main className="playground">
      <header className="playground-hero">
        <div className="cookie-hero" aria-hidden="true">
          🍪
        </div>
        <p className="eyebrow">Playground</p>
        <h1>react-cookie-manager</h1>
        <p className="hero-copy">
          Preview a built-in theme and see cookie-aware YouTube blocking on one
          simple page.
        </p>
        <nav className="project-links" aria-label="Project links">
          <a
            href="https://github.com/hypershiphq/react-cookie-manager"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
          <a
            href="https://www.npmjs.com/package/react-cookie-manager"
            target="_blank"
            rel="noreferrer"
          >
            npm ↗
          </a>
        </nav>
      </header>

      <section className="playground-panel" aria-labelledby="theme-heading">
        <div className="panel-copy">
          <p className="eyebrow">Theme preview</p>
          <h2 id="theme-heading">Choose the look and feel</h2>
          <p>
            The selected preset applies to the banner, settings modal, toggles,
            and floating cookie button.
          </p>
        </div>

        <div className="theme-controls">
          <label htmlFor="theme-select">Theme</label>
          <select
            id="theme-select"
            value={activeTheme}
            onChange={selectTheme}
          >
            {cookieThemePresets.map((preset) => (
              <option key={preset.name} value={preset.name}>
                {preset.label} — {preset.description}
              </option>
            ))}
          </select>
          <code>{`theme="${activeTheme}"`}</code>
          <button type="button" onClick={showConsentBanner}>
            Preview cookie banner
          </button>
          <p className="consent-status">
            Advertising consent: <strong>{consentStatus}</strong>
          </p>
        </div>
      </section>

      <section className="video-demo" aria-labelledby="video-heading">
        <div className="panel-copy">
          <p className="eyebrow">Cookie-aware embeds</p>
          <h2 id="video-heading">One YouTube video, blocked until consent</h2>
          <p>
            Decline advertising cookies to see the privacy placeholder. Accept
            them and the same embed is restored automatically.
          </p>
        </div>

        <div className="video-container">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"
            title="YouTube cookie blocking demonstration"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>
    </main>
  );
}

export default App;
