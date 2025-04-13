import React, { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { MountPosition } from '@/types';
import { MdOutlineNotes } from 'react-icons/md';

// Shared mount position color mapping
export const getMountPositionColor = (position: MountPosition): string => {
  switch (position) {
    case MountPosition.WALL_LOW:
      return "#4299e1"; // Blue for wall low
    case MountPosition.WALL_MEDIUM:
      return "#48bb78"; // Green for wall medium
    case MountPosition.WALL_HIGH:
      return "#ed8936"; // Orange for wall high
    case MountPosition.CEILING:
      return "#9f7aea"; // Purple for ceiling
    default:
      return "#666"; // Default gray
  }
};

// Get mount position label (L, M, H, C)
export const getMountPositionLabel = (position: MountPosition): string => {
  switch (position) {
    case MountPosition.WALL_LOW:
      return "L";
    case MountPosition.WALL_MEDIUM:
      return "M";
    case MountPosition.WALL_HIGH:
      return "H";
    case MountPosition.CEILING:
      return "C";
    default:
      return "";
  }
};

export const snapToGrid = (value: number, gridSize: number = 10): number => {
  return Math.round(value / gridSize) * gridSize;
};

interface NotesIndicatorProps {
  notes?: string;
}

export const NotesIndicator: React.FC<NotesIndicatorProps> = ({ notes }) => {
  if (!notes) return null;
  
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

interface MountPositionIndicatorProps {
  position: MountPosition;
}

export const MountPositionIndicator: React.FC<MountPositionIndicatorProps> = ({ position }) => {
  const color = getMountPositionColor(position);
  
  return (
    <circle 
      cx="0" 
      cy="0" 
      r="14" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeDasharray={position === MountPosition.CEILING ? "2,2" : "none"}
    />
  );
};

interface GroupMountPositionIndicatorProps {
  position: MountPosition;
}

export const GroupMountPositionIndicator: React.FC<GroupMountPositionIndicatorProps> = ({ position }) => {
  const color = getMountPositionColor(position);
  
  return (
    <>
      <circle cx="-12" cy="-12" r="8" fill={color} />
      <text x="-12" y="-9" textAnchor="middle" fill="white" fontSize="10">
        {getMountPositionLabel(position)}
      </text>
    </>
  );
};

interface SizeIndicatorProps {
  count: number;
}

export const SizeIndicator: React.FC<SizeIndicatorProps> = ({ count }) => {
  return (
    <>
      <circle cx="12" cy="-12" r="8" fill="#2196f3" />
      <text x="12" y="-9" textAnchor="middle" fill="white" fontSize="10">
        {count}
      </text>
    </>
  );
};

interface DraggableElementProps {
  id: string;
  x: number;
  y: number;
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onDragEnd?: (id: string, x: number, y: number) => void;
  children: ReactNode;
  readOnly?: boolean;
}

export const DraggableElement: React.FC<DraggableElementProps> = ({
  id,
  x,
  y,
  selected,
  onClick,
  onDragStart,
  onDragEnd,
  children,
  readOnly = false
}) => {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x, y });
  
  const svgRef = useRef<SVGSVGElement | null>(null);
  const positionRef = useRef({ x, y });
  const startPosRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });
  
  const ctmInverseRef = useRef<DOMMatrix | null>(null);
  
  const gridSize = 10;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(e);
    
    if (readOnly || !onDragStart) return;
    
    onDragStart(e);
    
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
    initialPosRef.current = {
      x,
      y
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
    if (!dragging || !ctmInverseRef.current || readOnly || !onDragEnd) return;
    
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
      
      const newX = snapToGrid(initialPosRef.current.x + dx, gridSize);
      const newY = snapToGrid(initialPosRef.current.y + dy, gridSize);
      positionRef.current = { x: newX, y: newY };
      
      requestAnimationFrame(() => {
        setPosition(positionRef.current);
      });
    }
  }, [dragging, readOnly, onDragEnd]);

  const handleMouseUp = useCallback(() => {
    if (dragging && !readOnly && onDragEnd) {
      setDragging(false);
      onDragEnd(id, positionRef.current.x, positionRef.current.y);
      ctmInverseRef.current = null;
    }
  }, [dragging, id, onDragEnd, readOnly]);

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
      const snappedX = snapToGrid(x, gridSize);
      const snappedY = snapToGrid(y, gridSize);
      setPosition({ x: snappedX, y: snappedY });
      positionRef.current = { x: snappedX, y: snappedY };
    }
  }, [x, y, dragging]);

  return (
    <svg
      ref={ref => { svgRef.current = ref; }}
      x={position.x}
      y={position.y}
      width="40" 
      height="40"
      viewBox="-20 -20 40 40"
      style={{ 
        cursor: readOnly ? 'default' : dragging ? 'grabbing' : 'pointer',
        opacity: dragging ? 0.8 : 1,
        willChange: dragging ? 'transform' : 'auto' // Rendering optimization
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </svg>
  );
};