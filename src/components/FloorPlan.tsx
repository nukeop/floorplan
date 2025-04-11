import React, { useRef, useState, useEffect } from 'react';
import { Device, Room, DeviceGroup } from '@/types';
import DeviceComponent from './DeviceComponent';
import GroupedDeviceComponent from './GroupedDeviceComponent';
import RoomHandles from './RoomHandles';
import { useFloorplan } from '@/contexts/FloorplanContext';
import { useGrid } from '@/hooks/useGrid';
import { useWalls } from '@/hooks/useWalls';

const FloorPlan: React.FC = () => {
  const {
    rooms,
    devices,
    deviceGroups,
    selectedDeviceType,
    selectedDevice,
    selectedGroup,
    selectedRoom,
    addDevice,
    updateDevicePosition,
    updateGroupPosition,
    selectDevice,
    selectGroup,
    selectRoom,
    updateRoom,
    isLoading,
    createDeviceGroup
  } = useFloorplan();

  const {
    gridSize,
    margin,
    snapToGrid,
    ensurePositiveCoordinate
  } = useGrid();

  const wallLengths = useWalls(rooms);

  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const [draggingDeviceId, setDraggingDeviceId] = useState<string | null>(null);

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [viewBoxValues, setViewBoxValues] = useState({ x: 0, y: 0, width: 950 + margin * 2, height: 950 + margin * 2 });
  const [viewBox, setViewBox] = useState<string>(`${viewBoxValues.x} ${viewBoxValues.y} ${viewBoxValues.width} ${viewBoxValues.height}`);

  const [frameDimensions, setFrameDimensions] = useState({
    x: margin,
    y: margin,
    width: 950,
    height: 950
  });

  useEffect(() => {
    const calculateBoundingBox = () => {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      // If there's no content, use default values
      if (rooms.length === 0 && devices.length === 0) {
        minX = 0;
        minY = 0;
        maxX = 950 + margin;
        maxY = 950 + margin;
      } else {
        // Check each room to find the true bounds
        rooms.forEach(room => {
          minX = Math.min(minX, room.x);
          minY = Math.min(minY, room.y);
          maxX = Math.max(maxX, room.x + room.width);
          maxY = Math.max(maxY, room.y + room.height);
        });

        // Check each device to find the true bounds
        devices.forEach(device => {
          minX = Math.min(minX, device.x);
          minY = Math.min(minY, device.y);
          maxX = Math.max(maxX, device.x);
          maxY = Math.max(maxY, device.y);
        });
      }

      // Add padding around content
      minX = minX - margin;
      minY = minY - margin;
      maxX += margin;
      maxY += margin;

      // Update frame dimensions - explicitly handle all directions
      setFrameDimensions({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      });

      // Set viewBox dimensions to ensure all content is visible
      const viewBoxWidth = maxX - minX;
      const viewBoxHeight = maxY - minY;

      if (!isPanning) {
        setViewBoxValues(prev => ({
          ...prev,
          // Don't update x,y during panning - only when content changes
          x: minX,
          y: minY,
          width: viewBoxWidth,
          height: viewBoxHeight
        }));
        setViewBox(`${minX} ${minY} ${viewBoxWidth} ${viewBoxHeight}`);
      } else {
        // During panning, only update dimensions but keep the current origin
        setViewBoxValues(prev => ({
          ...prev,
          width: viewBoxWidth,
          height: viewBoxHeight
        }));
        setViewBox(`${viewBoxValues.x} ${viewBoxValues.y} ${viewBoxWidth} ${viewBoxHeight}`);
      }
    };

    calculateBoundingBox();
  }, [rooms, devices, margin, isPanning, viewBoxValues.x, viewBoxValues.y]);

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

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      return;
    }

    const target = e.target as SVGElement;

    const isBackgroundClick =
      target === svgRef.current ||
      target.getAttribute('data-background') === 'true';

    if (isBackgroundClick) {
      selectDevice(null);
      selectGroup(null);
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

  // Pan handlers
  const handlePanStart = (e: React.MouseEvent) => {
    if (selectedDeviceType || isDraggingRoom || isResizing || dragging) {
      return;
    }

    const target = e.target as SVGElement;
    const isBackgroundClick =
      target === svgRef.current ||
      target.getAttribute('data-background') === 'true';

    if (isBackgroundClick) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handlePan = (e: React.MouseEvent) => {
    if (!isPanning) return;

    if (!svgRef.current) return;

    // Get the current dimensions of the SVG element
    const svgRect = svgRef.current.getBoundingClientRect();
    const svgWidth = svgRect.width;
    const svgHeight = svgRect.height;
    
    // Calculate movement as a percentage of the SVG view dimensions
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    
    // Calculate the ratio between SVG units and pixel units
    const ratioX = viewBoxValues.width / svgWidth;
    const ratioY = viewBoxValues.height / svgHeight;
    
    // Apply the ratio to convert pixel movement to SVG units
    const svgDx = dx * ratioX;
    const svgDy = dy * ratioY;
    
    // Update the viewBox
    const newX = viewBoxValues.x - svgDx;
    const newY = viewBoxValues.y - svgDy;
    
    setViewBoxValues(prev => ({ ...prev, x: newX, y: newY }));
    setViewBox(`${newX} ${newY} ${viewBoxValues.width} ${viewBoxValues.height}`);
    
    // Update the pan start point for the next move
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handlePanEnd = () => {
    if (!isPanning) return;
    setIsPanning(false);
  };

  const handleRoomClick = (e: React.MouseEvent, room: Room) => {
    e.stopPropagation();
    selectDevice(null);
    selectGroup(null);
    selectRoom(room);
  };

  const handleDeviceClick = (e: React.MouseEvent, device: Device) => {
    e.stopPropagation();
    selectRoom(null);
    selectDevice(device);
  };

  const handleGroupClick = (e: React.MouseEvent, group: DeviceGroup) => {
    e.stopPropagation();
    selectRoom(null);
    selectDevice(null);
    selectGroup(group);
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
    if (isPanning) {
      handlePan(e);
      return;
    }

    if (!isDraggingRoom && !isResizing) return;

    const svgPoint = svgRef.current?.createSVGPoint();
    if (!svgPoint || !selectedRoom) return;

    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;
    const transformedPoint = svgPoint.matrixTransform(
      svgRef.current?.getScreenCTM()?.inverse()
    );

    if (isDraggingRoom) {
      const deltaX = transformedPoint.x - dragStartX;
      const deltaY = transformedPoint.y - dragStartY;

      const newX = snapToGrid(roomStartX + deltaX);
      const newY = snapToGrid(roomStartY + deltaY);

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
    if (isPanning) {
      handlePanEnd();
      return;
    }

    setIsDraggingRoom(false);
    setIsResizing(false);
    setResizeDirection(null);

    // Check if a dragged device should be grouped with another
    if (dragging && draggingDeviceId) {
      const deviceToCheck = devices.find(d => d.id === draggingDeviceId);

      if (deviceToCheck && !deviceToCheck.groupId) {
        // Find if there's another device at this position
        const targetDevice = devices.find(
          d => d.id !== draggingDeviceId &&
            !d.groupId &&
            Math.abs(d.x - deviceToCheck.x) < 5 &&
            Math.abs(d.y - deviceToCheck.y) < 5
        );

        if (targetDevice) {
          // Create a new group with these two devices
          createDeviceGroup([deviceToCheck.id, targetDevice.id]);
        }
      }
    }

    setDragging(false);
    setDraggingDeviceId(null);
  };

  // Handle device drag and drop
  const handleDragStart = (e: React.MouseEvent, device: Device) => {
    e.stopPropagation();
    selectDevice(device);
    setDragging(true);
    setDraggingDeviceId(device.id);
  };

  const handleDragEnd = (id: string, x: number, y: number) => {
    const safeX = ensurePositiveCoordinate(x);
    const safeY = ensurePositiveCoordinate(y);
    updateDevicePosition(id, safeX, safeY);
    setDragging(false);
    setDraggingDeviceId(null);
  };

  // Handle group drag and drop
  const handleGroupDragStart = (e: React.MouseEvent, group: DeviceGroup) => {
    e.stopPropagation();
    selectGroup(group);
    setDragging(true);
  };

  const handleGroupDragEnd = (id: string, x: number, y: number) => {
    const safeX = ensurePositiveCoordinate(x);
    const safeY = ensurePositiveCoordinate(y);
    updateGroupPosition(id, safeX, safeY);
    setDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isPanning || isDraggingRoom || isResizing) {
        const mouseEvent = e as unknown as React.MouseEvent;
        handleMouseMove(mouseEvent);
      }
    };

    if (isPanning || isDraggingRoom || isResizing) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isPanning, isDraggingRoom, isResizing, selectedRoom, dragging, draggingDeviceId, handleMouseMove, handleMouseUp]);

  // Get devices that are not part of a group (for rendering)
  const nonGroupedDevices = devices.filter(device => !device.groupId);

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
        <div className="relative w-full h-full overflow-auto">
          <svg
            ref={svgRef}
            viewBox={viewBox}
            className={`w-full h-full ${selectedDeviceType ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-grab'} active:cursor-grabbing select-none`}
            onClick={handleClick}
            onMouseDown={handlePanStart}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <defs>
              <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* White background covering the entire viewable area */}
            <rect
              x="-100000"
              y="-100000"
              width="200000"
              height="200000"
              fill="#f9fafb"
              stroke="none"
              data-background="true"
            />

            {/* Grid pattern covering the entire viewable area */}
            <rect
              x="-100000"
              y="-100000"
              width="200000"
              height="200000"
              fill="url(#grid)"
              stroke="none"
              data-background="true"
            />

            {/* Blue border frame for the main working area */}
            <rect 
              x={frameDimensions.x} 
              y={frameDimensions.y} 
              width={frameDimensions.width} 
              height={frameDimensions.height} 
              fill="none" 
              stroke="#2563eb" 
              strokeWidth="2"
              rx="5"
              ry="5"
              data-background="true"
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

            {/* Render device groups */}
            {deviceGroups.map((group) => (
              <GroupedDeviceComponent
                key={group.id}
                group={group}
                selected={selectedGroup?.id === group.id}
                onClick={(e) => handleGroupClick(e, group)}
                onDragStart={(e) => handleGroupDragStart(e, group)}
                onDragEnd={handleGroupDragEnd}
              />
            ))}

            {/* Render only non-grouped devices */}
            {nonGroupedDevices.map((device) => (
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
      )}
    </div>
  );
};

export default FloorPlan;