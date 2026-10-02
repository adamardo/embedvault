// SQLite (in this Prisma version) has no enum support, so the entry type is
// stored as plain text in the database. This file is the single place that
// lists the allowed values, labels, and the content fields every entry has.

export const EntryType = {
  MICROCONTROLLER: "MICROCONTROLLER",
  COMPONENT: "COMPONENT",
  CONCEPT: "CONCEPT",
  PROTOCOL: "PROTOCOL",
} as const;

export type EntryTypeValue = (typeof EntryType)[keyof typeof EntryType];

export function isEntryType(value: string): value is EntryTypeValue {
  return (Object.values(EntryType) as string[]).includes(value);
}

// Singular labels, used in forms and badges.
export const TYPE_LABELS: Record<EntryTypeValue, string> = {
  MICROCONTROLLER: "Microcontroller",
  COMPONENT: "Component",
  CONCEPT: "Concept",
  PROTOCOL: "Protocol",
};

// Maps the URL part (/knowledge/<category>) to an entry type.
export const CATEGORIES: Record<string, { type: EntryTypeValue; label: string }> = {
  microcontrollers: { type: EntryType.MICROCONTROLLER, label: "Microcontrollers" },
  components: { type: EntryType.COMPONENT, label: "Components" },
  concepts: { type: EntryType.CONCEPT, label: "Concepts" },
  protocols: { type: EntryType.PROTOCOL, label: "Protocols" },
};

export function categoryUrlFor(type: string): string {
  const found = Object.entries(CATEGORIES).find(([, c]) => c.type === type);
  return `/knowledge/${found ? found[0] : "concepts"}`;
}

// Every long-text section an entry can have. The database column name is
// `name`; `label` is what you see on screen. Adding a section later = one
// line here (plus a column in schema.prisma).
export const ENTRY_FIELDS = [
  { name: "overview", label: "Overview", rows: 5 },
  { name: "specifications", label: "Specifications", rows: 4 },
  { name: "pinout", label: "Pinout", rows: 5 },
  { name: "power", label: "Power", rows: 3 },
  { name: "gpioInfo", label: "GPIO", rows: 3 },
  { name: "adcInfo", label: "ADC", rows: 3 },
  { name: "pwmInfo", label: "PWM", rows: 3 },
  { name: "uartInfo", label: "UART", rows: 3 },
  { name: "spiInfo", label: "SPI", rows: 3 },
  { name: "i2cInfo", label: "I2C", rows: 3 },
  { name: "interruptsInfo", label: "Interrupts", rows: 3 },
  { name: "wifiInfo", label: "Wi-Fi", rows: 3 },
  { name: "bluetoothInfo", label: "Bluetooth", rows: 3 },
  { name: "programming", label: "Programming", rows: 4 },
  { name: "wiring", label: "Wiring", rows: 4 },
  { name: "commonMistakes", label: "Common Mistakes", rows: 4 },
  { name: "references", label: "References", rows: 3 },
] as const;
