// components/FloorPlan.tsx
import React, { useRef, useState } from 'react';
import { Device, DeviceType, Room } from '@/types';
import DeviceComponent from './DeviceComponent';

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
              fill="none"
              stroke="#999"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <text
              x={room.x + room.width / 2}
              y={room.y + room.height / 2}
              textAnchor="middle"
              fill="#999"
              fontSize="14"
            >
              {room.name}
            </text>
          </g>
        ))}

        <rect x="0" y="60" width="918" height="890" fill="none" stroke="#000" strokeWidth="3" />
        <line x1="0" y1="280" x2="490" y2="280" stroke="#000" strokeWidth="3" />
        <line x1="490" y1="60" x2="490" y2="950" stroke="#000" strokeWidth="3" />
        <line x1="0" y1="580" x2="918" y2="580" stroke="#000" strokeWidth="3" />
        <line x1="430" y1="580" x2="430" y2="950" stroke="#000" strokeWidth="3" />
        <line x1="0" y1="160" x2="226" y2="160" stroke="#000" strokeWidth="3" />
        <line x1="226" y1="110" x2="226" y2="280" stroke="#000" strokeWidth="3" />

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