import React from 'react';
import { DeviceType, Device, MountPosition } from '@/types';

interface ControlPanelProps {
  selectedDeviceType: DeviceType | null;
  setSelectedDeviceType: (type: DeviceType | null) => void;
  selectedDevice: Device | null;
  selectedMountPosition: MountPosition;
  setSelectedMountPosition: (position: MountPosition) => void;
  rotateDevice: (id: string) => void;
  deleteDevice: (id: string) => void;
  updateDevicePosition: (id: string, position: MountPosition) => void;
  exportConfiguration: () => void;
  importConfiguration: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedDeviceType,
  setSelectedDeviceType,
  selectedDevice,
  selectedMountPosition,
  setSelectedMountPosition,
  rotateDevice,
  deleteDevice,
  updateDevicePosition,
  exportConfiguration,
  importConfiguration,
}) => {
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
  ];

  const mountPositions = [
    { position: MountPosition.WALL_LOW, label: 'Wall (low ~30cm)', color: 'bg-blue-500' },
    { position: MountPosition.WALL_MEDIUM, label: 'Wall (medium ~80cm)', color: 'bg-green-500' },
    { position: MountPosition.WALL_HIGH, label: 'Wall (high ~120cm)', color: 'bg-orange-500' },
    { position: MountPosition.CEILING, label: 'Ceiling', color: 'bg-purple-500' },
  ];

  React.useEffect(() => {
    if (selectedDeviceType) {
      switch (selectedDeviceType) {
        case DeviceType.CEILING_LIGHT:
        case DeviceType.CEILING_SENSOR:
          setSelectedMountPosition(MountPosition.CEILING);
          break;
        case DeviceType.SWITCH:
        case DeviceType.SMART_SWITCH:
        case DeviceType.THERMOSTAT:
          setSelectedMountPosition(MountPosition.WALL_HIGH);
          break;
        case DeviceType.SOCKET:
        case DeviceType.SMART_SOCKET:
        case DeviceType.ETHERNET:
        case DeviceType.TV_OUTLET:
          setSelectedMountPosition(MountPosition.WALL_MEDIUM);
          break;
        default:
          break;
      }
    }
  }, [selectedDeviceType, setSelectedMountPosition]);

  return (
    <div className="w-80 bg-white p-4 overflow-y-auto border-r border-gray-200 shadow-md">
      <h2 className="text-xl font-bold mb-4">Control Panel</h2>
      
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
                  onClick={() => updateDevicePosition(selectedDevice.id, pos.position)}
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
  );
};

export default ControlPanel;