/**
 * Service de cache et persistance PWA pour données scientifiques.
 * Conserve la date de mise en cache, l'état de la source et garantit
 * l'absence d'invention silencieuse de fausses données en mode dégradé.
 */

interface CacheEntry<T> {
  data: T;
  cachedAt: string;
  sourceStatus: 'ONLINE' | 'CACHED' | 'DEGRADED';
  version: string;
}

export class CacheService {
  private static PREFIX = 'co2_atmos_cache_';

  public static set<T>(key: string, data: T, sourceStatus: 'ONLINE' | 'CACHED' | 'DEGRADED' = 'ONLINE'): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        cachedAt: new Date().toISOString(),
        sourceStatus,
        version: '1.0'
      };
      localStorage.setItem(this.PREFIX + key, JSON.stringify(entry));
    } catch (e) {
      console.warn('Erreur stockage cache local:', e);
    }
  }

  public static get<T>(key: string): CacheEntry<T> | null {
    try {
      const raw = localStorage.getItem(this.PREFIX + key);
      if (!raw) return null;
      return JSON.parse(raw) as CacheEntry<T>;
    } catch (e) {
      console.warn('Erreur lecture cache local:', e);
      return null;
    }
  }

  public static clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Erreur purge cache:', e);
    }
  }
}
