export enum DeviceType {
    SOCKET = 'socket',
    SWITCH = 'switch',
    MOTION_SENSOR = 'motion-sensor',
    TEMPERATURE_SENSOR = 'temperature-sensor',
    LIGHT = 'light',
    SMART_SOCKET = 'smart-socket',
    SMART_SWITCH = 'smart-switch',
    ETHERNET = 'ethernet',
    TV_OUTLET = 'tv-outlet',
    THERMOSTAT = 'thermostat',
    CEILING_LIGHT = 'ceiling-light',
    CEILING_SENSOR = 'ceiling-sensor',
}

export enum MountPosition {
    WALL_LOW = 'wall-low',
    WALL_MEDIUM = 'wall-medium',
    WALL_HIGH = 'wall-high',
    CEILING = 'ceiling',
}

export interface Device {
    id: string;
    type: DeviceType;
    x: number;
    y: number;
    rotation: number;
    position: MountPosition;
    description?: string;
    notes?: string;
    groupId?: string;
}

export interface DeviceGroup {
    id: string;
    x: number;
    y: number;
    devices: Device[];
    notes: string;
    expanded?: boolean; // Whether the group is currently expanded in the UI
}

export interface Room {
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
}