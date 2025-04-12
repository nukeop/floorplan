import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { DeviceType, Device, Room, MountPosition, DeviceGroup } from '@/types';

interface FloorplanContextType {
  // State
  devices: Device[];
  deviceGroups: DeviceGroup[];
  rooms: Room[];
  selectedDeviceType: DeviceType | null;
  selectedDevice: Device | null;
  selectedGroup: DeviceGroup | null;
  selectedRoom: Room | null;
  selectedMountPosition: MountPosition;
  isLoading: boolean;
  detailsPanelOpen: boolean;
  
  // Device operations
  addDevice: (x: number, y: number) => void;
  updateDevicePosition: (id: string, x: number, y: number) => void;
  updateDeviceMountPosition: (id: string, position: MountPosition) => void;
  updateDeviceNotes: (id: string, notes: string) => void;
  selectDevice: (device: Device | null) => void;
  rotateDevice: (id: string) => void;
  deleteDevice: (id: string) => void;
  setSelectedDeviceType: (type: DeviceType | null) => void;
  setSelectedMountPosition: (position: MountPosition) => void;
  
  // Group operations
  createDeviceGroup: (deviceIds: string[]) => void;
  updateGroupPosition: (id: string, x: number, y: number) => void;
  updateGroupMountPosition: (id: string, position: MountPosition) => void;
  updateGroupNotes: (id: string, notes: string) => void;
  addDeviceToGroup: (deviceId: string, groupId: string) => void;
  removeDeviceFromGroup: (deviceId: string, groupId: string) => void;
  deleteGroup: (id: string) => void;
  selectGroup: (group: DeviceGroup | null) => void;
  
  // Room operations
  addRoom: (name: string, color: string) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  selectRoom: (room: Room | null) => void;
  
  // UI operations
  openDetailsPanel: () => void;
  closeDetailsPanel: () => void;
  
  // Configuration operations
  exportConfiguration: () => void;
  importConfiguration: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FloorplanContext = createContext<FloorplanContextType | undefined>(undefined);

interface FloorplanProviderProps {
  children: ReactNode;
}

export const FloorplanProvider: React.FC<FloorplanProviderProps> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<DeviceGroup | null>(null);
  const [selectedMountPosition, setSelectedMountPosition] = useState<MountPosition>(MountPosition.WALL_MEDIUM);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState<boolean>(false);

  // Device operations
  const addDevice = (x: number, y: number) => {
    if (!selectedDeviceType) return;
    
    const newDevice: Device = {
      id: `device-${Date.now()}`,
      type: selectedDeviceType,
      x,
      y,
      rotation: 0,
      position: selectedMountPosition,
    };
    
    setDevices([...devices, newDevice]);
    setSelectedDeviceType(null);
  };

  const updateDevicePosition = (id: string, x: number, y: number) => {
    setDevices(
      devices.map(device => 
        device.id === id ? { ...device, x, y } : device
      )
    );
  };

  const updateDeviceMountPosition = (id: string, position: MountPosition) => {
    setDevices(
      devices.map(device => 
        device.id === id ? { ...device, position } : device
      )
    );
  };

  const updateDeviceNotes = useCallback((id: string, notes: string) => {
    setDevices(currentDevices => {
      const newDevices = currentDevices.map(device =>
        device.id === id ? { ...device, notes } : device
      );
      const updatedDevice = newDevices.find(device => device.id === id);
      setSelectedDevice(prev => (prev && prev.id === id ? updatedDevice || null : prev));
      return newDevices;
    });
  }, []);

  const deleteDevice = (id: string) => {
    setDevices(devices.filter(device => device.id !== id));
    if (selectedDevice?.id === id) {
      setSelectedDevice(null);
      closeDetailsPanel();
    }
  };

  const rotateDevice = (id: string) => {
    setDevices(
      devices.map(device => 
        device.id === id 
          ? { ...device, rotation: (device.rotation + 90) % 360 } 
          : device
      )
    );
  };

  const selectDevice = (device: Device | null) => {
    setSelectedDevice(device);
    setSelectedGroup(null);
    if (device) {
      setSelectedRoom(null);
      if (device.groupId) {
        // If the device is part of a group, select the group instead
        const group = deviceGroups.find(g => g.id === device.groupId);
        if (group) {
          setSelectedGroup(group);
          setSelectedDevice(null);
        }
      } else {
        openDetailsPanel();
      }
    }
  };

