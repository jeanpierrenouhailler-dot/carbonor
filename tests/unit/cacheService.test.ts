import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheService } from '../../src/providers/cacheService';

// Mock localStorage pour environnement Node
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    }
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('Service de Cache & Persistance PWA (CacheService)', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('enregistre et restitue une entrée typée avec métadonnées de provenance', () => {
    const testData = { ppm: 421.3, station: 'MLO', date: '2024-05-15' };
    CacheService.set('mlo_latest', testData, 'ONLINE');

    const entry = CacheService.get<typeof testData>('mlo_latest');
    expect(entry).not.toBeNull();
    expect(entry?.data.ppm).toBe(421.3);
    expect(entry?.data.station).toBe('MLO');
    expect(entry?.sourceStatus).toBe('ONLINE');
    expect(entry?.version).toBe('1.0');
    expect(entry?.cachedAt).toBeDefined();
  });

  it('renvoie null si la clé n’existe pas', () => {
    const entry = CacheService.get('cle_inexistante');
    expect(entry).toBeNull();
  });

  it('purge uniquement les clés préfixées par co2_atmos_cache_', () => {
    CacheService.set('data_a', { val: 1 });
    CacheService.set('data_b', { val: 2 });
    localStorageMock.setItem('autre_app_cle', 'valeur_externe');

    CacheService.clear();

    expect(CacheService.get('data_a')).toBeNull();
    expect(CacheService.get('data_b')).toBeNull();
    expect(localStorageMock.getItem('autre_app_cle')).toBe('valeur_externe');
  });

  it('supporte le statut DEGRADED sans altérer les données', () => {
    CacheService.set('fallback_series', [410, 412], 'DEGRADED');
    const entry = CacheService.get<number[]>('fallback_series');
    expect(entry?.sourceStatus).toBe('DEGRADED');
    expect(entry?.data).toEqual([410, 412]);
  });

  it('génère et vérifie une empreinte d’intégrité (checksum) cryptographique SHA-256 conforme', () => {
    // Vecteur de référence officiel FIPS 180-4 : chaîne vide
    expect(CacheService.sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

    const dataA = { station: 'MLO', co2: 421.3 };
    const dataB = { station: 'MLO', co2: 421.3 };
    const dataC = { station: 'MLO', co2: 422.0 };

    const hashA = CacheService.computeChecksum(dataA);
    const hashB = CacheService.computeChecksum(dataB);
    const hashC = CacheService.computeChecksum(dataC);

    expect(hashA).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(hashA).toBe(hashB);
    expect(hashA).not.toBe(hashC);
  });

  it('enregistre et restitue toutes les métadonnées scientifiques de traçabilité requises', () => {
    const payload = [{ soundingId: '202610021400', xco2: 421.5 }];
    const retrievedAt = '2026-10-04T19:37:00.000Z';
    const validFrom = '2026-10-02T00:00:00.000Z';
    const validTo = '2026-10-02T23:59:59.000Z';
    const expiresAt = '2026-11-04T19:37:00.000Z';

    CacheService.set('nasa_oco_test', payload, 'CACHED', {
      source: 'NASA Earthdata',
      dataset: 'OCO-2 Level 2 Lite',
      version: 'v11.3r',
      retrievedAt,
      validFrom,
      validTo,
      expiresAt,
      quality: 'GOOD',
      requestParameters: { track: 'Europe-France', qualityFlag: '0' },
      isRealData: true
    });

    const entry = CacheService.get<typeof payload>('nasa_oco_test');
    expect(entry).not.toBeNull();
    expect(entry?.source).toBe('NASA Earthdata');
    expect(entry?.dataset).toBe('OCO-2 Level 2 Lite');
    expect(entry?.version).toBe('v11.3r');
    expect(entry?.retrievedAt).toBe(retrievedAt);
    expect(entry?.validFrom).toBe(validFrom);
    expect(entry?.validTo).toBe(validTo);
    expect(entry?.expiresAt).toBe(expiresAt);
    expect(entry?.quality).toBe('GOOD');
    expect(entry?.checksum).toBeDefined();
    expect(entry?.requestParameters).toEqual({ track: 'Europe-France', qualityFlag: '0' });
    expect(entry?.isRealData).toBe(true);
  });

  it('formate fidèlement la chaîne de traçabilité scientifique selon les exigences de transparence', () => {
    const formatted = CacheService.formatTraceability({
      source: 'NASA',
      dataset: 'OCO-2',
      version: 'v11.3r',
      retrievedAt: '2026-10-04T21:37:00.000Z',
      observedAt: '2026-10-02T12:00:00.000Z',
      quality: 'GOOD',
      cacheAgeDays: 3,
      isRealData: true
    });

    expect(formatted).toContain('Donnée réelle NASA');
    expect(formatted).toContain('téléchargée le 04/10/2026');
    expect(formatted).toContain('produit OCO-2 v11.3r');
    expect(formatted).toContain('observation du 02/10/2026');
    expect(formatted).toContain('qualité GOOD');
    expect(formatted).toContain('cache âgé de 3 jours');
  });

  it('détecte l’expiration d’une entrée de cache selon expiresAt', () => {
    const now = Date.now();
    const expiredEntry = {
      data: [1, 2, 3],
      cachedAt: new Date(now - 40 * 86400000).toISOString(),
      expiresAt: new Date(now - 10 * 86400000).toISOString(),
      sourceStatus: 'CACHED' as const,
      version: '1.0'
    };
    const validEntry = {
      data: [1, 2, 3],
      cachedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 10 * 86400000).toISOString(),
      sourceStatus: 'CACHED' as const,
      version: '1.0'
    };

    expect(CacheService.isExpired(expiredEntry)).toBe(true);
    expect(CacheService.isExpired(validEntry)).toBe(false);
  });

  it('formate explicitement les données en Mode Démonstration avec avertissement de fixtures embarquées', () => {
    const demoFormatted = CacheService.formatTraceability({
      source: 'NASA Earthdata',
      dataset: 'OCO-2 Lite',
      version: 'v11.3r',
      dataMode: 'DEMO',
      quality: 'GOOD',
      observedAt: '2026-10-02T12:00:00.000Z'
    });

    expect(demoFormatted).toContain('Donnée d\'exemple (Mode Démonstration) NASA Earthdata');
    expect(demoFormatted).toContain('produit OCO-2 Lite v11.3r');
    expect(demoFormatted).toContain('observation du 02/10/2026');
  });
});

