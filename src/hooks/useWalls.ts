import { useMemo } from 'react';
import { Room } from '@/types';
import { calculateDistance } from '@/lib/floorplan-utils';

interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  roomId: string;
  color?: string;
}

interface WallWithLength extends Wall {
  length: number;
}

export const useWalls = (rooms: Room[]): WallWithLength[] => {
  const walls = useMemo<Wall[]>(() => {
    const generatedWalls: Wall[] = [];
    
    rooms.forEach(room => {
      const topWall = {
        id: `${room.id}-top`,
        x1: room.x,
        y1: room.y,
        x2: room.x + room.width,
        y2: room.y,
        roomId: room.id,
        color: room.color
      };
      
      const rightWall = {
        id: `${room.id}-right`,
        x1: room.x + room.width,
        y1: room.y,
        x2: room.x + room.width,
        y2: room.y + room.height,
        roomId: room.id,
        color: room.color
      };
      
      const bottomWall = {
        id: `${room.id}-bottom`,
        x1: room.x,
        y1: room.y + room.height,
        x2: room.x + room.width,
        y2: room.y + room.height,
        roomId: room.id,
        color: room.color
      };
      
      const leftWall = {
        id: `${room.id}-left`,
        x1: room.x,
        y1: room.y,
        x2: room.x,
        y2: room.y + room.height,
        roomId: room.id,
        color: room.color
      };
      
      generatedWalls.push(topWall, rightWall, bottomWall, leftWall);
    });
    
    const uniqueWalls: Wall[] = [];
    generatedWalls.forEach(wall => {
      const isDuplicate = uniqueWalls.some(existingWall => 
        (Math.abs(existingWall.x1 - wall.x1) < 1 && Math.abs(existingWall.y1 - wall.y1) < 1 &&
         Math.abs(existingWall.x2 - wall.x2) < 1 && Math.abs(existingWall.y2 - wall.y2) < 1) ||
        (Math.abs(existingWall.x1 - wall.x2) < 1 && Math.abs(existingWall.y1 - wall.y2) < 1 &&
         Math.abs(existingWall.x2 - wall.x1) < 1 && Math.abs(existingWall.y2 - wall.y1) < 1)
      );
      
      if (!isDuplicate) {
        uniqueWalls.push(wall);
      }
    });
    
    return uniqueWalls;
  }, [rooms]);

  const wallsWithLengths = useMemo(() => {
    return walls.map(wall => {
      const length = calculateDistance(wall.x1, wall.y1, wall.x2, wall.y2);
      return {
        ...wall,
        length: Math.round(length)
      };
    });
  }, [walls]);

  return wallsWithLengths;
};