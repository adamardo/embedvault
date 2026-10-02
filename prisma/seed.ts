// Populates the database with real, technically accurate starter entries so
// the app isn't empty on first run. Run with: npm run prisma:seed
//
// Note on accuracy (per project requirement): specs given here are the
// well-documented defaults for the *chip itself*. Where a spec depends on
// the specific dev board variant (e.g. exact usable GPIO count, which pins
// are broken out), that's flagged in the text rather than stated as a
// single universal number.

import { PrismaClient } from "@prisma/client";
import { EntryType } from "../lib/entry-types";

const prisma = new PrismaClient();

async function upsertEntry(data: Parameters<typeof prisma.entry.create>[0]["data"]) {
  return prisma.entry.upsert({
    where: { slug: data.slug as string },
    update: data,
    create: data,
  });
}

async function main() {
  // Make the seed safe to re-run: remove previously seeded snippets/guides
  // first (matched by title/problem), so running it twice never duplicates them.
  await prisma.codeSnippet.deleteMany({
    where: {
      title: {
        in: [
          "ESP32 GPIO Digital Output (Blink)",
          "STM32F401 Bare-Metal GPIO LED Blink",
          "UART Basic Send/Receive (Arduino framework, ESP32)",
        ],
      },
    },
  });
  await prisma.troubleshootingGuide.deleteMany({
    where: {
      problem: {
        in: [
          "ESP32 is not uploading code (upload fails or times out).",
          "STM32 LED won't blink (bare-metal GPIO code has no effect).",
          "I2C device not detected (I2C scanner finds nothing).",
        ],
      },
    },
  });

  // ---------------- Microcontrollers ----------------

  const esp32 = await upsertEntry({
    type: EntryType.MICROCONTROLLER,
    title: "ESP32",
    slug: "esp32",
    summary: "Dual-core Wi-Fi + Bluetooth microcontroller, widely used for IoT projects.",
    overview:
      "The ESP32 is a low-cost, low-power system-on-chip (SoC) from Espressif with built-in Wi-Fi and Bluetooth. It's a strong default choice for IoT projects that need wireless connectivity, and is commonly programmed via the Arduino framework, ESP-IDF (Espressif's native SDK), or MicroPython.",
    specifications:
      "Dual-core Xtensa LX6 @ up to 240MHz (variant-dependent), 520KB SRAM, integrated 802.11 b/g/n Wi-Fi and Bluetooth 4.2 (Classic + BLE). Flash size varies by board (commonly 4MB on dev boards).",
    pinout:
      "Pinout depends heavily on the dev board (e.g. ESP32 DevKitC vs NodeMCU-32S vs WROOM variants place pins differently). General rule: not all labeled GPIOs are safe to use freely — GPIO 6-11 are connected to the internal flash chip and should be avoided; GPIO 34-39 are input-only (no internal pull-up/down, no output); some pins are pulled high/low at boot and can interfere with the boot process if a peripheral is attached (e.g. GPIO 0, 2, 12, 15). Always check your specific board's pinout diagram before wiring.",
    power:
      "Operates at 3.3V logic — NOT 5V tolerant on most GPIOs. Powered via USB (5V, regulated on-board to 3.3V) or directly via 3.3V pin. Typical active current draw is tens of mA, spiking higher (can exceed 200-300mA briefly) during Wi-Fi transmission — undersized USB cables/ports are a common source of instability.",
    gpioInfo:
      "Most GPIOs support digital input/output. Internal pull-up/pull-down resistors are software-configurable on most pins (except input-only pins 34-39). Some pins have restrictions at boot time (see Pinout above).",
    adcInfo:
      "Two ADC units (ADC1, ADC2), 12-bit resolution. ADC2 shares hardware with Wi-Fi — its readings become unreliable while Wi-Fi is active, so ADC1 pins are preferred for analog sensors in Wi-Fi-connected projects.",
    pwmInfo:
      "PWM is generated via the LEDC peripheral (originally designed for LED control but usable for general PWM, including servo control). Supports multiple channels with configurable frequency and resolution.",
    uartInfo:
      "3 hardware UART controllers (UART0, UART1, UART2). UART0 is typically used for flashing/serial monitor via USB, so it's best to use UART1 or UART2 for other serial devices.",
    spiInfo:
      "2 general-purpose SPI peripherals available to user code (HSPI, VSPI), plus SPI0/1 reserved internally for flash. Supports master and slave modes.",
    i2cInfo:
      "2 I2C controllers, each configurable as master or slave. Any GPIO can typically be assigned as SDA/SCL via the I2C peripheral's flexible pin matrix (board/framework dependent).",
    interruptsInfo:
      "Nearly all GPIOs can trigger interrupts on rising/falling/change edge. Useful for buttons, encoders, and sensor data-ready pins without polling.",
    wifiInfo:
      "802.11 b/g/n at 2.4GHz. Supports station mode, access point mode, and both simultaneously. Common libraries: WiFi.h (Arduino), esp_wifi (ESP-IDF).",
    bluetoothInfo:
      "Supports both Bluetooth Classic and Bluetooth Low Energy (BLE). Cannot use Wi-Fi and Bluetooth radios at full simultaneous throughput — they share the same 2.4GHz radio and time-share it.",
    programming:
      "Can be programmed via Arduino IDE (with ESP32 board support installed), PlatformIO, ESP-IDF (native, most control), or MicroPython. Flashing uses the built-in USB-to-serial chip on most dev boards; some boards require holding a BOOT button manually to enter flash mode.",
    wiring:
      "For sensors/modules, respect the 3.3V logic level — connecting 5V-logic devices directly can damage GPIOs; use a logic level shifter or voltage divider where needed.",
    commonMistakes:
      "Using ADC2 pins while Wi-Fi is active and getting unstable readings; wiring 5V-logic sensors directly; using input-only pins (34-39) for outputs; picking a boot-sensitive pin for a pulled-up peripheral, preventing normal boot; insufficient power supply causing random resets under Wi-Fi load.",
    references: "Espressif ESP32 Technical Reference Manual and datasheet (espressif.com).",
  });

  const stm32 = await upsertEntry({
    type: EntryType.MICROCONTROLLER,
    title: "STM32F401",
    slug: "stm32f401",
    summary: "ARM Cortex-M4 microcontroller (STM32F4 series), common for bare-metal and HAL-based learning.",
    overview:
      "The STM32F401 is part of ST's F4 series, built on an ARM Cortex-M4 core. It's a popular choice for learning register-level (bare-metal) embedded programming, and is well supported by STM32CubeIDE and the STM32 HAL/LL libraries.",
    specifications:
      "ARM Cortex-M4 core (with FPU on most variants) running up to 84MHz, up to 512KB Flash and 96KB SRAM depending on the exact part number (e.g. STM32F401RE vs STM32F401CC differ in memory and package).",
    pinout:
      "Pin layout depends on package (e.g. LQFP64, LQFP100) and board (e.g. Nucleo-F401RE vs a bare chip). Nucleo boards label pins both by STM32 port/pin (e.g. PA5) and Arduino-style headers (e.g. D13) — always confirm against your specific board's user manual.",
    power:
      "Operates at 3.3V logic, not 5V tolerant on most pins (a few are 5V-tolerant depending on part — check the datasheet). Nucleo boards can be powered via USB (ST-LINK) at 5V, regulated on-board.",
    gpioInfo:
      "GPIOs are organized into ports (GPIOA, GPIOB, ...), each pin individually configurable as input, output, alternate function, or analog, with configurable pull-up/pull-down and output speed — controlled via registers like MODER, OTYPER, PUPDR in bare-metal programming.",
    adcInfo:
      "12-bit ADC(s), multiple channels multiplexed across GPIO pins. Reference voltage and channel mapping depend on the specific pin/port.",
    pwmInfo:
      "Generated via hardware timers (e.g. TIM1, TIM2) in PWM output mode — timer channels are mapped to specific GPIO pins via alternate function settings.",
    uartInfo:
      "Multiple USART/UART peripherals (exact count depends on part). Nucleo boards typically route one USART through the ST-LINK for a virtual COM port over USB.",
    spiInfo:
      "Multiple hardware SPI peripherals, configurable as master or slave, with configurable clock polarity/phase (mode 0-3).",
    i2cInfo:
      "Multiple I2C peripherals; unlike ESP32's flexible pin matrix, STM32 I2C pins are fixed to specific GPIOs per peripheral (check the alternate function table in the datasheet).",
    interruptsInfo:
      "External interrupts via EXTI lines, each GPIO pin number maps to a shared EXTI line (e.g. all 'pin 5' across ports share EXTI5) — a bare-metal gotcha worth knowing early.",
    programming:
      "Programmed via STM32CubeIDE (HAL/LL libraries with a graphical pin configurator), bare-metal (direct register access, no HAL), or platforms like PlatformIO. Flashing/debugging typically via ST-LINK (built into Nucleo boards).",
    wiring:
      "Logic level is 3.3V; check datasheet for any 5V-tolerant pins before connecting 5V peripherals directly.",
    commonMistakes:
      "Forgetting to enable the peripheral clock (RCC) for a GPIO port or peripheral before configuring it in bare-metal code — the most common reason 'nothing happens'; misconfiguring alternate function mode instead of plain GPIO mode for peripherals like UART/SPI/I2C; EXTI line conflicts between pins sharing the same line number.",
    references: "STM32F401 datasheet and Reference Manual RM0368 (st.com).",
  });

  // ---------------- Components & Modules ----------------

  const hcsr04 = await upsertEntry({
    type: EntryType.COMPONENT,
    title: "HC-SR04",
    slug: "hc-sr04",
    summary: "Ultrasonic distance sensor using a trigger/echo pin pair.",
    overview:
      "The HC-SR04 measures distance by emitting an ultrasonic pulse and timing how long it takes to receive the echo. It's a very common beginner sensor for obstacle detection and distance measurement.",
    specifications:
      "Range roughly 2cm-400cm (varies by unit/conditions), measurement angle around 15 degrees, operating voltage 5V.",
    power: "Requires 5V for VCC — the module itself is 5V logic.",
    gpioInfo:
      "Uses 2 digital pins: TRIG (output from MCU, sends a 10µs pulse to start measurement) and ECHO (input to MCU, goes high for a duration proportional to distance).",
    wiring:
      "VCC to 5V, GND to GND, TRIG to any digital output pin, ECHO to any digital input pin. Important: on 3.3V-logic boards like ESP32, the ECHO pin's 5V output should be stepped down (voltage divider or level shifter) before connecting to the MCU to avoid damaging the input.",
    commonMistakes:
      "Connecting ECHO directly to a 3.3V-only MCU input without level shifting; not waiting long enough between measurements (module needs a brief settling time); measuring against soft/angled surfaces that absorb or deflect the ultrasonic pulse, giving inconsistent readings.",
    references: "HC-SR04 datasheet (widely available from module manufacturers).",
  });

  const hc05 = await upsertEntry({
    type: EntryType.COMPONENT,
    title: "HC-05",
    slug: "hc-05",
    summary: "Classic Bluetooth serial (SPP) module for wireless UART communication.",
    overview:
      "The HC-05 is a Bluetooth module that exposes a serial (UART) interface, letting a microcontroller send/receive data wirelessly to a phone or PC over Bluetooth Classic (Serial Port Profile). It can operate as master or slave.",
    power: "Operates at 3.3V logic on its UART pins, but many breakout boards accept 5V on VCC (check your specific board — the module chip itself is 3.3V).",
    uartInfo:
      "Communicates via UART (TXD/RXD) at a default baud rate (commonly 9600 for data mode; AT command mode may use a different rate depending on firmware). RXD is NOT 5V tolerant on the bare module — a voltage divider is recommended if driving it from a 5V MCU TX pin.",
    wiring:
      "VCC and GND per board spec, module TXD to MCU RX, module RXD to MCU TX (through a voltage divider if the MCU is 5V logic).",
    commonMistakes:
      "Wiring TX-to-TX and RX-to-RX instead of crossing them (TX must go to RX and vice versa); driving RXD directly from a 5V TX pin without level shifting; not entering AT command mode correctly when trying to rename the device or change its baud rate.",
    references: "HC-05 datasheet and common AT command reference sheets.",
  });

  const mpu6050 = await upsertEntry({
    type: EntryType.COMPONENT,
    title: "MPU6050",
    slug: "mpu6050",
    summary: "6-axis accelerometer + gyroscope module, communicates over I2C.",
    overview:
      "The MPU6050 combines a 3-axis accelerometer and 3-axis gyroscope in one chip, commonly used for motion sensing, tilt detection, and robotics/drone stabilization projects.",
    power: "Operates at 3.3V-5V depending on the breakout board's onboard regulator (check your specific module).",
    i2cInfo:
      "Communicates over I2C. Default address is 0x68 (or 0x69 if the AD0 pin is pulled high) — useful when using two MPU6050s on the same bus.",
    commonMistakes:
      "Forgetting pull-up resistors on SDA/SCL if the breakout board doesn't already include them; not calibrating the sensor (raw values have an offset/bias that should be zeroed at rest); address conflicts when using multiple I2C devices with overlapping addresses.",
    references: "InvenSense/TDK MPU-6050 Register Map and Datasheet.",
  });

  const sg90 = await upsertEntry({
    type: EntryType.COMPONENT,
    title: "SG90",
    slug: "sg90",
    summary: "Small hobby servo motor controlled via PWM.",
    overview:
      "The SG90 is a lightweight, low-torque hobby servo commonly used in beginner robotics projects. Position is controlled by the width of a PWM pulse, typically at a 50Hz refresh rate.",
    power:
      "Rated around 4.8V-6V. Important: servos can draw significant current under load/stall — powering multiple servos (or a servo plus other components) from a microcontroller's onboard 5V/3.3V regulator can brown out the board; a separate power supply with shared ground is recommended for anything beyond a single lightly-loaded servo.",
    pwmInfo:
      "Controlled by a PWM signal at roughly 50Hz, where pulse width (commonly in the ~1ms-2ms range, varies slightly by unit) sets the shaft angle across its rotation range (roughly 0-180 degrees for this model).",
    wiring:
      "Three wires: power (red), ground (brown/black), signal (orange/yellow) to a PWM-capable pin.",
    commonMistakes:
      "Powering the servo from the MCU's onboard regulator alongside other loads, causing brownouts/resets; not sharing ground between the servo's power supply and the MCU when using a separate supply; assuming exact pulse-width-to-angle values without checking the datasheet or calibrating, since these vary slightly between units.",
    references: "Common SG90 datasheet (TowerPro and equivalent clones).",
  });

  const relay = await upsertEntry({
    type: EntryType.COMPONENT,
    title: "Relay Module",
    slug: "relay-module",
    summary: "Electromechanical switch letting a microcontroller control high-voltage/high-current loads.",
    overview:
      "A relay module lets a low-power microcontroller signal switch a much higher-power circuit (e.g. mains-voltage appliances) by using the MCU's output to energize a small electromagnet that mechanically closes a separate, isolated switch contact.",
    power:
      "Control side commonly needs 5V to reliably drive the relay coil (many cheap modules are not reliably 3.3V-triggerable without a transistor driver stage — check whether your specific module is 'low-level' or 'high-level' triggered, and whether it's marked 3.3V-compatible).",
    gpioInfo:
      "Typically one digital output pin per relay channel, either active-HIGH or active-LOW depending on the module design — check the module's silkscreen/datasheet.",
    wiring:
      "Control side (VCC, GND, IN) connects to the MCU at logic level; load side (COM, NO, NC) connects to the separate high-power circuit being switched. NEVER mix the isolated load-side wiring with the MCU's low-voltage circuit.",
    commonMistakes:
      "Assuming a relay module is 3.3V-logic compatible when it isn't, resulting in unreliable switching; working with mains voltage on the load side without appropriate safety precautions and experience; forgetting that many modules are active-LOW (output LOW energizes the relay), which is the opposite of intuition.",
    references: "Generic relay module datasheets (module design varies by manufacturer).",
  });

  // ---------------- Concepts ----------------

  const gpio = await upsertEntry({
    type: EntryType.CONCEPT,
    title: "GPIO",
    slug: "gpio",
    summary: "General Purpose Input/Output — a pin that software can configure as digital input or output.",
    overview:
      "GPIO pins are the most basic building block of embedded hardware interfacing. Each pin can typically be configured (via registers or a framework's API) as a digital input (reads HIGH/LOW) or digital output (drives HIGH/LOW), often with configurable internal pull-up/pull-down resistors and, on many MCUs, alternate functions (UART, SPI, PWM, etc.) that repurpose the same physical pin.",
    commonMistakes:
      "Forgetting to enable the peripheral/port clock before configuring a GPIO in bare-metal code (STM32-style); leaving a floating input pin unconnected, which can read random noise as digital input without a pull-up/pull-down; driving two outputs into each other (bus contention).",
  });

  const uart = await upsertEntry({
    type: EntryType.CONCEPT,
    title: "UART",
    slug: "uart",
    summary: "Asynchronous serial communication protocol using TX/RX lines.",
    overview:
      "UART (Universal Asynchronous Receiver/Transmitter) sends data one bit at a time over a single wire in each direction (TX, RX), with no separate clock line — both sides must agree on a baud rate (bits per second) in advance to correctly interpret the timing of each bit.",
    commonMistakes:
      "Baud rate mismatch between sender and receiver producing garbled ('garbage') characters; wiring TX-to-TX/RX-to-RX instead of crossing them; not sharing a common ground between the two devices.",
  });

  const i2c = await upsertEntry({
    type: EntryType.CONCEPT,
    title: "I2C",
    slug: "i2c",
    summary: "Two-wire (SDA/SCL) bus protocol supporting multiple devices with unique addresses.",
    overview:
      "I2C (Inter-Integrated Circuit) uses two shared lines — SDA (data) and SCL (clock) — allowing multiple devices on the same bus, each identified by a unique address. It requires pull-up resistors on both lines (often included on breakout boards, but not always).",
    commonMistakes:
      "Missing pull-up resistors on SDA/SCL causing unreliable communication; address conflicts when two devices on the same bus share a default address; exceeding the bus's practical wire length/speed for the pull-up values chosen.",
  });

  const spi = await upsertEntry({
    type: EntryType.CONCEPT,
    title: "SPI",
    slug: "spi",
    summary: "Fast, synchronous 4-wire protocol (MOSI, MISO, SCLK, CS) for point-to-point or multi-device communication.",
    overview:
      "SPI (Serial Peripheral Interface) uses a shared clock line (SCLK) plus data lines (MOSI, MISO) and a separate Chip Select (CS) line per device, letting a master communicate with multiple slaves by toggling which CS line is active. It's generally faster than I2C but uses more pins per additional device.",
    commonMistakes:
      "Forgetting to set CS low before a transaction and high afterward; mismatched SPI mode (clock polarity/phase) between master and slave; multiple devices' CS lines being asserted simultaneously causing bus conflicts.",
  });

  const pwm = await upsertEntry({
    type: EntryType.CONCEPT,
    title: "PWM",
    slug: "pwm",
    summary: "Pulse Width Modulation — simulating an analog signal by rapidly switching a digital pin on and off.",
    overview:
      "PWM varies the proportion of time a digital signal is HIGH vs LOW (the duty cycle) at a fixed frequency, which can be used to control perceived brightness (LEDs), motor speed, or — for servos — the target angle, depending on the pulse width and frequency used.",
    commonMistakes:
      "Using a PWM frequency inappropriate for the target device (e.g. servos expect roughly 50Hz, not an arbitrary high frequency); confusing duty cycle percentage with raw timer register values when moving between different MCU platforms.",
  });

  const adc = await upsertEntry({
    type: EntryType.CONCEPT,
    title: "ADC",
    slug: "adc",
    summary: "Analog-to-Digital Converter — converts a continuous voltage into a discrete digital value.",
    overview:
      "An ADC samples an analog input voltage and converts it into a digital number with a certain resolution (e.g. 12-bit gives values 0-4095), relative to a reference voltage. Used for reading sensors that output a varying voltage rather than a simple HIGH/LOW.",
    commonMistakes:
      "Not accounting for the ADC's reference voltage when converting raw readings to real-world voltage; reading noisy values without any averaging/filtering; on some MCUs (e.g. ESP32's ADC2), certain ADC units becoming unreliable while Wi-Fi is active.",
  });

  // ---------------- Troubleshooting ----------------

  await prisma.troubleshootingGuide.create({
    data: {
      problem: "ESP32 is not uploading code (upload fails or times out).",
      possibleCauses:
        "1. Wrong COM port selected\n2. Missing/incorrect USB driver (e.g. CP2102 or CH340 depending on board)\n3. Wrong board selected in Arduino IDE/PlatformIO\n4. Bad or charge-only USB cable\n5. Board not entering bootloader/flash mode automatically",
      diagnosticSteps:
        "Check Device Manager (Windows) for the COM port and any driver warning icons. Confirm the correct board is selected in your IDE. Try a different USB cable and port. Watch the IDE's upload log for the specific failure point (e.g. 'Connecting...' hanging vs a timeout after 'Writing').",
      solution:
        "Install the correct USB-to-serial driver for your board's chip (CP210x or CH340, check board silkscreen/documentation). Select the correct COM port and board type. If auto-reset into bootloader isn't working, hold the BOOT button while the IDE begins uploading, release once it starts writing.",
      example:
        "A common case: IDE shows 'Connecting....____....' repeatedly, then times out — usually means bootloader mode isn't being entered automatically; holding BOOT during the upload attempt resolves it.",
      commonMistakes: "Using a charge-only USB cable with no data lines; not installing the serial driver at all.",
      entryId: esp32.id,
    },
  });

  await prisma.troubleshootingGuide.create({
    data: {
      problem: "STM32 LED won't blink (bare-metal GPIO code has no effect).",
      possibleCauses:
        "1. Peripheral clock (RCC) for the GPIO port not enabled\n2. GPIO mode register not set to output\n3. Wrong pin/port in code vs. actual wiring\n4. LED wired backwards or missing current-limiting resistor (damaged LED)",
      diagnosticSteps:
        "Verify in code that the RCC enable bit for the relevant GPIO port's clock is set BEFORE configuring the pin. Double check the MODER register bits correspond to output mode (typically '01') for the correct pin. Confirm the physical pin used matches the board's silkscreen/schematic, not just an assumed default.",
      solution:
        "Enable the GPIO port's clock in RCC first, then set the pin's mode bits to general-purpose output, then toggle the output data register (ODR) or use the atomic BSRR register to set/reset the pin.",
      example:
        "On many STM32F4 boards, forgetting `RCC->AHB1ENR |= ...` for the relevant GPIO port before touching `GPIOx->MODER` is the single most common reason 'nothing happens' in a first bare-metal blink program.",
      commonMistakes: "Configuring the pin before enabling its port's clock — the registers exist but writes to them have no effect.",
      entryId: stm32.id,
    },
  });

  await prisma.troubleshootingGuide.create({
    data: {
      problem: "I2C device not detected (I2C scanner finds nothing).",
      possibleCauses:
        "1. Missing pull-up resistors on SDA/SCL\n2. Wrong SDA/SCL pins in code\n3. Device address assumption wrong\n4. Wiring fault (loose connection, wrong VCC voltage for the device)",
      diagnosticSteps:
        "Run a basic I2C scanner sketch/program to check if ANY address responds. Verify wiring continuity. Check the device's datasheet for its actual default address (and any address-select pins). Confirm the device's voltage requirement matches what's supplied.",
      solution:
        "Add external pull-up resistors (commonly 4.7kΩ) on SDA and SCL if the breakout board doesn't already include them. Correct the SDA/SCL pin assignment in code to match your wiring. Verify the address against the datasheet rather than assuming a commonly-cited default.",
      example:
        "MPU6050 modules default to address 0x68, but read 0x69 instead if the AD0 pin is tied high — a scanner returning nothing at 0x68 but working at 0x69 usually means AD0 is pulled up on that particular board.",
      commonMistakes: "Assuming a device address without checking the datasheet; missing pull-ups on breakout boards that don't include them.",
      entryId: i2c.id,
    },
  });

  // ---------------- Code Library ----------------

  await prisma.codeSnippet.create({
    data: {
      title: "ESP32 GPIO Digital Output (Blink)",
      platform: "ESP32",
      language: "C++",
      style: "Arduino framework",
      description: "Basic digital output example: blinks an LED connected to a GPIO pin.",
      hardwareRequired: "ESP32 dev board, LED + current-limiting resistor (or the board's built-in LED, commonly GPIO 2 on many boards — verify against your specific board).",
      wiring: "LED anode through a resistor to the chosen GPIO, cathode to GND.",
      code: `#define LED_PIN 2  // Verify this matches your board's built-in LED or wiring

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);
}`,
      explanation:
        "pinMode() configures the pin as a digital output. digitalWrite() sets it HIGH (3.3V) or LOW (0V). delay() pauses execution in milliseconds — fine for a simple blink, but blocks all other code, which becomes a limitation in larger programs.",
      expectedOutput: "The LED turns on and off every 500ms.",
      commonErrors: "Using the wrong GPIO number for your specific board's built-in LED; forgetting the current-limiting resistor on an external LED.",
      entryId: esp32.id,
    },
  });

  await prisma.codeSnippet.create({
    data: {
      title: "STM32F401 Bare-Metal GPIO LED Blink",
      platform: "STM32F401",
      language: "C",
      style: "Bare-metal",
      description: "Direct register-level GPIO output, no HAL library — blinks an LED via a Nucleo board's user LED pin.",
      hardwareRequired: "STM32F401 Nucleo board (uses onboard user LED, commonly on GPIOA pin 5 — verify against your specific board's user manual).",
      wiring: "None required if using the Nucleo board's onboard LED.",
      code: `#include "stm32f4xx.h"

void delay(volatile uint32_t count) {
    while (count--) { __NOP(); }
}

int main(void) {
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;   // 1. Enable GPIOA clock

    GPIOA->MODER &= ~(3U << (5 * 2));      // Clear mode bits for pin 5
    GPIOA->MODER |=  (1U << (5 * 2));      // 2. Set pin 5 to general-purpose output

    while (1) {
        GPIOA->BSRR = (1U << 5);           // Set pin 5 high (atomic set)
        delay(1000000);
        GPIOA->BSRR = (1U << (5 + 16));    // Reset pin 5 low (atomic reset)
        delay(1000000);
    }
}`,
      explanation:
        "RCC->AHB1ENR enables the clock for GPIO port A — without this, register writes to GPIOA have no effect (see the related troubleshooting entry). MODER configures pin 5 as output (bits '01'). BSRR is a write-only register where writing to the lower 16 bits sets pins HIGH and the upper 16 bits resets them LOW, atomically (avoids read-modify-write race conditions that ODR has).",
      expectedOutput: "The Nucleo board's user LED blinks roughly once per second (exact timing depends on clock speed; this busy-loop delay is not precisely calibrated).",
      commonErrors: "Forgetting the RCC clock enable line; using ODR with a non-atomic read-modify-write instead of BSRR in code that's also touched by an interrupt.",
      entryId: stm32.id,
    },
  });

  await prisma.codeSnippet.create({
    data: {
      title: "UART Basic Send/Receive (Arduino framework, ESP32)",
      platform: "ESP32",
      language: "C++",
      style: "Arduino framework",
      description: "Minimal example sending and echoing data over a hardware UART.",
      hardwareRequired: "ESP32 dev board, USB cable for the serial monitor.",
      code: `void setup() {
  Serial.begin(115200); // Must match the baud rate set in your serial monitor
}

void loop() {
  if (Serial.available()) {
    String incoming = Serial.readStringUntil('\\n');
    Serial.print("You sent: ");
    Serial.println(incoming);
  }
}`,
      explanation:
        "Serial.begin() sets the baud rate — both ends (device and serial monitor/other device) must match or you'll see garbled output. Serial.available() checks if incoming bytes are waiting; readStringUntil reads until a newline character.",
      expectedOutput: "Typing text into the Serial Monitor and pressing Enter echoes it back prefixed with 'You sent: '.",
      commonErrors: "Baud rate mismatch between code and serial monitor settings, producing garbled ('garbage') characters.",
      entryId: uart.id,
    },
  });

  // ---------------- Relationships ----------------

  async function relate(fromId: string, toId: string, label?: string) {
    await prisma.relation.upsert({
      where: { fromEntryId_toEntryId: { fromEntryId: fromId, toEntryId: toId } },
      update: {},
      create: { fromEntryId: fromId, toEntryId: toId, label },
    });
  }

  await relate(esp32.id, gpio.id, "uses");
  await relate(esp32.id, uart.id, "supports");
  await relate(esp32.id, i2c.id, "supports");
  await relate(esp32.id, spi.id, "supports");
  await relate(esp32.id, pwm.id, "supports");
  await relate(esp32.id, adc.id, "supports");
  await relate(gpio.id, pwm.id, "enables");
  await relate(pwm.id, sg90.id, "controls");
  await relate(stm32.id, gpio.id, "uses");
  await relate(i2c.id, mpu6050.id, "used by");
  await relate(gpio.id, hcsr04.id, "used by");

  // ---------------- Tags ----------------

  const tagNames = ["ESP32", "STM32", "GPIO", "UART", "I2C", "SPI", "Sensor", "BareMetal", "IoT", "Robotics"];
  const tags = await Promise.all(
    tagNames.map((name) => prisma.tag.upsert({ where: { name }, update: {}, create: { name } }))
  );
  const tagByName = Object.fromEntries(tags.map((t) => [t.name, t.id]));

  async function tagEntry(entryId: string, names: string[]) {
    for (const name of names) {
      await prisma.entryTag.upsert({
        where: { entryId_tagId: { entryId, tagId: tagByName[name] } },
        update: {},
        create: { entryId, tagId: tagByName[name] },
      });
    }
  }

  await tagEntry(esp32.id, ["ESP32", "IoT"]);
  await tagEntry(stm32.id, ["STM32", "BareMetal"]);
  await tagEntry(hcsr04.id, ["Sensor", "GPIO"]);
  await tagEntry(hc05.id, ["UART", "IoT"]);
  await tagEntry(mpu6050.id, ["I2C", "Sensor", "Robotics"]);
  await tagEntry(sg90.id, ["Robotics"]);
  await tagEntry(relay.id, ["GPIO", "IoT"]);
  await tagEntry(gpio.id, ["GPIO"]);
  await tagEntry(uart.id, ["UART"]);
  await tagEntry(i2c.id, ["I2C"]);
  await tagEntry(spi.id, ["SPI"]);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