  // Group operations
  const createDeviceGroup = (deviceIds: string[]) => {
    if (deviceIds.length < 2) return;

    // Find devices to group
    const devicesToGroup = devices.filter((d) => deviceIds.includes(d.id));
    if (devicesToGroup.length < 2) return;

    // Use position of first device as group position
    const firstDevice = devicesToGroup[0];
    const groupPosition = { x: firstDevice.x, y: firstDevice.y };

    const commonPosition = firstDevice.position;

    // Create new group
    const newGroup: DeviceGroup = {
      id: `group-${Date.now()}`,
      x: groupPosition.x,
      y: groupPosition.y,
      devices: [],
      notes: '',
      position: commonPosition,
    };

    // Update devices to be part of this group
    const updatedDevices = devices.map((device) => {
      if (deviceIds.includes(device.id)) {
        return { ...device, groupId: newGroup.id };
      }
      return device;
    });

    // Add devices to group (creating copies to avoid reference issues)
    const groupDevices = devicesToGroup.map((d) => ({ ...d, groupId: newGroup.id }));
    newGroup.devices = groupDevices;

    // Update state
    setDevices(updatedDevices);
    setDeviceGroups([...deviceGroups, newGroup]);
    setSelectedGroup(newGroup);
    setSelectedDevice(null);
    openDetailsPanel();
  };

  const updateGroupPosition = useCallback((id: string, x: number, y: number) => {
    setDeviceGroups(
      deviceGroups.map(group => 
        group.id === id ? { ...group, x, y } : group
      )
    );
  }, [deviceGroups, selectedDevice]);

  const updateGroupMountPosition = useCallback((id: string, position: MountPosition) => {
    setDeviceGroups(currentGroups => {
      const newGroups = currentGroups.map(group => 
        group.id === id ? { ...group, position } : group
      );
      
      const updatedGroup = newGroups.find(group => group.id === id);
      setSelectedGroup(prev => (prev && prev.id === id ? updatedGroup || null : prev));
      
      return newGroups;
    });
    
    // Also update all devices in this group to have the same position
    setDevices(currentDevices => {
      return currentDevices.map(device => 
        device.groupId === id ? { ...device, position } : device
      );
    });
  }, []);

  const updateGroupNotes = useCallback((id: string, notes: string) => {
    setDeviceGroups(currentGroups => {
      const newGroups = currentGroups.map(group => 
        group.id === id ? { ...group, notes } : group
      );
      const updatedGroup = newGroups.find(group => group.id === id);
      setSelectedGroup(prev => (prev && prev.id === id ? updatedGroup || null : prev));
      return newGroups;
    });
  }, []);

