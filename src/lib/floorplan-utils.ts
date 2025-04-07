// Types for floorplan elements
export type ElementType = 'socket' | 'switch' | 'iot-sensor' | 'light' | 'other';

export interface FloorplanElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  label?: string;
  notes?: string;
}

export interface FloorplanData {
  width: number;
  height: number;
  elements: FloorplanElement[];
  scale: number; // pixels per meter/feet
}

// Utility functions for floorplan management
export function generateElementId(): string {
  return `element-${Math.random().toString(36).substring(2, 9)}`;
}

export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// This will be expanded as the project develops