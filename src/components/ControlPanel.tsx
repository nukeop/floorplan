import React, { useState } from 'react';
import { DeviceType, MountPosition } from '@/types';
import RoomPanel from './RoomPanel';
import { useFloorplan } from '@/contexts/FloorplanContext';
import { FaChevronLeft, FaChevronRight, FaBars } from 'react-icons/fa';

const ControlPanel: React.FC = () => {
  const {
    selectedDeviceType,
    setSelectedDeviceType,
    selectedDevice,
    selectedMountPosition,
    setSelectedMountPosition,
    rotateDevice,
    deleteDevice,
    updateDeviceMountPosition,
    exportConfiguration,
    importConfiguration,
    isEditorMode,
    isLoading
  } = useFloorplan();

  // State to track if sidebar is collapsed
  const [isCollapsed, setIsCollapsed] = useState(!isEditorMode);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const deviceTypes = [
    { type: DeviceType.SOCKET, label: 'Socket' },
    { type: DeviceType.SWITCH, label: 'Switch' },
    { type: DeviceType.SMART_SOCKET, label: 'Smart Socket' },
    { type: DeviceType.SMART_SWITCH, label: 'Smart Switch' },
    { type: DeviceType.MOTION_SENSOR, label: 'Motion Sensor' },
    { type: DeviceType.TEMPERATURE_SENSOR, label: 'Temperature Sensor' },
    { type: DeviceType.LIGHT, label: 'Wall Light' },
    { type: DeviceType.CEILING_LIGHT, label: 'Ceiling Light' },
    { type: DeviceType.CEILING_SENSOR, label: 'Ceiling Sensor' },
    { type: DeviceType.ETHERNET, label: 'Ethernet' },
    { type: DeviceType.TV_OUTLET, label: 'TV Outlet' },
    { type: DeviceType.THERMOSTAT, label: 'Thermostat' },
    { type: DeviceType.AIR_SENSOR, label: 'Air Sensor' },
  ];

  const mountPositions = [
    { position: MountPosition.WALL_LOW, label: 'Wall (low ~30cm)', color: 'bg-blue-500' },
    { position: MountPosition.WALL_MEDIUM, label: 'Wall (medium ~80cm)', color: 'bg-green-500' },
    { position: MountPosition.WALL_HIGH, label: 'Wall (high ~120cm)', color: 'bg-orange-500' },
    { position: MountPosition.CEILING, label: 'Ceiling', color: 'bg-purple-500' },
  ];

  if (!isEditorMode) {
    return (
      <div className={`bg-white border-r border-gray-200 shadow-md transition-all duration-300 ease-in-out flex h-full ${isCollapsed ? 'w-12' : 'w-80'}`}>
        {/* Collapsed sidebar with toggle button */}
        {isCollapsed && (
          <div className="w-12 h-full flex items-center justify-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
              title="Expand panel"
            >
              <FaChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
        
        {/* Main content */}
        <div className={`${isCollapsed ? 'w-0 opacity-0' : 'flex-1 opacity-100'} overflow-y-auto transition-all duration-300 p-4 relative`}>
          <button
            onClick={toggleSidebar}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 focus:outline-none"
            title="Collapse panel"
          >
            <FaChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          
          <h2 className="text-xl font-bold mb-4 pr-8">Floorplan Viewer</h2>
          
          {isLoading ? (
            <div className="py-4 text-center">Loading...</div>
          ) : (
            <div className="mt-4">
              <label className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-center cursor-pointer block">
                Import Floorplan
                <input
                  type="file"
                  accept=".json"
                  onChange={importConfiguration}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border-r border-gray-200 shadow-md transition-all duration-300 ease-in-out flex h-full ${isCollapsed ? 'w-12' : 'w-80'}`}>
      {/* Collapsed sidebar with toggle button */}
      {isCollapsed && (
        <div className="w-12 h-full flex items-center justify-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
            title="Expand panel"
          >
            <FaChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}
      
      {/* Main content */}
      <div className={`${isCollapsed ? 'w-0 opacity-0' : 'flex-1 opacity-100'} overflow-y-auto transition-all duration-300 p-4 relative`}>
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 focus:outline-none"
          title="Collapse panel"
        >
          <FaChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        
        <h2 className="text-xl font-bold mb-4 pr-8">Control Panel</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Select element:</h3>
          <div className="grid grid-cols-2 gap-2">
            {deviceTypes.map((device) => (
              <button
                key={device.type}
                className={`p-2 border rounded text-sm transition-colors ${
                  selectedDeviceType === device.type 
                    ? 'bg-green-500 text-white border-green-600' 
                    : 'bg-white hover:bg-gray-100 border-gray-300'
                }`}
                onClick={() => setSelectedDeviceType(device.type)}
              >
                {device.label}
              </button>
            ))}
          </div>
          
          {selectedDeviceType && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Select mount position:</h3>
              <div className="flex flex-col gap-2">
                {mountPositions.map((pos) => (
                  <button
                    key={pos.position}
                    className={`p-2 border rounded flex items-center transition-colors ${
                      selectedMountPosition === pos.position 
                        ? 'bg-gray-100 border-gray-400' 
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => setSelectedMountPosition(pos.position)}
                  >
                    <span className={`inline-block w-4 h-4 rounded-full mr-2 ${pos.color}`}></span>
                    {pos.label}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm mb-2">
                  Click on the plan to add {deviceTypes.find(d => d.type === selectedDeviceType)?.label}
                </p>
                <button 
                  className="w-full py-1 px-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  onClick={() => setSelectedDeviceType(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        {selectedDevice && (
          <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Edit element:</h3>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Change mount position:</h4>
              <div className="flex flex-col gap-2">
                {mountPositions.map((pos) => (
                  <button
                    key={pos.position}
                    className={`p-2 border rounded flex items-center transition-colors ${
                      selectedDevice.position === pos.position 
                        ? 'bg-gray-100 border-gray-400' 
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => updateDeviceMountPosition(selectedDevice.id, pos.position)}
                  >
                    <span className={`inline-block w-4 h-4 rounded-full mr-2 ${pos.color}`}></span>
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                onClick={() => rotateDevice(selectedDevice.id)}
              >
                Rotate
              </button>
              <button 
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                onClick={() => deleteDevice(selectedDevice.id)}
              >
                Delete
              </button>
            </div>
          </div>
        )}
        
        <RoomPanel />
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Configuration:</h3>
          <div className="flex flex-col gap-2">
            <button 
              className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={exportConfiguration}
            >
              Export
            </button>
            
            <label className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-center cursor-pointer">
              Import
              <input
                type="file"
                accept=".json"
                onChange={importConfiguration}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;