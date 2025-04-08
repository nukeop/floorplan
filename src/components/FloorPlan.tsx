import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Device, DeviceType, Room } from '@/types';
import DeviceComponent from './DeviceComponent';
import RoomHandles from './RoomHandles';
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
  selectedRoom: Room | null;
  addDevice: (x: number, y: number) => void;
  updateDevicePosition: (id: string, x: number, y: number) => void;
  selectDevice: (device: Device | null) => void;
  selectRoom: (room: Room | null) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  isLoading?: boolean;
}

const FloorPlan: React.FC<FloorPlanProps> = ({
  rooms,
  devices,
  selectedDeviceType,
  selectedDevice,
  selectedRoom,
  addDevice,
  updateDevicePosition,
  selectDevice,
  selectRoom,
  updateRoom,
  isLoading = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  
  // Room dragging state
  const [isDraggingRoom, setIsDraggingRoom] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [roomStartX, setRoomStartX] = useState(0);
  const [roomStartY, setRoomStartY] = useState(0);
  
  // Room resizing state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [roomStartWidth, setRoomStartWidth] = useState(0);
  const [roomStartHeight, setRoomStartHeight] = useState(0);
  
  // Grid and frame configuration
  const gridSize = 10; // Grid size in SVG units
  const margin = 50; 
  const workingWidth = 950;
  const workingHeight = 950;
  const totalWidth = workingWidth + (margin * 2);
  const totalHeight = workingHeight + (margin * 2);
  
  const snapToGrid = (value: number): number => {
    return Math.round(value / gridSize) * gridSize;
  };

  const ensurePositiveCoordinate = (value: number): number => {
    return Math.max(margin, value);
  };

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
    if (e.target === svgRef.current) {
      selectDevice(null);
      selectRoom(null);
      return;
    }

    if (selectedDeviceType && !dragging) {
      const svgPoint = svgRef.current?.createSVGPoint();
      if (svgPoint) {
        svgPoint.x = e.clientX;
        svgPoint.y = e.clientY;
        const transformedPoint = svgPoint.matrixTransform(
          svgRef.current?.getScreenCTM()?.inverse()
        );
        
        const snappedX = snapToGrid(transformedPoint.x);
        const snappedY = snapToGrid(transformedPoint.y);
        
        const safeX = ensurePositiveCoordinate(snappedX);
        const safeY = ensurePositiveCoordinate(snappedY);
        
        addDevice(safeX, safeY);
      }
    }
  };

  const handleRoomClick = (e: React.MouseEvent, room: Room) => {
    e.stopPropagation();
    selectDevice(null);
    selectRoom(room);
  };

  const handleDeviceClick = (e: React.MouseEvent, device: Device) => {
    e.stopPropagation();
    selectRoom(null);
    selectDevice(device);
  };

  // Room dragging handlers
  const handleRoomDragStart = (e: React.MouseEvent) => {
    if (!selectedRoom) return;
    
    const svgPoint = svgRef.current?.createSVGPoint();
    if (svgPoint) {
      svgPoint.x = e.clientX;
      svgPoint.y = e.clientY;
      const transformedPoint = svgPoint.matrixTransform(
        svgRef.current?.getScreenCTM()?.inverse()
      );
      
      setDragStartX(transformedPoint.x);
      setDragStartY(transformedPoint.y);
      setRoomStartX(selectedRoom.x);
      setRoomStartY(selectedRoom.y);
      setIsDraggingRoom(true);
    }
  };

  // Room resizing handlers
  const handleRoomResizeStart = (direction: string, e: React.MouseEvent) => {
    if (!selectedRoom) return;
    
    const svgPoint = svgRef.current?.createSVGPoint();
    if (svgPoint) {
      svgPoint.x = e.clientX;
      svgPoint.y = e.clientY;
      const transformedPoint = svgPoint.matrixTransform(
        svgRef.current?.getScreenCTM()?.inverse()
      );
      
      setResizeStartX(transformedPoint.x);
      setResizeStartY(transformedPoint.y);
      setRoomStartX(selectedRoom.x);
      setRoomStartY(selectedRoom.y);
      setRoomStartWidth(selectedRoom.width);
      setRoomStartHeight(selectedRoom.height);
      setResizeDirection(direction);
      setIsResizing(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRoom && !isResizing) return;
    
    const svgPoint = svgRef.current?.createSVGPoint();
    if (!svgPoint || !selectedRoom) return;
    
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;
    const transformedPoint = svgPoint.matrixTransform(
      svgRef.current?.getScreenCTM()?.inverse()
    );
    
    if (isDraggingRoom) {
      // Calculate the new position with drag offset
      const deltaX = transformedPoint.x - dragStartX;
      const deltaY = transformedPoint.y - dragStartY;
      
      const newX = ensurePositiveCoordinate(snapToGrid(roomStartX + deltaX));
      const newY = ensurePositiveCoordinate(snapToGrid(roomStartY + deltaY));
      
      updateRoom(selectedRoom.id, { x: newX, y: newY });
    } else if (isResizing && resizeDirection) {
      // Handle resizing based on direction
      const deltaX = transformedPoint.x - resizeStartX;
      const deltaY = transformedPoint.y - resizeStartY;
      
      let newX = selectedRoom.x;
      let newY = selectedRoom.y;
      let newWidth = selectedRoom.width;
      let newHeight = selectedRoom.height;
      
      if (resizeDirection.includes('n')) {
        newY = snapToGrid(roomStartY + deltaY);
        newHeight = snapToGrid(roomStartHeight - deltaY);
        // Prevent negative height
        if (newHeight < gridSize) {
          newHeight = gridSize;
          newY = roomStartY + roomStartHeight - gridSize;
        }
      }
      if (resizeDirection.includes('s')) {
        newHeight = snapToGrid(roomStartHeight + deltaY);
        // Prevent negative height
        if (newHeight < gridSize) {
          newHeight = gridSize;
        }
      }
      if (resizeDirection.includes('w')) {
        newX = snapToGrid(roomStartX + deltaX);
        newWidth = snapToGrid(roomStartWidth - deltaX);
        // Prevent negative width
        if (newWidth < gridSize) {
          newWidth = gridSize;
          newX = roomStartX + roomStartWidth - gridSize;
        }
      }
      if (resizeDirection.includes('e')) {
        newWidth = snapToGrid(roomStartWidth + deltaX);
        // Prevent negative width
        if (newWidth < gridSize) {
          newWidth = gridSize;
        }
      }
      
      updateRoom(selectedRoom.id, { 
        x: newX, 
        y: newY, 
        width: newWidth, 
        height: newHeight 
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingRoom(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  // Handle device drag and drop
  const handleDragStart = (e: React.MouseEvent, device: Device) => {
    e.stopPropagation();
    selectDevice(device);
    setDragging(true);
  };

  const handleDragEnd = (id: string, x: number, y: number) => {
    const safeX = ensurePositiveCoordinate(x);
    const safeY = ensurePositiveCoordinate(y);
    updateDevicePosition(id, safeX, safeY);
    setDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingRoom || isResizing) {
        const mouseEvent = e as unknown as React.MouseEvent;
        handleMouseMove(mouseEvent);
      }
    };
    
    if (isDraggingRoom || isResizing) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDraggingRoom, isResizing, selectedRoom]);

  const viewBox = `0 0 ${totalWidth} ${totalHeight}`;
  const isEmpty = rooms.length === 0 && devices.length === 0;

  return (
    <div className="flex-1 bg-gray-100 overflow-auto">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl font-semibold text-gray-700">Loading your floorplan...</p>
          </div>
        </div>
      ) : (
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className={`w-full h-full ${selectedDeviceType ? 'cursor-crosshair' : 'cursor-grab'} active:cursor-grabbing select-none`}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <defs>
            <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
              <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
            </pattern>
          </defs>
          
          {/* Frame and background */}
          <rect 
            x="0" 
            y="0" 
            width={totalWidth} 
            height={totalHeight} 
            fill="#f9fafb" 
            stroke="none" 
          />
          
          {/* Grid working area with frame */}
          <rect 
            x={margin} 
            y={margin} 
            width={workingWidth} 
            height={workingHeight} 
            fill="url(#grid)" 
            stroke="#2563eb" 
            strokeWidth="2"
            rx="5"
            ry="5"
          />
          
          {isEmpty && (
            <g>
              <rect 
                x={margin + 275} 
                y={margin + 350} 
                width="400" 
                height="250" 
                rx="10" 
                ry="10" 
                fill="rgba(255,255,255,0.9)"
                stroke="#ccc"
                strokeWidth="2"
              />
              <text 
                x={margin + 475} 
                y={margin + 440} 
                textAnchor="middle" 
                fontSize="24" 
                fontWeight="bold"
                fill="#666"
              >
                Welcome to Smart Home Planner
              </text>
              <text 
                x={margin + 475} 
                y={margin + 480} 
                textAnchor="middle" 
                fontSize="16" 
                fill="#666"
              >
                To get started, create a room using
              </text>
              <text 
                x={margin + 475} 
                y={margin + 510} 
                textAnchor="middle" 
                fontSize="16" 
                fill="#666"
              >
                the Room Management panel or
              </text>
              <text 
                x={margin + 475} 
                y={margin + 540} 
                textAnchor="middle" 
                fontSize="16" 
                fill="#666"
              >
                import an existing configuration.
              </text>
            </g>
          )}
          
          {rooms.map((room) => (
            <g key={room.id}>
              <rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                fill={room.color ? `${room.color}20` : 'none'}
                stroke={room.color || '#999'}
                strokeWidth={selectedRoom?.id === room.id ? "4" : "2"}
                strokeDasharray={selectedRoom?.id === room.id ? "" : "5,5"}
                className="cursor-pointer"
                onClick={(e) => handleRoomClick(e, room)}
              />
              <text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2}
                textAnchor="middle"
                fill={room.color || '#999'}
                fontSize="14"
                pointerEvents="none"
                className='select-none'
              >
                {room.name}
              </text>
              
              {selectedRoom?.id === room.id && (
                <RoomHandles 
                  room={room}
                  onDragStart={handleRoomDragStart}
                  onResizeStart={handleRoomResizeStart}
                />
              )}
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
                className="select-none"
                pointerEvents="none"
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
      )}
    </div>
  );
};

export default FloorPlan;