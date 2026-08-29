export const BSP_MODULES = [
{id:'bsp-01',num:'01',title:'What is a BSP?',hours:6,phase:0,topics:['BSP scope','Platform','SDK','Vendor'],content:`
## 🎯 Goal
Understand what a Board Support Package is, its boundaries, and its role in the product development chain from silicon vendor to consumer.

## 🧠 BSP — The Bridge Layer

A BSP is everything needed to boot an operating system on a specific board. The silicon vendor provides a reference BSP; the OEM customizes it for their product.

\`\`\`mermaid
flowchart TD
    HW[Hardware / SoC] --> BSP[Board Support Package]
    BSP --> Boot[Bootloader<br/>U-Boot, TF-A]
    BSP --> Kernel[Kernel + Drivers]
    BSP --> DT[Device Tree]
    BSP --> HAL[HAL / Firmware]
    BSP --> Build[Build System<br/>Yocto, Buildroot]
    BSP --> OS[Operating System<br/>Linux, Android, RTOS]
    OS --> APP[Applications]
\`\`\`

**BSP vs SDK vs Firmware:**
- **BSP:** Board-specific code — bootloader config, device tree, kernel drivers, HAL
- **SDK:** Development tools + libraries for building applications on top of the BSP
- **Firmware:** Low-level code running on embedded processors (modem firmware, sensor hub firmware)

## 🧠 BSP Development Lifecycle

Every BSP follows a lifecycle from vendor release through customization to production. Understanding this cycle prevents teams from customizing too early or too late.

\`\`\`mermaid
flowchart LR
    VEN[Vendor Reference BSP<br/>Silicon vendor release] --> EVAL[Evaluation<br/>Boot on eval board]
    EVAL --> CUSTOM[Customization<br/>Device tree, drivers]
    CUSTOM --> INT[Integration<br/>Build system, rootfs]
    INT --> VAL[Validation<br/>HW test, stress test]
    VAL --> OPT[Optimization<br/>Boot time, power]
    OPT --> REL[Production Release<br/>Locked BSP version]
    REL --> MAINT[Maintenance<br/>Security patches, bug fixes]
\`\`\`

**Vendor BSP anatomy — what ships in a typical release tarball:**

\`\`\`bash
vendor-bsp-v2.1/
├── bootloader/          # U-Boot source + board config
│   ├── u-boot-2023.04/
│   └── patches/
├── kernel/              # Linux kernel source + out-of-tree drivers
│   ├── linux-6.1/
│   └── patches/
├── device-tree/         # .dts/.dtsi files for supported boards
├── firmware/            # Binary blobs (WiFi, GPU, DSP)
├── tools/               # Flash utilities, signing tools
├── build/               # Yocto layers or Buildroot configs
│   ├── meta-vendor/
│   └── configs/
├── docs/                # Release notes, errata, HW manual
└── manifest.xml         # Repo manifest (if using repo tool)
\`\`\`

## ⌨️ Do This

1. Browse a real BSP repository — look at the Raspberry Pi kernel repo (github.com/raspberrypi/linux) or TI's Processor SDK
2. List every component you can identify: bootloader configs, device tree files, kernel patches, build scripts
3. Find the board-specific files vs the generic kernel code — notice how small the BSP delta actually is
4. Read the release notes of any vendor BSP — observe what changed between versions
5. Compare two BSP versions from the same vendor — count how many patches were added, removed, or upstreamed
6. Run \`find arch/arm64/boot/dts/ -name "*.dts" | head -20\` in a kernel tree to see device tree files organized by vendor

## ⚠️ Gotcha

**"BSP" means different things to different vendors.** Some vendors ship a BSP as a tarball of patches on top of mainline Linux. Others ship an entire forked kernel with proprietary drivers baked in. The latter is harder to maintain and upgrade. Always check how far the vendor BSP has diverged from mainline — a BSP with 500 patches on kernel 5.4 when mainline is at 6.x is a maintenance burden. One team spent six months rebasing a vendor kernel from 5.4 to 5.15 because the vendor never upstreamed their patches.

**Don't confuse BSP with SDK.** An SDK might include a BSP, but it also includes application-level libraries, toolchains, and documentation. When someone says "install the SDK," you're getting more than just board support. A 20GB Qualcomm SDK download is mostly application frameworks and sample code — the actual BSP delta might be a few hundred files.

**Vendor lock-in is the silent killer.** Proprietary GPU drivers, binary-only WiFi firmware, and undocumented hardware blocks create dependencies that last years. Before selecting a SoC, check how much of the BSP is open-source and upstreamed. A chip with mainline Linux support (like many TI and NXP parts) saves months of engineering over a chip with a vendor fork and NDA-only documentation.

## 🛠️ Mini-Project

Create a BSP inventory document for any development board you have access to (Raspberry Pi, BeagleBone, or even a virtual QEMU target):
1. List every BSP component: bootloader (version, patches), kernel version, device tree files, out-of-tree drivers
2. Document the build instructions (how to compile the kernel, how to flash the image)
3. Note which components are upstream vs vendor-specific — count the number of out-of-tree patches
4. Identify one component you'd want to upstream and explain why (reduced maintenance, community review)
5. Compare the vendor kernel config with \`make defconfig\` — list the vendor-specific Kconfig options enabled
6. Write a one-page BSP summary suitable for handing to a new team member joining the project

## ✅ You've mastered this when…
- You can define BSP scope and boundaries without conflating it with SDK or firmware
- You understand the vendor to OEM to consumer chain and where BSP engineering fits
- You know the difference between BSP, SDK, and firmware and can explain each to a non-engineer
- You can list the major components of a typical Linux BSP and their roles
- You can evaluate a vendor BSP for mainline divergence and maintenance risk
- You understand the BSP lifecycle from evaluation through production maintenance
`},

{id:'bsp-02',num:'02',title:'Boot Sequence',hours:12,phase:0,topics:['U-Boot','TF-A','Secure boot','AVB','ROM code'],content:`
## 🎯 Goal
Trace the complete boot sequence from power-on to userspace. Understand each stage, secure boot, and the chain of trust.

## 🧠 The Boot Chain

Every ARM-based embedded system follows a multi-stage boot sequence. Each stage initializes enough hardware to load the next stage, building capability incrementally.

\`\`\`mermaid
flowchart TD
    POR[Power-On Reset] --> ROM[Boot ROM<br/>Hardcoded in silicon]
    ROM --> SPL[SPL / MLO<br/>First-stage bootloader]
    SPL --> TFA[ARM Trusted Firmware<br/>TF-A / BL31]
    TFA --> UBOOT[U-Boot<br/>Second-stage bootloader]
    UBOOT --> KERN[Linux Kernel]
    KERN --> INIT[Init System<br/>systemd / SysVinit]
    INIT --> USER[Userspace<br/>Applications]
\`\`\`

Each stage initializes just enough hardware to load the next.

**ROM code** sets up basic clocks and the storage controller it will boot from, then copies SPL into **on-chip SRAM**. It does *not* bring up DRAM — DRAM is not usable yet, which is exactly why SPL has to land in SRAM.

That constraint shapes everything downstream: on-chip SRAM is typically only **64–256 KB**, so SPL must be tiny. When you hit "SPL image too large" during bring-up, this is the limit you have run into, and it is why SPL is a separate stage rather than just the front of U-Boot.

**SPL** runs from SRAM and does the job ROM could not: it trains and initializes DRAM. Once DRAM works, there is room for a full bootloader, so SPL loads U-Boot into it.

**U-Boot** then has a full environment — network, storage, display, a command line — and loads the kernel.

**What each stage does:**
- **Boot ROM:** Hardcoded in silicon, cannot be updated. Reads boot pins, initializes minimal clocks, loads SPL from eMMC/SD/SPI/UART
- **SPL (Secondary Program Loader):** Initializes DRAM timing, loads and runs TF-A and U-Boot
- **TF-A (ARM Trusted Firmware):** Sets up secure world (TrustZone), PSCI for CPU power management
- **U-Boot:** Full bootloader with shell, environment variables, network boot, device tree fixups

## 🧠 Secure Boot — Chain of Trust

Each stage cryptographically verifies the next before executing it:

\`\`\`mermaid
flowchart LR
    ROM[ROM<br/>Root of trust<br/>Has public key hash] -->|verifies signature| SPL
    SPL -->|verifies| TFA[TF-A]
    TFA -->|verifies| UBOOT[U-Boot]
    UBOOT -->|verifies| KERN[Kernel + DTB]
    KERN -->|dm-verity| FS[Root Filesystem]
\`\`\`

If any stage fails verification, boot halts. This prevents running tampered or malicious code.

**U-Boot essential commands** you will use daily:

\`\`\`bash
# U-Boot shell commands
=> printenv                    # Show all environment variables
=> setenv bootargs console=ttyS0,115200 root=/dev/mmcblk0p2 rootwait
=> setenv bootcmd 'load mmc 0:1 \${kernel_addr_r} Image; load mmc 0:1 \${fdt_addr_r} board.dtb; booti \${kernel_addr_r} - \${fdt_addr_r}'
=> saveenv                     # Save to persistent storage
=> boot                        # Execute bootcmd
=> load mmc 0:1 0x48000000 Image   # Load file from MMC partition
=> md 0x48000000 0x40          # Memory dump — inspect loaded data
=> reset                       # Reboot
\`\`\`

**Android Verified Boot (AVB)** extends this to Android, verifying boot, system, and vendor partitions using vbmeta images.

## ⌨️ Do This

1. Read U-Boot documentation: understand environment variables, boot commands, and the \`bootcmd\` / \`bootargs\` pattern
2. On a Linux machine, run \`dmesg | head -100\` — observe the kernel's early boot messages, note timestamps
3. Check if your system uses UEFI or legacy BIOS: \`ls /sys/firmware/efi\` (exists = UEFI)
4. Examine your kernel command line: \`cat /proc/cmdline\` — identify root device, console, and boot parameters
5. Measure your system's boot time: \`systemd-analyze\` shows total time; \`systemd-analyze blame\` shows per-service breakdown
6. If you have a Raspberry Pi or BeagleBone, connect a serial console (USB-UART adapter at 115200 baud) and watch the full boot output from ROM to login

## ⚠️ Gotcha

**Secure boot can permanently brick a board.** Once you burn OTP (One-Time Programmable) fuses with your secure boot keys, there is no going back. If you lose the private key, the board will refuse to boot anything — ever. A hardware team once burned production keys onto 500 evaluation boards during testing, then lost the USB drive with the private key. Every board became a paperweight. Always test with development keys on non-production hardware first, and store production keys in an HSM with backup procedures.

**Boot time matters more than you think.** Automotive systems need to show a rear-view camera within 2 seconds of ignition. Consumer devices with 30-second boot times frustrate users. Industrial controllers must resume within 500ms of power glitches. Measure boot time from the start — optimizing it later means touching every stage of the chain, and each stage has different owners and constraints.

**U-Boot environment corruption silently prevents boot.** U-Boot stores its environment in a flash partition. If that partition gets corrupted (bad write, wear-out), U-Boot falls back to compiled-in defaults — which may not match your board. Always set a reliable \`bootcmd\` default in the U-Boot config, and implement a watchdog-based recovery mechanism.

## 🛠️ Mini-Project

Trace and document the boot sequence of your own machine or a QEMU virtual machine:
1. Run \`dmesg | head -200\` and annotate each phase: kernel decompression, memory init, device tree parsing, driver probing, filesystem mount
2. Measure boot time: \`systemd-analyze\` for total time, \`systemd-analyze critical-chain\` for the critical path
3. Identify the top 5 slowest steps using \`systemd-analyze blame\` — research why each is slow
4. Draw a timeline diagram showing each boot stage and its duration (power-on to login prompt)
5. Propose one optimization per boot stage that could shave time off the boot — explain the trade-off
6. If using QEMU: boot a minimal ARM64 kernel with \`-append "console=ttyAMA0"\` and capture the full serial output

## ✅ You've mastered this when…
- You can trace every stage from power-on to userspace and explain what each initializes
- You understand what each bootloader stage does and why multiple stages exist
- You can explain secure boot and the chain of trust, including OTP fuse implications
- You know what dm-verity and AVB (Android Verified Boot) do and when to use them
- You can configure U-Boot environment variables and boot commands
- You can measure and analyze boot time at each stage
`},

{id:'bsp-03',num:'03',title:'Linux Kernel Fundamentals',hours:12,phase:0,topics:['Kernel','Syscalls','Modules','procfs','sysfs'],content:`
## 🎯 Goal
Understand the Linux kernel architecture — monolithic with modules, the kernel/userspace boundary, syscalls, and the kernel build system.

## 🧠 Kernel Architecture

\`\`\`mermaid
flowchart TD
    subgraph Userspace
        APP[Applications]
        LIB[C Library / glibc]
    end
    subgraph Kernel_Space[Kernel Space]
        SC[System Call Interface]
        PM[Process Mgmt]
        MM[Memory Mgmt]
        VFS[Virtual Filesystem]
        NET[Network Stack]
        DD[Device Drivers]
    end
    subgraph Hardware
        CPU[CPU]
        RAM[Memory]
        DEV[Devices]
    end
    APP --> LIB --> SC
    SC --> PM & MM & VFS & NET & DD
    DD --> DEV
    MM --> RAM
    PM --> CPU
\`\`\`

The kernel is the privileged layer between applications and hardware. Applications can only access hardware through system calls (open, read, write, ioctl, mmap, etc.).

**procfs (/proc):** Virtual filesystem exposing kernel and process information. \`/proc/cpuinfo\`, \`/proc/meminfo\`, \`/proc/[pid]/status\`.

**sysfs (/sys):** Virtual filesystem exposing device and driver information. Structured by bus, class, and device.

## 🧠 Kernel Build System

The kernel build system (Kbuild) uses Kconfig for configuration and Makefiles for compilation. Understanding this flow is essential for BSP work.

\`\`\`mermaid
flowchart LR
    DEF[defconfig<br/>Board defaults] -->|make xxx_defconfig| DOT[.config<br/>Full config]
    DOT -->|make menuconfig| DOT
    DOT -->|make| BUILD[Build Process]
    BUILD --> VMLINUX[vmlinux<br/>Uncompressed kernel]
    VMLINUX --> IMAGE["Image = arm64, uncompressed<br/>Image.gz or zImage = compressed"]
    BUILD --> MODS[*.ko<br/>Kernel modules]
    BUILD --> DTB[*.dtb<br/>Device tree blobs]
\`\`\`

\`\`\`bash
# Kernel build workflow for ARM64
export ARCH=arm64
export CROSS_COMPILE=aarch64-linux-gnu-
make defconfig                    # Load default config
make menuconfig                   # Interactive config editor
make -j\$(nproc)                   # Build kernel + modules + DTBs
make modules_install INSTALL_MOD_PATH=/path/to/rootfs
make dtbs                         # Build device tree blobs only
\`\`\`

**Key directories in the kernel source:**

\`\`\`bash
arch/arm64/           # Architecture-specific code
  boot/dts/           # Device tree source files by vendor
  configs/            # Default configs (defconfig files)
drivers/              # All device drivers, organized by subsystem
  iio/                # Industrial I/O (sensors, ADCs, DACs)
  gpio/               # GPIO controllers
  i2c/                # I2C bus controllers
  spi/                # SPI bus controllers
  net/                # Network drivers
include/linux/        # Kernel headers
kernel/               # Core kernel (scheduler, signals, etc.)
fs/                   # Filesystem implementations
\`\`\`

## ⌨️ Do This

1. Check your running kernel version: \`uname -r\` — note the version, patchlevel, and any vendor suffix
2. List loaded kernel modules: \`lsmod\` — pick one and run \`modinfo <module>\` to see its metadata, dependencies, and parameters
3. Explore procfs: \`cat /proc/cpuinfo\`, \`cat /proc/meminfo\`, \`cat /proc/interrupts\` — correlate interrupt counts with active hardware
4. Explore sysfs: \`ls /sys/class/net/\` to see network interfaces, \`ls /sys/block/\` for storage devices, \`ls /sys/bus/i2c/devices/\` for I2C devices
5. Try loading and unloading a module: \`sudo modprobe <module>\` and \`sudo modprobe -r <module>\` — watch \`dmesg\` for load/unload messages
6. Trace a syscall: \`strace -e trace=open,read ls /tmp\` — observe how even simple commands use dozens of system calls
7. Check kernel config: \`zcat /proc/config.gz\` or \`cat /boot/config-\$(uname -r)\` — search for a driver you care about

## ⚠️ Gotcha

**A kernel bug crashes the entire system.** Unlike userspace where a segfault kills one process, a bug in kernel code causes a kernel panic — the whole system goes down. This is why kernel development demands extra discipline: no memory leaks (the kernel has no garbage collection), no sleeping while holding spinlocks, and rigorous error handling on every code path. A single NULL pointer dereference in a driver's probe function can prevent the entire system from booting.

**Kernel API is not stable.** Unlike userspace APIs (POSIX, syscalls), internal kernel APIs change between versions with no backward compatibility guarantee. A driver that compiles on 5.15 might not compile on 6.1. This is by design — it forces drivers to stay in-tree where they get updated alongside API changes. Out-of-tree drivers (common in vendor BSPs) break with every kernel update, creating a maintenance nightmare. This is the strongest argument for upstreaming your drivers.

**CONFIG options interact in non-obvious ways.** Enabling CONFIG_PREEMPT_RT changes locking semantics across the entire kernel. Enabling CONFIG_DEBUG_INFO doubles your kernel image size. Disabling CONFIG_MODULES means every driver must be built-in — useful for security but painful for development. Always understand the implications of a Kconfig change before setting it in your defconfig.

## 🛠️ Mini-Project

Write a "hello world" kernel module and explore the kernel build system:
1. Create a C file with \`module_init()\` and \`module_exit()\` functions that use \`printk(KERN_INFO "Hello from kernel!\\n")\`
2. Write a Makefile that builds against your running kernel headers: \`make -C /lib/modules/\$(uname -r)/build M=\$(pwd) modules\`
3. Load it with \`insmod hello.ko\`, check \`dmesg | tail\` for your message, unload with \`rmmod hello\`
4. Add a module parameter (\`module_param()\`) that accepts a name string and prints "Hello, <name>!"
5. Add a \`/proc\` entry using \`proc_create()\` that returns a message when read with \`cat /proc/hello\`
6. Modify the module to create a sysfs attribute under \`/sys/module/hello/\` that exposes a counter incremented on each read

If you do not have a Linux machine, use a VM or WSL2.

## ✅ You've mastered this when…
- You understand the kernel/userspace boundary and why it exists (privilege levels, memory protection)
- You can navigate procfs and sysfs to find system information and device state
- You know how to configure and build a kernel from source (make menuconfig, make, make modules_install)
- You understand kernel modules vs built-in drivers and when to use each
- You can write, compile, load, and unload a basic kernel module
- You know the key kernel source directories and where to find drivers for a given subsystem
`},

{id:'bsp-04',num:'04',title:'Device Trees',hours:10,phase:0,topics:['DTS','DTB','Overlays','Bindings'],content:`
## 🎯 Goal
Read, write, and debug device trees — the data structure that tells the kernel what hardware is present and how it's connected.

## 🧠 What Problem Device Trees Solve

Without device trees, hardware descriptions were hardcoded in board files inside the kernel source. Every new board required kernel modifications. Device trees externalize this: the hardware description is a separate data file passed to the kernel at boot.

\`\`\`mermaid
flowchart LR
    DTS[".dts source file"] -->|dtc compiler| DTB[".dtb binary blob"]
    DTSI[".dtsi include files"] -->|#include| DTS
    DTB -->|loaded by bootloader| KERN[Linux Kernel]
    KERN -->|matches compatible strings| DRV[Device Drivers]
    OVR[".dtbo overlay"] -->|applied at boot or runtime| DTB
\`\`\`

**Device tree syntax — a complete I2C sensor example:**

\`\`\`c
/* board.dts — top-level board file */
/dts-v1/;
#include "soc-base.dtsi"      /* SoC-level definitions */
#include "board-common.dtsi"   /* Shared board features */

/ {
    model = "My Custom Board v2";
    compatible = "myvendor,custom-board", "soc-vendor,soc-name";

    memory@80000000 {
        device_type = "memory";
        reg = <0x80000000 0x40000000>; /* 1GB at 0x80000000 */
    };

    chosen {
        stdout-path = "serial0:115200n8";
        bootargs = "console=ttyS0,115200 root=/dev/mmcblk0p2 rootwait";
    };
};

&i2c1 {
    status = "okay";
    clock-frequency = <400000>;  /* 400 kHz Fast mode */

    temperature-sensor@48 {
        compatible = "ti,tmp102";
        reg = <0x48>;
        interrupt-parent = <&gpio1>;
        interrupts = <7 IRQ_TYPE_EDGE_FALLING>;
        #thermal-sensor-cells = <0>;
    };

    accelerometer@1d {
        compatible = "st,lis3dh-accel";
        reg = <0x1d>;
        st,drdy-int-pin = <1>;
        interrupt-parent = <&gpio2>;
        interrupts = <3 IRQ_TYPE_EDGE_RISING>;
    };
};
\`\`\`

## 🧠 Device Tree Overlay Architecture

Overlays allow modifying the base device tree without replacing it — essential for add-on boards (HATs, capes), optional features, and runtime configuration.

\`\`\`mermaid
flowchart TD
    SOC[SoC .dtsi<br/>CPU, memory controller,<br/>peripheral base addresses] --> BOARD[Board .dts<br/>Board-specific pins,<br/>enabled peripherals]
    BOARD --> BASE[Base DTB<br/>Compiled board description]
    OV1[Overlay: Camera HAT<br/>Enable CSI, I2C sensor] --> MERGED[Merged DTB<br/>Final hardware description]
    OV2[Overlay: Motor Cape<br/>Enable PWM, GPIO] --> MERGED
    BASE --> MERGED
    MERGED --> KERNEL[Kernel Boot]
\`\`\`

**Overlay syntax:**

\`\`\`c
/* camera-overlay.dts */
/dts-v1/;
/plugin/;

&i2c1 {
    #address-cells = <1>;
    #size-cells = <0>;

    camera@36 {
        compatible = "ovti,ov5647";
        reg = <0x36>;
        clocks = <&camera_clk>;
        status = "okay";
    };
};

&csi {
    status = "okay";
    port {
        csi_ep: endpoint {
            remote-endpoint = <&camera_ep>;
            data-lanes = <1 2>;
        };
    };
};
\`\`\`

## ⌨️ Do This

1. Decompile your system's device tree: \`dtc -I dtb -O dts /sys/firmware/fdt > my_board.dts 2>/dev/null\` or find DTB files in \`/boot/dtbs/\`
2. Read the device tree bindings documentation in the kernel source: \`ls Documentation/devicetree/bindings/\` — pick a subsystem and read the YAML binding
3. Find the \`compatible\` string for any device in your DT and search for the matching driver: \`grep -r "compatible.*vendor,device" drivers/\`
4. Practice reading hex addresses: \`reg = <0x40012000 0x400>\` means base address 0x40012000, size 0x400 (1024 bytes)
5. Compile a device tree: \`dtc -I dts -O dtb -o test.dtb test.dts\` — fix any warnings the compiler reports
6. Inspect a compiled DTB: \`fdtdump test.dtb\` or \`dtc -I dtb -O dts test.dtb\` to round-trip and verify

## ⚠️ Gotcha

**The compatible string must match exactly.** If your device tree says \`compatible = "vendor,sensor-v2"\` but the driver registers \`"vendor,sensor"\`, the driver will never probe. This is the number one cause of "my driver does not load" bugs. Always check the driver's \`of_match_table\` and copy the compatible string character-for-character. One team spent three days debugging a driver that would not probe — the device tree had a trailing space in the compatible string.

**Address and size cells trip everyone up.** \`#address-cells\` and \`#size-cells\` in a parent node define how many 32-bit values make up an address or size in child nodes. Get these wrong and your memory regions will be silently misinterpreted. On a 64-bit SoC, the root node typically has \`#address-cells = <2>; #size-cells = <2>;\` (two 32-bit words for each), while I2C and SPI buses use \`#address-cells = <1>; #size-cells = <0>;\`.

**Status "okay" vs "disabled" controls whether a node is active.** Vendor SoC .dtsi files typically set all peripherals to \`status = "disabled"\` — the board .dts must explicitly set \`status = "okay"\` on peripherals it uses. Forgetting this means your hardware exists in the device tree but the kernel ignores it completely.

## 🛠️ Mini-Project

Write a device tree overlay for a hypothetical expansion board:
1. Start with a base device tree for Raspberry Pi or BeagleBone (DTS files are in \`arch/arm64/boot/dts/broadcom/\` or \`arch/arm/boot/dts/ti/omap/\`)
2. Write an overlay that adds: an I2C temperature sensor (TMP102 at address 0x48), an SPI flash chip (W25Q128 on SPI0 CS0), and a GPIO-controlled LED on GPIO 17
3. Include proper \`compatible\` strings, \`reg\` properties, interrupt configuration, and \`status = "okay"\`
4. Compile it with \`dtc -I dts -O dtb -@ -o overlay.dtbo overlay.dts\` — the \`-@\` flag enables overlay support
5. Verify there are no warnings — fix any \`#address-cells\` or \`#size-cells\` issues
6. Document each property you used and why, referencing the kernel binding documentation

## ✅ You've mastered this when…
- You can read a device tree and identify CPUs, memory, buses, and peripherals
- You can write device tree entries for new hardware with correct properties
- You understand device tree bindings — the contract between DT and driver
- You can use overlays to modify the base DT for add-on boards
- You know the DTS include hierarchy: SoC .dtsi to board .dts to overlay .dtbo
- You can debug device tree issues using dtc warnings and kernel boot logs
`},

{id:'bsp-05',num:'05',title:'Kernel Driver Development',hours:14,phase:1,topics:['char driver','Platform driver','probe','ioctl'],content:`
## 🎯 Goal
Write a Linux kernel driver — understand the platform driver model, probe/remove lifecycle, and how userspace communicates with drivers.

## 🧠 Driver Types and the Platform Model

| Type | Interface | Example |
|------|-----------|--------|
| Character | /dev/xxx (read/write bytes) | Serial ports, sensors, GPIO |
| Block | /dev/sdX (read/write blocks) | Disks, flash storage |
| Network | Network interface (eth0, wlan0) | Ethernet, WiFi |

\`\`\`mermaid
sequenceDiagram
    participant DT as Device Tree
    participant BUS as Platform Bus
    participant DRV as Driver
    DT->>BUS: Register device (compatible string)
    DRV->>BUS: Register driver (of_match_table)
    BUS->>BUS: Match compatible strings
    BUS->>DRV: Call probe(pdev)
    Note over DRV: Request resources (clk, gpio, irq)
    Note over DRV: Map registers (devm_ioremap)
    Note over DRV: Register /dev node or sysfs
    Note over DRV: ... device in use ...
    BUS->>DRV: Call remove(pdev)
    Note over DRV: Unregister, free resources
\`\`\`

The kernel matches drivers to devices using the \`compatible\` string from the device tree. The \`of_match_table\` in the driver lists which compatible strings it handles.

## 🧠 Driver Resource Management

The \`devm_*\` (device-managed) API is essential for BSP drivers. Resources allocated with \`devm_*\` are automatically freed when the device is removed — preventing leaks.

\`\`\`mermaid
flowchart TD
    PROBE[probe called] --> RES1[devm_clk_get<br/>Acquire clock]
    RES1 --> RES2[devm_ioremap_resource<br/>Map registers]
    RES2 --> RES3[devm_request_irq<br/>Register interrupt]
    RES3 --> REG[Register with subsystem<br/>IIO, input, misc]
    REG --> OK[Device ready]
    OK --> REM[remove called or error]
    REM --> AUTO[devm auto-frees all<br/>in reverse order]
\`\`\`

\`\`\`c
/* Skeleton platform driver */
static int my_probe(struct platform_device *pdev)
{
    struct my_data *data;
    void __iomem *base;

    data = devm_kzalloc(&pdev->dev, sizeof(*data), GFP_KERNEL);
    if (!data)
        return -ENOMEM;

    base = devm_platform_ioremap_resource(pdev, 0);
    if (IS_ERR(base))
        return PTR_ERR(base);

    /* devm_clk_get_enabled() gets, prepares and enables in one call, and
     * unwinds automatically on unbind — replaces the old get + prepare_enable
     * pair, and can't leave the clock on down an error path. */
    data->clk = devm_clk_get_enabled(&pdev->dev, NULL);
    if (IS_ERR(data->clk))
        return PTR_ERR(data->clk);

    platform_set_drvdata(pdev, data);
    return 0;
}

static const struct of_device_id my_of_match[] = {
    { .compatible = "vendor,my-device" },
    { /* sentinel */ }
};
MODULE_DEVICE_TABLE(of, my_of_match);

static struct platform_driver my_driver = {
    .probe  = my_probe,
    /* No .remove needed: every allocation above is devm_*, so the driver
     * core unwinds them in reverse order on unbind. If you do add one,
     * note the signature changed in Linux 6.11 —
     *   void my_remove(struct platform_device *pdev)
     * An int-returning .remove is now a build error. */
    .driver = {
        .name = "my-device",
        .of_match_table = my_of_match,
    },
};
module_platform_driver(my_driver);
\`\`\`

## ⌨️ Do This

1. Read a real kernel driver — start with \`drivers/iio/temperature/tmp102.c\` (I2C temperature sensor) — it is under 400 lines
2. Identify the key structures: \`of_match_table\`, \`probe()\`, \`remove()\`, \`file_operations\` or IIO info
3. Trace how the driver registers with the platform bus and matches with the device tree
4. Look at how the driver exposes data to userspace (sysfs attributes, /dev node, or IIO channels)
5. Find all \`devm_*\` calls in the probe function — note that no explicit cleanup is needed in remove()
6. Read \`drivers/misc/dummy-irq.c\` — one of the simplest kernel drivers, good for understanding module structure

## ⚠️ Gotcha

**Never sleep in interrupt context.** Functions like \`msleep()\`, \`mutex_lock()\`, or \`kmalloc(GFP_KERNEL)\` can sleep — calling them from an interrupt handler or while holding a spinlock will deadlock or crash the system. Use \`GFP_ATOMIC\` for allocations in interrupt context, and defer work to a tasklet or workqueue. A junior engineer once put an I2C read (which sleeps) inside a GPIO interrupt handler — the kernel locked up every time the interrupt fired, but only under load, making it a nightmare to reproduce.

**Always check return values.** Every kernel function that can fail returns an error code. Ignoring it means your driver will silently corrupt data or crash. Use \`IS_ERR()\` for pointer-returning functions and always have a cleanup path for partial initialization. The \`devm_*\` family simplifies this enormously — prefer it over manual resource management whenever possible.

**Probe ordering is not guaranteed.** If your driver depends on another driver (e.g., a clock provider, a GPIO controller), that driver might not have probed yet. Return \`-EPROBE_DEFER\` and the kernel will retry your probe later. Do not hack around this with \`late_initcall\` — probe deferral is the correct mechanism.

## 🛠️ Mini-Project

Write a character device driver for a virtual sensor:
1. Create a platform driver skeleton with \`module_platform_driver()\` and an \`of_match_table\`
2. In \`probe()\`, register a misc device (\`misc_register()\`) that creates \`/dev/vsensor\`
3. Implement \`read()\` to return a simulated temperature value using \`get_random_bytes()\` scaled to a realistic range (20-30 C)
4. Implement \`ioctl()\` with custom commands to let userspace configure the sensor: set update interval, enable/disable averaging
5. Add a device tree binding document (\`Documentation/devicetree/bindings/misc/learn,virtual-sensor.yaml\`) describing expected properties
6. Write a userspace test program that opens \`/dev/vsensor\`, reads 10 values, and uses ioctl to change settings between reads
7. Add proper error handling: what happens if two processes open the device simultaneously?

## ✅ You've mastered this when…
- You can write a basic platform driver with probe/remove lifecycle
- You understand file_operations (open, read, write, ioctl, release) and their semantics
- You can create a /dev entry for userspace access using misc_register or cdev_add
- You know how the kernel matches drivers to device tree entries via compatible strings
- You understand devm_* resource management and why it prevents leaks
- You can handle probe deferral (-EPROBE_DEFER) for driver dependencies
`},

{id:'bsp-06',num:'06',title:'Build Systems & Toolchains',hours:12,phase:1,topics:['Cross-compile','Yocto','Buildroot','Kconfig'],content:`
## 🎯 Goal
Cross-compile a Linux kernel, build a complete root filesystem, and understand when to use Yocto vs Buildroot.

## 🧠 Cross-Compilation Flow

Cross-compilation means building code on your development host (x86_64) that runs on a different target (ARM64, RISC-V). The toolchain includes a cross-compiler, linker, and target libraries.

\`\`\`mermaid
flowchart LR
    SRC[Source Code<br/>C, kernel, apps] --> TC[Cross Toolchain<br/>aarch64-linux-gnu-gcc]
    TC --> BIN[Target Binary<br/>ARM64 ELF]
    BIN --> ROOTFS[Root Filesystem<br/>Image for target]
    ROOTFS --> FLASH[Flash / SD Card<br/>Target board]
    FLASH --> BOOT[Target boots<br/>and runs]
\`\`\`

**Toolchain components:**
- **Compiler:** aarch64-linux-gnu-gcc (cross-compiler for ARM64)
- **Binutils:** aarch64-linux-gnu-ld, as, objdump, readelf
- **C Library:** glibc (full-featured), musl (small, static-friendly), uclibc-ng (embedded)
- **Sysroot:** Target headers and libraries for linking

## 🧠 Build System Comparison

\`\`\`mermaid
flowchart TD
    subgraph Yocto[Yocto / OpenEmbedded]
        LAYERS[Layers<br/>meta-poky, meta-vendor] --> RECIPES[Recipes .bb<br/>Per-package build rules]
        RECIPES --> BITBAKE[BitBake<br/>Task scheduler]
        BITBAKE --> PKG[Packages<br/>opkg/rpm/deb]
        PKG --> IMG[Root FS Image]
    end
    subgraph BR[Buildroot]
        KCONF[Kconfig<br/>make menuconfig] --> MAKE[make<br/>Sequential build]
        MAKE --> BRIMG[Root FS Image<br/>No package manager]
    end
\`\`\`

| | Yocto/OpenEmbedded | Buildroot |
|---|-------------------|----------|
| Complexity | High (steep learning curve) | Lower |
| Flexibility | Very high (layers, recipes) | Moderate |
| Package management | opkg/rpm/deb at runtime | None (static image) |
| Build time | Hours (first build) | Faster |
| Reproducibility | Excellent (hermetic builds) | Good |
| Use case | Production products, long-lived | Prototyping, simple products |

**Yocto key commands:**

\`\`\`bash
# Yocto/BitBake workflow
source oe-init-build-env build/
bitbake-layers add-layer ../meta-custom
bitbake core-image-minimal           # Build minimal image
bitbake -c menuconfig virtual/kernel # Configure kernel
bitbake -c devshell my-package       # Drop into build env
bitbake -e my-package | grep ^SRC_URI  # Inspect recipe variables
\`\`\`

## ⌨️ Do This

1. Install a cross-compilation toolchain: \`sudo apt install gcc-aarch64-linux-gnu\`
2. Cross-compile a "hello world" C program: \`aarch64-linux-gnu-gcc -o hello hello.c\`
3. Verify the binary: \`file hello\` — should show "ARM aarch64", not your host architecture
4. Inspect the binary: \`aarch64-linux-gnu-readelf -h hello\` to see the ELF header, \`-d\` for dynamic dependencies
5. Download Buildroot, run \`make qemu_aarch64_virt_defconfig && make -j\$(nproc)\` — observe the entire build process
6. Boot the resulting image in QEMU: \`qemu-system-aarch64 -M virt -cpu cortex-a57 -nographic -kernel output/images/Image -append "console=ttyAMA0"\`

## ⚠️ Gotcha

**Toolchain mismatch silently breaks things.** If your kernel is built with GCC 12 and your rootfs libraries are built with GCC 10, you might get subtle runtime failures — different ABIs, different default flags, different library versions. Always use the same toolchain for everything in a BSP. Buildroot and Yocto handle this correctly by building their own internal toolchain — problems arise when you mix a vendor toolchain with your own builds.

**Yocto's first build takes hours and needs 50GB+ of disk.** It downloads and compiles everything from source, including the toolchain. Do not cancel it midway — the partial state is hard to recover from. Use \`SSTATE_MIRRORS\` and \`DL_DIR\` caching to speed up subsequent builds. Set \`DL_DIR\` to a shared location outside the build directory so multiple builds reuse downloaded sources.

**Buildroot has no incremental package management.** Once you build a Buildroot image, adding a single package requires rebuilding the rootfs image. There is no \`apt install\` on the target. For products that need field updates to individual packages, Yocto with a runtime package manager (opkg) is the better choice.

## 🛠️ Mini-Project

Build a minimal Linux system with Buildroot and boot it:
1. Clone Buildroot and configure for QEMU ARM64: \`make qemu_aarch64_virt_defconfig\`
2. Add packages: \`make menuconfig\` — add dropbear (SSH), nano (editor), htop, and busybox httpd
3. Build the full image: \`make -j\$(nproc)\` — time the build
4. Boot in QEMU: use the command from the Buildroot board readme
5. SSH into your custom Linux system and verify all packages work
6. Document: total image size (\`ls -lh output/images/\`), boot time, and what is running (\`ps aux\`)
7. Create a Buildroot external tree with a custom package (a simple hello-world app with its own Config.in and .mk files)

## ✅ You've mastered this when…
- You can cross-compile a kernel and userspace programs for an ARM target
- You can build a root filesystem with Buildroot and boot it in QEMU
- You understand Yocto's layer and recipe architecture (meta-layers, .bb files, BitBake)
- You know how Kconfig and defconfig work for both kernel and Buildroot
- You can explain when to use Yocto vs Buildroot for a given project
- You understand toolchain components: compiler, binutils, C library, sysroot
`},

{id:'bsp-07',num:'07',title:'Root Filesystem & Init',hours:10,phase:1,topics:['initramfs','systemd','BusyBox','OTA','A/B partition'],content:`
## 🎯 Goal
Build and customize root filesystems, understand init systems, and implement OTA update strategies.

## 🧠 From Kernel to Userspace

\`\`\`mermaid
flowchart LR
    K[Kernel] --> IR{initramfs?}
    IR -->|yes| IFS[initramfs<br/>Early userspace<br/>Mount real rootfs]
    IR -->|no| RFS[Root Filesystem<br/>directly via root=]
    IFS --> RFS
    RFS --> INIT[Init System<br/>PID 1]
    INIT --> S1[Service 1]
    INIT --> S2[Service 2]
    INIT --> S3[Login shell]
\`\`\`

The kernel needs a root filesystem to start userspace. It can either mount one directly (\`root=/dev/mmcblk0p2\`) or load an initramfs first (a small in-memory filesystem that finds and mounts the real rootfs).

**Root filesystem layout (FHS):**

\`\`\`bash
/
├── bin/      # Essential user binaries (ls, cp, sh)
├── sbin/     # Essential system binaries (init, mount)
├── etc/      # Configuration files
├── dev/      # Device nodes (populated by devtmpfs/udev)
├── proc/     # procfs mount point
├── sys/      # sysfs mount point
├── tmp/      # Temporary files (tmpfs)
├── var/      # Variable data (logs, state)
├── lib/      # Shared libraries
└── usr/      # Secondary hierarchy (non-essential)
\`\`\`

## 🧠 OTA Update Strategies

\`\`\`mermaid
flowchart TD
    subgraph AB[A/B Partition Strategy]
        A_BOOT[Slot A: Active<br/>Running system] --> DOWNLOAD[Download update<br/>to Slot B]
        DOWNLOAD --> VERIFY[Verify Slot B<br/>checksum + signature]
        VERIFY --> SWITCH[Switch active slot<br/>A to B]
        SWITCH --> REBOOT[Reboot into Slot B]
        REBOOT --> VALIDATE{Boot successful?}
        VALIDATE -->|yes| COMMIT[Mark Slot B good]
        VALIDATE -->|no| ROLLBACK[Rollback to Slot A]
    end
    subgraph PART[Partition Layout]
        BOOTL[Bootloader] --- PARTA[System A<br/>Active]
        BOOTL --- PARTB[System B<br/>Inactive]
        BOOTL --- DATA[Data Partition<br/>Persistent]
    end
\`\`\`

Tools: **RAUC** (robust auto-update controller), **SWUpdate**, **Mender** (managed OTA platform), **OSTree** (git for OS images).

## ⌨️ Do This

1. Examine your system's init: \`ps -p 1 -o comm=\` — is it systemd, SysVinit, or something else?
2. List enabled services: \`systemctl list-unit-files --state=enabled\` — count how many there are
3. Write a simple systemd service unit that runs a script at boot — use \`Type=oneshot\` with \`RemainAfterExit=yes\`
4. Check your root filesystem type and options: \`mount | grep "on / "\` — note filesystem type, mount options (ro/rw)
5. Explore BusyBox: if you have it, run \`busybox --list\` to see all built-in commands — count the applets
6. Create a minimal initramfs: \`echo '#!/bin/sh' > init && echo 'exec /bin/sh' >> init && find . | cpio -o -H newc | gzip > initramfs.cpio.gz\`

## ⚠️ Gotcha

**A read-only rootfs needs writable overlays.** Many embedded products use a read-only root filesystem for reliability (you cannot corrupt what you cannot write to). But some paths (/tmp, /var, /etc) need to be writable. Use tmpfs for volatile data and overlayfs for persistent writable layers on top of a read-only base. One product shipped with a writable rootfs and experienced data corruption on 2% of field units after power loss — switching to read-only rootfs with tmpfs overlays eliminated the issue entirely.

**OTA updates without A/B can brick devices.** If power fails during a single-partition update, the device will not boot. A/B partitioning solves this but doubles your storage requirement for the system partition. Know the trade-off before choosing your update strategy. For storage-constrained devices, consider a recovery partition approach: a minimal recovery OS that can reflash the main partition.

**systemd adds 10+ seconds to boot on embedded.** Full systemd with default targets pulls in dozens of services. For fast-booting embedded products, either strip systemd aggressively (\`systemctl mask\` unneeded services, use \`systemd-analyze critical-chain\` to find bottlenecks) or use a simpler init like BusyBox init or OpenRC.

## 🛠️ Mini-Project

Build a minimal rootfs from scratch (no Buildroot, no Yocto):
1. Cross-compile BusyBox statically: \`make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- menuconfig\` — enable static linking under Settings — \`make install\`
2. Create the rootfs directory structure: /bin, /sbin, /etc, /proc, /sys, /dev, /tmp, /var, /root
3. Write an init script (/etc/init.d/rcS) that mounts procfs, sysfs, and devtmpfs
4. Create /etc/inittab with a console login and rcS execution
5. Package as a cpio initramfs: \`find . | cpio -o -H newc | gzip > rootfs.cpio.gz\`
6. Boot with QEMU: \`qemu-system-aarch64 -M virt -cpu cortex-a57 -nographic -kernel Image -initrd rootfs.cpio.gz -append "console=ttyAMA0"\`
7. Document every file in your rootfs and why it is there — aim for under 2MB total

## ✅ You've mastered this when…
- You can build a minimal rootfs with BusyBox from scratch and boot it
- You understand systemd units and service management for embedded targets
- You can implement A/B partition OTA updates with rollback
- You know when to use initramfs vs direct root mount
- You can configure a read-only rootfs with appropriate writable overlays
- You understand the trade-offs between OTA strategies (A/B, recovery, delta)
`},

{id:'bsp-08',num:'08',title:'HAL & Platform Abstraction',hours:10,phase:1,topics:['HAL','regmap','clk framework','pinctrl'],content:`
## 🎯 Goal
Design hardware abstraction layers and work with Linux kernel frameworks — regmap, clock, reset, and pin control.

## 🧠 Linux Kernel Frameworks

The kernel provides standard frameworks so drivers do not reinvent the wheel:

| Framework | Purpose | Key API |
|-----------|---------|---------|
| **regmap** | Unified register access (I2C, SPI, MMIO) | regmap_read(), regmap_write(), regmap_update_bits() |
| **clk** | Clock management — enable, disable, set rate | clk_prepare_enable(), clk_set_rate(), clk_get_rate() |
| **pinctrl** | Pin multiplexing — configure pin functions | pinctrl_select_state(), in device tree: pinctrl-0 |
| **reset** | Reset line management for peripherals | reset_control_assert(), reset_control_deassert() |
| **gpio** | GPIO abstraction — direction, value, IRQs | gpiod_get(), gpiod_direction_output(), gpiod_set_value() |
| **regulator** | Power supply management — enable, voltage | regulator_enable(), regulator_set_voltage() |

\`\`\`mermaid
flowchart TD
    DRV[Your Driver] --> REGMAP[regmap<br/>Register access]
    DRV --> CLK[clk framework<br/>Clock management]
    DRV --> PINCTRL[pinctrl<br/>Pin muxing]
    DRV --> RESET[reset<br/>HW reset lines]
    DRV --> GPIO[gpio<br/>GPIO pins]
    DRV --> REG[regulator<br/>Power supplies]
    REGMAP --> I2C[I2C Bus]
    REGMAP --> SPI[SPI Bus]
    REGMAP --> MMIO[Memory-mapped I/O]
    CLK --> CLKTREE[Clock Tree<br/>PLL, dividers, gates]
    PINCTRL --> PINS[Physical Pins<br/>Mux configuration]
\`\`\`

**Regmap example — unified register access:**

\`\`\`c
/* Same driver code works over I2C, SPI, or MMIO */
static const struct regmap_config my_regmap_config = {
    .reg_bits = 8,
    .val_bits = 8,
    .max_register = 0xFF,
    .cache_type = REGCACHE_MAPLE,   /* RBTREE was removed in Linux 6.10 */
    .volatile_reg = my_volatile_reg,  /* Status regs: skip cache */
};

/* In probe(): */
data->regmap = devm_regmap_init_i2c(client, &my_regmap_config);
/* Read/write are bus-agnostic: */
regmap_read(data->regmap, REG_CHIP_ID, &val);
regmap_write(data->regmap, REG_CONFIG, 0x42);
regmap_update_bits(data->regmap, REG_CTRL, MASK_ENABLE, MASK_ENABLE);
\`\`\`

## 🧠 Clock Tree and Pin Control in Device Tree

The clock and pin control frameworks are configured primarily through the device tree. Understanding how to read and write clock and pinctrl DT entries is a core BSP skill.

\`\`\`mermaid
flowchart LR
    OSC[Crystal<br/>24 MHz] --> PLL[PLL<br/>x40 = 960 MHz]
    PLL --> DIV1[Divider /4<br/>240 MHz CPU]
    PLL --> DIV2[Divider /8<br/>120 MHz AHB]
    DIV2 --> GATE1[Gate: I2C clk<br/>enable/disable]
    DIV2 --> GATE2[Gate: SPI clk<br/>enable/disable]
    DIV1 --> CPU[CPU Core]
    GATE1 --> I2C[I2C Controller]
    GATE2 --> SPI[SPI Controller]
\`\`\`

**Device tree clock and pinctrl bindings:**

\`\`\`c
&i2c1 {
    /* Clock: which clock this peripheral uses */
    clocks = <&clk_ahb IMX8_CLK_I2C1>;
    clock-names = "per";

    /* Pinctrl: which pin configuration to use */
    pinctrl-names = "default", "sleep";
    pinctrl-0 = <&pinctrl_i2c1>;    /* Active state */
    pinctrl-1 = <&pinctrl_i2c1_sleep>; /* Low-power state */

    status = "okay";
};

/* Pin mux definition */
&iomuxc {
    pinctrl_i2c1: i2c1grp {
        fsl,pins = <
            MX8_PAD_I2C1_SCL__I2C1_SCL  0x400001c3
            MX8_PAD_I2C1_SDA__I2C1_SDA  0x400001c3
        >;
    };
};
\`\`\`

## ⌨️ Do This

1. Find a driver using regmap in the kernel source: \`grep -rl "devm_regmap_init_i2c" drivers/iio/ | head -5\`
2. Read how it calls \`regmap_read()\` and \`regmap_write()\` instead of raw I2C transactions — note the regmap_config
3. Explore the clock tree: mount debugfs (\`mount -t debugfs none /sys/kernel/debug\`), then \`cat /sys/kernel/debug/clk/clk_summary\`
4. Check pinctrl state: \`cat /sys/kernel/debug/pinctrl/*/pins\` to see pin assignments and mux settings
5. Find a driver that uses both clk and regmap: trace how it acquires clocks in probe() and what happens if clk_prepare_enable() fails
6. Read an IIO driver's regmap_config: identify which registers are marked volatile and why

## ⚠️ Gotcha

**Regmap caching can mask hardware bugs.** Regmap caches register values by default so it does not re-read unchanged registers. If your hardware has a register that changes independently (like a status register or FIFO), you must mark it as \`volatile\` in the regmap config. Otherwise you will read stale cached values and wonder why your driver does not see hardware events. One team spent two weeks debugging a sensor that "stopped updating" — the data register was being served from cache instead of read from hardware.

**Clock dependencies are implicit and ordering matters.** If your driver uses a clock but does not properly call \`clk_prepare_enable()\` / \`clk_disable_unprepare()\`, the clock framework might gate the clock while your hardware still needs it. Always manage clocks explicitly in your driver's probe/remove. More subtly, the clock must be enabled before you access any registers on the peripheral — accessing registers with the clock gated causes a bus error or hang.

**Pinctrl conflicts cause silent hardware failures.** If two device tree nodes claim the same physical pin with different mux settings, the last one to probe wins — and the first device silently stops working. The kernel logs a warning but does not prevent it. Always verify pin assignments with \`cat /sys/kernel/debug/pinctrl/*/pinmux-pins\` after boot.

## 🛠️ Mini-Project

Study and document a real kernel driver that uses multiple frameworks:
1. Pick a driver from \`drivers/iio/\` (e.g., \`drivers/iio/accel/bma220_spi.c\` or \`drivers/iio/light/veml6070.c\`) that uses regmap + clk
2. Trace the probe() function line by line: what resources does it acquire and in what order?
3. Draw a diagram showing: device tree properties to driver probe to framework calls to hardware register access
4. Document the error handling path: what happens if devm_regmap_init fails? Does the driver clean up properly? What about clk_prepare_enable() failure?
5. Write a review noting any improvements you would suggest (missing error checks, unused features, clarity)
6. Create a regmap_config for a hypothetical 16-bit I2C sensor with 256 registers, where registers 0x00-0x0F are volatile status registers

## ✅ You've mastered this when…
- You understand why kernel frameworks exist and what good abstraction looks like
- You can use regmap for register access and configure caching correctly
- You know how the clk and pinctrl frameworks work in both driver code and device tree
- You can write portable drivers that work across boards by using framework APIs
- You can debug framework-related issues using debugfs (clk_summary, pinmux-pins)
- You understand the interaction between clock gating, pin muxing, and register access
`},

{id:'bsp-09',num:'09',title:'Peripheral Drivers (I2C/SPI/UART/GPIO)',hours:10,phase:2,topics:['I2C driver','SPI driver','GPIO','IRQ'],content:`
## 🎯 Goal
Write Linux drivers for common peripherals — I2C sensors, SPI devices, GPIO with interrupts — using the proper kernel subsystem APIs.

## 🧠 I2C Subsystem Architecture

\`\`\`mermaid
flowchart TD
    DT[Device Tree Entry<br/>compatible, reg, interrupts] -->|compatible match| DRV[I2C Client Driver<br/>your sensor driver]
    DRV -->|i2c_smbus_read_byte_data| CORE[I2C Core<br/>Bus arbitration, addressing]
    CORE --> ADAPT[I2C Adapter Driver<br/>SoC-specific controller]
    ADAPT -->|physical I2C bus| DEV[Hardware Device<br/>Sensor, EEPROM, etc.]
    DRV -->|sysfs/IIO/input| USER[Userspace<br/>Application]
\`\`\`

The kernel I2C subsystem handles bus arbitration, addressing, and protocol details. Your driver only needs to implement the device-specific register reads/writes.

**I2C vs SPI comparison for driver developers:**

| Aspect | I2C | SPI |
|--------|-----|-----|
| Wires | 2 (SDA, SCL) | 4+ (MOSI, MISO, CLK, CS) |
| Speed | 100/400 kHz, up to 3.4 MHz | Up to 100+ MHz |
| Addressing | 7-bit address on bus | Chip select per device |
| Driver base | struct i2c_driver | struct spi_driver |
| DT reg property | I2C address (e.g., 0x48) | Chip select index (e.g., 0) |
| Read function | i2c_smbus_read_byte_data() | spi_read() / spi_write_then_read() |

## 🧠 Interrupt Handling in Drivers

\`\`\`mermaid
sequenceDiagram
    participant HW as Hardware
    participant IRQ as IRQ Handler<br/>hardirq context
    participant THR as Threaded Handler<br/>process context
    participant USER as Userspace

    HW->>IRQ: Interrupt fires (GPIO edge)
    Note over IRQ: Cannot sleep!<br/>Read status, clear IRQ
    IRQ->>IRQ: return IRQ_WAKE_THREAD
    IRQ->>THR: Wake threaded handler
    Note over THR: Can sleep, do I2C/SPI
    THR->>THR: Read sensor data via I2C
    THR->>USER: Update sysfs / send event
    THR->>THR: return IRQ_HANDLED
\`\`\`

\`\`\`c
/* Threaded IRQ — the modern pattern */
ret = devm_request_threaded_irq(&client->dev, client->irq,
    my_irq_handler,        /* hardirq: fast, no sleeping */
    my_irq_thread_fn,      /* thread: can sleep, do I2C */
    IRQF_TRIGGER_FALLING | IRQF_ONESHOT,
    "my-sensor", data);

/* hardirq handler */
static irqreturn_t my_irq_handler(int irq, void *dev_id)
{
    /* Only do minimal work: check if this is our interrupt */
    return IRQ_WAKE_THREAD;
}

/* threaded handler — runs in process context */
static irqreturn_t my_irq_thread_fn(int irq, void *dev_id)
{
    struct my_data *data = dev_id;
    int val;
    /* Safe to do I2C/SPI here */
    regmap_read(data->regmap, REG_DATA, &val);
    /* Push to IIO buffer or update sysfs */
    return IRQ_HANDLED;
}
\`\`\`

## ⌨️ Do This

1. Scan the I2C bus: \`sudo i2cdetect -y 1\` (bus 1) — each number shown is a responding device address
2. Read an I2C register: \`sudo i2cget -y 1 0x48 0x00\` (address 0x48, register 0x00)
3. Write an I2C register: \`sudo i2cset -y 1 0x48 0x01 0x42\` (address 0x48, register 0x01, value 0x42)
4. Read a complete IIO sensor driver: \`drivers/iio/temperature/tmp102.c\` — follow the data path from hardware register to sysfs attribute
5. Check your system's interrupt assignments: \`cat /proc/interrupts\` — identify which devices are using which IRQ lines
6. Use \`gpiodetect\` and \`gpioinfo\` (from libgpiod) to list GPIO chips and their line states

## ⚠️ Gotcha

**Top-half vs bottom-half interrupt handling is non-negotiable.** The interrupt handler (top-half / hardirq) runs with interrupts disabled — it must be fast. Do the minimum (read status register, clear interrupt) and defer real work to a threaded IRQ handler (bottom-half). Using \`devm_request_threaded_irq()\` is the modern pattern — the thread can sleep, take mutexes, and do I2C/SPI transactions. Using the legacy \`request_irq()\` with a workqueue is functionally equivalent but more boilerplate.

**I2C address collisions are silent failures.** If two devices share the same I2C address on the same bus, reads and writes corrupt silently — you might read the temperature sensor and get EEPROM data back. Always check the datasheet for configurable address pins (A0, A1, A2) and verify with \`i2cdetect\` before writing your driver. Some boards use I2C multiplexers (TCA9548A) to create isolated bus segments when address conflicts are unavoidable.

**SPI mode and speed must match the device datasheet.** SPI has four modes (0-3) based on clock polarity and phase. If you configure the wrong mode, data will be shifted by one bit, causing every register read to return garbage. The kernel's SPI framework lets you set mode in the device tree (\`spi-cpol\`, \`spi-cpha\`) or in the driver — always verify against the datasheet timing diagrams.

## 🛠️ Mini-Project

Write an I2C temperature sensor driver using the IIO subsystem:
1. Create an I2C client driver matching compatible string \`"ti,tmp102"\` (or \`"learn,virtual-temp"\` for a virtual device)
2. In \`probe()\`, create a regmap and confirm the chip responds. Note that **TMP102 has no ID register** — it exposes only four: 0x00 temperature, 0x01 configuration, 0x02 T_LOW, 0x03 T_HIGH. Probe it by reading the config register and checking the reset defaults, or simply let a failed I2C transfer be your "not present" signal. (Reaching for an ID register is the right instinct — TMP117 has one at 0x0F — but inventing one for a chip that lacks it is a classic way to conclude your hardware is broken when it isn't.)
3. Register an IIO device with a temperature channel — implement \`read_raw()\` to read register 0x00 and convert to millidegrees
4. Add interrupt support: configure the sensor's alert threshold register (0x03) and handle the alert with a threaded IRQ
5. Write a matching device tree entry with compatible string, reg, and interrupt properties
6. Test from userspace: \`cat /sys/bus/iio/devices/iio:device0/in_temp_raw\` and verify the conversion to millidegrees
7. Add a configurable high-temperature alarm threshold via an IIO event interface

## ✅ You've mastered this when…
- You can write an I2C or SPI client driver for a real sensor chip
- You handle interrupts correctly using threaded IRQs (IRQF_ONESHOT pattern)
- You expose device data through the IIO subsystem or sysfs attributes
- You use device tree bindings correctly for I2C address, SPI chip-select, and interrupt wiring
- You can debug bus issues with i2cdetect, i2cdump, and kernel log messages
- You understand the difference between I2C SMBus and raw I2C transfers
`},

{id:'bsp-10',num:'10',title:'Display & Graphics',hours:10,phase:2,topics:['DRM/KMS','Display pipeline','GPU','Wayland'],content:`
## 🎯 Goal
Understand the Linux display stack — DRM/KMS, the display pipeline, framebuffer management, and the landscape of GPU drivers and display servers.

## 🧠 Display Pipeline Architecture

\`\`\`mermaid
flowchart LR
    FB[Framebuffer<br/>Pixel data in memory] --> PLANE[Plane<br/>Overlay, cursor, primary]
    PLANE --> CRTC[CRTC<br/>Scanout engine<br/>Timing generator]
    CRTC --> ENC[Encoder<br/>Signal conversion<br/>Digital to HDMI/DP/DSI]
    ENC --> CONN[Connector<br/>Physical port<br/>HDMI-A-1, DSI-1]
    CONN --> PANEL[Display Panel<br/>Monitor, LCD, OLED]
\`\`\`

DRM (Direct Rendering Manager) / KMS (Kernel Mode Setting) is the modern Linux display framework. It replaces the legacy framebuffer interface (/dev/fb0) with a more capable and flexible API.

**Key DRM/KMS concepts:**
- **Plane:** A hardware layer that holds pixel data. Primary plane = main display. Overlay planes = composited on top. Cursor plane = hardware cursor.
- **CRTC:** The scan-out engine that reads planes and generates timing signals. One CRTC per independent display output.
- **Encoder:** Converts the CRTC's digital output to a specific protocol (HDMI, DisplayPort, MIPI-DSI, LVDS).
- **Connector:** The physical port. Reports connection status, supported modes, EDID data.

## 🧠 Full Display Software Stack

\`\`\`mermaid
flowchart TD
    APP[Application<br/>GTK, Qt, game] --> COMP[Compositor<br/>Weston, Mutter, KWin]
    COMP --> EGL[EGL/OpenGL ES<br/>GPU rendering]
    COMP --> LIBDRM[libdrm<br/>DRM/KMS userspace API]
    EGL --> MESA[Mesa / GPU Driver<br/>Panfrost, Lima, freedreno]
    MESA --> KGPU[Kernel GPU Driver<br/>DRM driver]
    LIBDRM --> KDRM[Kernel DRM/KMS<br/>Mode setting, planes]
    KGPU --> GPU[GPU Hardware]
    KDRM --> DISP[Display Hardware<br/>CRTC, encoder, panel]
\`\`\`

**Wayland vs X11:**
- **X11:** Client-server model, 30+ years old. The X server owns the display and all rendering goes through it. Network-transparent but adds latency.
- **Wayland:** Compositor-based model. Each client renders into its own buffer. The compositor (Weston) directly programs DRM/KMS. Lower latency, better security (clients cannot snoop on each other).

## ⌨️ Do This

1. List your display outputs: \`ls /sys/class/drm/\` — each card*-CONNECTOR-N entry is a display output
2. Check connected displays: \`cat /sys/class/drm/card0-HDMI-A-1/status\` — "connected" or "disconnected"
3. List supported display modes: \`cat /sys/class/drm/card0-HDMI-A-1/modes\` — resolution and refresh rate
4. If you have \`modetest\` (from libdrm-tests): \`modetest -c\` (connectors), \`modetest -p\` (planes), \`modetest -e\` (encoders)
5. Check your GPU driver: \`cat /sys/class/drm/card0/device/uevent | grep DRIVER\` or \`lspci -k | grep -A3 VGA\`
6. Draw a colored test pattern to the framebuffer: \`cat /dev/urandom > /dev/fb0\` (on a system with fbdev enabled)

## ⚠️ Gotcha

**DRM (Direct Rendering Manager) has nothing to do with DRM (Digital Rights Management).** Same acronym, completely unrelated. In BSP and kernel context, DRM always means the display framework. This confusion has persisted for 20+ years and still trips up newcomers searching for documentation.

**GPU driver support is the number one pain point in embedded Linux display.** Many SoC vendors provide proprietary GPU drivers that only work with specific kernel versions and break on upgrades. Mesa open-source GPU drivers are the ideal, and coverage is now much better than its reputation: Arm Mali has **Panfrost** for Midgard and Bifrost, and **Panthor** — merged in Linux 6.10 — for newer Valhall and Arm's CSF-based parts; Vivante GPUs have etnaviv; Qualcomm Adreno has freedreno. Check the current state before assuming you need a vendor blob, because that assumption is often a year or two out of date and commits you to a driver that pins your kernel version. Always verify GPU driver availability and OpenGL ES version support before choosing a display SoC for a product.

**Display pipeline configuration order matters.** You must set modes atomically: configure CRTC, encoder, and connector together. Setting them individually can leave the display in an inconsistent state with garbled output or no output at all. Use the DRM atomic modesetting API (\`drmModeAtomicCommit\`) rather than legacy per-CRTC calls.

## 🛠️ Mini-Project

Explore the DRM subsystem and write a framebuffer renderer:
1. Write a C program using libdrm to enumerate all connectors, encoders, CRTCs, and planes — print their properties
2. Find a connected display and its preferred mode (resolution + refresh rate from EDID)
3. Create a dumb buffer (\`DRM_IOCTL_MODE_CREATE_DUMB\`), map it, and fill it with a colored gradient
4. Set the display mode and attach your buffer to the primary plane using atomic modesetting
5. Implement page flipping: create two buffers and alternate between them to show animation without tearing
6. If using QEMU, use \`-device virtio-gpu-pci\` for a virtual GPU with DRM support

## ✅ You've mastered this when…
- You understand the DRM/KMS pipeline (planes to CRTC to encoder to connector) and what each component does
- You know the difference between DRM/KMS and legacy framebuffer and why the migration happened
- You can navigate the GPU driver landscape (Mesa vs proprietary, which open drivers support which GPUs)
- You understand Wayland vs X11 and why embedded systems increasingly use Wayland
- You can use libdrm to enumerate display resources and set modes
- You know how to debug display issues using modetest and sysfs
`},

{id:'bsp-11',num:'11',title:'Audio Subsystem',hours:10,phase:2,topics:['ALSA','ASoC','DAPM','PipeWire','Codec'],content:`
## 🎯 Goal
Understand the Linux audio stack — ALSA, ASoC framework, DAPM power management, and audio routing for embedded products.

## 🧠 ASoC Architecture

The ASoC (ALSA System on Chip) framework splits audio into three driver types, making code reusable across boards:

\`\`\`mermaid
flowchart LR
    APP[Application<br/>aplay, browser] --> PW[PipeWire<br/>or PulseAudio]
    PW --> ALSA[ALSA Core<br/>PCM, mixer, control]
    ALSA --> MACH[Machine Driver<br/>Board-specific<br/>routing and clocks]
    MACH --> PLAT[Platform Driver<br/>SoC DMA engine<br/>I2S/TDM controller]
    MACH --> CODEC[Codec Driver<br/>DAC/ADC chip<br/>e.g., WM8960, TLV320]
    PLAT --> I2S[I2S / TDM Bus]
    CODEC --> I2S
    CODEC --> SPK[Speaker / Headphone]
    CODEC --> MIC[Microphone]
\`\`\`

**Three ASoC driver types:**
- **Codec driver:** Drives the audio codec chip (DAC/ADC). Vendor-independent — the same WM8960 driver works on any SoC.
- **Platform driver:** Drives the SoC's audio DMA and I2S/TDM controller. SoC-specific but board-independent.
- **Machine driver:** The board-specific glue that connects codec to platform, defines audio routes, and configures clocks.

## 🧠 DAPM — Dynamic Audio Power Management

DAPM automatically manages power for audio paths. Each audio component is a "widget" (input, output, mixer, switch, supply). DAPM traces which widgets are in an active audio path and powers down everything else.

\`\`\`mermaid
flowchart LR
    MIC[Microphone<br/>Widget: Input] --> PGA[PGA<br/>Widget: Amplifier]
    PGA --> ADC[ADC<br/>Widget: ADC]
    ADC --> DMA_IN[DMA Capture<br/>Widget: AIF IN]
    DMA_OUT[DMA Playback<br/>Widget: AIF OUT] --> DAC[DAC<br/>Widget: DAC]
    DAC --> MIX[Output Mixer<br/>Widget: Mixer]
    MIX --> HP[Headphone<br/>Widget: Output]
    MIX --> SPK[Speaker<br/>Widget: Output]

    style MIC fill:#4a4,color:#fff
    style PGA fill:#4a4,color:#fff
    style ADC fill:#4a4,color:#fff
    style DMA_IN fill:#4a4,color:#fff
    style DMA_OUT fill:#888,color:#fff
    style DAC fill:#888,color:#fff
    style MIX fill:#888,color:#fff
    style HP fill:#888,color:#fff
    style SPK fill:#888,color:#fff
\`\`\`

In this example, only the capture path is active (green). DAPM has automatically powered down the playback path (gray) — saving power without any application involvement.

## ⌨️ Do This

1. List audio devices: \`aplay -l\` (playback) and \`arecord -l\` (capture) — note the card and device numbers
2. Play a test tone: \`speaker-test -t sine -f 440 -c 2\` (440 Hz = concert A, stereo)
3. Inspect ALSA mixer controls: \`amixer -c 0 contents\` — look at volume controls, switches, and routes
4. Check audio server: \`pactl info\` or \`pw-cli info all\` to see if PipeWire or PulseAudio is managing audio
5. View DAPM widget states (if debugfs is mounted): \`cat /sys/kernel/debug/asoc/*/dapm_widgets\` — observe which widgets are powered up
6. Record and play back audio: \`arecord -f cd -d 5 test.wav && aplay test.wav\` — verify the round-trip works

## ⚠️ Gotcha

**DAPM silently mutes audio paths.** DAPM powers down unused audio routes automatically. If you cannot hear audio, it is often because DAPM determined the path is unused — a widget is not connected, or a mixer control is off. Use \`amixer\` to check that all controls in the audio path are enabled, and inspect DAPM widget states in debugfs. A common mistake: enabling the DAC output but forgetting to connect it to the output mixer via an ALSA route control.

**Machine drivers are board-specific glue and the usual source of audio bugs.** The platform (SoC I2S) and codec (audio chip) drivers are reusable, but the machine driver ties them together for your specific board's wiring. If audio does not work after a board revision, the machine driver is usually where the routing changed. Check the \`snd_soc_dapm_route\` array in the machine driver — it must match your schematic's audio connections exactly.

**Clock configuration is the hidden audio killer.** Audio codecs are extremely sensitive to clock accuracy. The I2S bit clock and frame sync must be derived from a master clock (MCLK) that is an exact multiple of the sample rate. A 48kHz stream needs MCLK = 12.288 MHz or 24.576 MHz. If your PLL configuration produces 12.000 MHz instead, audio will play at the wrong speed with subtle artifacts. Always verify MCLK with an oscilloscope or by checking the codec's clock error registers.

## 🛠️ Mini-Project

Map and document the complete audio subsystem on your machine:
1. Identify the audio codec chip: check \`dmesg | grep -i codec\`, \`dmesg | grep -i audio\`, or read the device tree
2. Draw the full audio pipeline: application to PipeWire/PulseAudio to ALSA to machine driver to platform (I2S) to codec to speaker/headphone
3. List all ALSA mixer controls with \`amixer -c 0 contents\` and document what each control does (volume, mute, route selection)
4. Record 5 seconds of audio and play it back — measure the round-trip latency using audacity or by recording a click
5. If on embedded hardware: read the machine driver source (search for \`SND_SOC_DAILINK_DEFS\`) and trace the DAPM widget connections
6. Create a diagram showing all DAPM widgets and their connections for your audio subsystem

## ✅ You've mastered this when…
- You understand the ALSA/ASoC three-driver architecture (machine, platform, codec)
- You know what DAPM does and can trace audio power management through widgets
- You can configure audio routing using ALSA mixer controls and verify in debugfs
- You understand the PulseAudio to PipeWire transition and why it matters for embedded
- You can debug "no audio" issues systematically: check connections, DAPM states, clocks, and mixer routes
- You know how I2S/TDM clocking works and why MCLK accuracy matters
`},

{id:'bsp-12',num:'12',title:'Camera & Multimedia',hours:10,phase:2,topics:['V4L2','ISP','Media controller','GStreamer'],content:`
## 🎯 Goal
Understand the Linux camera and multimedia stack — V4L2, media controller, ISP pipeline configuration, and video processing with GStreamer.

## 🧠 Camera Pipeline Architecture

\`\`\`mermaid
flowchart LR
    SENSOR[Camera Sensor<br/>Raw Bayer data<br/>MIPI CSI-2] --> CSI[CSI-2 Receiver<br/>Deserialize MIPI<br/>lanes]
    CSI --> ISP[Image Signal Processor<br/>Demosaic, denoise,<br/>AWB, AE, gamma]
    ISP --> SCALER[Scaler / Crop<br/>Resize output]
    SCALER --> ENC[Video Encoder<br/>H.264 / H.265<br/>Hardware codec]
    SCALER --> APP[V4L2 Application<br/>Capture frames]
    APP --> DISPLAY[Display / Stream]
\`\`\`

V4L2 (Video4Linux2) is the kernel framework for video capture and output devices. The Media Controller API describes the topology of complex pipelines where multiple processing blocks are connected.

**What the ISP does to raw sensor data:**
- **Demosaicing:** Convert Bayer pattern (RGGB) to full RGB pixels
- **White balance:** Correct color temperature (auto white balance = AWB)
- **Noise reduction:** Temporal and spatial denoising
- **Exposure control:** Auto-exposure (AE) adjusts sensor gain and integration time
- **Gamma correction:** Apply transfer curve for display-ready output
- **Lens correction:** Fix vignetting and distortion

## 🧠 Media Controller Topology

Complex camera systems have multiple processing blocks. The Media Controller API describes how they connect:

\`\`\`mermaid
flowchart TD
    SENS[Sensor Entity<br/>ov5647 0-0036] -->|pad 0 to pad 0| CSI[CSI-2 Receiver<br/>csi2rx]
    CSI -->|pad 1 to pad 0| ISP_IN[ISP Input<br/>rkisp1_isp]
    ISP_IN -->|pad 2 to pad 0| RSZ_MP[Main Path Resizer<br/>rkisp1_resizer_mainpath]
    ISP_IN -->|pad 3 to pad 0| RSZ_SP[Self Path Resizer<br/>rkisp1_resizer_selfpath]
    RSZ_MP -->|pad 1| VID_MP["/dev/video0<br/>Main capture"]
    RSZ_SP -->|pad 1| VID_SP["/dev/video1<br/>Self capture"]
    ISP_IN -->|pad 1| PARAMS["/dev/video2<br/>ISP parameters"]
    ISP_IN ---|pad 4| STATS["/dev/video3<br/>3A statistics"]
\`\`\`

You must configure each link and set formats on each pad before you can capture frames.

## ⌨️ Do This

1. List video devices: \`v4l2-ctl --list-devices\` — note which /dev/videoN is which
2. List supported formats: \`v4l2-ctl -d /dev/video0 --list-formats-ext\` — note resolution and pixel format
3. Query current format: \`v4l2-ctl -d /dev/video0 --get-fmt-video\` — check width, height, pixel format
4. Capture a single frame: \`v4l2-ctl -d /dev/video0 --stream-mmap --stream-count=1 --stream-to=frame.raw\`
5. If you have GStreamer: \`gst-launch-1.0 v4l2src device=/dev/video0 ! videoconvert ! autovideosink\` (camera preview)
6. Explore the media controller topology: \`media-ctl -d /dev/media0 -p\` (prints all entities, pads, and links)

## ⚠️ Gotcha

**The media controller topology must be configured before capture.** On complex camera systems (SoC with ISP), you cannot just open /dev/video0 and start capturing. You must first configure the media controller pipeline — set formats on each pad, link entities together with \`media-ctl\`. The format must be consistent across connected pads (output pad format must match input pad format). Forgetting this step results in \`EPIPE\` or garbage frames.

**Raw sensor data looks terrible without ISP processing.** A raw Bayer image from the sensor is a mosaic of single-color pixels (RGGB pattern). The ISP demosaics it into a full-color image and applies auto white balance, noise reduction, and exposure correction. Skipping the ISP means green-tinted, noisy, dim images that are unusable for any real application. Even "simple" USB webcams have an ISP built into the camera module.

**V4L2 buffer management is the source of most camera bugs.** V4L2 uses a queue-based model: you allocate buffers (\`VIDIOC_REQBUFS\`), enqueue them (\`VIDIOC_QBUF\`), start streaming (\`VIDIOC_STREAMON\`), and dequeue filled frames (\`VIDIOC_DQBUF\`). If you dequeue too slowly, the driver runs out of buffers and drops frames. If you do not re-enqueue after processing, the pipeline stalls.

## 🛠️ Mini-Project

Build a camera capture pipeline and analyze the data flow:
1. Connect a USB camera or create a virtual camera: \`sudo modprobe v4l2loopback\`
2. Capture 10 seconds of video using v4l2-ctl or a GStreamer pipeline
3. Build a GStreamer pipeline that captures video, resizes to 640x480, encodes to H.264, and saves to MP4: \`gst-launch-1.0 v4l2src num-buffers=300 ! videoconvert ! videoscale ! video/x-raw,width=640,height=480 ! x264enc ! mp4mux ! filesink location=out.mp4\`
4. Add a live preview branch using a tee element: split the pipeline into recording and display paths
5. Document the V4L2 format negotiation: what formats does the device support, which did GStreamer choose, and why?
6. Measure capture latency: compare the frame timestamp (\`v4l2-ctl --stream-mmap\` output) with wall-clock time

## ✅ You've mastered this when…
- You understand V4L2 and the media controller API and can configure a pipeline topology
- You can trace data flow through a camera pipeline from sensor to application
- You know what the ISP does and why raw Bayer sensor data needs processing
- You can build GStreamer pipelines for video capture, processing, and encoding
- You understand V4L2 buffer management (REQBUFS, QBUF, DQBUF, STREAMON)
- You can debug camera issues: no frames, green images, wrong resolution, dropped frames
`},

{id:'bsp-13',num:'13',title:'Connectivity',hours:10,phase:2,topics:['WiFi','Bluetooth','Cellular','mac80211','QMI'],content:`
## 🎯 Goal
Understand Linux connectivity stacks — WiFi (cfg80211/mac80211), Bluetooth (BlueZ), and cellular modem integration.

## 🧠 WiFi Stack Architecture

\`\`\`mermaid
flowchart TD
    APP[Application<br/>Browser, curl] --> NM[NetworkManager<br/>or wpa_supplicant]
    NM --> NL[nl80211<br/>Netlink interface]
    NL --> CFG[cfg80211<br/>Configuration layer<br/>Regulatory, scan, connect]
    CFG --> MAC[mac80211<br/>Software MAC layer<br/>Frame handling, queues]
    MAC --> DRV[WiFi Driver<br/>Hardware-specific<br/>e.g., ath10k, iwlwifi]
    DRV --> FW[Firmware<br/>Loaded from /lib/firmware/]
    FW --> HW[WiFi Chipset<br/>QCA9377, Intel AX200]
\`\`\`

**FullMAC vs SoftMAC — two driver architectures:**

| | FullMAC | SoftMAC |
|---|---------|---------|
| MAC layer | In firmware | In kernel (mac80211) |
| Driver complexity | Simple | More complex |
| Examples | Broadcom brcmfmac, Cypress | Intel iwlwifi, Qualcomm ath10k |
| Flexibility | Limited (firmware controls) | Full (kernel controls) |
| Debugging | Hard (firmware is opaque) | Easier (code is in kernel) |

## 🧠 Bluetooth Stack and Cellular Integration

\`\`\`mermaid
flowchart TD
    subgraph BT[Bluetooth Stack]
        BT_APP[Application] --> BLUEZ[BlueZ<br/>D-Bus API]
        BLUEZ --> HCI[HCI Core<br/>Host Controller Interface]
        HCI --> BT_DRV[BT Driver<br/>btusb, hci_uart]
        BT_DRV --> BT_HW[BT Chipset]
    end
    subgraph CELL[Cellular Stack]
        CELL_APP[Application] --> MM[ModemManager<br/>D-Bus API]
        MM --> QMI[QMI / AT Commands<br/>Modem protocol]
        QMI --> WWAN[WWAN Driver<br/>qmi_wwan, cdc_mbim]
        WWAN --> MODEM[Cellular Modem<br/>Quectel, Sierra]
    end
\`\`\`

**Bluetooth profiles relevant to embedded:**
- **A2DP:** Stereo audio streaming
- **HFP:** Hands-free calling
- **BLE/GATT:** Low-energy sensors and peripherals
- **SPP:** Serial port emulation

**Cellular modem interfaces:**
- **AT commands:** Legacy text-based control (Hayes command set)
- **QMI:** Qualcomm MSM Interface — binary protocol, more efficient
- **MBIM:** Mobile Broadband Interface Model — USB standard for cellular modems

## ⌨️ Do This

1. Scan WiFi networks: \`sudo iw dev wlan0 scan | grep -E "SSID|signal|freq"\`
2. Check WiFi driver and chipset: \`sudo iw dev wlan0 info\` — note the interface type, channel, and txpower
3. Check if your WiFi driver is FullMAC or SoftMAC: \`lsmod | grep mac80211\` — if loaded, your WiFi uses SoftMAC
4. List Bluetooth adapters: \`bluetoothctl show\` — check name, powered status, and supported features
5. Scan for Bluetooth devices: \`bluetoothctl\` then \`scan on\` — observe LE and BR/EDR devices discovered
6. Check firmware files: \`ls /lib/firmware/ath10k/\` or \`ls /lib/firmware/iwlwifi-*\` — these are the binary blobs your WiFi chip needs

## ⚠️ Gotcha

**Regulatory domain affects which WiFi channels and power levels are legal.** Different countries allow different frequency bands and transmission power. If your device ships globally, it must comply with local regulations. The Linux wireless regulatory database (\`wireless-regdb\` package, \`iw reg get\` to check current domain) handles this, but misconfiguration can make channels unavailable or violate regulations. Some chipsets have regulatory enforcement in firmware (world-roaming mode), while others rely entirely on the kernel.

**Firmware blobs are the hidden dependency.** Most WiFi and Bluetooth chipsets require proprietary firmware loaded by the kernel at runtime from \`/lib/firmware/\`. These binaries must match your kernel version and chipset revision. A firmware mismatch can cause silent failures — the device appears to work but drops packets or disconnects randomly. One product shipped with firmware v42 that caused random disconnects every 4 hours — downgrading to v41 fixed it, but the team spent weeks chasing the issue in the driver.

**Bluetooth coexistence with WiFi is non-trivial.** Many embedded modules combine WiFi and Bluetooth on the same chip (combo modules). They share the 2.4 GHz band and must coordinate via a coexistence protocol. If coexistence is not configured, WiFi throughput drops by 50%+ when Bluetooth audio is active. Check the vendor's coexistence driver/firmware and ensure the coex GPIO or UART signals are wired correctly on your board.

## 🛠️ Mini-Project

Set up a WiFi access point and Bluetooth scanner on Linux:
1. Install hostapd: \`sudo apt install hostapd dnsmasq\`
2. Configure hostapd.conf: set SSID, channel (avoid DFS channels for testing), WPA2 passphrase, hw_mode=g (2.4 GHz)
3. Set up DHCP for clients: configure dnsmasq to assign IP addresses on a dedicated subnet (e.g., 192.168.4.0/24)
4. Enable IP forwarding and NAT: \`echo 1 > /proc/sys/net/ipv4/ip_forward\` and \`iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE\`
5. Test: connect a phone to your AP, browse the web, measure throughput with iperf3
6. Write a Bluetooth LE scanner using \`bluetoothctl\` or the D-Bus API that discovers nearby BLE devices and reads their advertisement data

## ✅ You've mastered this when…
- You understand the WiFi stack layers (nl80211 to cfg80211 to mac80211 to driver)
- You know FullMAC vs SoftMAC and their implications for driver development and debugging
- You can configure Bluetooth using BlueZ and understand BLE vs classic profiles
- You understand cellular modem integration (QMI vs AT commands, ModemManager)
- You know about firmware dependencies and how to troubleshoot firmware loading issues
- You can set up a WiFi AP and debug connectivity issues using iw, wpa_cli, and kernel logs
`},

{id:'bsp-14',num:'14',title:'Power & Thermal Frameworks',hours:8,phase:2,topics:['cpufreq','cpuidle','Thermal','Suspend','PM runtime'],content:`
## 🎯 Goal
Work with Linux power and thermal management frameworks — cpufreq, cpuidle, thermal zones, system suspend/resume, and device PM runtime.

## 🧠 Power Management Architecture

\`\`\`mermaid
flowchart TD
    subgraph Kernel_PM[Kernel Power Management]
        GOV_F[cpufreq Governor<br/>schedutil, ondemand] --> CPUFREQ[cpufreq<br/>CPU frequency scaling]
        GOV_I[cpuidle Governor<br/>menu, TEO] --> CPUIDLE[cpuidle<br/>CPU idle state selection]
        GOV_D[devfreq Governor] --> DEVFREQ[devfreq<br/>Device freq scaling<br/>GPU, DDR, bus]
    end
    subgraph Thermal[Thermal Management]
        TZ[Thermal Zones<br/>CPU, GPU, battery] --> TGOV[Thermal Governor<br/>step_wise, power_allocator]
        TGOV --> COOL[Cooling Devices]
        COOL --> CPUFREQ
        COOL --> FAN[Fan Control]
        COOL --> DEVFREQ
    end
    subgraph Device_PM[Device PM]
        PM_RT[PM Runtime<br/>Per-device power] --> DRV[Device Drivers]
        SUSPEND[System Suspend<br/>suspend-to-RAM/disk] --> PM_RT
    end
\`\`\`

**cpufreq governors — when to use each:**

| Governor | Behavior | Use case |
|----------|----------|----------|
| performance | Always max frequency | Benchmarking, real-time |
| powersave | Always min frequency | Maximum battery life |
| ondemand | Scale based on CPU load | General desktop use |
| schedutil | Scheduler-integrated scaling | Modern default, best responsiveness |
| conservative | Like ondemand, slower ramp-up | Smooth frequency transitions |

## 🧠 System Suspend and PM Runtime

\`\`\`mermaid
sequenceDiagram
    participant USER as Userspace
    participant PM as PM Core
    participant DRV as Device Drivers
    participant HW as Hardware

    USER->>PM: echo mem > /sys/power/state
    PM->>PM: Freeze userspace processes
    PM->>DRV: Call suspend() for each device
    Note over DRV: Save state, disable interrupts
    DRV->>HW: Power down peripherals
    PM->>HW: CPU enters low-power state
    Note over HW: System sleeping...
    HW->>PM: Wake event (RTC, GPIO, USB)
    PM->>DRV: Call resume() for each device
    Note over DRV: Restore state, re-enable IRQs
    PM->>USER: Thaw userspace processes
\`\`\`

**PM Runtime** manages power for individual devices independently of system suspend. A driver calls \`pm_runtime_resume_and_get()\` before accessing hardware and \`pm_runtime_put_autosuspend()\` when done. (Reach for \`resume_and_get()\`, not the older \`pm_runtime_get_sync()\`: on failure \`get_sync()\` returns the error but *keeps* the usage count it took, so error paths that just return leak a reference and pin the device powered forever. \`resume_and_get()\` drops it for you.) The PM core powers the device down after a configurable idle timeout — no power wasted on devices not in active use.

\`\`\`bash
# PM runtime sysfs interface
cat /sys/devices/.../power/runtime_status     # active, suspended, unsupported
cat /sys/devices/.../power/autosuspend_delay_ms  # idle timeout before suspend
echo 5000 > /sys/devices/.../power/autosuspend_delay_ms  # set 5-second idle timeout
\`\`\`

## ⌨️ Do This

1. Check available cpufreq governors: \`cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_available_governors\`
2. See current frequency: \`cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq\` (in kHz)
3. List thermal zones and temperatures: \`for tz in /sys/class/thermal/thermal_zone*/; do echo "\$(cat \$tz/type): \$(cat \$tz/temp)"; done\` (millidegrees C)
4. Monitor CPU idle states: \`cat /sys/devices/system/cpu/cpu0/cpuidle/state*/name\` and \`cat /sys/devices/system/cpu/cpu0/cpuidle/state*/time\` (total time in each state)
5. Check PM runtime status for all devices: \`find /sys/devices -name runtime_status -exec sh -c 'echo "\$(dirname {}): \$(cat {})"' \\;\` (shows which devices are suspended)
6. Measure power impact: switch governor to performance vs powersave and observe CPU temperature change over 60 seconds

## ⚠️ Gotcha

**Aggressive thermal throttling masks performance bugs.** If your application is slow and the CPU frequency keeps dropping, the problem might not be thermal — it could be a runaway background process generating heat, or a cooling assembly that is not making proper contact. Always check CPU utilization (\`top\`, \`htop\`) alongside thermal data (\`/sys/class/thermal/\`) before blaming the thermal framework. One team redesigned their heatsink three times before discovering a firmware polling loop was burning 100% of one CPU core.

**Sleep state transitions have real costs.** Deep sleep states save more power but take longer to wake from. A device that enters C6 sleep (deep idle) during a real-time audio callback will miss its deadline and cause a glitch. Profile the wake latency of each idle state (\`cat /sys/devices/system/cpu/cpu0/cpuidle/state*/latency\` in microseconds) and configure the cpuidle governor's acceptable latency. For real-time workloads, set \`/dev/cpu_dma_latency\` to your deadline.

**Suspend/resume driver bugs are the hardest to reproduce.** A driver that works perfectly during normal operation may crash on resume because it does not properly restore hardware state. Common failures: re-enabling clocks in the wrong order, not re-initializing DMA descriptors, accessing registers before the power domain is up. Stress-test suspend/resume in a loop: \`for i in \$(seq 100); do echo mem > /sys/power/state; sleep 2; done\` — failures often appear only after 20+ cycles.

## 🛠️ Mini-Project

Create a thermal monitoring and analysis system:
1. Write a shell script that polls all thermal zones, CPU frequency, and current governor every second
2. Log to CSV: timestamp, temperature (each zone), CPU frequency, governor, CPU utilization
3. Run a CPU stress test (\`stress-ng --cpu \$(nproc) --timeout 120\`) and capture the full thermal profile
4. Plot temperature vs frequency vs time to visualize thermal throttling behavior
5. Experiment with different governors (performance vs schedutil vs powersave) — compare thermal profiles and throughput
6. Test suspend/resume: trigger system suspend, verify all devices resume correctly by checking dmesg for errors

## ✅ You've mastered this when…
- You can configure cpufreq governors and understand their trade-offs for different workloads
- You know how thermal zones and cooling devices interact through thermal governors
- You understand system suspend/resume lifecycle and PM runtime for individual devices
- You can debug power and thermal issues using sysfs, tracing, and thermal profiling
- You know how to set latency constraints for real-time workloads (/dev/cpu_dma_latency)
- You can stress-test suspend/resume and diagnose driver issues in the resume path
`},

{id:'bsp-15',num:'15',title:'Capstone — BSP Integration & Release',hours:12,phase:2,topics:['Validation','Porting','Release','Upstream'],content:`
## 🎯 Goal
Port a BSP to a new board, validate it systematically, and prepare for production release — the complete BSP engineering cycle from vendor silicon to shipping product.

## 🧠 BSP Porting Process

\`\`\`mermaid
flowchart LR
    REF[Reference BSP<br/>Vendor eval board] --> SCHEMATIC[Study target<br/>board schematic]
    SCHEMATIC --> DT[Write device tree<br/>Pin mux, peripherals]
    DT --> BOOT[Configure bootloader<br/>U-Boot board config]
    BOOT --> KERNEL[Enable kernel drivers<br/>defconfig + modules]
    KERNEL --> ROOTFS[Build root filesystem<br/>Buildroot or Yocto]
    ROOTFS --> FLASH[Flash and first boot<br/>Serial console debug]
    FLASH --> PERIPH[Bring up peripherals<br/>One by one]
    PERIPH --> VAL[Systematic validation<br/>Test every interface]
    VAL --> OPT[Optimization<br/>Boot time, power, size]
    OPT --> REL[Release Package<br/>Reproducible build]
\`\`\`

**Key porting steps in detail:**
1. **Study the schematic:** Identify every peripheral, its bus connection (I2C/SPI/UART), address, interrupt GPIO, and power supply enable pin
2. **Device tree:** Start from the SoC .dtsi, create your board .dts — enable only the peripherals your board has
3. **U-Boot:** Create a board defconfig, configure boot media (eMMC/SD/QSPI), set DRAM timing parameters
4. **Kernel:** Start with the vendor defconfig, add/remove configs for your board's specific peripherals
5. **Bring-up order:** UART console first (debug output), then storage, then network, then remaining peripherals

## 🧠 Validation Strategy and Release Engineering

\`\`\`mermaid
flowchart TD
    subgraph Validation[Systematic Validation]
        UNIT[Unit Tests<br/>kselftest, driver tests] --> INT_TEST[Integration Tests<br/>Peripheral interaction]
        INT_TEST --> STRESS[Stress Tests<br/>72+ hours continuous]
        STRESS --> POWER[Power Tests<br/>Suspend/resume cycles]
        POWER --> THERMAL[Thermal Tests<br/>Full load in enclosure]
        THERMAL --> FIELD[Field Tests<br/>Real environment]
    end
    subgraph Release[Release Package]
        SRC[Source Code<br/>Buildable, tagged] --> DOCS[Documentation<br/>Build guide, HW deps]
        DOCS --> IMAGES[Pre-built Images<br/>Flash-ready binaries]
        IMAGES --> TESTS[Test Results<br/>Pass/fail matrix]
        TESTS --> NOTES[Release Notes<br/>Known issues, changes]
    end
\`\`\`

**Upstream contribution process:** Getting your driver accepted into the mainline Linux kernel. Benefits: maintenance shifts to the community, your hardware works out-of-the-box in future kernels, and you gain credibility as an engineering team.

\`\`\`bash
# Upstream submission workflow
./scripts/checkpatch.pl --strict my-driver.patch    # Check coding style
./scripts/get_maintainer.pl my-driver.patch          # Find reviewers
git format-patch -1 --cover-letter                   # Generate patch email
git send-email --to=maintainer@kernel.org *.patch    # Send to mailing list
# Wait 1-2 weeks for review, address feedback, resend as v2, v3...
\`\`\`

## ⌨️ Do This

1. Clone a reference BSP for a development board: Raspberry Pi (\`github.com/raspberrypi/linux\`), BeagleBone (\`github.com/beagleboard/linux\`), or STM32MP1 (ST wiki)
2. Build the kernel from source following the vendor instructions — verify it boots (on hardware or QEMU)
3. Run kernel selftests: \`make -C tools/testing/selftests TARGETS=gpio run_tests\` — observe which tests pass and fail
4. Run the kernel coding style checker on any out-of-tree driver: \`./scripts/checkpatch.pl --file drivers/misc/my_driver.c\`
5. Measure boot time end-to-end: serial console timestamps from first character to login prompt
6. Create a peripheral test matrix: list every interface (I2C, SPI, UART, GPIO, USB, Ethernet, WiFi, display, audio) and verify each works

## ⚠️ Gotcha

**Upstream acceptance is slow — plan for it.** Getting a driver into the mainline kernel typically takes 3 to 6 months of review cycles. Reviewers are volunteers with limited bandwidth, and they will request multiple revisions. Start with small patches (documentation fixes, trivial cleanups, checkpatch warnings) to learn the process and build relationships with subsystem maintainers before submitting a full driver. One engineer submitted a complex DRM driver as their first patch — it went through 14 revisions over 8 months.

**"Works on my board" is not validation.** A BSP must be tested across: cold boot, warm boot, suspend/resume cycles (100+ iterations), all peripheral combinations simultaneously, and extended uptime (72+ hours under load). Intermittent bugs in clock configuration or power sequencing only appear under specific conditions — a DMA channel that corrupts data once every 10,000 transfers, a suspend/resume race condition that hits once every 50 cycles. Automate your test suite from day one with scripted tests and serial console monitoring.

**Release reproducibility is non-negotiable.** If you cannot rebuild the exact same BSP image from the same source six months later, you cannot do security patches, you cannot do regulatory re-certification, and you cannot debug field returns. Pin every dependency: kernel commit hash, toolchain version, Buildroot/Yocto manifest, firmware blob versions. Use \`repo manifest -r\` or git submodules to lock everything down. Store the toolchain binary alongside the source.

## 🛠️ Capstone Project

Full BSP integration exercise — the culmination of everything in this track:
1. Choose a target: Raspberry Pi 4, BeagleBone Black, STM32MP157-DK2, or QEMU ARM64 virt machine
2. Start with the vendor reference BSP — build and boot it unmodified to establish a baseline
3. Customize the device tree: add a device tree overlay for an I2C sensor and an SPI device (real or simulated)
4. Write a simple IIO driver for the I2C sensor — implement probe, read_raw, and device tree binding
5. Build a complete system image with Buildroot including your driver, a test application, and SSH access
6. Create an automated validation script that tests: boot success, I2C device detection (\`i2cdetect\`), sensor read, GPIO toggle, network connectivity, and 10 suspend/resume cycles
7. Measure and document boot time at each stage (U-Boot, kernel, userspace)
8. Package the release: source code (git tag), pre-built images, build instructions, test results, and release notes with known issues
9. Submit one small patch upstream — even a Documentation fix or checkpatch cleanup counts as experience with the process

## ✅ You've mastered the BSP track when…
- You can port a BSP to a new board starting from a vendor reference
- You have written and tested a real kernel driver (I2C/SPI sensor, GPIO, or similar)
- Your BSP boots reliably with all peripherals working and validated
- You understand the upstream contribution process and have submitted at least one patch
- You can hand your BSP to another engineer and they can build and boot it from your documentation alone
- You can create a reproducible release package with pinned dependencies and automated tests
`}
];
