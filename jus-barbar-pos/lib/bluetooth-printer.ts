/**
 * Bluetooth Thermal Printer Utility
 * Printer: iWare RPP02N (58mm)
 * Protocol: ESC/POS over Bluetooth Low Energy (BLE)
 */

const PRINTER_SERVICE_UUID = '49535343-fe7d-4ae5-8fa9-9fafd205e455';
const PRINTER_WRITE_UUID = '49535343-8841-43f4-a8d4-ecbe34729bb3';
const MAX_CHUNK_SIZE = 100; // bytes per write (safe limit for BLE)

// ESC/POS Commands
const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

const CMD = {
  INIT: [ESC, 0x40],                    // Initialize printer
  CENTER: [ESC, 0x61, 0x01],            // Center alignment
  LEFT: [ESC, 0x61, 0x00],              // Left alignment
  RIGHT: [ESC, 0x61, 0x02],             // Right alignment
  BOLD_ON: [ESC, 0x45, 0x01],           // Bold on
  BOLD_OFF: [ESC, 0x45, 0x00],          // Bold off
  DOUBLE_HEIGHT: [ESC, 0x21, 0x10],     // Double height
  DOUBLE_WIDTH: [ESC, 0x21, 0x20],      // Double width
  DOUBLE_SIZE: [ESC, 0x21, 0x30],       // Double height + width
  NORMAL_SIZE: [ESC, 0x21, 0x00],       // Normal size
  FEED_CUT: [LF, LF, LF, GS, 0x56, 0x00], // Feed & full cut
  FEED_LINES: [LF, LF, LF, LF],        // Feed 4 lines
};

// Encode text to bytes (supports basic characters)
function textToBytes(text: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    bytes.push(code > 127 ? 0x3f : code); // Replace non-ASCII with '?'
  }
  return bytes;
}

// Create a line of text with padding
function formatLine(left: string, right: string, width: number = 32): string {
  const padding = width - left.length - right.length;
  if (padding < 1) return left + ' ' + right;
  return left + ' '.repeat(padding) + right;
}

// Create separator line
function separator(char: string = '-', width: number = 32): string {
  return char.repeat(width);
}

export interface PrintReceiptData {
  customerName: string;
  items: { name: string; qty: number; price: number; subtotal: number }[];
  total: number;
  paymentMethod: 'CASH' | 'QRIS';
  cashReceived?: number;
  change?: number;
}

// Build full receipt as byte array
function buildReceipt(data: PrintReceiptData): Uint8Array {
  const bytes: number[] = [];

  const add = (...b: number[]) => bytes.push(...b);
  const addText = (t: string) => bytes.push(...textToBytes(t), LF);

  // Initialize
  add(...CMD.INIT);

  // Header
  add(...CMD.CENTER);
  add(...CMD.BOLD_ON);
  add(...CMD.DOUBLE_SIZE);
  addText('JUS BAR BAR');
  add(...CMD.NORMAL_SIZE);
  add(...CMD.BOLD_OFF);
  addText('Sistem Point of Sale');
  addText(separator('='));

  // Customer & Date
  add(...CMD.LEFT);
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  addText(`Tgl: ${dateStr} ${timeStr}`);
  addText(`Plg: ${data.customerName}`);
  addText(separator('-'));

  // Items
  for (const item of data.items) {
    addText(item.name);
    const qtyPrice = `  ${item.qty} x ${formatRupiah(item.price)}`;
    const subtotal = formatRupiah(item.subtotal);
    addText(formatLine(qtyPrice, subtotal));
  }

  addText(separator('-'));

  // Total
  add(...CMD.BOLD_ON);
  addText(formatLine('TOTAL', formatRupiah(data.total)));
  add(...CMD.BOLD_OFF);

  // Payment info
  addText(
    formatLine(
      `BAYAR (${data.paymentMethod})`,
      formatRupiah(
        data.paymentMethod === 'CASH'
          ? data.cashReceived ?? data.total
          : data.total
      )
    )
  );

  if (data.paymentMethod === 'CASH' && data.change !== undefined && data.change > 0) {
    addText(formatLine('KEMBALI', formatRupiah(data.change)));
  }

  addText(separator('='));

  // Footer
  add(...CMD.CENTER);
  addText('');
  addText('Terima Kasih');
  addText('Telah Berbelanja!');
  addText('Semoga Harimu');
  addText('Menyenangkan!');

  // Feed & cut
  add(...CMD.FEED_LINES);

  return new Uint8Array(bytes);
}

// Format currency
function formatRupiah(value: number): string {
  return 'Rp' + value.toLocaleString('id-ID');
}

// Send data in chunks to BLE characteristic
async function sendChunked(
  characteristic: BluetoothRemoteGATTCharacteristic,
  data: Uint8Array
): Promise<void> {
  for (let offset = 0; offset < data.length; offset += MAX_CHUNK_SIZE) {
    const chunk = data.slice(offset, offset + MAX_CHUNK_SIZE);
    await characteristic.writeValueWithoutResponse(chunk);
    // Small delay between chunks to prevent buffer overflow
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

// Main print function
export async function printReceipt(data: PrintReceiptData): Promise<{ success: boolean; message: string }> {
  try {
    // Check Web Bluetooth support
    if (!navigator.bluetooth) {
      return { success: false, message: 'Browser tidak mendukung Bluetooth. Gunakan Chrome.' };
    }

    // Request Bluetooth device
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ name: 'RPP02N' }],
      optionalServices: [PRINTER_SERVICE_UUID],
    });

    if (!device.gatt) {
      return { success: false, message: 'Tidak dapat terhubung ke printer.' };
    }

    // Connect
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(PRINTER_SERVICE_UUID);
    const characteristic = await service.getCharacteristic(PRINTER_WRITE_UUID);

    // Build & send receipt
    const receiptBytes = buildReceipt(data);
    await sendChunked(characteristic, receiptBytes);

    // Disconnect
    server.disconnect();

    return { success: true, message: 'Struk berhasil dicetak!' };
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === 'NotFoundError') {
      return { success: false, message: 'Printer tidak ditemukan. Pastikan printer menyala dan Bluetooth aktif.' };
    }
    if (err.name === 'SecurityError') {
      return { success: false, message: 'Akses Bluetooth ditolak oleh browser.' };
    }
    return { success: false, message: `Gagal cetak: ${err.message}` };
  }
}
