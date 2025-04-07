import React, { useState, useRef, useEffect } from 'react';
import { Device, MountPosition } from '@/types';

interface DeviceComponentProps {
  device: Device;
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.MouseEvent) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

const DeviceComponent: React.FC<DeviceComponentProps> = ({
  device,
  selected,
  onClick,
  onDragStart,
  onDragEnd,
}) => {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: device.x, y: device.y });
  const svgRef = useRef<SVGSVGElement | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  const getMountPositionColor = () => {
    switch (device.position) {
      case MountPosition.WALL_LOW:
        return "#4299e1";
      case MountPosition.WALL_MEDIUM:
        return "#48bb78";
      case MountPosition.WALL_HIGH:
        return "#ed8936";
      case MountPosition.CEILING:
        return "#9f7aea";
      default:
        return "#fff";
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(e);
    onDragStart(e);
    setDragging(true);
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;

    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;

    if (svgRef.current) {
      const svgPoint = svgRef.current.createSVGPoint();
      svgPoint.x = device.x + dx;
      svgPoint.y = device.y + dy;
      
      const transformedPoint = svgPoint.matrixTransform(
        svgRef.current.getScreenCTM()?.inverse()
      );
      
      setPosition({
        x: transformedPoint.x,
        y: transformedPoint.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (dragging) {
      setDragging(false);
      onDragEnd(device.id, position.x, position.y);
    }
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  useEffect(() => {
    setPosition({ x: device.x, y: device.y });
  }, [device.x, device.y]);

  const renderDeviceIcon = () => {
    const positionColor = getMountPositionColor();
    const strokeColor = selected ? "#2196f3" : "#000";
    const strokeWidth = selected ? 2 : 1;
    
    switch (device.type) {
      case 'socket':
        return (
          <g transform={`rotate(${device.rotation}, 0, 0)`}>
            <circle cx="0" cy="0" r="10" fill="#fff" stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx="-3" cy="0" r="2" fill="#000" />
            <circle cx="3" cy="0" r="2" fill="#000" />
          </g>
        );
      case 'smart-socket':
        return (
          <g transform={`rotate(${device.rotation}, 0, 0)`}>
            <circle cx="0" cy="0" r="10" fill="#aaf" stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx="-3" cy="0" r="2" fill="#000" />
            <circle cx="3" cy="0" r="2" fill="#000" />
          </g>
        );
      case 'switch':
        return (
          <g transform={`rotate(${device.rotation}, 0, 0)`}>
            <rect x="-10" y="-10" width="20" height="20" fill="#fff" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="-5" y1="0" x2="5" y2="0" stroke="#000" strokeWidth="2" />
          </g>
        );
      case 'smart-switch':
        return (
          <g transform={`rotate(${device.rotation}, 0, 0)`}>
            <rect x="-10" y="-10" width="20" height="20" fill="#aaf" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="-5" y1="0" x2="5" y2="0" stroke="#000" strokeWidth="2" />
          </g>
        );
      case 'motion-sensor':
      case 'ceiling-sensor':
        return (
          <g transform={`rotate(${device.rotation}, 0, 0)`}>
            <polygon points="0,-12 10,6 -10,6" fill="#ffa" stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx="0" cy="0" r="4" fill="#000" />
          </g>
        );
      case 'temperature-sensor':
        return (
          <g transform={`rotate(${device.rotation}, 0, 0)`}>
            <rect x="-8" y="-8" width="16" height="16" fill="#faa" stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx="0" cy="0" r="4" fill="#f00" />
          </g>
        );
      case 'light':
      case 'ceiling-light':
        return (
          <g transform={`rotate(${device.rotation}, 0, 0)`}>
            <circle cx="0" cy="0" r="12" fill="#ff0" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="-8" y1="-8" x2="8" y2="8" stroke="#000" strokeWidth="1" />
            <line x1="-8" y1="8" x2="8" y2="-8" stroke="#000" strokeWidth="1" />
          </g>
        );
      case 'ethernet':
        return (
          <g transform={`rotate(${device.rotation}, 0, 0)`}>
            <rect x="-10" y="-10" width="20" height="20" fill="#0af" stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="-6" y="-4" width="12" height="8" fill="#fff" />
          </g>
        );
      case 'tv-outlet':
        return (
          <g transform={`rotate(${device.rotation}, 0, 0)`}>
            <rect x="-10" y="-10" width="20" height="20" fill="#aaa" stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx="0" cy="0" r="6" fill="#fff" />
            <circle cx="0" cy="0" r="2" fill="#000" />
          </g>
        );
      case 'thermostat':
        return (
          <g transform={`rotate(${device.rotation}, 0, 0)`}>
            <rect x="-12" y="-12" width="24" height="24" rx="4" fill="#fff" stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx="0" cy="0" r="8" fill="#faa" />
            <line x1="0" y1="-6" x2="0" y2="0" stroke="#000" strokeWidth="2" />
          </g>
        );
      default:
        return (
          <circle cx="0" cy="0" r="10" fill="#ccc" stroke={strokeColor} strokeWidth={strokeWidth} />
        );
    }
  };

  const renderMountPositionIndicator = () => {
    const color = getMountPositionColor();
    
    return (
      <circle 
        cx="0" 
        cy="0" 
        r="14" 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        strokeDasharray={device.position === MountPosition.CEILING ? "2,2" : "none"}
      />
    );
  };

  return (
    <svg
      ref={(ref) => (svgRef.current = ref)}
      x={position.x}
      y={position.y}
      width="32"
      height="32"
      viewBox="-16 -16 32 32"
      className={`cursor-pointer ${dragging ? 'opacity-80' : ''}`}
      onMouseDown={handleMouseDown}
    >
      {renderMountPositionIndicator()}
      {renderDeviceIcon()}
    </svg>
  );
};

export default DeviceComponent;