import React, { useState, useRef, useEffect } from 'react';
import { DeviceGroup } from '@/types';

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
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: group.x, y: group.y });
  
  const svgRef = useRef<SVGSVGElement | null>(null);
  const positionRef = useRef({ x: group.x, y: group.y });
  const startPosRef = useRef({ x: 0, y: 0 });
  const initialGroupPosRef = useRef({ x: 0, y: 0 });
  
  const ctmInverseRef = useRef<DOMMatrix | null>(null);
  
  const gridSize = 10;
  
  const snapToGrid = (value: number): number => {
    return Math.round(value / gridSize) * gridSize;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(e);
    onDragStart(e);
    
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
    
    initialGroupPosRef.current = {
      x: group.x,
      y: group.y
    };
    
    if (svgRef.current) {
      const screenCTM = svgRef.current.getScreenCTM();
      if (screenCTM) {
        ctmInverseRef.current = screenCTM.inverse();
      }
    }
    
    setDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
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
      
      const newX = snapToGrid(initialGroupPosRef.current.x + dx);
      const newY = snapToGrid(initialGroupPosRef.current.y + dy);
      positionRef.current = { x: newX, y: newY };
      
      requestAnimationFrame(() => {
        setPosition(positionRef.current);
      });
    }
  };

  const handleMouseUp = () => {
    if (dragging) {
      setDragging(false);
      onDragEnd(group.id, positionRef.current.x, positionRef.current.y);
      ctmInverseRef.current = null;
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
    if (!dragging) {
      const snappedX = snapToGrid(group.x);
      const snappedY = snapToGrid(group.y);
      setPosition({ x: snappedX, y: snappedY });
      positionRef.current = { x: snappedX, y: snappedY };
    }
  }, [group.x, group.y, dragging]);

  const renderGroupedDevices = () => {
    // Show a stack-like representation with slight offsets
    return (
      <g>
        {/* Bottom layer (furthest back) */}
        <rect 
          x="-15" 
          y="-15" 
          width="30" 
          height="30" 
          fill="#e0e0e0" 
          stroke="#666"
          strokeWidth="1"
          rx="4"
          ry="4"
        />
        
        {/* Middle layer */}
        <rect 
          x="-12" 
          y="-12" 
          width="30" 
          height="30" 
          fill="#f0f0f0" 
          stroke="#666"
          strokeWidth="1"
          rx="4"
          ry="4"
        />
        
        {/* Top layer (most visible) */}
        <rect 
          x="-9" 
          y="-9" 
          width="30" 
          height="30" 
          fill="#ffffff" 
          stroke={selected ? "#2196f3" : "#666"}
          strokeWidth={selected ? 2 : 1}
          rx="4"
          ry="4"
        />
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
      onClick={onClick}
      onMouseDown={handleMouseDown}
      style={{ 
        cursor: dragging ? 'grabbing' : 'pointer',
        opacity: dragging ? 0.8 : 1,
        willChange: dragging ? 'transform' : 'auto' // Rendering optimization
      }}
    >
      {renderGroupedDevices()}
      
      {/* Group size indicator */}
      <circle cx="12" cy="-12" r="8" fill="#2196f3" />
      <text x="12" y="-9" textAnchor="middle" fill="white" fontSize="10">
        {group.devices.length}
      </text>
      
      {/* Notes indicator if group has notes */}
      {group.notes && (
        <g transform="translate(12, 12)">
          <path
            d="M-4,-6 L4,-6 L4,6 L-4,6 Z"
            fill="#ffeb3b"
            stroke="#666"
            strokeWidth="0.5"
          />
          <path
            d="M-2,-4 L2,-4 M-2,-2 L2,-2 M-2,0 L2,0 M-2,2 L2,2"
            stroke="#666"
            strokeWidth="0.5"
          />
        </g>
      )}
    </svg>
  );
};

export default GroupedDeviceComponent;