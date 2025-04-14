import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Device, Room, DeviceGroup, DeviceType, MountPosition } from '@/types';
import DeviceComponent from './DeviceComponent';
import GroupedDeviceComponent from './GroupedDeviceComponent';
import RoomHandles from './RoomHandles';
import { useFloorplan } from '@/contexts/FloorplanContext';
import { useGrid } from '@/hooks/useGrid';
import { useWalls } from '@/hooks/useWalls';
import { 
  FaCrosshairs, 
  FaRuler, 
  FaSearchPlus, 
  FaSearchMinus, 
  FaExpand, 
  FaLayerGroup,
  FaPlug,
  FaLightbulb,
  FaThermometerHalf,
  FaWifi,
  FaEye,
  FaEdit
} from 'react-icons/fa';
import { 
  MdOutlineGridOn, 
  MdVisibility, 
  MdInfo, 
  MdHome, 
  MdSquareFoot 
} from 'react-icons/md';

const FloorplanControlPanel: React.FC<{
  rooms: Room[];
  devices: Device[];
  deviceGroups: DeviceGroup[];
  gridSize: number;
  viewBoxValues: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  onCenterView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomChange: (scale: number) => void;
  selectedRoom: Room | null;
  selectedDevice: Device | null;
  selectedGroup: DeviceGroup | null;
  isEditorMode: boolean;
}> = ({
  rooms,
  devices,
  deviceGroups,
  gridSize,
  viewBoxValues,
  onCenterView,
  onZoomIn,
  onZoomOut,
  onZoomChange,
  selectedRoom,
  selectedDevice,
  selectedGroup,
  isEditorMode
}) => {
  const [expanded, setExpanded] = useState(false); // Changed from true to false
  
  const totalArea = useMemo(() => {
    // Convert from grid units to square meters (grid size is in cm)
    return rooms.reduce((total, room) => {
      const areaInSquareCm = room.width * room.height;
      const areaInSquareMeters = areaInSquareCm / 10000; // 10000 sq cm = 1 sq m
      return total + areaInSquareMeters;
    }, 0);
  }, [rooms]);
  
  const deviceCountsByType = useMemo(() => {
    const counts: Record<DeviceType, number> = {} as Record<DeviceType, number>;
    
    Object.values(DeviceType).forEach(type => {
      counts[type] = 0;
    });
    
    devices.forEach(device => {
      counts[device.type]++;
    });
    
    return counts;
  }, [devices]);
  
  // Calculate total electrical and IoT devices
  const totalElectricalDevices = useMemo(() => {
    return devices.filter(d => 
      d.type === DeviceType.SOCKET || 
      d.type === DeviceType.SWITCH || 
      d.type === DeviceType.SMART_SOCKET || 
      d.type === DeviceType.SMART_SWITCH
    ).length;
  }, [devices]);
  
  const totalLightingDevices = useMemo(() => {
    return devices.filter(d => 
      d.type === DeviceType.LIGHT || 
      d.type === DeviceType.CEILING_LIGHT
    ).length;
  }, [devices]);
  
  const totalSensorDevices = useMemo(() => {
    return devices.filter(d => 
      d.type === DeviceType.MOTION_SENSOR || 
      d.type === DeviceType.TEMPERATURE_SENSOR || 
      d.type === DeviceType.CEILING_SENSOR
    ).length;
  }, [devices]);
  
  // Get currently selected item info
  const getSelectionInfo = () => {
    if (selectedRoom) {
      // Calculate area in square meters for the selected room
      const areaInSquareCm = selectedRoom.width * selectedRoom.height;
      const areaInSquareMeters = areaInSquareCm / 10000; // 10000 sq cm = 1 sq m
      
      return {
        type: 'Room',
        name: selectedRoom.name,
        area: `${areaInSquareMeters.toFixed(2)} m²`
      };
    }
    
    if (selectedDevice) {
      return {
        type: 'Device',
        name: selectedDevice.type,
        position: selectedDevice.position
      };
    }
    
    if (selectedGroup) {
      return {
        type: 'Group',
        name: `Group of ${selectedGroup.devices.length} devices`,
        description: selectedGroup.notes || 'No description'
      };
    }
    
    return null;
  };
  
  const selectedInfo = getSelectionInfo();
  
  // Current view scale (relative to initial size)
  const viewScale = Math.round((1000 / viewBoxValues.width) * 100);
  
  // Handle zoom slider change
  const handleZoomSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseInt(e.target.value, 10);
    onZoomChange(newScale);
  };
  
  return (
    <div 
      className={`absolute top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300 ${expanded ? 'w-72' : 'w-12'}`}
    >
      {/* Header with expand button */}
      <div className="flex justify-center items-center p-2 border-b border-gray-200">
        {expanded ? (
          <h3 className="font-semibold text-gray-800 flex-grow flex items-center">
            {isEditorMode ? (
              <>
                <FaEdit className="mr-2 text-blue-500" /> Editor Mode
              </>
            ) : (
              <>
                <FaEye className="mr-2 text-green-500" /> Viewer Mode
              </>
            )}
          </h3>
        ) : null}
        <button 
          onClick={() => setExpanded(!expanded)}
          className={`text-gray-500 hover:text-blue-500 focus:outline-none ${expanded ? '' : 'mx-auto'}`}
          title={expanded ? "Collapse panel" : "Expand panel"}
        >
          <FaExpand className="w-4 h-4" />
        </button>
      </div>
      
      <div className={`${expanded ? 'p-3' : 'p-0'}`}>
        {/* View Controls with slider */}
        <div className={`${expanded ? 'mb-4' : ''}`}>
          <div className={`flex justify-start items-center ${expanded ? 'mb-2 flex-row justify-end' : 'py-2 flex-col'} gap-2 p-2`}>
            <button
              onClick={onCenterView}
              className="p-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 focus:outline-none flex items-center justify-center"
              title="Center View"
            >
              <FaCrosshairs className="w-5 h-5" />
            </button>
            
            <a
              href={isEditorMode ? '/' : '/editor'}
              className="p-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 focus:outline-none flex items-center justify-center"
              title={isEditorMode ? "Switch to Viewer Mode" : "Switch to Editor Mode"}
            >
              {isEditorMode ? <FaEye className="w-5 h-5" /> : <FaEdit className="w-5 h-5" />}
            </a>
          </div>
          
          {expanded && (
            <div className="flex items-center space-x-2 mt-2">
              <button
                onClick={onZoomOut}
                className="p-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 focus:outline-none flex items-center justify-center"
                title="Zoom Out"
              >
                <FaSearchMinus className="w-4 h-4" />
              </button>
              
              <input
                type="range"
                min="50"
                max="200"
                value={viewScale}
                onChange={handleZoomSliderChange}
                className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              
              <button
                onClick={onZoomIn}
                className="p-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 focus:outline-none flex items-center justify-center"
                title="Zoom In"
              >
                <FaSearchPlus className="w-4 h-4" />
              </button>
              
              <span className="text-xs text-gray-500 w-12 text-right">{viewScale}%</span>
            </div>
          )}
        </div>
        
        {expanded && (
          <>
            {/* Statistics */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                <MdInfo className="mr-1" /> Floorplan Statistics
              </h4>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <MdHome className="text-blue-500 mr-1" /> Rooms:
                </div>
                <div className="text-right font-medium">{rooms.length}</div>
                
                <div className="flex items-center">
                  <MdSquareFoot className="text-blue-500 mr-1" /> Area:
                </div>
                <div className="text-right font-medium">{totalArea.toFixed(2)} m²</div>
                
                <div className="flex items-center">
                  <FaLayerGroup className="text-blue-500 mr-1" /> Groups:
                </div>
                <div className="text-right font-medium">{deviceGroups.length}</div>
                
                <div className="flex items-center">
                  <FaRuler className="text-blue-500 mr-1" /> Grid Size:
                </div>
                <div className="text-right font-medium">{gridSize} cm</div>
              </div>
            </div>
            
            {/* Device Counts */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                <MdOutlineGridOn className="mr-1" /> Device Inventory
              </h4>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <FaPlug className="text-blue-500 mr-1" /> Electrical:
                </div>
                <div className="text-right font-medium">{totalElectricalDevices}</div>
                
                <div className="flex items-center">
                  <FaLightbulb className="text-blue-500 mr-1" /> Lighting:
                </div>
                <div className="text-right font-medium">{totalLightingDevices}</div>
                
                <div className="flex items-center">
                  <FaWifi className="text-blue-500 mr-1" /> Sensors:
                </div>
                <div className="text-right font-medium">{totalSensorDevices}</div>
                
                <div className="flex items-center">
                  <FaThermometerHalf className="text-blue-500 mr-1" /> Thermostats:
                </div>
                <div className="text-right font-medium">{deviceCountsByType[DeviceType.THERMOSTAT]}</div>
                
                <div className="flex items-center col-span-2 pt-1 border-t border-gray-200 mt-1">
                  <strong>Total Devices:</strong> <span className="ml-auto font-medium">{devices.length}</span>
                </div>
              </div>
            </div>
            
            {/* Selection Info */}
            {selectedInfo && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-700 mb-2">Selected {selectedInfo.type}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(selectedInfo).map(([key, value]) => {
                    if (key === 'type') return null;
                    return (
                      <React.Fragment key={key}>
                        <div className="capitalize">{key}:</div>
                        <div className="text-right font-medium">
                          {value.toString()}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

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
    createDeviceGroup,
    addDeviceToGroup,
    isEditorMode,
    importConfiguration
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
  const [userPanned, setUserPanned] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [viewBoxValues, setViewBoxValues] = useState({ x: 0, y: 0, width: 950 + margin * 2, height: 950 + margin * 2 });
  const [viewBox, setViewBox] = useState<string>(`${viewBoxValues.x} ${viewBoxValues.y} ${viewBoxValues.width} ${viewBoxValues.height}`);
  const [frameDimensions, setFrameDimensions] = useState({
    x: margin,
    y: margin,
    width: 950,
    height: 950
  });

  // Zoom functionality
  const zoomIn = () => {
    // Zoom in by reducing the viewBox dimensions by 10%
    const newWidth = viewBoxValues.width * 0.9;
    const newHeight = viewBoxValues.height * 0.9;
    
    // Calculate the new origin to keep the center point the same
    const centerX = viewBoxValues.x + viewBoxValues.width / 2;
    const centerY = viewBoxValues.y + viewBoxValues.height / 2;
    
    const newX = centerX - newWidth / 2;
    const newY = centerY - newHeight / 2;
    
    setViewBoxValues({ x: newX, y: newY, width: newWidth, height: newHeight });
    setViewBox(`${newX} ${newY} ${newWidth} ${newHeight}`);
    setUserPanned(true); // Mark as user-modified view
  };

  const zoomOut = () => {
    // Zoom out by increasing the viewBox dimensions by 10%
    const newWidth = viewBoxValues.width * 1.1;
    const newHeight = viewBoxValues.height * 1.1;
    
    // Calculate the new origin to keep the center point the same
    const centerX = viewBoxValues.x + viewBoxValues.width / 2;
    const centerY = viewBoxValues.y + viewBoxValues.height / 2;
    
    const newX = centerX - newWidth / 2;
    const newY = centerY - newHeight / 2;
    
    setViewBoxValues({ x: newX, y: newY, width: newWidth, height: newHeight });
    setViewBox(`${newX} ${newY} ${newWidth} ${newHeight}`);
    setUserPanned(true); // Mark as user-modified view
  };

  const zoomChange = (scale: number) => {
    const newWidth = 1000 / (scale / 100);
    const newHeight = 1000 / (scale / 100);
    const centerX = viewBoxValues.x + viewBoxValues.width / 2;
    const centerY = viewBoxValues.y + viewBoxValues.height / 2;
    const newX = centerX - newWidth / 2;
    const newY = centerY - newHeight / 2;
    setViewBoxValues({ x: newX, y: newY, width: newWidth, height: newHeight });
    setViewBox(`${newX} ${newY} ${newWidth} ${newHeight}`);
    setUserPanned(true);
  };

  const handleZoomChange = (scale: number) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    if (rooms.length === 0 && devices.length === 0) {
      minX = 0;
      minY = 0;
      maxX = 950 + margin;
      maxY = 950 + margin;
    } else {
      rooms.forEach(room => {
        minX = Math.min(minX, room.x);
        minY = Math.min(minY, room.y);
        maxX = Math.max(maxX, room.x + room.width);
        maxY = Math.max(maxY, room.y + room.height);
      });
      devices.forEach(device => {
        minX = Math.min(minX, device.x);
        minY = Math.min(minY, device.y);
        maxX = Math.max(maxX, device.x);
        maxY = Math.max(maxY, device.y);
      });
    }
    minX = minX - margin;
    minY = minY - margin;
    maxX += margin;
    maxY += margin;
    const baseWidth = maxX - minX;
    const baseHeight = maxY - minY;
    const newWidth = baseWidth * (100 / scale);
    const newHeight = baseHeight * (100 / scale);
    const centerX = viewBoxValues.x + viewBoxValues.width / 2;
    const centerY = viewBoxValues.y + viewBoxValues.height / 2;
    const newX = centerX - newWidth / 2;
    const newY = centerY - newHeight / 2;
    setViewBoxValues({ x: newX, y: newY, width: newWidth, height: newHeight });
    setViewBox(`${newX} ${newY} ${newWidth} ${newHeight}`);
    setUserPanned(true);
  };

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

      if (!userPanned) {
        setViewBoxValues({ x: minX, y: minY, width: viewBoxWidth, height: viewBoxHeight });
        setViewBox(`${minX} ${minY} ${viewBoxWidth} ${viewBoxHeight}`);
      } else {
        // Preserve current origin if user has panned
        setViewBoxValues(prev => ({ ...prev, width: viewBoxWidth, height: viewBoxHeight }));
        setViewBox(`${viewBoxValues.x} ${viewBoxValues.y} ${viewBoxWidth} ${viewBoxHeight}`);
      }
    };

    calculateBoundingBox();
  }, [rooms, devices, margin, userPanned]);

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
    if (isPanning || !isEditorMode) {
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
      setUserPanned(true); // mark that user has panned
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

  const centerView = () => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    if (rooms.length === 0 && devices.length === 0) {
      minX = 0;
      minY = 0;
      maxX = 950 + margin;
      maxY = 950 + margin;
    } else {
      rooms.forEach(room => {
        minX = Math.min(minX, room.x);
        minY = Math.min(minY, room.y);
        maxX = Math.max(maxX, room.x + room.width);
        maxY = Math.max(maxY, room.y + room.height);
      });
      devices.forEach(device => {
        minX = Math.min(minX, device.x);
        minY = Math.min(minY, device.y);
        maxX = Math.max(maxX, device.x);
        maxY = Math.max(maxY, device.y);
      });
    }

    minX = minX - margin;
    minY = minY - margin;
    maxX += margin;
    maxY += margin;

    const viewBoxWidth = maxX - minX;
    const viewBoxHeight = maxY - minY;

    setFrameDimensions({ x: minX, y: minY, width: viewBoxWidth, height: viewBoxHeight });
    setViewBoxValues({ x: minX, y: minY, width: viewBoxWidth, height: viewBoxHeight });
    setViewBox(`${minX} ${minY} ${viewBoxWidth} ${viewBoxHeight}`);
    setUserPanned(false);
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
    if (!selectedRoom || !isEditorMode) return;
    
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

  // Room resizing handlers - modified to respect isEditorMode
  const handleRoomResizeStart = (direction: string, e: React.MouseEvent) => {
    if (!selectedRoom || !isEditorMode) return;
    
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
    
    // Updated grouping logic: Check if a dragged device should be grouped with nearby device(s)
    if (dragging && draggingDeviceId) {
      const deviceToCheck = devices.find(d => d.id === draggingDeviceId);
      if (deviceToCheck && !deviceToCheck.groupId) {
        // Find candidate devices in proximity
        const candidateDevices = devices.filter(d =>
          d.id !== draggingDeviceId &&
          Math.abs(d.x - deviceToCheck.x) <= 20 &&
          Math.abs(d.y - deviceToCheck.y) <= 20
        );
        if (candidateDevices.length > 0) {
          // If any candidate is already grouped, add the dragged device to that group
          const groupedCandidate = candidateDevices.find(d => d.groupId);
          if (groupedCandidate) {
            addDeviceToGroup(deviceToCheck.id, groupedCandidate.groupId!);
          } else {
            // Otherwise, create a new group with the dragged device and the first candidate
            createDeviceGroup([deviceToCheck.id, candidateDevices[0].id]);
          }
        }
      }
    }
    
    setDragging(false);
    setDraggingDeviceId(null);
  };

  // Handle device drag and drop - modified to respect isEditorMode
  const handleDragStart = (e: React.MouseEvent, device: Device) => {
    if (!isEditorMode) return;
    
    e.stopPropagation();
    selectDevice(device);
    setDragging(true);
    setDraggingDeviceId(device.id);
  };

  const handleDragEnd = (id: string, x: number, y: number) => {
    if (!isEditorMode) return;
    
    const safeX = ensurePositiveCoordinate(x);
    const safeY = ensurePositiveCoordinate(y);
    updateDevicePosition(id, safeX, safeY);
    setDragging(false);
    setDraggingDeviceId(null);
  };

  // Handle group drag and drop - modified to respect isEditorMode
  const handleGroupDragStart = (e: React.MouseEvent, group: DeviceGroup) => {
    if (!isEditorMode) return;
    
    e.stopPropagation();
    selectGroup(group);
    setDragging(true);
  };

  const handleGroupDragEnd = (id: string, x: number, y: number) => {
    if (!isEditorMode) return;
    
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileImportClick = () => {
    fileInputRef.current?.click();
  };

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
            className={`w-full h-full ${
              selectedDeviceType 
                ? 'cursor-crosshair' 
                : isPanning 
                  ? 'cursor-grabbing' 
                  : 'cursor-grab'
            } active:cursor-grabbing select-none`}
            onClick={isEditorMode ? handleClick : undefined}
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
                
                {isEditorMode ? (
                  <>
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
                  </>
                ) : (
                  // For viewer mode, just show the button with proper spacing
                  <g onClick={handleFileImportClick} className="cursor-pointer">
                    <rect
                      x={margin + 375}
                      y={margin + 480}
                      width="200"
                      height="40"
                      rx="20"
                      ry="20"
                      fill="#3b82f6"
                      stroke="none"
                    />
                    <text
                      x={margin + 475}
                      y={margin + 505}
                      textAnchor="middle"
                      fontSize="16"
                      fontWeight="bold"
                      fill="white"
                    >
                      Import Floorplan
                    </text>
                  </g>
                )}
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
                  className={isEditorMode ? "cursor-pointer" : ""}
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

                {isEditorMode && selectedRoom?.id === room.id && (
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
                readOnly={!isEditorMode}
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
                readOnly={!isEditorMode}
              />
            ))}
          </svg>

          <input
            type="file"
            ref={fileInputRef}
            onChange={importConfiguration}
            style={{ display: 'none' }}
            accept=".json"
          />

          <FloorplanControlPanel
            rooms={rooms}
            devices={devices}
            deviceGroups={deviceGroups}
            gridSize={gridSize}
            viewBoxValues={viewBoxValues}
            onCenterView={centerView}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onZoomChange={handleZoomChange}
            selectedRoom={selectedRoom}
            selectedDevice={selectedDevice}
            selectedGroup={selectedGroup}
            isEditorMode={isEditorMode}
          />
        </div>
      )}
    </div>
  );
};

export default FloorPlan;