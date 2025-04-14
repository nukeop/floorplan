import React from 'react';
import { MountPosition } from '@/types';
import NotesEditor from './NotesEditor';
import { FaTrash } from 'react-icons/fa';
import { useFloorplan } from '@/contexts/FloorplanContext';

interface DeviceDetailsPanelProps {
  readOnly?: boolean;
}

const DeviceDetailsPanel: React.FC<DeviceDetailsPanelProps> = ({ readOnly = false }) => {
  const {
    selectedDevice,
    selectedGroup,
    updateDeviceNotes,
    updateGroupNotes,
    updateDeviceMountPosition,
    updateGroupMountPosition,
    rotateDevice,
    deleteDevice,
    deleteGroup,
    ungroupAllDevices,
    closeDetailsPanel
  } = useFloorplan();

  const getPanelTitle = () => {
    if (selectedDevice) {
      return `${selectedDevice.type.replace(/-/g, ' ')} Details`;
    }
    if (selectedGroup) {
      return 'Device Group Details';
    }
    return 'Details';
  };

  const renderGroupDetails = () => {
    if (!selectedGroup) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Mount Position:</h3>
          {readOnly ? (
            <div className="mt-1 text-sm border rounded p-2 bg-gray-50">
              {selectedGroup.position.replace(/-/g, ' ')}
            </div>
          ) : (
            <select
              value={selectedGroup.position}
              onChange={(e) => updateGroupMountPosition(selectedGroup.id, e.target.value as MountPosition)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value={MountPosition.WALL_LOW}>Wall (Low)</option>
              <option value={MountPosition.WALL_MEDIUM}>Wall (Medium)</option>
              <option value={MountPosition.WALL_HIGH}>Wall (High)</option>
              <option value={MountPosition.CEILING}>Ceiling</option>
            </select>
          )}
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700">Devices in this group:</h3>
          <ul className="mt-2 space-y-1">
            {selectedGroup.devices.map(d => (
              <li key={d.id} className="flex items-center justify-between p-1 hover:bg-gray-50 rounded">
                <span className="text-sm">{d.type.replace(/-/g, ' ')}</span>
                {!readOnly && (
                  <button
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                    onClick={() => deleteDevice(d.id)}
                    title="Delete device"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <NotesEditor
          value={selectedGroup.notes || ''}
          onChange={(e) => updateGroupNotes(selectedGroup.id, e.target.value)}
          placeholder="Add installation instructions for this group..."
          label="Group Notes"
          readOnly={readOnly}
        />
        
        {!readOnly && (
          <div className="pt-2 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Group Actions:</h3>
            <div className="grid grid-cols-1 gap-2">
              <button 
                className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                onClick={() => deleteGroup(selectedGroup.id)}
              >
                Delete Group & Devices
              </button>
              <button 
                className="py-2 px-4 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                onClick={() => ungroupAllDevices(selectedGroup.id)}
              >
                Ungroup & Keep Devices
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDeviceDetails = () => {
    if (!selectedDevice) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Mount Position:</h3>
          {readOnly ? (
            <div className="mt-1 text-sm border rounded p-2 bg-gray-50">
              {selectedDevice.position.replace(/-/g, ' ')}
            </div>
          ) : (
            <select
              value={selectedDevice.position}
              onChange={(e) => updateDeviceMountPosition(selectedDevice.id, e.target.value as MountPosition)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value={MountPosition.WALL_LOW}>Wall (Low)</option>
              <option value={MountPosition.WALL_MEDIUM}>Wall (Medium)</option>
              <option value={MountPosition.WALL_HIGH}>Wall (High)</option>
              <option value={MountPosition.CEILING}>Ceiling</option>
            </select>
          )}
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700">Rotation: {selectedDevice.rotation}°</h3>
          {!readOnly && (
            <button
              onClick={() => rotateDevice(selectedDevice.id)}
              className="mt-1 inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Rotate 90°
            </button>
          )}
        </div>
        
        <NotesEditor
          value={selectedDevice.notes || ''}
          onChange={(e) => updateDeviceNotes(selectedDevice.id, e.target.value)}
          placeholder="Add specific installation notes for this device..."
          label="Device Notes"
          readOnly={readOnly}
        />
      </div>
    );
  };

  return (
    <div className="absolute top-4 left-[calc(80px+1rem)] w-80 bg-white shadow-lg rounded-lg overflow-hidden z-10">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
        <h2 className="text-lg font-semibold text-gray-800">
          {readOnly ? (
            <span>{getPanelTitle()} <span className="text-sm text-gray-500">(View Only)</span></span>
          ) : (
            getPanelTitle()
          )}
        </h2>
        <button
          onClick={closeDetailsPanel}
          className="p-1 rounded-md hover:bg-gray-200 focus:outline-none"
        >
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-4">
        {selectedGroup ? renderGroupDetails() : renderDeviceDetails()}
      </div>
    </div>
  );
};

export default DeviceDetailsPanel;