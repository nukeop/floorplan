import React from 'react';
import { Room } from '@/types';

interface RoomHandlesProps {
  room: Room;
  onResizeStart: (direction: string, e: React.MouseEvent) => void;
  onDragStart: (e: React.MouseEvent) => void;
}

const RoomHandles: React.FC<RoomHandlesProps> = ({ 
  room, 
  onResizeStart,
  onDragStart
}) => {
  const handleSize = 10;
  
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDragStart(e);
  };

  const handles = [
    { position: 'nw', x: room.x - handleSize/2, y: room.y - handleSize/2, cursor: 'nw-resize' },
    { position: 'n', x: room.x + room.width/2 - handleSize/2, y: room.y - handleSize/2, cursor: 'n-resize' },
    { position: 'ne', x: room.x + room.width - handleSize/2, y: room.y - handleSize/2, cursor: 'ne-resize' },
    { position: 'e', x: room.x + room.width - handleSize/2, y: room.y + room.height/2 - handleSize/2, cursor: 'e-resize' },
    { position: 'se', x: room.x + room.width - handleSize/2, y: room.y + room.height - handleSize/2, cursor: 'se-resize' },
    { position: 's', x: room.x + room.width/2 - handleSize/2, y: room.y + room.height - handleSize/2, cursor: 's-resize' },
    { position: 'sw', x: room.x - handleSize/2, y: room.y + room.height - handleSize/2, cursor: 'sw-resize' },
    { position: 'w', x: room.x - handleSize/2, y: room.y + room.height/2 - handleSize/2, cursor: 'w-resize' },
  ];
  
  return (
    <g>
      <rect
        x={room.x}
        y={room.y}
        width={room.width}
        height={room.height}
        fill="transparent"
        className="cursor-move"
        onMouseDown={handleDragStart}
      />
      
      {handles.map(handle => (
        <rect
          key={handle.position}
          x={handle.x}
          y={handle.y}
          width={handleSize}
          height={handleSize}
          fill={room.color || '#000'}
          stroke="#fff"
          strokeWidth="1"
          style={{ cursor: handle.cursor }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(handle.position, e);
          }}
        />
      ))}
    </g>
  );
};

export default RoomHandles;