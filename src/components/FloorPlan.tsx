import React, { useRef, useState, useMemo } from 'react';
import { Device, DeviceType, Room } from '@/types';
import DeviceComponent from './DeviceComponent';
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

interface FloorPlanProps {
  rooms: Room[];
  devices: Device[];
  selectedDeviceType: DeviceType | null;
  selectedDevice: Device | null;
  addDevice: (x: number, y: number) => void;
  updateDevicePosition: (id: string, x: number, y: number) => void;
  selectDevice: (device: Device | null) => void;
}

const FloorPlan: React.FC<FloorPlanProps> = ({
  rooms,
  devices,
  selectedDeviceType,
  selectedDevice,
  addDevice,
  updateDevicePosition,
  selectDevice,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

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

  const wallLengths = useMemo(() => {
    return walls.map(wall => {
      const length = calculateDistance(wall.x1, wall.y1, wall.x2, wall.y2);
      return {
        ...wall,
        length: Math.round(length)
      };
    });
  }, [walls]);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (selectedDeviceType && !dragging) {
      const svgPoint = svgRef.current?.createSVGPoint();
      if (svgPoint) {
        svgPoint.x = e.clientX;
        svgPoint.y = e.clientY;
        const transformedPoint = svgPoint.matrixTransform(
          svgRef.current?.getScreenCTM()?.inverse()
        );
        addDevice(transformedPoint.x, transformedPoint.y);
      }
    }
  };

  const handleDeviceClick = (e: React.MouseEvent, device: Device) => {
    e.stopPropagation();
    selectDevice(device);
  };

  const handleDragStart = (e: React.MouseEvent, device: Device) => {
    e.stopPropagation();
    selectDevice(device);
    setDragging(true);
  };

  const handleDragEnd = (id: string, x: number, y: number) => {
    updateDevicePosition(id, x, y);
    setDragging(false);
  };

  const viewBox = "0 0 1050 1050";

  return (
    <div className="flex-1 bg-gray-100 overflow-auto">
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className={`w-full h-full ${selectedDeviceType ? 'cursor-crosshair' : 'cursor-grab'} active:cursor-grabbing`}
        onClick={handleClick}
      >
        {rooms.map((room) => (
          <g key={room.id}>
            <rect
              x={room.x}
              y={room.y}
              width={room.width}
              height={room.height}
              fill={room.color ? `${room.color}20` : 'none'}
              stroke={room.color || '#999'}
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <text
              x={room.x + room.width / 2}
              y={room.y + room.height / 2}
              textAnchor="middle"
              fill={room.color || '#999'}
              fontSize="14"
            >
              {room.name}
            </text>
          </g>
        ))}

        {wallLengths.map((wall) => (
          <g key={wall.id}>
            <line 
              x1={wall.x1} 
              y1={wall.y1} 
              x2={wall.x2} 
              y2={wall.y2} 
              stroke={wall.color || '#000'} 
              strokeWidth="3" 
            />
            <text
              x={(wall.x1 + wall.x2) / 2}
              y={(wall.y1 + wall.y2) / 2}
              dx={wall.y1 === wall.y2 ? 0 : -15}
              dy={wall.x1 === wall.x2 ? 15 : 0}
              textAnchor="middle"
              fill={wall.color || '#333'}
              fontSize="12"
              fontWeight="bold"
              className="wall-length-label"
            >
              {wall.length}
            </text>
          </g>
        ))}

        {devices.map((device) => (
          <DeviceComponent
            key={device.id}
            device={device}
            selected={selectedDevice?.id === device.id}
            onClick={(e) => handleDeviceClick(e, device)}
            onDragStart={(e) => handleDragStart(e, device)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </svg>
    </div>
  );
};

export default FloorPlan;