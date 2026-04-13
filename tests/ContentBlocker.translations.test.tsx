import { blockTrackingScripts, setContentBlockerTranslations } from '../src/utils/cookie-blocking';
import { createTFunction } from '../src/utils/translations';

describe('content-blocker translations', () => {
  beforeEach(() => {
    // Clear any existing content
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('uses default English text when no translations are set', () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/abc123';
    document.body.appendChild(iframe);

    const observer = blockTrackingScripts(['youtube']);

    // Check that default English text is present
    const bodyText = document.body.innerHTML;
    expect(bodyText).toContain('Content Blocked');
    expect(bodyText).toContain('This content requires cookies');
    expect(bodyText).toContain('Manage Cookie Settings');

    observer.disconnect();
  });

  test('uses custom translations when provided', () => {
    // Set up Spanish translations
    const tFunction = createTFunction({
      blockedContentTitle: 'Contenido Bloqueado',
      blockedContentMessage: 'Este contenido requiere cookies que están bloqueadas.',
      blockedContentRefreshMessage: 'Después de aceptar las cookies, actualice la página.',
      blockedContentButtonText: 'Administrar Configuración de Cookies',
    });

    setContentBlockerTranslations(tFunction);

    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/abc123';
    document.body.appendChild(iframe);

    const observer = blockTrackingScripts(['youtube']);

    // Check that Spanish translations are present
    const bodyText = document.body.innerHTML;
    expect(bodyText).toContain('Contenido Bloqueado');
    expect(bodyText).toContain('Este contenido requiere cookies que están bloqueadas');
    expect(bodyText).toContain('Administrar Configuración de Cookies');

    observer.disconnect();
  });

  test('uses i18next translation function when provided', () => {
    // Mock an i18next-like translation function
    const mockI18nT = (key: string) => {
      const translations: Record<string, string> = {
        'cookie.blockedContentTitle': 'Contenu Bloqué',
        'cookie.blockedContentMessage': 'Ce contenu nécessite des cookies.',
        'cookie.blockedContentRefreshMessage': 'Après avoir accepté les cookies, actualisez la page.',
        'cookie.blockedContentButtonText': 'Gérer les Paramètres des Cookies',
      };
      return translations[key] || key;
    };

    const tFunction = createTFunction(mockI18nT as any, 'cookie.');

    setContentBlockerTranslations(tFunction);

    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/abc123';
    document.body.appendChild(iframe);

    const observer = blockTrackingScripts(['youtube']);

    // Check that French translations are present
    const bodyText = document.body.innerHTML;
    expect(bodyText).toContain('Contenu Bloqué');
    expect(bodyText).toContain('Ce contenu nécessite des cookies');
    expect(bodyText).toContain('Gérer les Paramètres des Cookies');

    observer.disconnect();
  });
});


