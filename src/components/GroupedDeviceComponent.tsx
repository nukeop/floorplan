import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DeviceGroup } from '@/types';
import { IoLayersOutline } from 'react-icons/io5';
import { MdOutlineNotes } from 'react-icons/md';

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
      
      const newX = snapToGrid(initialGroupPosRef.current.x + dx);
      const newY = snapToGrid(initialGroupPosRef.current.y + dy);
      positionRef.current = { x: newX, y: newY };
      
      requestAnimationFrame(() => {
        setPosition(positionRef.current);
      });
    }
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      setDragging(false);
      onDragEnd(group.id, positionRef.current.x, positionRef.current.y);
      ctmInverseRef.current = null;
    }
  }, [dragging, group.id, onDragEnd]);

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
      const snappedX = snapToGrid(group.x);
      const snappedY = snapToGrid(group.y);
      setPosition({ x: snappedX, y: snappedY });
      positionRef.current = { x: snappedX, y: snappedY };
    }
  }, [group.x, group.y, dragging]);

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
      {/* Main container */}
      <rect 
        x="-16" 
        y="-16" 
        width="32" 
        height="32" 
        fill="white" 
        stroke={selected ? "#2196f3" : "#666"}
        strokeWidth={selected ? 2 : 1}
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
      <circle cx="12" cy="-12" r="8" fill="#2196f3" />
      <text x="12" y="-9" textAnchor="middle" fill="white" fontSize="10">
        {group.devices.length}
      </text>
      
      {/* Notes indicator if group has notes */}
      {group.notes && (
        <foreignObject x="5" y="5" width="16" height="16">
          <div className="flex items-center justify-center w-full h-full">
            <MdOutlineNotes size={14} color="#555" />
          </div>
        </foreignObject>
      )}
    </svg>
  );
};

export default GroupedDeviceComponent;