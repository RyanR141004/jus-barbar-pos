/**
 * Web Bluetooth API Type Declarations
 * Needed because TypeScript doesn't include Web Bluetooth types by default
 */

interface BluetoothRemoteGATTCharacteristic {
  writeValueWithoutResponse(value: BufferSource): Promise<void>;
  writeValueWithResponse(value: BufferSource): Promise<void>;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTServer {
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothDevice {
  gatt?: BluetoothRemoteGATTServer;
  name?: string;
}

interface BluetoothRequestDeviceOptions {
  filters?: Array<{ name?: string; services?: string[] }>;
  optionalServices?: string[];
}

interface Bluetooth {
  requestDevice(options: BluetoothRequestDeviceOptions): Promise<BluetoothDevice>;
}

interface Navigator {
  bluetooth: Bluetooth;
}
