import { describe, it, expect } from 'vitest';
import { has360Asset, get360PosterUrl, get360AssetType } from '@/lib/media/360';
import type { Vehicle360Asset } from '@/types/vehicle';

describe('has360Asset', () => {
  it('returns true for valid spin asset', () => {
    const asset: Vehicle360Asset = { type: 'spin', url: 'https://cdn.example.com/spin.zip' };
    expect(has360Asset(asset)).toBe(true);
  });

  it('returns true for valid interior asset', () => {
    const asset: Vehicle360Asset = { type: 'interior', url: 'https://cdn.example.com/interior' };
    expect(has360Asset(asset)).toBe(true);
  });

  it('returns true for valid GLB asset', () => {
    const asset: Vehicle360Asset = { type: 'glb', url: 'https://cdn.example.com/model.glb' };
    expect(has360Asset(asset)).toBe(true);
  });

  it('returns false for undefined', () => {
    expect(has360Asset(undefined)).toBe(false);
  });

  it('returns false for empty URL', () => {
    const asset: Vehicle360Asset = { type: 'spin', url: '' };
    expect(has360Asset(asset)).toBe(false);
  });
});

describe('get360PosterUrl', () => {
  it('returns poster URL when present', () => {
    const asset: Vehicle360Asset = {
      type: 'spin',
      url: 'https://cdn.example.com/spin.zip',
      posterImageUrl: 'https://cdn.example.com/poster.jpg',
    };
    expect(get360PosterUrl(asset)).toBe('https://cdn.example.com/poster.jpg');
  });

  it('returns undefined when no poster', () => {
    const asset: Vehicle360Asset = { type: 'spin', url: 'https://cdn.example.com/spin.zip' };
    expect(get360PosterUrl(asset)).toBeUndefined();
  });

  it('returns undefined for empty poster string', () => {
    const asset: Vehicle360Asset = { type: 'spin', url: 'https://cdn.example.com/spin.zip', posterImageUrl: '' };
    expect(get360PosterUrl(asset)).toBeUndefined();
  });
});

describe('get360AssetType', () => {
  it('returns spin type', () => {
    expect(get360AssetType({ type: 'spin', url: 'x' })).toBe('spin');
  });

  it('returns interior type', () => {
    expect(get360AssetType({ type: 'interior', url: 'x' })).toBe('interior');
  });

  it('returns glb type', () => {
    expect(get360AssetType({ type: 'glb', url: 'x' })).toBe('glb');
  });
});
