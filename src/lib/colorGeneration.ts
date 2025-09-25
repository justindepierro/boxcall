/**
 * Advanced Color Generation Service
 * Provides AI-powered color palette generation and team-specific theming
 */

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface TeamColors {
  primary: string;
  secondary?: string;
  accent?: string;
}

export class ColorGenerationService {
  /**
   * Generate a complete harmonious color palette from team colors
   */
  static generateTeamPalette(teamColors: TeamColors): ColorPalette {
    const primary = this.parseColor(teamColors.primary);
    const secondary = teamColors.secondary ? this.parseColor(teamColors.secondary) : this.generateComplementary(primary);
    const accent = teamColors.accent ? this.parseColor(teamColors.accent) : this.generateTriadic(primary)[0];

    return {
      primary: this.toHex(primary),
      secondary: this.toHex(secondary),
      accent: this.toHex(accent),
      background: this.generateTint(primary, 0.95),
      surface: this.generateTint(primary, 0.98),
      text: this.generateShade(primary, 0.1),
      success: this.toHex(this.generateAnalogous(primary, 120)[0]), // Green analogous
      warning: this.toHex(this.generateAnalogous(primary, 45)[0]),  // Orange analogous
      error: this.toHex(this.generateAnalogous(primary, -30)[0]),   // Red analogous
      info: this.toHex(this.generateAnalogous(primary, 240)[0]),    // Blue analogous
    };
  }

  /**
   * Generate emotion-based color schemes
   */
  static generateEmotionPalette(emotion: 'trust' | 'energy' | 'calm' | 'achievement'): ColorPalette {
    const emotionColors = {
      trust: {
        primary: '#00A86B',
        secondary: '#1E293B',
        accent: '#7C3AED',
        background: '#F0FDF4',
        surface: '#FFFFFF',
        text: '#052E16',
      },
      energy: {
        primary: '#7C3AED',
        secondary: '#FF6B6B',
        accent: '#00A86B',
        background: '#F5F3FF',
        surface: '#FFFFFF',
        text: '#4C1D95',
      },
      calm: {
        primary: '#009688',
        secondary: '#7CB342',
        accent: '#00A86B',
        background: '#F0F9FF',
        surface: '#FFFFFF',
        text: '#0F766E',
      },
      achievement: {
        primary: '#22C55E',
        secondary: '#F59E0B',
        accent: '#7C3AED',
        background: '#F0FDF4',
        surface: '#FFFFFF',
        text: '#14532D',
      },
    };

    const base = emotionColors[emotion];
    const primary = this.parseColor(base.primary);

    return {
      ...base,
      success: base.primary,
      warning: base.secondary,
      error: this.toHex(this.generateAnalogous(primary, -30)[0]),
      info: this.toHex(this.generateAnalogous(primary, 240)[0]),
    };
  }

  /**
   * Generate contextual color schemes for different app sections
   */
  static generateContextPalette(context: 'calm' | 'energetic' | 'professional'): ColorPalette {
    const contextColors = {
      calm: {
        primary: '#00A86B',
        secondary: '#475569',
        accent: '#7C3AED',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: '#1E293B',
      },
      energetic: {
        primary: '#7C3AED',
        secondary: '#00A86B',
        accent: '#FF6B6B',
        background: '#FEF7FF',
        surface: '#FFFFFF',
        text: '#4C1D95',
      },
      professional: {
        primary: '#1E293B',
        secondary: '#00A86B',
        accent: '#F59E0B',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: '#0F172A',
      },
    };

    const base = contextColors[context];
    const primary = this.parseColor(base.primary);

    return {
      ...base,
      success: this.toHex(this.generateAnalogous(primary, 120)[0]),
      warning: this.toHex(this.generateAnalogous(primary, 45)[0]),
      error: this.toHex(this.generateAnalogous(primary, -30)[0]),
      info: this.toHex(this.generateAnalogous(primary, 240)[0]),
    };
  }

  /**
   * Generate accessibility-compliant color variations
   */
  static generateAccessiblePalette(basePalette: ColorPalette, accessibilityMode: 'normal' | 'highContrast' | 'deuteranopia' | 'protanopia' | 'tritanopia'): ColorPalette {
    switch (accessibilityMode) {
      case 'highContrast':
        return {
          ...basePalette,
          background: '#FFFFFF',
          surface: '#F8FAFC',
          text: '#000000',
          primary: '#000000',
          secondary: '#404040',
        };

      case 'deuteranopia':
        return {
          ...basePalette,
          success: '#007ACC', // Blue instead of green
          error: '#FF6B6B',   // Red (still visible)
          warning: '#FF9500', // Orange
          info: '#5856D6',    // Purple
        };

      case 'protanopia':
        return {
          ...basePalette,
          success: '#007ACC', // Blue instead of green
          error: '#8E8E93',   // Gray instead of red
          warning: '#FF9500', // Orange
          info: '#5856D6',    // Purple
        };

      case 'tritanopia':
        return {
          ...basePalette,
          success: '#30D158', // Green
          error: '#FF453A',  // Red
          warning: '#FF9F0A', // Orange
          info: '#BF5AF2',    // Purple
        };

      default:
        return basePalette;
    }
  }

  // Color mathematics utilities
  private static parseColor(color: string): { r: number; g: number; b: number } {
    const hex = color.replace('#', '');
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16),
    };
  }

  private static toHex(color: { r: number; g: number; b: number }): string {
    const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  }

  private static generateComplementary(color: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    // Convert to HSL, rotate hue by 180 degrees, convert back to RGB
    const hsl = this.rgbToHsl(color);
    hsl.h = (hsl.h + 180) % 360;
    return this.hslToRgb(hsl);
  }

  private static generateTriadic(color: { r: number; g: number; b: number }): [{ r: number; g: number; b: number }, { r: number; g: number; b: number }] {
    const hsl = this.rgbToHsl(color);
    const triad1 = { ...hsl, h: (hsl.h + 120) % 360 };
    const triad2 = { ...hsl, h: (hsl.h + 240) % 360 };
    return [this.hslToRgb(triad1), this.hslToRgb(triad2)];
  }

  private static generateAnalogous(color: { r: number; g: number; b: number }, degrees: number): [{ r: number; g: number; b: number }] {
    const hsl = this.rgbToHsl(color);
    hsl.h = (hsl.h + degrees) % 360;
    return [this.hslToRgb(hsl)];
  }

  private static generateTint(color: { r: number; g: number; b: number }, factor: number): string {
    const tinted = {
      r: color.r + (255 - color.r) * factor,
      g: color.g + (255 - color.g) * factor,
      b: color.b + (255 - color.b) * factor,
    };
    return this.toHex(tinted);
  }

  private static generateShade(color: { r: number; g: number; b: number }, factor: number): string {
    const shaded = {
      r: color.r * factor,
      g: color.g * factor,
      b: color.b * factor,
    };
    return this.toHex(shaded);
  }

  private static rgbToHsl(color: { r: number; g: number; b: number }): { h: number; s: number; l: number } {
    const r = color.r / 255;
    const g = color.g / 255;
    const b = color.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  private static hslToRgb(hsl: { h: number; s: number; l: number }): { r: number; g: number; b: number } {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }
}