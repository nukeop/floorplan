import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Device, MountPosition } from '@/types';
import { MdOutlineNotes } from 'react-icons/md';
import { 
  BsOutlet, 
  BsLightbulb,
  BsThermometerHalf,
  BsToggleOn, 
  BsEthernet,
  BsTv
} from 'react-icons/bs';
import { IoThermometerOutline } from 'react-icons/io5';
import { GiSmartphone } from 'react-icons/gi';
import { RiSensorLine } from 'react-icons/ri';

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
  const positionRef = useRef({ x: device.x, y: device.y });
  const startPosRef = useRef({ x: 0, y: 0 });
  const initialDevicePosRef = useRef({ x: 0, y: 0 });
  
  const ctmInverseRef = useRef<DOMMatrix | null>(null);
  
  const gridSize = 10;
  
  const snapToGrid = (value: number): number => {
    return Math.round(value / gridSize) * gridSize;
  };

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

  const getDeviceBorderColor = () => {
    switch (device.type) {
      case 'socket':
        return "#0ea5e9"; // Sky blue
      case 'smart-socket':
        return "#2563eb"; // Blue
      case 'switch':
        return "#10b981"; // Emerald
      case 'smart-switch':
        return "#059669"; // Green
      case 'motion-sensor':
      case 'ceiling-sensor':
        return "#f59e0b"; // Amber
      case 'temperature-sensor':
        return "#ef4444"; // Red
      case 'light':
      case 'ceiling-light':
        return "#f59e0b"; // Amber
      case 'ethernet':
        return "#6366f1"; // Indigo
      case 'tv-outlet':
        return "#7c3aed"; // Violet
      case 'thermostat':
        return "#ec4899"; // Pink
      default:
        return "#6b7280"; // Gray
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(e);
    onDragStart(e);
    
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
    initialDevicePosRef.current = {
      x: device.x,
      y: device.y
    };
    
    if (svgRef.current) {
      const screenCTM = svgRef.current.getScreenCTM();
      if (screenCTM) {
        ctmInverseRef.current = screenCTM.inverse();
      }
    }
    
    setDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !ctmInverseRef.current) return;
    
    const svgPoint = svgRef.current?.createSVGPoint();
    const startSvgPoint = svgRef.current?.createSVGPoint();
    
    if (svgPoint && startSvgPoint) {
      svgPoint.x = e.clientX;
      svgPoint.y = e.clientY;
      startSvgPoint.x = startPosRef.current.x;
      startSvgPoint.y = startPosRef.current.y;
      
      const transformedPoint = svgPoint.matrixTransform(ctmInverseRef.current);
      const transformedStartPoint = startSvgPoint.matrixTransform(ctmInverseRef.current);
      
      const dx = transformedPoint.x - transformedStartPoint.x;
      const dy = transformedPoint.y - transformedStartPoint.y;
      
      const newX = snapToGrid(initialDevicePosRef.current.x + dx);
      const newY = snapToGrid(initialDevicePosRef.current.y + dy);
      positionRef.current = { x: newX, y: newY };
      
      requestAnimationFrame(() => {
        setPosition(positionRef.current);
      });
    }
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      setDragging(false);
      onDragEnd(device.id, positionRef.current.x, positionRef.current.y);
      ctmInverseRef.current = null;
    }
  }, [dragging, device.id, onDragEnd]);

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
  }, [dragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (!dragging) {
      const snappedX = snapToGrid(device.x);
      const snappedY = snapToGrid(device.y);
      setPosition({ x: snappedX, y: snappedY });
      positionRef.current = { x: snappedX, y: snappedY };
    }
  }, [device.x, device.y, dragging]);

  const renderDeviceIcon = () => {
    const getIconProps = () => {
      switch (device.type) {
        case 'socket':
          return { Icon: BsOutlet, size: 20 };
        case 'smart-socket':
          return { Icon: GiSmartphone, size: 20 };
        case 'switch':
          return { Icon: BsToggleOn, size: 20 };
        case 'smart-switch':
          return { Icon: BsToggleOn, size: 20 };
        case 'motion-sensor':
        case 'ceiling-sensor':
          return { Icon: RiSensorLine, size: 20 };
        case 'temperature-sensor':
          return { Icon: IoThermometerOutline, size: 20 };
        case 'light':
        case 'ceiling-light':
          return { Icon: BsLightbulb, size: 20 };
        case 'ethernet':
          return { Icon: BsEthernet, size: 20 };
        case 'tv-outlet':
          return { Icon: BsTv, size: 20 };
        case 'thermostat':
          return { Icon: BsThermometerHalf, size: 20 };
        default:
          return { Icon: MdOutlineNotes, size: 20 };
      }
    };

    const { Icon, size } = getIconProps();
    const borderColor = getDeviceBorderColor();
    const containerStroke = selected ? "#2196f3" : borderColor;
    const containerStrokeWidth = selected ? 2 : 1.5;
    const isRectangular = ['switch', 'smart-switch', 'thermostat', 'ethernet', 'tv-outlet', 'temperature-sensor'].includes(device.type);

    return (
      <g transform={`rotate(${device.rotation}, 0, 0)`}>
        {isRectangular ? (
          <rect 
            x="-16" 
            y="-16" 
            width="32" 
            height="32" 
            fill="white"
            stroke={containerStroke}
            strokeWidth={containerStrokeWidth}
            rx="4"
            ry="4"
          />
        ) : (
          <circle 
            cx="0" 
            cy="0" 
            r="16" 
            fill="white"
            stroke={containerStroke}
            strokeWidth={containerStrokeWidth}
          />
        )}
        
        <foreignObject x="-14" y="-14" width="28" height="28">
          <div className="flex items-center justify-center w-full h-full">
            <Icon size={size} color="#555" />
          </div>
        </foreignObject>
      </g>
    );
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

  const renderNotesIndicator = () => {
    if (!device.notes) return null;
    
    return (
      <g transform="translate(10, 10)">
        <circle cx="0" cy="0" r="7" fill="#fffde7" stroke="#666" strokeWidth="1" />
        <foreignObject x="-5" y="-5" width="10" height="10">
          <div className="flex items-center justify-center w-full h-full">
            <MdOutlineNotes size={8} color="#555" />
          </div>
        </foreignObject>
      </g>
    );
  };

  return (
    <svg
      ref={ref => { svgRef.current = ref; }}
      x={position.x}
      y={position.y}
      width="40" 
      height="40"
      viewBox="-20 -20 40 40"
      style={{ 
        cursor: dragging ? 'grabbing' : 'pointer',
        opacity: dragging ? 0.8 : 1,
        willChange: dragging ? 'transform' : 'auto' // Rendering optimization
      }}
      onMouseDown={handleMouseDown}
    >
      {renderMountPositionIndicator()}
      {renderDeviceIcon()}
      {renderNotesIndicator()}
    </svg>
  );
};

export default DeviceComponent;