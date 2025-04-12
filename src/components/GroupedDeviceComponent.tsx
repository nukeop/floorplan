import React from 'react';
import { DeviceGroup } from '@/types';
import { IoLayersOutline } from 'react-icons/io5';
import { 
  DraggableElement,
  NotesIndicator, 
  GroupMountPositionIndicator,
  SizeIndicator
} from './shared/FloorplanElements';

interface GroupedDeviceComponentProps {
  group: DeviceGroup;
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.MouseEvent) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

const GroupedDeviceComponent: React.FC<GroupedDeviceComponentProps> = ({
  group,
  selected,
  onClick,
  onDragStart,
  onDragEnd,
}) => {
  // Get border color based on selection status
  const getBorderColor = () => {
    return selected ? "#2196f3" : "#666";
  };

  return (
    <DraggableElement
      id={group.id}
      x={group.x}
      y={group.y}
      selected={selected}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Main container */}
      <rect 
        x="-16" 
        y="-16" 
        width="32" 
        height="32" 
        fill="white" 
        stroke={getBorderColor()}
        strokeWidth={selected ? 2 : 2.5}
        rx="4"
        ry="4"
      />
      
      {/* Group icon in the center */}
      <foreignObject x="-14" y="-14" width="28" height="28">
        <div className="flex items-center justify-center w-full h-full">
          <IoLayersOutline size={20} color="#555" />
        </div>
      </foreignObject>
      
      {/* Group size indicator */}
      <SizeIndicator count={group.devices.length} />
      
      {/* Mount position indicator */}
      <GroupMountPositionIndicator position={group.position} />
      
      {/* Notes indicator */}
      <NotesIndicator notes={group.notes} />
    </DraggableElement>
  );
};

export default GroupedDeviceComponent;