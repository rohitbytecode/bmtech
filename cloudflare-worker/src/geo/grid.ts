/**
 * supabase/functions/crawler-worker/geo/grid.ts
 *
 * Adaptive grid partitioning for thorough geographic coverage.
 */

import { BoundingBox } from './resolver';

export interface GridCell {
  south: number;
  north: number;
  west: number;
  east: number;
}

/**
 * Generate a grid of cells within a bounding box.
 * Default cell size is approx 0.05 degrees (~5.5km),
 * which balances API limits with detailed coverage.
 */
export function generateGridCells(bbox: BoundingBox, stepDegrees = 0.05): GridCell[] {
  const cells: GridCell[] = [];
  
  // Ensure we don't create an unreasonably large number of cells if the bbox is huge
  const latDiff = bbox.north - bbox.south;
  const lonDiff = bbox.east - bbox.west;
  
  if (latDiff > 2 || lonDiff > 2) {
    // If it's a huge area (e.g. a whole state), fallback to 1 large cell or limit it
    // In practice, this should be a city, so diffs are usually < 0.5
    return [bbox];
  }

  for (let lat = bbox.south; lat < bbox.north; lat += stepDegrees) {
    for (let lon = bbox.west; lon < bbox.east; lon += stepDegrees) {
      cells.push({
        south: lat,
        north: Math.min(lat + stepDegrees, bbox.north),
        west: lon,
        east: Math.min(lon + stepDegrees, bbox.east),
      });
    }
  }

  return cells;
}
