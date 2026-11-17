declare module '@nouhailler/video-studio' {
  export type LanguageCode = 'fr' | 'en' | (string & {});
  export type Layout = 'phone' | 'desktop';

  export interface VideoNarration {
    text?: string;
    language?: LanguageCode;
    voice?: string;
    rate?: number;
    pauseBeforeMs?: number;
    pauseAfterMs?: number;
  }

  export interface VideoStepMetadata {
    narration?: VideoNarration | false;
    subtitle?: string;
    readingPause?: number;
    transition?: 'none' | 'fade' | 'slide';
    chapter?: string;
    zoom?: number;
  }

  export interface BaseStep {
    type: string;
    narrate?: string;
    target?: string;
    text?: string;
    ms?: number;
    video?: VideoStepMetadata;
    [key: string]: unknown;
  }

  export type RuntimeStep =
    | { type: 'navigate'; url?: string; target?: string; narrate?: string; video?: VideoStepMetadata }
    | { type: 'click'; target: string; narrate?: string; video?: VideoStepMetadata }
    | { type: 'type'; target: string; text: string; narrate?: string; video?: VideoStepMetadata }
    | { type: 'highlight'; target: string; label?: string; narrate?: string; video?: VideoStepMetadata }
    | { type: 'scroll'; target: string; narrate?: string; video?: VideoStepMetadata }
    | { type: 'wait'; ms: number; video?: VideoStepMetadata }
    | { type: 'narrate'; text: string; title?: string; ms?: number; video?: VideoStepMetadata };

  export interface VideoCard {
    eyebrow?: string;
    title?: string;
    tagline?: string;
    narration?: string;
    bullets?: string[];
    links?: { label: string; url: string }[];
    minDurationMs?: number;
  }

  export interface VideoMetadata {
    title: string;
    description?: string;
    language: LanguageCode;
    voiceEnabled: boolean;
    voice?: string;
    resolution: { width: number; height: number };
    fps: number;
    intro?: VideoCard | false;
    outro?: VideoCard | false;
    subtitles?: { export?: boolean; burnIn?: boolean };
    clock?: string;
    timezone?: string;
    location?: { city?: string; lat: number; lng: number };
    seed?: Record<string, string>;
    speed?: number;
    firstChapter?: string;
  }

  export type AnyStep = { type: string; video?: VideoStepMetadata };

  export interface VideoScenario<S extends AnyStep = BaseStep> {
    id: string;
    video: VideoMetadata;
    scenario: {
      name: string;
      label: string;
      description?: string;
      steps: S[];
    };
  }

  export interface NetworkFixture {
    id: string;
    match: RegExp;
    file: string;
    contentType: string;
    nature: 'simulé' | 'réel figé';
    note?: string;
  }

  export interface VoiceConfig {
    engine: 'piper' | 'mock';
    model: string;
    language: string;
    rate: number;
    volume: number;
    sentenceGapMs: number;
  }

  export interface RuntimeDriver {
    type: 'runtime';
    url?: string;
    targetAttribute?: string;
    loadingSelector?: string;
    startDelayMs?: number;
  }

  export interface EngineDriver {
    type: 'engine';
    url: string;
    globals?: Partial<{
      request: string;
      events: string;
      result: string;
      stop: string;
      realClock: string;
    }>;
  }

  export interface ThemeColors {
    bg: string;
    bgTop: string;
    bgMid: string;
    surface: string;
    line: string;
    text: string;
    dim: string;
    faint: string;
    accent: string;
    accentLight: string;
    accentDark: string;
    accentSoft: string;
    accentLine: string;
    accentInk: string;
    glowA: string;
    glowB: string;
  }

  export interface TimelineLabels {
    chapter: string;
    tutorial: string;
    intro: string;
    outro: string;
  }

  export interface VideoStudioConfig {
    name: string;
    app: {
      build?: string | null;
      staticDir?: string;
      spaFallback?: boolean;
      command?: string;
      port?: number;
      host?: string;
    };
    driver: EngineDriver | RuntimeDriver;
    scenarios: VideoScenario<any>[];
    layout?: Layout;
    capture?: Partial<{
      viewport: { width: number; height: number };
      deviceScaleFactor: number;
      isMobile: boolean;
      jpegQuality: number;
      stepTimeoutMs: number;
      breathMs: number;
      tailMs: number;
      maxDurationMs: number;
      locale: string;
      timezone: string;
      colorScheme: 'dark' | 'light';
    }>;
    output?: Partial<{
      width: number;
      height: number;
      fps: number;
      crf: number;
      concurrency: number;
      timeoutMs: number;
    }>;
    narration?: Partial<{ pauseBeforeMs: number; pauseAfterMs: number }>;
    voices?: Record<string, VoiceConfig>;
    defaultVoice?: Record<string, string>;
    voicesDir?: string;
    pronunciations?: Record<string, [RegExp, string][]>;
    subtitles?: Partial<{ maxCharsPerLine: number; maxLines: number; minCueMs: number; burnIn: boolean }>;
    network?: {
      mode?: 'replay' | 'refresh' | 'offline';
      fixtures?: NetworkFixture[];
      fixturesDir?: string;
      blockedHosts?: RegExp[];
    };
    preseed?: (scn: VideoScenario<any>, ctx: { root: string }) => Record<string, string>;
    verifyRestore?: { prefix: string; ignore?: (key: string) => boolean } | false;
    validation?: {
      sourceDirs?: string[];
      targetAttribute?: string;
      extraTargets?: string[];
      targetPrefixes?: string[];
      patterns?: RegExp[];
      validateStep?: (step: BaseStep, index: number) => string[];
    };
    theme?: Partial<{
      brand: string;
      url: string | null;
      logo: string | null;
      starfield: boolean;
      colors: Partial<ThemeColors>;
      fonts: Partial<{ serif: string; sans: string; mono: string }>;
      labels: Partial<TimelineLabels>;
      fontCss: string[];
    }>;
  }

  export function defineVideoConfig(c: VideoStudioConfig): VideoStudioConfig;
  export function defineScenario<S extends AnyStep>(s: VideoScenario<S>): VideoScenario<S>;
}
