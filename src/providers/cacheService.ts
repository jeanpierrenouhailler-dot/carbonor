import { DataProvenance } from '../types/observation';

/**
 * Service de cache et persistance PWA pour données scientifiques traçables.
 * 
 * Garantit la traçabilité métrologique complète exigée pour la crédibilité scientifique :
 * - source officielle
 * - dataset exact
 * - version
 * - retrievedAt (date & heure précise de téléchargement)
 * - validFrom / validTo (période de validité de l'observation)
 * - expiresAt (date d'expiration nominale du cache)
 * - checksum (empreinte d'intégrité cryptographique SHA-256)
 * - request parameters (critères spatiaux, temporels et filtres)
 * - quality (qualification métrologique : EXCELLENT, GOOD, ACCEPTABLE, DEGRADED)
 * - cacheAgeDays (âge réel du cache)
 * - isRealData (indicateur explicite de donnée réelle issue des réseaux officiels)
 */

export interface CacheMetadataOptions {
  source?: string;
  dataset?: string;
  version?: string;
  retrievedAt?: string;
  validFrom?: string;
  validTo?: string;
  expiresAt?: string;
  ttlDays?: number;
  checksum?: string;
  requestParameters?: Record<string, any>;
  quality?: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'DEGRADED' | 'SUSPECT' | string;
  isRealData?: boolean;
  dataMode?: 'DEMO' | 'REAL_DATA';
}

export interface CacheEntry<T> {
  data: T;
  cachedAt: string;
  sourceStatus: 'ONLINE' | 'CACHED' | 'DEGRADED' | 'CONNECTED' | 'FETCHED' | 'STALE' | 'OFFLINE' | 'ERROR' | 'NOT_CONFIGURED';
  version: string;
  source?: string;
  dataset?: string;
  retrievedAt?: string;
  validFrom?: string;
  validTo?: string;
  expiresAt?: string;
  checksum?: string;
  requestParameters?: Record<string, any>;
  quality?: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'DEGRADED' | 'SUSPECT' | string;
  cacheAgeDays?: number;
  isRealData?: boolean;
  dataMode?: 'DEMO' | 'REAL_DATA';
}

export class CacheService {
  private static PREFIX = 'co2_atmos_cache_';
  public static readonly DEFAULT_TTL_DAYS = 30;

  /**
   * Calcule une véritable empreinte cryptographique SHA-256 (FIPS 180-4)
   * Retourne une chaîne hexadécimale authentique de 64 caractères préfixée par 'sha256:'
   */
  public static computeChecksum(data: any): string {
    const raw = typeof data === 'string' ? data : JSON.stringify(data);
    return `sha256:${this.sha256Hex(raw)}`;
  }

  /**
   * Algorithme SHA-256 cryptographique conforme (64 caractères hexadécimaux)
   */
  public static sha256Hex(str: string): string {
    let ascii = unescape(encodeURIComponent(str));
    const rightRotate = (value: number, amount: number) => (value >>> amount) | (value << (32 - amount));
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let i = 0;
    let j = 0;
    let result = '';
    const words: number[] = [];
    const asciiBitLength = ascii.length * 8;
    let hash: number[] = [];
    const k: number[] = [];
    let primeCounter = 0;
    const isComposite: Record<number, number> = {};

    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    ascii += '\x80';
    while ((ascii.length % 64) - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      const code = ascii.charCodeAt(i);
      words[i >> 2] |= code << (((3 - i) % 4) * 8);
    }
    words[words.length] = (asciiBitLength / maxWord) | 0;
    words[words.length] = asciiBitLength;

    for (j = 0; j < words.length;) {
      const w = words.slice(j, (j += 16));
      const oldHash = hash.slice(0);
      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15];
        const w2 = w[i - 2];
        const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;
        const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
        const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
        const temp1 = hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + w[i];
        const temp2 = (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;
        hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }

    for (i = 0; i < 8; i++) {
      for (let b = 3; b >= 0; b--) {
        const byte = (hash[i] >> (b * 8)) & 255;
        result += byte.toString(16).padStart(2, '0');
      }
    }
    return result;
  }

  /**
   * Calcule l'âge d'un horodatage en jours entiers
   */
  public static calculateAgeDays(isoDateString?: string | null): number {
    if (!isoDateString) return 0;
    try {
      const timestamp = new Date(isoDateString).getTime();
      if (isNaN(timestamp)) return 0;
      const ageMs = Date.now() - timestamp;
      return Math.max(0, Math.floor(ageMs / (1000 * 60 * 60 * 24)));
    } catch {
      return 0;
    }
  }

  private static memoryStore: Map<string, string> = new Map();