  const addDeviceToGroup = (deviceId: string, groupId: string) => {
    // Find the device and group
    const device = devices.find((d) => d.id === deviceId);
    const group = deviceGroups.find((g) => g.id === groupId);

    if (!device || !group) return;

    // Update the device to be part of the group
    const updatedDevices = devices.map((d) => {
      if (d.id === deviceId) {
        return { ...d, groupId: groupId };
      }
      return d;
    });

    // Add the device to the group
    const updatedGroups = deviceGroups.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          devices: [...g.devices, { ...device, groupId }],
        };
      }
      return g;
    });

    // Update state
    setDevices(updatedDevices);
    setDeviceGroups(updatedGroups);
  };

  const removeDeviceFromGroup = (deviceId: string, groupId: string) => {
    // Update the device to no longer be part of the group
    const updatedDevices = devices.map((d) => {
      if (d.id === deviceId) {
        const { groupId: _, ...deviceWithoutGroup } = d;
        return deviceWithoutGroup;
      }
      return d;
    });

    // Remove the device from the group
    const updatedGroups = deviceGroups.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          devices: g.devices.filter(d => d.id !== deviceId),
        };
      }
      return g;
    });

    // Check if group should be deleted (has fewer than 2 devices)
    const groupToUpdate = updatedGroups.find(g => g.id === groupId);
    if (groupToUpdate && groupToUpdate.devices.length < 2) {
      // If fewer than 2 devices, delete the group
      const finalGroups = updatedGroups.filter(g => g.id !== groupId);
      setDeviceGroups(finalGroups);
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
        closeDetailsPanel();
      }
    } else {
      setDeviceGroups(updatedGroups);
    }

    setDevices(updatedDevices);
  };

  const deleteGroup = (id: string) => {
    // Update all devices in the group to no longer be part of it
    const updatedDevices = devices.map((device) => {
      if (device.groupId === id) {
        const { groupId, ...deviceWithoutGroup } = device;
        return deviceWithoutGroup;
      }
      return device;
    });

    // Remove the group
    setDeviceGroups(deviceGroups.filter(group => group.id !== id));
    setDevices(updatedDevices);

    if (selectedGroup?.id === id) {
      setSelectedGroup(null);
      closeDetailsPanel();
    }
  };

  const selectGroup = (group: DeviceGroup | null) => {
    setSelectedGroup(group);
    setSelectedDevice(null);
    setSelectedRoom(null);
    
    if (group) {
      openDetailsPanel();
    }
  };

  // UI operations
  const openDetailsPanel = () => {
    setDetailsPanelOpen(true);
  };

  const closeDetailsPanel = () => {
    setDetailsPanelOpen(false);
  };

  const exportConfiguration = () => {
    const data = {
      rooms,
      devices,
      deviceGroups
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smart-home-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          
          // Handle old-format configurations without deviceGroups
          if (config.rooms && config.devices) {
            setRooms(config.rooms);
            setDevices(config.devices);
            
            if (config.deviceGroups) {
              setDeviceGroups(config.deviceGroups);
            } else {
              setDeviceGroups([]);
            }
          }
        } catch (error) {
          console.error('Error parsing configuration file:', error);
        } finally {
          setTimeout(() => {
            setIsLoading(false);
          }, 300);
        }
      };
      reader.readAsText(file);
    }
  };

  const addRoom = (name: string, color: string) => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name,
      x: 50,
      y: 50,
      width: 200,
      height: 150,
      color,
    };
    
    setRooms([...rooms, newRoom]);
    setSelectedRoom(newRoom);
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    setRooms(
      rooms.map(room => room.id === id ? { ...room, ...updates } : room)
    );
  };

  const deleteRoom = (id: string) => {
    setRooms(rooms.filter(room => room.id !== id));
    if (selectedRoom?.id === id) {
      setSelectedRoom(null);
    }
  };

  const selectRoom = (room: Room | null) => {
    setSelectedRoom(room);
    if (room) {
      setSelectedDevice(null);
      setSelectedGroup(null);
      closeDetailsPanel();
    }
  };

  // Effect to handle saving configuration to local storage
  useEffect(() => {
    if (devices.length > 0) {
      localStorage.setItem('smart-home-devices', JSON.stringify(devices));
    }
  }, [devices]);

  useEffect(() => {
    if (deviceGroups.length > 0) {
      localStorage.setItem('smart-home-device-groups', JSON.stringify(deviceGroups));
    }
  }, [deviceGroups]);

  useEffect(() => {
    if (rooms.length > 0) {
      localStorage.setItem('smart-home-rooms', JSON.stringify(rooms));
    }
  }, [rooms]);

  // Effect to load saved configuration
  useEffect(() => {
    setIsLoading(true);
    
    const savedDevices = localStorage.getItem('smart-home-devices');
    if (savedDevices) {
      try {
        setDevices(JSON.parse(savedDevices));
      } catch (error) {
        console.error('Error loading saved devices:', error);
      }
    }
    
    const savedGroups = localStorage.getItem('smart-home-device-groups');
    if (savedGroups) {
      try {
        setDeviceGroups(JSON.parse(savedGroups));
      } catch (error) {
        console.error('Error loading saved device groups:', error);
      }
    }
    
    const savedRooms = localStorage.getItem('smart-home-rooms');
    if (savedRooms) {
      try {
        setRooms(JSON.parse(savedRooms));
      } catch (error) {
        console.error('Error loading saved rooms:', error);
      }
    }
    
    // Simulate a small delay to prevent flashing if loading is very quick
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  // Auto-select appropriate mount position based on device type
  useEffect(() => {
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
  }, [selectedDeviceType]);

  // Create the value object containing all state and methods
  const value: FloorplanContextType = {
    // State
    devices,
    deviceGroups,
    rooms,
    selectedDeviceType,
    selectedDevice,
    selectedGroup,
    selectedRoom,
    selectedMountPosition,
    isLoading,
    detailsPanelOpen,
    
    // Device operations
    addDevice,
    updateDevicePosition,
    updateDeviceMountPosition,
    updateDeviceNotes,
    selectDevice,
    rotateDevice,
    deleteDevice,
    setSelectedDeviceType,
    setSelectedMountPosition,
    
    // Group operations
    createDeviceGroup,
    updateGroupPosition,
    updateGroupMountPosition,
    updateGroupNotes,
    addDeviceToGroup,
    removeDeviceFromGroup,
    deleteGroup,
    selectGroup,
    
    // Room operations
    addRoom,
    updateRoom,
    deleteRoom,
    selectRoom,
    
    // UI operations
    openDetailsPanel,
    closeDetailsPanel,
    
    // Configuration operations
    exportConfiguration,
    importConfiguration,
  };

  return (
    <FloorplanContext.Provider value={value}>
      {children}
    </FloorplanContext.Provider>
  );
};

export const useFloorplan = (): FloorplanContextType => {
  const context = useContext(FloorplanContext);
  if (context === undefined) {
    throw new Error('useFloorplan must be used within a FloorplanProvider');
  }
  return context;
};