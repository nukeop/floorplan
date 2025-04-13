import React from 'react';
import { Device } from '@/types';
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
import { MdOutlineNotes } from 'react-icons/md';
import { 
  DraggableElement, 
  NotesIndicator, 
  MountPositionIndicator 
} from './shared/FloorplanElements';

interface DeviceComponentProps {
  device: Device;
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.MouseEvent) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  readOnly?: boolean;
}

const DeviceComponent: React.FC<DeviceComponentProps> = ({
  device,
  selected,
  onClick,
  onDragStart,
  onDragEnd,
  readOnly = false
}) => {
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

  return (
    <DraggableElement
      id={device.id}
      x={device.x}
      y={device.y}
      selected={selected}
      onClick={onClick}
      onDragStart={readOnly ? undefined : onDragStart}
      onDragEnd={readOnly ? undefined : onDragEnd}
      readOnly={readOnly}
    >
      <MountPositionIndicator position={device.position} />
      {renderDeviceIcon()}
      <NotesIndicator notes={device.notes} />
    </DraggableElement>
  );
};

export default DeviceComponent;