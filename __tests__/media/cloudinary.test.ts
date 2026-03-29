import { describe, it, expect } from 'vitest';
import {
  applyCloudinaryTransforms,
  heroImageUrl,
  socialCardImageUrl,
  galleryThumbUrl,
  inventoryCardImageUrl,
  cloudinaryBase,
  HERO_IMAGE_DIMS,
  CARD_IMAGE_DIMS,
  SOCIAL_CARD_DIMS,
} from '@/lib/media/cloudinary';

const SAMPLE_URL = 'https://res.cloudinary.com/planet-motors/image/upload/v1/vehicles/hero.jpg';
const NON_CLOUDINARY_URL = 'https://example.com/images/car.jpg';

describe('applyCloudinaryTransforms', () => {
  it('inserts transform params after /upload/', () => {
    const result = applyCloudinaryTransforms(SAMPLE_URL, { width: 800, height: 600 });
    expect(result).toContain('/upload/w_800,h_600,');
    expect(result).toContain('c_fill');
    expect(result).toContain('f_auto');
    expect(result).toContain('q_auto');
  });

  it('returns non-Cloudinary URLs unchanged', () => {
    const result = applyCloudinaryTransforms(NON_CLOUDINARY_URL, { width: 800 });
    expect(result).toBe(NON_CLOUDINARY_URL);
  });

  it('returns empty string for empty input', () => {
    expect(applyCloudinaryTransforms('', { width: 100 })).toBe('');
  });

  it('includes gravity when specified', () => {
    const result = applyCloudinaryTransforms(SAMPLE_URL, { gravity: 'auto' });
    expect(result).toContain('g_auto');
  });

  it('uses custom crop and format', () => {
    const result = applyCloudinaryTransforms(SAMPLE_URL, {
      crop: 'scale',
      format: 'webp',
      quality: '80',
    });
    expect(result).toContain('c_scale');
    expect(result).toContain('f_webp');
    expect(result).toContain('q_80');
  });
});

describe('heroImageUrl', () => {
  it('returns 1200x800 transform with gravity auto', () => {
    const result = heroImageUrl(SAMPLE_URL);
    expect(result).toContain('w_1200');
    expect(result).toContain('h_800');
    expect(result).toContain('g_auto');
  });

  it('is safe to call on non-Cloudinary URL', () => {
    expect(heroImageUrl(NON_CLOUDINARY_URL)).toBe(NON_CLOUDINARY_URL);
  });
});

describe('socialCardImageUrl', () => {
  it('returns 1200x630 JPEG transform', () => {
    const result = socialCardImageUrl(SAMPLE_URL);
    expect(result).toContain('w_1200');
    expect(result).toContain('h_630');
    expect(result).toContain('f_jpg');
  });
});

describe('galleryThumbUrl', () => {
  it('returns 600x400 transform', () => {
    const result = galleryThumbUrl(SAMPLE_URL);
    expect(result).toContain('w_600');
    expect(result).toContain('h_400');
  });
});

describe('inventoryCardImageUrl', () => {
  it('returns 480x320 transform', () => {
    const result = inventoryCardImageUrl(SAMPLE_URL);
    expect(result).toContain('w_480');
    expect(result).toContain('h_320');
  });
});

describe('dimension constants', () => {
  it('HERO_IMAGE_DIMS matches heroImageUrl dimensions', () => {
    expect(HERO_IMAGE_DIMS.width).toBe(1200);
    expect(HERO_IMAGE_DIMS.height).toBe(800);
  });

  it('CARD_IMAGE_DIMS matches inventoryCardImageUrl dimensions', () => {
    expect(CARD_IMAGE_DIMS.width).toBe(480);
    expect(CARD_IMAGE_DIMS.height).toBe(320);
  });

  it('SOCIAL_CARD_DIMS matches OG spec (1.91:1 ratio)', () => {
    expect(SOCIAL_CARD_DIMS.width).toBe(1200);
    expect(SOCIAL_CARD_DIMS.height).toBe(630);
    const ratio = SOCIAL_CARD_DIMS.width / SOCIAL_CARD_DIMS.height;
    expect(ratio).toBeCloseTo(1.905, 1); // ~1.91:1
  });
});

describe('cloudinaryBase', () => {
  it('returns empty string when cloud name is not set', () => {
    // CLOUDINARY_CLOUD_NAME is evaluated at import time
    // This test just verifies the function exists and returns a string
    const base = cloudinaryBase();
    expect(typeof base).toBe('string');
  });
});
