import { useMemo } from 'react';

interface GridConfig {
  gridSize: number;
  margin: number;
  workingWidth: number;
  workingHeight: number;
  totalWidth: number;
  totalHeight: number;
  snapToGrid: (value: number) => number;
  ensurePositiveCoordinate: (value: number) => number;
  viewBox: string;
}

export const useGrid = (gridSize: number = 10, margin: number = 50): GridConfig => {
  const workingWidth = 950;
  const workingHeight = 950;
  const totalWidth = workingWidth + (margin * 2);
  const totalHeight = workingHeight + (margin * 2);
  const viewBox = `0 0 ${totalWidth} ${totalHeight}`;
  
  const snapToGrid = (value: number): number => {
    return Math.round(value / gridSize) * gridSize;
  };

  const ensurePositiveCoordinate = (value: number): number => {
    return Math.max(margin, value);
  };

  return {
    gridSize,
    margin,
    workingWidth,
    workingHeight,
    totalWidth,
    totalHeight,
    snapToGrid,
    ensurePositiveCoordinate,
    viewBox,
  };
};