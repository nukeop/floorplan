import React from 'react';
import { Device, DeviceGroup, MountPosition } from '@/types';
import NotesEditor from './NotesEditor';

interface DeviceDetailsPanelProps {
  device: Device | null;
  group: DeviceGroup | null;
  onUpdateDeviceNotes: (id: string, notes: string) => void;
  onUpdateGroupNotes: (id: string, notes: string) => void;
  onClose: () => void;
  onRemoveDeviceFromGroup: (deviceId: string, groupId: string) => void;
  onChangeMountPosition: (id: string, position: MountPosition) => void;
  onChangeGroupMountPosition: (id: string, position: MountPosition) => void;
  onRotateDevice: (id: string) => void;
}

const DeviceDetailsPanel: React.FC<DeviceDetailsPanelProps> = ({
  device,
  group,
  onUpdateDeviceNotes,
  onUpdateGroupNotes,
  onClose,
  onRemoveDeviceFromGroup,
  onChangeMountPosition,
  onChangeGroupMountPosition,
  onRotateDevice
}) => {
  const getPanelTitle = () => {
    if (device) {
      return `${device.type.replace(/-/g, ' ')} Details`;
    }
    if (group) {
      return 'Device Group Details';
    }
    return 'Details';
  };

  const renderGroupDetails = () => {
    if (!group) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Mount Position:</h3>
          <select
            value={group.position}
            onChange={(e) => onChangeGroupMountPosition(group.id, e.target.value as MountPosition)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value={MountPosition.WALL_LOW}>Wall (Low)</option>
            <option value={MountPosition.WALL_MEDIUM}>Wall (Medium)</option>
            <option value={MountPosition.WALL_HIGH}>Wall (High)</option>
            <option value={MountPosition.CEILING}>Ceiling</option>
          </select>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700">Devices in this group:</h3>
          <ul className="mt-2 space-y-1">
            {group.devices.map(d => (
              <li key={d.id} className="flex items-center justify-between">
                <span className="text-sm">{d.type.replace(/-/g, ' ')}</span>
                <button
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                  onClick={() => onRemoveDeviceFromGroup(d.id, group.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <NotesEditor
          value={group.notes || ''}
          onChange={(e) => onUpdateGroupNotes(group.id, e.target.value)}
          placeholder="Add installation instructions for this group..."
          label="Group Notes"
        />
      </div>
    );
  };

  const renderDeviceDetails = () => {
    if (!device) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Mount Position:</h3>
          <select
            value={device.position}
            onChange={(e) => onChangeMountPosition(device.id, e.target.value as MountPosition)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value={MountPosition.WALL_LOW}>Wall (Low)</option>
            <option value={MountPosition.WALL_MEDIUM}>Wall (Medium)</option>
            <option value={MountPosition.WALL_HIGH}>Wall (High)</option>
            <option value={MountPosition.CEILING}>Ceiling</option>
          </select>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700">Rotation: {device.rotation}°</h3>
          <button
            onClick={() => onRotateDevice(device.id)}
            className="mt-1 inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Rotate 90°
          </button>
        </div>
        
        <NotesEditor
          value={device.notes || ''}
          onChange={(e) => onUpdateDeviceNotes(device.id, e.target.value)}
          placeholder="Add specific installation notes for this device..."
          label="Device Notes"
        />
      </div>
    );
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-10">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
        <h2 className="text-lg font-semibold text-gray-800">{getPanelTitle()}</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-200 focus:outline-none"
        >
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-4">
        {group ? renderGroupDetails() : renderDeviceDetails()}
      </div>
    </div>
  );
};

export default DeviceDetailsPanel;