  /**
   * Enregistre une donnée dans le cache PWA avec toutes ses métadonnées scientifiques de traçabilité
   */
  public static set<T>(
    key: string,
    data: T,
    sourceStatus: 'ONLINE' | 'CACHED' | 'DEGRADED' | 'CONNECTED' | 'FETCHED' | 'STALE' | 'OFFLINE' | 'ERROR' | 'NOT_CONFIGURED' = 'ONLINE',
    metadata?: CacheMetadataOptions
  ): void {
    try {
      const now = new Date();
      const retrievedAt = metadata?.retrievedAt || now.toISOString();
      const ttlDays = metadata?.ttlDays ?? this.DEFAULT_TTL_DAYS;
      const expiresAt = metadata?.expiresAt || new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000).toISOString();
      const checksum = metadata?.checksum || this.computeChecksum(data);
      const cacheAgeDays = this.calculateAgeDays(retrievedAt);

      const entry: CacheEntry<T> = {
        data,
        cachedAt: now.toISOString(),
        sourceStatus,
        version: metadata?.version || '1.0',
        source: metadata?.source,
        dataset: metadata?.dataset,
        retrievedAt,
        validFrom: metadata?.validFrom,
        validTo: metadata?.validTo,
        expiresAt,
        checksum,
        requestParameters: metadata?.requestParameters,
        quality: metadata?.quality || 'GOOD',
        cacheAgeDays,
        isRealData: metadata?.isRealData ?? true
      };

      const serialized = JSON.stringify(entry);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.PREFIX + key, serialized);
      } else {
        this.memoryStore.set(this.PREFIX + key, serialized);
      }
    } catch (e) {
      console.warn('[CacheService] Erreur stockage cache local:', e);
    }
  }

  /**
   * Récupère une entrée du cache avec actualisation dynamique de l'âge du cache
   */
  public static get<T>(key: string): CacheEntry<T> | null {
    try {
      let raw: string | null = null;
      if (typeof localStorage !== 'undefined') {
        raw = localStorage.getItem(this.PREFIX + key);
      } else {
        raw = this.memoryStore.get(this.PREFIX + key) || null;
      }
      if (!raw) return null;
      const entry = JSON.parse(raw) as CacheEntry<T>;
      // Recalcul dynamique de l'âge du cache en jours
      entry.cacheAgeDays = this.calculateAgeDays(entry.retrievedAt || entry.cachedAt);
      return entry;
    } catch (e) {
      console.warn('[CacheService] Erreur lecture cache local:', e);
      return null;
    }
  }

  /**
   * Vérifie si une entrée de cache est expirée par rapport à sa date nominale expiresAt
   */
  public static isExpired(entry: CacheEntry<any>): boolean {
    if (!entry.expiresAt) return false;
    try {
      return Date.now() > new Date(entry.expiresAt).getTime();
    } catch {
      return false;
    }
  }

  /**
   * Formate la traçabilité scientifique selon la norme exacte attendue par les chercheurs :
   * « Donnée réelle NASA · téléchargée le 04/10/2026 à 21:37 · produit OCO-2 v11.3r · observation du 02/10/2026 · qualité GOOD · cache âgé de 3 jours »
   */
  public static formatTraceability(info: {
    source?: string;
    dataset?: string;
    version?: string;
    retrievedAt?: string;
    observedAt?: string;
    validFrom?: string;
    quality?: string;
    cacheAgeDays?: number;
    isRealData?: boolean;
    dataMode?: 'DEMO' | 'REAL_DATA';
  } | DataProvenance | CacheEntry<any>): string {
    const parts: string[] = [];

    // 1. Label Donnée réelle vs Mode Démonstration + Source
    const src = (info as any).source || 'Source Scientifique';
    const isDemo = (info as any).dataMode === 'DEMO' || (info as any).isRealData === false;
    parts.push(isDemo ? `Donnée d'exemple (Mode Démonstration) ${src}` : `Donnée réelle ${src}`);

    // 2. Date et heure de téléchargement
    const retrievedIso = (info as any).retrievedAt || (info as any).downloadedAt || (info as any).cachedAt;
    if (retrievedIso) {
      try {
        const d = new Date(retrievedIso);
        const day = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        parts.push(`téléchargée le ${day} à ${time}`);
      } catch {
        parts.push(`téléchargée le ${retrievedIso}`);
      }
    }

    // 3. Produit & Version
    const dataset = (info as any).dataset;
    const version = (info as any).version;
    if (dataset) {
      parts.push(`produit ${dataset}${version ? ` ${version}` : ''}`);
    }

    // 4. Date d'observation
    const obsIso = (info as any).observedAt || (info as any).validFrom || (info as any).timestamp;
    if (obsIso) {
      try {
        const d = new Date(obsIso);
        const day = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        parts.push(`observation du ${day}`);
      } catch {
        parts.push(`observation du ${obsIso}`);
      }
    }

    // 5. Qualité métrologique
    const quality = (info as any).quality || 'GOOD';
    parts.push(`qualité ${quality}`);

    // 6. Âge du cache
    const ageDays = (info as any).cacheAgeDays !== undefined 
      ? (info as any).cacheAgeDays 
      : this.calculateAgeDays(retrievedIso);
    parts.push(ageDays === 0 ? "cache du jour" : `cache âgé de ${ageDays} jour${ageDays > 1 ? 's' : ''}`);

    return parts.join(' · ');
  }

  /**
   * Purge toutes les entrées gérées par Carbonor
   */
  public static clear(): void {
    try {
      this.memoryStore.clear();
      if (typeof localStorage !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(this.PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      }
    } catch (e) {
      console.warn('[CacheService] Erreur purge cache:', e);
    }
  }
}
