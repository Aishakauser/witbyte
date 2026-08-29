export const HW_MODULES = [
{id:'hw-01',num:'01',title:'Digital Logic Fundamentals',hours:10,phase:0,topics:['Gates','Boolean','FSM','Flip-flops','Registers'],
content:`
## 🎯 Goal
Understand the building blocks of all digital hardware — logic gates, combinational and sequential circuits, and finite state machines.


## 📱 In Your Pocket, On Your Bench
**In your phone.** The SoC in your handset packs on the order of 15–20 billion transistors, and every one is wired into the gates on this page. When the touch controller decides a tap landed inside a button, that comparison bottoms out in XOR and AND a few nanometres wide. Its debounce logic — ignoring a finger that chatters on contact — is a finite state machine exactly like the ones you will build here.

**On your bench.** A Pi 5 will not let you probe its SoC's internal gates, but you can build the same logic on the GPIO header for the price of a coffee. Wire a 74HC00 quad NAND to pins 17, 27 and 22, then drive it:

\`\`\`bash
pinctrl set 17 op dh    # input A = 1
pinctrl set 27 op dl    # input B = 0
pinctrl get 22          # read the NAND output: expect 1
\`\`\`

NAND is functionally complete, so that one chip builds every other gate. Prove it: wire NOT, then AND, then OR, from nothing but those four NAND gates.

## 🧠 Logic Gates — The Atoms of Digital Hardware

Every digital circuit — from a calculator to a supercomputer — is built from a handful of primitive gates.

\`\`\`mermaid
flowchart LR
    subgraph "Basic Gates"
        AND[AND<br/>A·B]
        OR[OR<br/>A+B]
        NOT[NOT<br/>Ā]
    end
    subgraph "Derived Gates"
        NAND[NAND<br/>NOT AND]
        NOR[NOR<br/>NOT OR]
        XOR[XOR<br/>A⊕B]
    end
\`\`\`

**Boolean algebra** provides the mathematical foundation:
- \`A AND B\` = \`A · B\` — output 1 only when both inputs are 1
- \`A OR B\` = \`A + B\` — output 1 when either input is 1
- \`NOT A\` = \`Ā\` — inverts the input

**NAND is universal** — you can build any other gate from NAND gates alone, which is why CMOS libraries lean on it so heavily: a NAND cell needs only 4 transistors, against 6 for the equivalent AND.

Don't confuse this with NAND *flash*, which is unrelated. Flash is named for how its cells are wired: NAND flash strings cells in series (the shape of a NAND gate's transistor stack), giving high density and cheap sequential access; NOR flash wires them in parallel to the bit line, which costs area but allows random access — which is why NOR flash is what a boot ROM executes from directly.

### Combinational Circuits

Output depends *only* on current inputs (no memory):

| Circuit | What it does | Example |
|---------|-------------|---------|
| **Multiplexer (MUX)** | Select one of N inputs | 2:1 MUX: if sel=0, output=A; if sel=1, output=B |
| **Decoder** | N inputs → 2^N outputs (one-hot) | Address decoder in memory |
| **Adder** | Binary addition | Full adder: A + B + carry-in = sum + carry-out |
| **Comparator** | Compare two values | A > B, A = B, A < B |

### Sequential Circuits — Adding Memory

Output depends on current inputs AND previous state. Built from flip-flops.

\`\`\`mermaid
flowchart LR
    In[Input] --> CL[Combinational<br/>Logic]
    CL --> FF[Flip-Flops<br/>State storage]
    FF -->|feedback| CL
    CL --> Out[Output]
    CLK[Clock] --> FF
\`\`\`

**Flip-flop types:** D (stores data on clock edge), T (toggles), JK (set/reset/toggle), SR (set/reset).

**Registers** = group of flip-flops storing a multi-bit value. An 8-bit register = 8 D flip-flops.

### Finite State Machines (FSM)

A system with defined states and transitions:

\`\`\`mermaid
stateDiagram-v2
    [*] --> IDLE
    IDLE --> LOADING: start
    LOADING --> DONE: data_ready
    LOADING --> ERROR: timeout
    ERROR --> LOADING: retry
    DONE --> IDLE: reset
\`\`\`

**Every digital controller is an FSM** — traffic lights, vending machines, USB protocol engines, CPU instruction decoders.

## ⌨️ Do This

1. Build truth tables for AND, OR, XOR, NAND (pen and paper)
2. Simplify a Boolean expression using Karnaugh maps
3. Design a 4-bit counter FSM (pen and paper or simulator)
4. Try a logic simulator like Digital, Logisim, or Falstad's circuit simulator

## 🛠️ Mini-Project

Design a traffic light controller FSM:
1. Define the states: Green (30s) → Yellow (5s) → Red (30s) → repeat, plus a Pedestrian Walk (15s) state triggered by a crosswalk button
2. Draw the complete FSM state diagram with all transitions — label each edge with its trigger condition (timer expiry, button press) and output signals (R/Y/G lights, walk signal)
3. Create truth tables for next-state logic and output logic using binary-encoded states (2 flip-flops for 4 states)
4. Apply Karnaugh map simplification to the next-state equations and derive the minimal Boolean expressions
5. Implement the design in a simulator (Logisim, Digital, or Falstad) or write Verilog structural code with a clock divider for timing
6. Write a testbench that exercises every state transition, including edge cases: button pressed during Yellow, button held during Walk, rapid button presses

## ⚠️ Gotcha

**NAND gates being "universal" doesn't mean you should build everything from NAND gates.** In practice, synthesis tools optimize your design into the target technology's standard cell library. Understanding universality matters for theory and interview questions, not for actual chip design.

**FSM encoding matters more than you think.** Binary encoding uses fewer flip-flops but creates more complex combinational logic. One-hot encoding uses more flip-flops but simpler logic and faster state transitions. FPGAs prefer one-hot; ASICs often prefer binary. Pick wrong and your design fails timing.


## ✅ You've mastered this when…

- You can build any gate from NAND gates and explain why NAND is universal
- You understand the difference between combinational and sequential logic
- You can design a simple FSM with state diagram, truth table, and transitions
- You know what flip-flops are (D, T, JK, SR) and how registers are built from them
- You can simplify Boolean expressions using Karnaugh maps and apply De Morgan's laws
`},

{id:'hw-02',num:'02',title:'Computer Architecture',hours:12,phase:0,topics:['Pipeline','Cache','ISA','Branch prediction','Superscalar'],
content:`
## 🎯 Goal
Understand how a CPU executes instructions — the pipeline, cache hierarchy, and the techniques that make modern processors fast.


## 📱 In Your Pocket, On Your Bench
**In your phone.** Your handset has two or three *different* CPU designs on one die — a couple of big cores for burst work, several efficiency cores for everything else. Same instruction set, deliberately different pipelines: the big core reorders aggressively and speculates hard, the small one stays closer to in-order because that is what makes it cheap to run. When your phone gets warm and slows down, the scheduler is moving your work onto the small cores.

**On your bench.** The Pi 5's Cortex-A76 is a real out-of-order superscalar core, and you can watch the cache hierarchy on this page do its job:

\`\`\`bash
lscpu | grep -i cache          # 64K L1d, 512K L2 per core, 2M shared L3
perf stat -e cache-misses,cache-references,cycles,instructions ls
\`\`\`

Run \`perf stat\` on a tight loop over a small array, then over one larger than L2. The miss rate jumping is the memory hierarchy becoming visible in a number.

## 🧠 The CPU Pipeline

A CPU processes instructions in stages. Pipelining overlaps stages for different instructions:

\`\`\`mermaid
flowchart LR
    IF[Instruction<br/>Fetch] --> ID[Instruction<br/>Decode]
    ID --> EX[Execute]
    EX --> MEM[Memory<br/>Access]
    MEM --> WB[Write<br/>Back]
\`\`\`

| Clock cycle | Stage 1 | Stage 2 | Stage 3 | Stage 4 | Stage 5 |
|-------------|---------|---------|---------|---------|---------|
| 1 | Instr 1 | | | | |
| 2 | Instr 2 | Instr 1 | | | |
| 3 | Instr 3 | Instr 2 | Instr 1 | | |
| 4 | Instr 4 | Instr 3 | Instr 2 | Instr 1 | |
| 5 | Instr 5 | Instr 4 | Instr 3 | Instr 2 | Instr 1 |

**Pipeline hazards** — things that stall the pipeline:
- **Data hazard:** Instruction needs a result from the previous instruction
- **Control hazard:** Branch instruction — don't know which instruction comes next
- **Structural hazard:** Two instructions need the same hardware resource

**Branch prediction** guesses which way a branch will go (taken vs not taken) so the pipeline doesn't stall. Modern CPUs predict correctly ~95%+ of the time.

## 🧠 Cache Hierarchy

\`\`\`mermaid
flowchart TD
    CPU[CPU Core] --> L1[L1 Cache<br/>32-64 KB, ~1ns]
    L1 --> L2[L2 Cache<br/>256 KB-1 MB, ~5ns]
    L2 --> L3[L3 Cache<br/>4-64 MB, ~15ns<br/>Shared across cores]
    L3 --> RAM["Main Memory (DRAM)<br/>8-128 GB, ~60-100ns"]
    RAM --> Disk["Storage (SSD/HDD)<br/>~100μs-10ms"]
\`\`\`

Each level is bigger and slower than the one above, but the steps are uneven — roughly 5x from L1 to L2, 3x from L2 to L3, then a ~4x cliff into DRAM and a ~1000x cliff into storage. That last jump is the one that dominates: it is why a page fault costs more than every cache miss in a tight loop combined. The goal is to keep frequently used data in the fastest level that will hold it.

**Cache concepts:** Cache line (64 bytes typically), cache hit/miss, write-back vs write-through, associativity (direct-mapped, set-associative, fully associative), LRU eviction.

⚠️ **Gotcha — Cache-friendly code:** Accessing memory sequentially (array traversal) is dramatically faster than random access because it exploits spatial locality. This is why row-major vs column-major iteration order matters in matrix operations.

## ⌨️ Do This

1. Write two programs: one that traverses a 2D array by rows, one by columns. Benchmark both — the row-major version will be significantly faster due to spatial locality
2. Read your CPU specs (cores, cache sizes, clock speed) and understand what each means — use \`lscpu\` on Linux or check System Information on macOS/Windows
3. Use \`perf stat\` (Linux) to measure cache hits/misses for a program: \`perf stat -e cache-references,cache-misses ./your_program\`
4. Examine branch prediction: write a loop that processes a sorted vs unsorted array with an \`if\` branch — the sorted version is faster because the branch predictor learns the pattern

## ⚠️ Gotcha

**Cache-friendly code is not optional for performance-critical software.** Accessing memory sequentially (array traversal by rows in C) is dramatically faster than random access because it exploits spatial locality. A column-major traversal of a large matrix can be 10-50x slower than row-major. This is why data layout (Array of Structs vs Struct of Arrays) matters enormously in game engines, scientific computing, and database systems.

**Pipeline stalls from data hazards are invisible but expensive.** When instruction B depends on instruction A's result, the pipeline inserts "bubbles" (wasted cycles) until the result is ready. Hardware forwarding paths reduce but don't eliminate the cost. Compilers reorder instructions to hide latency, but hand-written assembly or intrinsics sometimes outperform the compiler in tight loops where every cycle counts.

## 🛠️ Mini-Project

Build a cache simulator in Python or C:
1. Implement a direct-mapped cache with configurable cache size (e.g., 1KB, 4KB, 16KB) and line size (e.g., 16, 32, 64 bytes)
2. Parse a trace file of memory addresses — generate one by instrumenting a simple C program or create synthetic patterns (sequential, strided, random)
3. Simulate cache lookups: compute tag, index, and offset for each address; track hits, misses (cold, conflict, capacity), and evictions
4. Add set-associative mode (2-way, 4-way) with LRU replacement and compare hit rates to direct-mapped
5. Produce a summary report: hit rate, miss rate breakdown by type, and a chart of hit rate vs cache size for each access pattern
6. Experiment: compare hit rates for row-major vs column-major matrix traversal and explain the difference

## ✅ You've mastered this when…

- You can trace an instruction through the 5-stage pipeline
- You understand pipeline hazards and how branch prediction helps
- You can draw the cache hierarchy and explain why it exists
- You know what cache-friendly code looks like and why it matters
- You can explain superscalar execution and out-of-order processing at a high level
`},

{id:'hw-03',num:'03',title:'Processor Architectures',hours:10,phase:0,topics:['ARM','RISC-V','x86','Cortex-A/R/M','ABI'],
content:`
## 🎯 Goal
Understand the major ISA families — ARM, RISC-V, x86 — their design philosophies, and how to read the processor landscape.


## 📱 In Your Pocket, On Your Bench
**In your phone.** Your applications processor is ARM A-profile, but it is far from the only CPU in the phone. The modem runs its own cores, the ISP has its own, the audio DSP another — each with an instruction set chosen for its job. "What CPU does my phone have?" has half a dozen right answers, and the one printed on the spec sheet is only the largest.

**On your bench.** You can hold both halves of the A-profile / M-profile split for about £60: a Pi 5 runs Cortex-A76 with an MMU and full Linux, while a Pico runs Cortex-M0+ with no MMU at all.

\`\`\`bash
uname -m                       # aarch64 on the Pi
cat /proc/cpuinfo | head -20   # implementer, architecture, part number
\`\`\`

That pair makes the "why won't Linux run on a Cortex-M?" gotcha concrete: it is not a speed problem, it is the missing MMU.

## 🧠 RISC vs CISC

\`\`\`mermaid
flowchart LR
    subgraph "RISC (ARM, RISC-V)"
        R1[Fixed-length instructions]
        R2[Simple operations]
        R3[Many registers]
        R4[Load/store architecture]
    end
    subgraph "CISC (x86)"
        C1[Variable-length instructions]
        C2[Complex operations]
        C3[Fewer registers]
        C4[Memory operands in ALU ops]
    end
\`\`\`

In practice, modern x86 CPUs decode CISC instructions into RISC-like micro-ops internally — the line has blurred significantly.

### ARM — Dominant in Mobile/Embedded

ARM doesn't make chips — it licenses designs. OEMs (Apple, Qualcomm, Samsung) customize and manufacture.

| Family | Profile | Use case |
|--------|---------|----------|
| **Cortex-A** | Application | Phones, tablets, laptops (high performance) |
| **Cortex-R** | Real-time | Automotive, industrial, storage controllers |
| **Cortex-M** | Microcontroller | IoT sensors, wearables, motor control |

### RISC-V — The Open Standard

Open-source ISA. Anyone can design a RISC-V chip without licensing fees. Growing rapidly in embedded, research, and increasingly in commercial products.

### Privilege Levels

\`\`\`mermaid
flowchart TD
    EL3[EL3 / Machine<br/>Secure firmware, TF-A] --> EL2[EL2 / Hypervisor<br/>Virtual machine management]
    EL2 --> EL1[EL1 / Supervisor<br/>OS kernel]
    EL1 --> EL0[EL0 / User<br/>Applications]
\`\`\`

Higher privilege = more hardware access. The kernel runs at EL1; your app runs at EL0 and must ask the kernel (via syscalls) to access hardware.

## ⌨️ Do This

1. Look up the processor in your phone — which Cortex-A cores does it use? Check the big.LITTLE or DynamIQ configuration (e.g., 1 x Cortex-X4 + 3 x Cortex-A720 + 4 x Cortex-A520)
2. Read the ARM Cortex-A78 technical reference manual introduction — note the pipeline depth, issue width, and supported instruction set extensions
3. Try the RISC-V online simulator (e.g., Venus or RARS): write a small program that adds two numbers using \`addi\`, \`add\`, \`lw\`, \`sw\` instructions
4. Compare calling conventions: look up the ARM AAPCS and RISC-V ABI — which registers are caller-saved vs callee-saved, and how are function arguments passed?

## 🛠️ Mini-Project

Write a comprehensive processor architecture comparison:
1. Select four architectures: ARM Cortex-A78, ARM Cortex-M4, a RISC-V core (e.g., SiFive U74), and x86-64 (e.g., Intel Alder Lake P-core)
2. For each, research and document: ISA type (RISC/CISC), instruction encoding length, register count, pipeline depth, typical clock speed, power envelope (TDP), and target market
3. Find 3 real commercial products using each architecture and note why that architecture was chosen for that product
4. Create a decision matrix: given requirements (battery-powered IoT sensor, smartphone, laptop, data center server), which architecture fits best and why?
5. Write a one-page summary explaining how the RISC vs CISC distinction has blurred in modern processors and what the real differentiators are today (ecosystem, licensing model, power efficiency, software compatibility)

## ⚠️ Gotcha

**"ARM" is not a single architecture.** Cortex-A (application), Cortex-R (real-time), and Cortex-M (microcontroller) are fundamentally different — different instruction sets, different privilege models, different use cases. Code compiled for Cortex-A won't run on Cortex-M. Always specify which ARM profile you're targeting.

**RISC-V is not automatically better than ARM.** RISC-V's advantage is the open ISA (no licensing fees), but the ecosystem (toolchains, verified IP, software libraries) is still maturing compared to ARM's 30+ years. For production products today, ARM is lower risk; RISC-V is the future bet.


## ✅ You've mastered this when…

- You can explain RISC vs CISC and why the distinction has blurred in modern processors
- You know the three ARM Cortex families (A, R, M) and when each is used
- You understand privilege levels (EL0-EL3 on ARM, Machine/Supervisor/User on RISC-V) and why they exist
- You can explain why RISC-V matters and where it's gaining traction
- You understand ABI and calling conventions and why code compiled for Cortex-A cannot run on Cortex-M
`},

{id:'hw-04',num:'04',title:'SoC Architecture',hours:12,phase:0,topics:['SoC','GPU','DSP','NPU','AXI/AHB','DMA'],content:`
## 🎯 Goal
Understand how a modern System-on-Chip is organized — CPU clusters, GPU, DSP, NPU, interconnect fabric, and how they communicate.


## 📱 In Your Pocket, On Your Bench
**In your phone.** The block diagram on this page *is* your phone's spec sheet, rearranged. CPU cluster, GPU, NPU, ISP, modem, video codecs, display controller — all on one die, arguing over one memory bus. That contention is why recording 4K while running a camera filter can drop frames: nothing is broken, the bus is just full.

**On your bench.** The Pi 5 is unusually good for this because it is visibly *two* chips: the BCM2712 SoC plus a separate RP1 I/O controller, joined by PCIe. Most of the peripherals you touch live on the far side of that link.

\`\`\`bash
lspci                          # the RP1 southbridge on the PCIe bus
vcgencmd get_config int | head # clocks and limits the firmware applied
\`\`\`

Very few boards let you \`lspci\` your own southbridge. Here the interconnect is not an abstraction in a diagram — it enumerates.

## 🧠 SoC Block Diagram

A System-on-Chip integrates what used to be separate chips onto a single die:

\`\`\`mermaid
flowchart TD
    subgraph "CPU Subsystem"
        CPU[CPU Cluster<br/>4x Cortex-A78 + 4x Cortex-A55]
        L3[Shared L3 Cache]
    end
    subgraph "Accelerators"
        GPU[GPU<br/>Graphics, compute]
        DSP[DSP<br/>Audio, signal processing]
        NPU[NPU / AI Engine<br/>Neural network inference]
        ISP[ISP<br/>Camera image processing]
    end
    subgraph "Connectivity"
        MODEM[5G Modem]
        WIFI[WiFi/BT]
    end
    subgraph "I/O & Memory"
        MC[Memory Controller<br/>LPDDR5]
        UFS[UFS Controller<br/>Storage]
        USB[USB Controller]
        PCIE[PCIe Controller]
    end
    CPU & GPU & DSP & NPU & ISP <--> NOC[Network-on-Chip<br/>Interconnect Fabric]
    NOC <--> MC & UFS & USB & PCIE & MODEM & WIFI
\`\`\`

### Interconnect — How Blocks Talk

**AMBA bus protocol family:**
- **AXI** (Advanced eXtensible Interface): High-performance, used for CPU-memory, GPU-memory
- **AHB** (Advanced High-performance Bus): Medium-performance peripherals
- **APB** (Advanced Peripheral Bus): Low-speed peripherals (GPIO, UART, timers)

**DMA (Direct Memory Access):** Allows peripherals to transfer data to/from memory without CPU involvement. Critical for high-bandwidth operations (camera, display, storage).

\`\`\`mermaid
sequenceDiagram
    participant CPU
    participant DMA
    participant Periph as Peripheral
    participant MEM as Memory
    CPU->>DMA: Configure transfer (src, dst, size)
    CPU->>CPU: Continue other work
    DMA->>Periph: Read data
    DMA->>MEM: Write data
    DMA->>CPU: Interrupt: transfer complete
\`\`\`

## ⌨️ Do This

1. Find the block diagram for a recent mobile SoC (Qualcomm Snapdragon 8 Gen 3, MediaTek Dimensity 9300, or Apple A17 Pro) from the vendor's whitepaper or press materials
2. Identify and label every major block: CPU cores (big/little configuration), GPU, DSP, NPU, modem, ISP, display controller, memory controller, and interconnect fabric
3. Calculate: if the NPU does 15 TOPS at INT8, how many 8-bit multiply-accumulate operations per second is that? What memory bandwidth (GB/s) would you need to keep it fed with operands?
4. Research AMBA protocol versions: compare AXI4 vs AXI5 — what features did AXI5 add (atomic transactions, cache stashing)? Identify which SoC blocks typically use AXI vs AHB vs APB

## 🛠️ Mini-Project

Design a complete SoC architecture for a hypothetical mobile chip:
1. Define the CPU cluster: choose a big.LITTLE configuration (e.g., 1x Cortex-X4 @ 3.3 GHz + 3x Cortex-A720 @ 2.8 GHz + 4x Cortex-A520 @ 2.0 GHz), specify L1/L2 per-core sizes and shared L3 cache size with justification
2. Add accelerators: GPU (specify shader core count and target performance tier), NPU (specify TOPS and supported data types), ISP (specify megapixel throughput), and audio DSP
3. Design the interconnect: assign each block to an AMBA bus level — AXI for high-bandwidth masters (CPU, GPU, NPU), AHB for medium peripherals, APB for low-speed control registers
4. Add I/O controllers: LPDDR5X memory controller (specify channels and total bandwidth), UFS 4.0 storage, USB 3.2, PCIe Gen4, MIPI CSI (camera) and DSI (display)
5. Specify DMA channels: which peripherals need DMA, what bandwidth does each require, and how do you prevent DMA contention on the interconnect?
6. Draw the complete block diagram with bus connections, clock domains, and power domains labeled

## ⚠️ Gotcha

**"TOPS" (tera operations per second) is a misleading NPU metric.** Vendors quote peak INT8 throughput, but real-world performance depends on memory bandwidth, model structure, and operator support. An NPU with 15 TOPS might only achieve 3 TOPS on your specific model because of memory-bound operations or unsupported layers falling back to CPU.

**DMA without cache management corrupts data.** When the DMA controller writes to memory, the CPU cache doesn't know about it. If the CPU reads that memory from cache, it gets stale data. You must invalidate the cache before reading DMA-written data and flush the cache before DMA reads CPU-written data.


## ✅ You've mastered this when…

- You can read an SoC block diagram and identify every major subsystem
- You understand the AMBA bus hierarchy (AXI > AHB > APB) and which blocks connect where
- You can explain DMA and why the CPU delegates data transfers to avoid wasting cycles
- You know the role of GPU, DSP, NPU, and ISP in a mobile SoC
- You understand Network-on-Chip interconnects and why they replaced simple shared buses
`},

{id:'hw-05',num:'05',title:'Memory Systems',hours:10,phase:1,topics:['DRAM','Flash','DDR5','MMU','Virtual memory'],content:`
## 🎯 Goal
Understand memory technologies (SRAM, DRAM, Flash), the memory management unit, and virtual memory — the abstraction that lets every process think it owns all of memory.


## 📱 In Your Pocket, On Your Bench
**In your phone.** Phones stack DRAM directly on top of the SoC (package-on-package) to keep the wires short and fast, which is also why phone RAM is never upgradeable. And phones do not swap to flash the way a laptop does — writes would wear the storage and burn battery — so when memory runs out, Android does not page, it *kills your background apps*. That is why your browser reloads the page when you switch back to it.

**On your bench.** The Pi has the same aversion to swap for the same reason, and you can watch virtual memory work:

\`\`\`bash
free -h                        # note how little swap, and why
cat /proc/meminfo | grep -i huge
\`\`\`

Write a loop striding through an array larger than L2 with increasing stride and time it. The step where throughput collapses is your TLB reach — the abstraction leaking exactly where this module says it will.

## 🧠 Memory Technologies

| Type | Speed | Density | Volatility | Use |
|------|-------|---------|------------|-----|
| SRAM | Very fast (~1ns) | Low | Volatile | CPU caches |
| DRAM | Fast (~60ns) | High | Volatile | Main memory (RAM) |
| NOR Flash | Medium | Low | Non-volatile | Boot ROM, firmware |
| NAND Flash | Medium | Very high | Non-volatile | Storage (SSD, eMMC, UFS) |

### DDR Generations

| Gen | Data rate | Key improvement |
|-----|-----------|----------------|
| DDR4 | up to 3200 MT/s | Mainstream desktop/server |
| DDR5 | 4800 MT/s at launch, now to 8800 | Higher bandwidth, on-die ECC |
| LPDDR5 | 6400 MT/s | Low power, mobile/laptop |
| LPDDR5X | to 9600 MT/s | Flagship phones, AI workloads |

Treat these as a moving ceiling, not a fixed spec — JEDEC keeps raising the top bin within a generation, and LPDDR6 is already specified. What stays true is the shape: LP variants trade peak throughput for a much lower idle power floor, which is why phones use them and servers don't.

## 🧠 Virtual Memory & MMU

The Memory Management Unit translates virtual addresses (what programs see) to physical addresses (actual RAM locations).

\`\`\`mermaid
flowchart LR
    CPU -->|virtual address| TLB{TLB hit?}
    TLB -->|yes| PA[Physical Address]
    TLB -->|no| PT[Page Table Walk]
    PT --> PA
    PA --> RAM[Physical RAM]
\`\`\`

This gives each process its own isolated address space, enables memory protection, and allows the OS to use more memory than physically available (paging to disk).

## 🧠 Memory Hierarchy — The Full Picture

\`\`\`mermaid
flowchart TD
    REG[CPU Registers<br/>~0.3ns, bytes] --> L1[L1 Cache<br/>~1ns, 32-64 KB]
    L1 --> L2[L2 Cache<br/>~5ns, 256 KB-1 MB]
    L2 --> L3[L3 Cache<br/>~15ns, 4-64 MB]
    L3 --> DRAM[DRAM / DDR5<br/>~60ns, 8-128 GB]
    DRAM --> NAND[NAND Flash / SSD<br/>~100us, 256 GB-8 TB]
    NAND --> HDD[HDD / Network<br/>~10ms, unlimited]
\`\`\`

Each level trades speed for capacity. The operating system and hardware conspire to keep the most-used data in the fastest tier — this is why understanding locality (temporal and spatial) is critical for writing fast software.

**DRAM refresh:** DRAM cells are tiny capacitors that leak charge. Every cell must be refreshed (re-read and re-written) every 64ms (standard) or 32ms (at high temperatures). This refresh steals memory bandwidth — at LPDDR5 speeds, refresh overhead can consume 5-15% of total bandwidth.

## ⌨️ Do This
1. Check your system's memory: \`sudo dmidecode -t memory\` (Linux) shows type, speed, rank, and capacity per DIMM
2. Monitor memory usage with \`top\` or \`htop\` — watch RSS vs virtual size; also try \`free -h\` to see total/used/available/cached breakdown
3. Write a program that allocates memory until the OS kills it — observe OOM behavior in \`dmesg | tail\`
4. Explore page tables: read \`/proc/self/pagemap\` with a small C program to translate a virtual address to a physical address and verify the MMU mapping

## ⚠️ Gotcha

**Virtual memory overhead is real on embedded.** Page table walks cost cycles and TLB misses are expensive. On memory-constrained embedded systems, consider hugepages (2MB or 1GB pages) to reduce TLB pressure, or run without an MMU entirely if your application doesn't need address translation. Cortex-M parts have no MMU — they have an **MPU**, which enforces access permissions on a handful of regions but does not translate addresses, so there is no per-process virtual address space. (The old \`uClinux\` project that targeted such parts is long defunct; MMU-less support lives in mainline under \`!CONFIG_MMU\`.) A TLB miss on a 4-level page table (x86-64) costs 4 sequential memory accesses — up to 240ns.

**DDR initialization is the most fragile part of board bring-up.** Getting DDR timing parameters wrong (tCAS, tRCD, tRP, tRAS) causes intermittent data corruption that's nearly impossible to debug. Use the silicon vendor's DDR training tools and never hand-tune timing parameters unless you really know what you're doing. One wrong value and your board passes basic tests but corrupts data under sustained load.

## 🛠️ Mini-Project

Explore virtual memory on your system:
1. Write a C program that allocates 1GB of memory with \`malloc()\` — check \`/proc/self/status\` for VmRSS vs VmSize before and after allocation (note: \`malloc\` doesn't allocate physical pages)
2. Touch every page (write one byte per 4KB) and watch RSS grow — use \`getrusage()\` to measure minor page faults
3. Use \`/proc/self/maps\` to see the virtual memory layout — identify stack, heap, shared libraries (\`.so\`), vDSO, and the kernel mapping
4. Write a program that causes an OOM kill and observe the kernel's OOM killer messages in \`dmesg\` — note which process was killed and why
5. Compare performance: allocate a large array and access it sequentially (stride=1) vs with stride=4096 (one access per page) — measure the TLB miss penalty with \`perf stat -e dTLB-load-misses\`

## ✅ You've mastered this when…
- You understand SRAM vs DRAM vs Flash and where each is used
- You can explain virtual memory, page tables, and the TLB
- You know what DDR generations mean and why bandwidth matters
- You understand MMU's role in memory protection and isolation
- You can explain DRAM refresh and why it affects system performance
- You know the difference between VmSize and VmRSS and what page faults mean
`},

{id:'hw-06',num:'06',title:'Bus Protocols & Interfaces',hours:12,phase:1,topics:['I2C','SPI','UART','PCIe','USB','MIPI'],content:`
## 🎯 Goal
Understand the major communication protocols used in embedded systems — when to use each, their trade-offs, and how to read timing diagrams.


## 📱 In Your Pocket, On Your Bench
**In your phone.** Every protocol here is in your pocket right now. The camera talks MIPI **CSI-2** to the ISP; the display comes back over **DSI**; the accelerometer, magnetometer and battery gauge sit on **I2C** because they are slow and cheap; the SIM speaks **ISO 7816**. Each bus was chosen against the trade-off table above — pin count against bandwidth against distance.

**On your bench.** A Sense HAT puts four I2C devices on one bus for about £30, and \`i2cdetect\` shows you the addresses on the wire:

\`\`\`bash
sudo apt install -y i2c-tools
i2cdetect -y 1                 # 7-bit addresses, the unshifted form
\`\`\`

Remember the shift: an address shown here as 0x5F goes out on the wire as 0xBE to write. Put a £10 logic analyzer on SDA and SCL, decode a transfer in PulseView, and you will see the shifted byte rather than the datasheet one.

## 🧠 Serial Protocols Comparison

| Protocol | Wires | Speed | Topology | Use case |
|----------|-------|-------|----------|----------|
| UART | 2 (TX/RX) | ~115Kbps–1Mbps | Point-to-point | Debug console, GPS, Bluetooth |
| I2C | 2 (SDA/SCL) | 100K–3.4Mbps | Multi-device bus | Sensors, EEPROM, small peripherals |
| SPI | 4 (MOSI/MISO/SCK/CS) | Up to 100Mbps+ | Host–peripheral | Flash, displays, ADC/DAC |
| PCIe | Differential pairs | Gen5: ~3.9 GB/s per lane | Point-to-point lanes | GPU, NVMe SSD, network cards |
| USB | 2-4 | USB3: 5-20 Gbps | Host-device tree | Everything external |

**Read PCIe numbers carefully.** Marketing quotes aggregate bandwidth; datasheets quote per-lane. Gen5 runs 32 GT/s per lane, which after 128b/130b encoding is about **3.9 GB/s per lane per direction**. The widely-quoted "128 GB/s" is a x16 link counting both directions at once — a different quantity by a factor of 32. Gen6 (2022) and Gen7 (2025) are also specified now.

\`\`\`mermaid
flowchart LR
    subgraph "Low-speed bus"
        I2C[I2C Bus] --- S1[Sensor 1]
        I2C --- S2[Sensor 2]
        I2C --- S3[EEPROM]
    end
    subgraph "High-speed point-to-point"
        SPI[SPI] --- Flash[Flash Memory]
        PCIE[PCIe x4] --- SSD[NVMe SSD]
    end
\`\`\`

### I2C Transaction — What Happens on the Wire

\`\`\`mermaid
sequenceDiagram
    participant M as Controller
    participant S as Target at 0x48
    M->>S: START condition
    M->>S: Address byte 0x90 = 0x48 shifted left, R/W=0
    S->>M: ACK
    M->>S: Register address 0x00 = temperature
    S->>M: ACK
    M->>S: Repeated START
    M->>S: Address byte 0x91 = 0x48 shifted left, R/W=1
    S->>M: ACK
    S->>M: Data byte (temperature MSB)
    M->>S: ACK
    S->>M: Data byte (temperature LSB)
    M->>S: NACK (end of read)
    M->>S: STOP condition
\`\`\`

**The address is shifted, and this trips up nearly everyone.** A datasheet advertising "I2C address 0x48" means a *7-bit* address. On the wire the controller sends one byte: the 7 address bits shifted left, with the read/write bit in the low position. So 0x48 goes out as **0x90** to write and **0x91** to read. Linux tools and the kernel API take the unshifted 7-bit form (\`i2cdetect\` shows 0x48); a logic analyzer shows you the shifted byte. If a device appears in \`i2cdetect\` but your bare-metal driver never gets an ACK, the missing shift is the first thing to check.

Pull-up resistors (typically 4.7K ohm for 100kHz, 2.2K ohm for 400kHz) are required on both SDA and SCL — I2C uses open-drain signaling. Missing or wrong pull-ups is the number one cause of I2C failures.

**A note on naming:** NXP's I2C specification moved to *controller/target* in Rev. 7, and the Linux kernel has followed. Older datasheets and much existing code still say master/slave — you will meet both, and they mean the same thing.

## ⌨️ Do This
1. Read the I2C specification summary — understand START, STOP, ACK/NACK conditions and how the address byte encodes the R/W bit
2. Look at SPI timing: CPOL/CPHA modes (Mode 0-3) determine when data is sampled vs shifted — draw the timing diagram for Mode 0 (CPOL=0, CPHA=0)
3. Compare USB generations: USB 2.0 (480 Mbps), USB 3.0 (5 Gbps), USB 3.2 Gen2x2 (20 Gbps), USB4 (40 Gbps; 80 Gbps only in USB4 Version 2.0) — note how the connector and cable requirements change, and how little the marketing names tell you
4. On a Linux system with I2C devices, run \`i2cdetect -y 1\` to scan the bus and list connected device addresses (Raspberry Pi or any embedded Linux board)

## ⚠️ Gotcha

**I2C's "simplicity" hides real problems.** Two wires sounds great until you hit: bus capacitance limits (400 pF max for standard mode — long wires = slow clock), address collisions (only 7 bits = 128 addresses, minus reserved), no error correction (a NACK is all you get), and clock stretching (a slow slave holds the entire bus hostage). For anything high-bandwidth, use SPI. For anything safety-critical, add a watchdog on the bus.

**USB enumeration failures are the most common "it doesn't work" complaint.** USB is incredibly complex under the hood — device descriptors, endpoint configuration, power negotiation (USB-PD), and class-specific protocols. A device that works on one host might fail on another due to timing differences in the enumeration sequence. Use a USB protocol analyzer (even a software one like Wireshark with USBPcap, or \`usbmon\` on Linux) to debug enumeration issues.

## 🛠️ Mini-Project

Build a protocol comparison chart and bus debugging guide:
1. Research the actual specifications for I2C, SPI, UART, USB, and MIPI — document wire count, maximum speed, maximum bus length, maximum devices, error detection, and power delivery capability
2. Create a decision flowchart: given a peripheral type (temperature sensor, 2MP camera, TFT display, NVMe storage, audio codec), determine which protocol fits and why
3. Find a real product teardown (iFixit) and identify which protocols connect which components — note where MIPI CSI connects the camera and MIPI DSI connects the display
4. Write a step-by-step I2C debugging checklist: verify pull-up resistor values with a multimeter, check signal integrity with an oscilloscope (the spec allows rise times up to 1000ns in Standard-mode at 100kHz, tightening to 300ns in Fast-mode at 400kHz and 120ns in Fast-mode Plus at 1MHz), scan for devices with \`i2cdetect\`, decode a transaction with a logic analyzer (Sigrok/PulseView)
5. Design a sensor board: connect 3 I2C sensors (temperature, humidity, accelerometer), 1 SPI display, and 1 UART GPS module to an MCU — draw the schematic with pull-ups, chip selects, and level shifters where needed

## ✅ You've mastered this when…
- You can pick the right protocol for a given peripheral and justify the choice
- You understand I2C addressing, pull-up requirements, and SPI chip select
- You can read and interpret a timing diagram from a datasheet
- You know the difference between MIPI CSI (camera) and DSI (display)
- You can diagnose common I2C/SPI failures (missing pull-ups, wrong clock polarity, address conflicts)
`},

{id:'hw-07',num:'07',title:'Clock, Power & Reset',hours:10,phase:1,topics:['PLL','Clock tree','CDC','DVFS','Power gating'],content:`
## 🎯 Goal
Understand clock generation and distribution, power domains, and reset sequences — the infrastructure that keeps a chip running.


## 📱 In Your Pocket, On Your Bench
**In your phone.** Your handset runs two crystals, not one: a fast reference (often 38.4 MHz) that PLLs multiply up for the CPU and modem, and a tiny 32.768 kHz one that keeps running while the phone is "off". That slow crystal is why the clock is right when you wake it, and why a phone in your pocket can still wake for a page from the network — the fast domain is powered down, the slow one never stops.

**On your bench.** DVFS is directly observable on a Pi 5:

\`\`\`bash
vcgencmd measure_clock arm     # idle, then under load
vcgencmd measure_volts core
\`\`\`

Run those in a loop, start a busy loop on all four cores, and watch frequency *and* voltage climb together — the V and f of the power equation above, moving in real time.

## 🧠 Clock Generation

\`\`\`mermaid
flowchart LR
    XTAL[Crystal Oscillator<br/>e.g., 38.4 MHz] --> PLL[PLL<br/>Phase-Locked Loop]
    PLL --> DIV1[Divider → CPU Clock<br/>2.8 GHz]
    PLL --> DIV2[Divider → Bus Clock<br/>800 MHz]
    PLL --> DIV3[Divider → Peripheral Clock<br/>100 MHz]
\`\`\`

A PLL takes a low reference frequency and multiplies it up. Clock dividers then create the frequencies each subsystem needs.

**Clock domain crossing (CDC)** is one of the trickiest problems in chip design — when data crosses between two clock domains, metastability can corrupt it. Solutions: synchronizer flip-flops, FIFOs, handshake protocols.

## 🧠 DVFS — Dynamic Voltage and Frequency Scaling

Dynamic power ∝ Voltage² × Frequency. Lowering both during light workloads is therefore far more effective than lowering frequency alone — frequency buys you a linear saving, voltage a quadratic one.

The "cubic" shorthand you'll often hear assumes voltage scales linearly with frequency, which held in the classical-scaling era but does not at modern operating points: near the minimum voltage a transistor needs to switch reliably, you can keep dropping frequency but you cannot keep dropping voltage. Past that knee the saving degrades toward linear, and static leakage — which DVFS does not address at all — starts to dominate the budget.

**Power gating** goes further — entire blocks are powered off when unused (GPU off when the screen is locked, for example).

## 🧠 Reset Sequence

Reset is not instantaneous — blocks must be brought up in a specific order. Power-on-reset (POR) initializes the entire chip, but warm resets can target individual subsystems.

\`\`\`mermaid
flowchart TD
    POR[Power-On Reset] --> PWR["Power domains ramp<br/>Regulators reach target voltage"]
    PWR --> CLK["Clocks start<br/>PLL locks, ~50-200us"]
    CLK --> CPU["CPU released from reset<br/>Executes boot ROM from on-chip SRAM"]
    CPU --> MEM["Boot ROM / SPL trains DDR<br/>Software running on the CPU"]
    MEM --> PERIPH["Peripheral resets released<br/>Each after its own clock is stable"]
\`\`\`

Two things about this order are worth pinning down, because both are commonly taught backwards.

**Rails before clocks.** A PLL cannot lock to a stable frequency until its supply is at the target voltage. Power sequencing comes first; clock stabilization follows.

**The CPU runs before DRAM works.** DDR training — calibrating the timing and impedance of the DRAM link — is not done by hardware. It is *software*, executing on the CPU, out of on-chip SRAM or ROM where no training is needed. So the CPU necessarily comes out of reset before DRAM is usable, and the first instruction fetch is never from DRAM. This is the same sequence \`bsp-02\` traces from the software side: Boot ROM loads SPL into SRAM precisely because DRAM isn't available yet.

**Reset order still matters** for peripherals: releasing a peripheral's reset before its clock is stable leaves undefined register values, and it is a genuinely nasty bug because it usually appears intermittently.

## ⌨️ Do This

1. Check your system's clock sources: \`cat /sys/devices/system/clocksource/clocksource0/available_clocksource\` — common sources are TSC (x86), arch_sys_counter (ARM), HPET
2. Monitor CPU frequency scaling in real-time: \`watch -n1 "cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_cur_freq"\` — observe DVFS in action as load changes
3. Read about PLL lock time — why does a PLL need 50-200us to stabilize after changing frequency? (Hint: the feedback loop needs time to converge on the target phase)
4. Search for "clock domain crossing bug" case studies — these are some of the hardest bugs in chip design and often only manifest at specific temperatures or voltages

## ⚠️ Gotcha

**Clock domain crossing (CDC) bugs are the silent killers of chip design.** A CDC bug causes metastability — a flip-flop output hovers between 0 and 1 for an indeterminate time, producing unpredictable results downstream. These bugs are intermittent, temperature-dependent, and nearly impossible to reproduce in simulation because simulators model flip-flops as ideal. Proper CDC verification (formal tools like Synopsys CDC Compiler or Cadence JasperGold) is non-negotiable in production designs.

**Disabling a clock without quiescing the block first corrupts state.** If a hardware block is mid-transaction (e.g., an AXI bus transfer) when its clock is gated, registers and FIFOs are left in an inconsistent state. Always ensure the block is idle (check a status register) before gating its clock, and re-initialize state after ungating. The Linux kernel's runtime PM framework handles this for well-written drivers.

## 🛠️ Mini-Project

Design a clock tree for a hypothetical SoC:
1. Start with a 24 MHz crystal oscillator — specify the oscillator load capacitance and tolerance
2. Design PLLs and dividers to generate: 1.8 GHz (CPU), 800 MHz (GPU), 200 MHz (bus), 48 MHz (USB), 100 MHz (Ethernet), 32.768 kHz (RTC) — calculate the PLL multiplier and divider values for each output
3. Identify which blocks are in different clock domains and list every domain boundary
4. For each domain crossing, specify the synchronization method: 2-FF synchronizer (single-bit signals), async FIFO (multi-bit data streams), or handshake protocol (control paths)
5. Draw the complete clock tree diagram with PLL lock times and specify the reset release sequence — which clocks must be stable before each block's reset is deasserted
6. Add DVFS operating points for the CPU: specify at least 3 voltage/frequency pairs (e.g., 0.7V/600MHz, 0.85V/1.2GHz, 1.0V/1.8GHz) and estimate relative power at each

## ✅ You've mastered this when…
- You understand PLLs, clock trees, and clock domain crossing
- You can explain DVFS and why power scales with voltage squared
- You know what power domains and power gating are
- You understand reset sequences and why reset order matters
- You can identify clock domain boundaries and specify the correct synchronization method
`},

{id:'hw-08',num:'08',title:'Peripherals & I/O',hours:8,phase:1,topics:['Timers','Watchdog','DMA','TrustZone','Crypto'],content:`
## 🎯 Goal
Understand common SoC peripherals — timers, watchdogs, DMA controllers, and security hardware (TrustZone, crypto engines).


## 📱 In Your Pocket, On Your Bench
**In your phone.** Your fingerprint never leaves the secure world. It is captured, converted to a template and matched inside a separate secure processor — Secure Enclave on Apple, Titan M on Pixel, a TrustZone secure OS elsewhere — and the application processor running Android or iOS only ever receives a yes or no. That is the isolation model on this page, shipped a billion times over: the untrusted side never holds the secret, so compromising it does not leak the biometric.

**On your bench.** The Pi is a useful *negative* example. Its SoC has TrustZone, but the stock software stack runs no secure OS, so there is no secure world to talk to — one reason a Pi is a poor fit for a product that must protect keys. The watchdog, though, is real and worth meeting:

\`\`\`bash
ls -l /dev/watchdog*
cat /sys/class/watchdog/watchdog0/timeout
\`\`\`

Open it, stop petting it, and the board reboots — the failure mode this module exists to teach.

## 🧠 Key Peripherals

**Timers:** Generate precise time intervals, PWM signals, measure pulse widths. Every RTOS scheduler depends on a hardware timer.

**Watchdog timer:** A countdown timer that resets the system if software doesn't periodically "pet" it. Catches software hangs.

\`\`\`mermaid
flowchart LR
    SW[Software] -->|periodic kick| WDT[Watchdog Timer]
    WDT -->|timeout!| RST[System Reset]
\`\`\`

**ARM TrustZone:** Hardware partitioning of the SoC into Secure and Non-Secure worlds. Secure world runs trusted firmware (keys, biometrics, DRM). Normal world runs the OS and apps.

\`\`\`mermaid
flowchart LR
    subgraph "Normal World (EL0/EL1)"
        APP[Applications] --> OS[Linux / Android]
    end
    subgraph "Secure World (S-EL0/S-EL1)"
        TA[Trusted Apps<br/>Biometrics, DRM] --> TEE[Trusted OS<br/>OP-TEE, Trusty]
    end
    OS -->|SMC call| MON[Secure Monitor<br/>EL3 / TF-A]
    TEE -->|SMC return| MON
    MON --- OS
    MON --- TEE
\`\`\`

**Crypto engines** provide hardware acceleration for AES-256, SHA-256, RSA-2048, and ECC operations. Software implementations of AES-256 run at ~50 MB/s; hardware engines achieve 1-10 GB/s. This matters for full-disk encryption, TLS handshakes, and secure boot signature verification.

## ⌨️ Do This

1. Check your system's watchdog: \`ls /dev/watchdog*\` — if present, read its timeout: \`cat /sys/class/watchdog/watchdog0/timeout\`
2. List hardware timers: \`ls /sys/devices/system/clockevents/\`
3. Read about ARM TrustZone: what runs in the Secure world on your phone? (Hint: biometrics, DRM keys, secure boot verification)
4. Check if your CPU has crypto acceleration: \`cat /proc/cpuinfo | grep -i aes\`

## ⚠️ Gotcha

**A watchdog that's too aggressive causes boot loops.** If the watchdog timeout is shorter than your boot time, the system resets before it finishes booting. Always disable or extend the watchdog during development, and set a production timeout that accounts for the worst-case boot time plus margin.

**TrustZone isn't magic security.** It provides hardware isolation, but a bug in your Trusted Application (TA) running in the Secure world is worse than a bug in userspace — it compromises the entire security foundation. Secure world code must be minimal, audited, and formally verified where possible.

## 🛠️ Mini-Project

Design the peripheral subsystem for a smart home sensor hub:
1. List required peripherals: temperature/humidity sensor (I2C), motion sensor (GPIO interrupt), display (SPI), WiFi (SDIO), real-time clock, watchdog, crypto engine
2. Assign each to appropriate bus protocols with justification
3. Design the watchdog strategy: timeout value, kick frequency, recovery action on timeout
4. Specify TrustZone partitioning: what goes in Secure world (WiFi credentials, OTA signature verification) vs Normal world
5. Draw the complete block diagram with interrupt routing

## ✅ You've mastered this when…
- You understand timers, watchdogs, and their role in embedded systems
- You can explain TrustZone's Secure/Non-Secure world split and the role of the Secure Monitor
- You know what crypto engines accelerate (AES, SHA, RSA) and why hardware acceleration matters
- You can design a watchdog strategy with appropriate timeout, kick frequency, and recovery action
- You understand PWM output, input capture, and how timer peripherals generate and measure signals
`},

{id:'hw-09',num:'09',title:'RTOS & Real-Time Systems',hours:10,phase:2,topics:['RTOS','FreeRTOS','Zephyr','Scheduler','Mutex'],content:`
## 🎯 Goal
Understand real-time operating systems — task scheduling, synchronization primitives, and the difference between hard and soft real-time.


## 📱 In Your Pocket, On Your Bench
**In your phone.** Your handset runs a general-purpose OS and a hard real-time system side by side on the same die. Android tolerates a late frame; the cellular modem does not — miss a transmit slot and you drop off the network. So the modem runs its own RTOS on its own cores, isolated from Linux entirely. This is the usual answer in practice: not RTOS *or* Linux, but both, each handling what it is good at.

**On your bench.** A Pico plus FreeRTOS or Zephyr gives you the deterministic side for a few pounds, and a Pi lets you measure the other:

\`\`\`bash
uname -v | grep -i preempt     # does this kernel have RT preemption?
chrt -f 80 ./your_loop         # run under SCHED_FIFO priority 80
\`\`\`

Time a loop with and without \`chrt\` while the machine is loaded. The worst-case number, not the average, is the one that matters.

## 🧠 RTOS vs General-Purpose OS

| | RTOS | Stock Linux | Linux with PREEMPT_RT |
|---|------|---------------|---|
| Scheduling | Deterministic, priority-based | Best-effort, time-sharing | Priority-based, preemptible |
| Typical worst-case latency | Single-digit microseconds | Milliseconds, unbounded tail | Tens of microseconds |
| Memory | Static allocation | Dynamic (malloc) | Dynamic, but lock pages with \`mlockall\` |
| Use case | Motor control, sensor reading | Desktop, server | Industrial control, audio, robotics |

**Hard real-time:** Missing a deadline is a system failure (airbag, pacemaker).
**Soft real-time:** Missing a deadline degrades quality (video streaming, UI responsiveness).

**"Linux can't do real-time" is out of date.** PREEMPT_RT — the patch set that makes almost all kernel code preemptible and converts spinlocks to sleeping mutexes — was **merged into mainline in Linux 6.12**, after roughly two decades out of tree. A tuned PREEMPT_RT system reaches tens of microseconds of worst-case latency, which is enough for a great many jobs once reserved for a dedicated RTOS.

That does not make the distinction disappear. An RTOS still wins on the smallest, most constrained parts (a Cortex-M with kilobytes of RAM will not run Linux at all) and where you must *prove* a bound for certification. The honest modern question is not "RTOS or Linux?" but "is my deadline tight enough, and my certification burden heavy enough, to need an RTOS?"

\`\`\`mermaid
flowchart TD
    SCH[Scheduler] --> T1[Task 1<br/>Priority: High<br/>Period: 1ms]
    SCH --> T2[Task 2<br/>Priority: Medium<br/>Period: 10ms]
    SCH --> T3[Task 3<br/>Priority: Low<br/>Period: 100ms]
    T1 -.->|preempts| T2 & T3
\`\`\`

**Priority inversion:** A low-priority task holds a resource a high-priority task needs. The high-priority task waits, effectively running at low priority. Solution: priority inheritance protocol.

\`\`\`mermaid
sequenceDiagram
    participant H as High Priority Task
    participant M as Medium Priority Task
    participant L as Low Priority Task
    participant MX as Mutex

    L->>MX: Lock mutex
    Note over L: Working with shared resource
    H->>MX: Try lock mutex (BLOCKED!)
    Note over H: Waiting for L to release
    M->>M: Runs freely (preempts L)
    Note over M: M runs instead of H!
    Note over H: H is effectively running<br/>at L's priority = INVERSION
    M->>M: Done
    L->>MX: Unlock mutex
    H->>MX: Lock mutex (finally!)
    H->>H: Runs at high priority again
\`\`\`

**Key RTOS primitives:** Mutexes (mutual exclusion, supports priority inheritance), semaphores (counting, signaling between tasks), message queues (inter-task communication with data), event flags (lightweight signaling).

## ⌨️ Do This

1. Download FreeRTOS source code and read \`tasks.c\` — understand how the scheduler works
2. Read about Zephyr RTOS — compare its architecture to FreeRTOS
3. Experiment with task priorities: what happens when a high-priority task never yields? (Answer: lower-priority tasks starve)
4. Calculate schedulability: given 3 periodic tasks with known periods and execution times, use Rate Monotonic Analysis to check if they're schedulable

## ⚠️ Gotcha

**Priority inversion nearly ended the Mars Pathfinder mission.** In 1997 the Pathfinder *lander's* VxWorks computer began resetting repeatedly on the Martian surface: a low-priority meteorological task held a mutex on the information bus that a high-priority bus-management task needed, and a medium-priority communications task ran instead of either. The bus task missed its deadline, the watchdog fired, and the system reset — losing a day of science each time. (Sojourner, the rover, was a separate vehicle and was not involved.)

Two details make this the canonical real-time bug. First, it was never reproduced before launch — it only appeared under the exact timing of a loaded system. Second, JPL fixed it *from Earth*: the priority-inheritance flag already existed in the VxWorks mutex, so they uploaded a patch flipping it on. Nothing was lost and the mission succeeded — but the reset loop is what priority inversion looks like in the field.

**"Real-time" doesn't mean "fast."** It means "deterministic." A real-time system that responds in exactly 10ms every time is better than one that usually responds in 1ms but occasionally takes 100ms. Worst-case execution time (WCET) matters more than average-case.

## 🛠️ Mini-Project

Build a multi-task RTOS application (use FreeRTOS or Zephyr on a real board or simulator):
1. Create 3 tasks: a sensor reader (high priority, 100ms period), a display updater (medium priority, 500ms period), and a logging task (low priority, 1s period)
2. Add a shared resource (a global data structure) protected by a mutex
3. Demonstrate priority inversion: make the low-priority task hold the mutex while the high-priority task waits
4. Enable priority inheritance and show that the inversion is resolved
5. Measure actual task execution timing and compare to your WCET estimates

## ✅ You've mastered this when…
- You understand preemptive priority-based scheduling and can trace task execution order
- You can explain mutexes, semaphores, and message queues and when to use each
- You know what priority inversion is and how priority inheritance prevents it
- You can choose between bare-metal, FreeRTOS, and Zephyr for a project based on requirements
- You can apply Rate Monotonic Analysis to determine if a set of periodic tasks is schedulable
`},

{id:'hw-10',num:'10',title:'Firmware Development',hours:12,phase:2,topics:['Embedded C','Toolchains','Linker','JTAG','GDB'],content:`
## 🎯 Goal
Write firmware — cross-compile C for embedded targets, understand linker scripts and startup code, and debug with JTAG/SWD.


## 📱 In Your Pocket, On Your Bench
**In your phone.** The step counter keeps counting while the screen is off and the main processor sleeps. That is firmware on a tiny always-on sensor hub, written against exactly the constraints in this module: no OS, kilobytes of RAM, and a power budget measured in microamps. It buffers readings and wakes the applications processor only occasionally, because waking the big core is the expensive part.

**On your bench.** A Pico is a genuine bare-metal target with a real toolchain and real debug hardware, for about £5:

\`\`\`bash
sudo apt install -y gcc-arm-none-eabi gdb-multiarch openocd
arm-none-eabi-size firmware.elf   # where your bytes actually went
\`\`\`

Note \`gdb-multiarch\` — Debian and Ubuntu ship no \`arm-none-eabi-gdb\` binary, which is a common first stumble. A second Pico flashed as picoprobe gives you SWD, so you can set breakpoints in code running on real silicon.

## 🧠 Cross-Compilation

You compile on your development machine (x86) for a different target (ARM). The cross-toolchain includes: compiler (arm-none-eabi-gcc), assembler, linker, and standard libraries.

\`\`\`mermaid
flowchart LR
    SRC[Source code<br/>C/C++] --> CC[Cross-compiler<br/>arm-none-eabi-gcc]
    CC --> OBJ[Object files<br/>.o]
    OBJ --> LD[Linker<br/>+ linker script]
    LD --> BIN[Binary<br/>.elf / .bin / .hex]
    BIN --> FLASH[Flash to device<br/>via JTAG/SWD]
\`\`\`

**Linker script** tells the linker where to place code (.text), data (.data), BSS (.bss), and stack in memory. Critical for embedded — memory is manually mapped.

**volatile** keyword: Tells the compiler not to optimize away reads/writes to a variable. Essential for hardware registers — the value can change without the CPU writing to it.

## 🧠 Memory Layout — The Linker Script's Job

\`\`\`mermaid
flowchart TD
    subgraph "Flash (Read-only, 0x08000000)"
        VT[Vector Table<br/>Reset handler, ISRs]
        TEXT[.text<br/>Code]
        RODATA[.rodata<br/>Constants, strings]
        DATA_INIT[.data init values<br/>Copied to RAM at startup]
    end
    subgraph "RAM (Read-write, 0x20000000)"
        DATA[.data<br/>Initialized globals]
        BSS[.bss<br/>Zeroed globals]
        HEAP[Heap<br/>grows up]
        STACK[Stack<br/>grows down]
    end
    DATA_INIT -.->|crt0 copies| DATA
\`\`\`

On an STM32F4, flash starts at \`0x08000000\` and RAM at \`0x20000000\`. The linker script maps each section to the correct address. Getting this wrong is the single most common cause of "my program crashes immediately."

## ⌨️ Do This

1. Install a cross-compilation toolchain: \`sudo apt install gcc-arm-none-eabi\`
2. Write a bare-metal "blinky" program for an ARM Cortex-M (even if simulated)
3. Read a linker script (.ld file) from any embedded project — identify the MEMORY and SECTIONS directives
4. Try GDB with a remote target: \`arm-none-eabi-gdb\` → \`target remote :3333\` (OpenOCD provides the debug server)

## ⚠️ Gotcha

**The volatile keyword is not optional for hardware registers.** Without it, the compiler optimizes away reads (it "knows" the value hasn't changed) and reorders writes (it thinks the order doesn't matter). Both are catastrophic for hardware register access where read side-effects exist and write order is critical.

**Startup code runs before main().** The C runtime (crt0) initializes .data (copies initialized variables from flash to RAM), zeroes .bss (uninitialized globals), sets up the stack pointer, and then calls main(). If your linker script is wrong, .data contains garbage, .bss isn't zeroed, and your program fails in mysterious ways.

## 🛠️ Mini-Project

Write a bare-metal LED blinker from scratch (no HAL libraries):
1. Read the datasheet for an STM32 or similar MCU — find the GPIO register addresses
2. Write a linker script that maps flash (code) and RAM (data) to the correct addresses
3. Write startup code in assembly: set up stack pointer, copy .data, zero .bss, call main
4. In main(), configure the GPIO pin by writing directly to registers (RCC enable, GPIO mode, output type)
5. Blink the LED with a busy-wait delay loop
6. Build, flash (or simulate in QEMU/Renode), and debug with GDB

## ✅ You've mastered this when…
- You can cross-compile C for an ARM target using arm-none-eabi-gcc
- You understand linker scripts (MEMORY, SECTIONS) and can trace where .text, .data, .bss, and stack are placed
- You know when to use volatile and why omitting it causes hardware register access bugs
- You can debug embedded code with GDB over JTAG/SWD — set breakpoints, inspect registers, examine memory
- You understand startup code (crt0) and can explain what happens between reset and main()
`},

{id:'hw-11',num:'11',title:'Hardware-Software Interface',hours:10,phase:2,topics:['MMIO','HAL','Registers','Cache coherency'],content:`
## 🎯 Goal
Understand how software talks to hardware — memory-mapped I/O, register programming, HAL design, and cache coherency at the hardware boundary.


## 📱 In Your Pocket, On Your Bench
**In your phone.** When the camera captures a frame, no CPU copies it. The sensor DMAs straight into a buffer the ISP will read, and the only CPU involvement is cache maintenance so nobody reads stale data. Get that wrong and you do not get a crash — you get a corrupted frame, intermittently, which is precisely the kind of bug this module is about.

**On your bench.** You can hold both sides of the hardware/software interface on a Pi. The raw way, and the correct way:

\`\`\`bash
sudo apt install -y gpiod
gpiodetect && gpioinfo          # the kernel's abstraction
gpioset gpiochip0 17=1          # set a pin through the proper API
\`\`\`

Then compare against poking the GPIO registers directly through \`/dev/mem\`. Both light the LED. Only one keeps working when the kernel has other opinions about that pin — which is the argument for a HAL in twenty lines.

## 🧠 Memory-Mapped I/O (MMIO)

Hardware registers are mapped to specific memory addresses. Reading/writing these addresses controls the hardware.

\`\`\`c
// Toggle an LED on GPIO port
#define GPIO_BASE   0x40020000
#define GPIO_OUTPUT (*(volatile uint32_t *)(GPIO_BASE + 0x14))

GPIO_OUTPUT |= (1 << 5);  // Set bit 5 — LED on
GPIO_OUTPUT &= ~(1 << 5); // Clear bit 5 — LED off
\`\`\`

**HAL (Hardware Abstraction Layer)** wraps MMIO in clean functions so application code doesn't deal with raw addresses. Same concept as an API — the interface stays stable even if the hardware changes.

\`\`\`mermaid
flowchart TD
    APP[Application Code] --> HAL[HAL Layer<br/>uart_send, gpio_write]
    HAL --> MMIO[MMIO Register Access<br/>volatile uint32_t *]
    MMIO --> PERIPH[Hardware Peripheral<br/>UART, GPIO, SPI, I2C]
\`\`\`

## 🧠 Cache Coherency at the DMA Boundary

When the CPU and DMA controller both access the same memory, caches create a consistency problem:

\`\`\`mermaid
sequenceDiagram
    participant CPU as CPU + Cache
    participant MEM as Main Memory
    participant DMA as DMA Controller
    Note over CPU,DMA: CPU writes data for DMA to send
    CPU->>CPU: Write to cache (dirty line)
    Note over CPU: Cache flush required!
    CPU->>MEM: Flush cache line to memory
    DMA->>MEM: Read data from memory
    Note over CPU,DMA: DMA receives data into memory
    DMA->>MEM: Write received data
    Note over CPU: Cache invalidate required!
    CPU->>CPU: Invalidate cache line
    CPU->>MEM: Read fresh data from memory
\`\`\`

Missing a flush or invalidate causes silent data corruption that only appears under load.

## ⌨️ Do This

1. Read a peripheral register map from any MCU datasheet (STM32 reference manual is freely available)
2. Practice bit manipulation: write C code to set bit 5, clear bit 3, toggle bit 7, and check if bit 2 is set
3. Find the HAL source code for any MCU vendor (STM32 HAL, NXP MCUX SDK) — compare the HAL function to the raw register access it wraps
4. Read about cache coherency: what happens when CPU writes to an address that DMA is also using?

## ⚠️ Gotcha

**Read-modify-write on hardware registers is not atomic.** The sequence: read register → modify bits → write register can be interrupted. If an interrupt handler modifies the same register between your read and write, your write overwrites the interrupt handler's changes. Use the hardware's atomic bit-set/bit-clear registers (if available) or disable interrupts around the RMW.

**Cache coherency bugs only appear under load.** During development with light workloads, DMA transfers might complete before the CPU reads the buffer, so stale cache data is never observed. In production under heavy load, the timing shifts and you get corrupted data. Always use proper cache maintenance (invalidate/flush) for DMA buffers, even if it works without it.

## 🛠️ Mini-Project

Design a HAL for a UART peripheral:
1. Read the UART register map from an STM32 or similar datasheet
2. Write raw register-level code to: initialize UART (baud rate, 8N1), send a byte, receive a byte
3. Wrap it in a clean HAL: \`uart_init(baud)\`, \`uart_send(buf, len)\`, \`uart_recv(buf, len)\`
4. Add interrupt-driven receive with a ring buffer
5. Write a test program that echoes received characters
6. Document: which registers did you access, what does each bit field do, and how does the HAL hide these details?

## ✅ You've mastered this when…
- You can read a register map from a datasheet and identify base address, offset, and bit fields
- You understand MMIO and can write register-level code with proper volatile access
- You can design a HAL that abstracts hardware details while remaining efficient
- You know why cache coherency matters for DMA buffers and when to flush vs invalidate
- You understand the read-modify-write atomicity problem and how to use bit-banding or atomic set/clear registers
`},

{id:'hw-12',num:'12',title:'Testing & Lab Instruments',hours:8,phase:2,topics:['Oscilloscope','Logic analyzer','FPGA','HIL'],content:`
## 🎯 Goal
Know the lab instruments used to debug hardware — oscilloscopes, logic analyzers, JTAG — and understand FPGA prototyping and hardware-in-the-loop testing.


## 📱 In Your Pocket, On Your Bench
**In your phone.** Open any iFixit teardown and look for the small exposed pads on the board. Those are test points: the factory probes them to program and test the device before the case ever goes on. Design for test is not an afterthought at that volume — a board you cannot test automatically is a board you cannot manufacture.

**On your bench.** This is the module where a small purchase changes everything. A £10 USB logic analyzer plus PulseView turns protocol debugging from guesswork into observation:

\`\`\`bash
sudo apt install -y pulseview sigrok-cli
sigrok-cli --driver fx2lafw --channels D0,D1 --samples 200000 \
  --config samplerate=1m --protocol-decoder i2c
\`\`\`

Clip onto the Sense HAT's SDA and SCL, capture a transfer, and read the decoded address, ACK and data bytes. An oscilloscope would show you voltage; this shows you protocol — the distinction this module draws.

## 🧠 Instruments

| Instrument | Measures | When to use |
|-----------|----------|------------|
| **Oscilloscope** | Voltage vs time (analog) | Signal integrity, timing, glitches |
| **Logic analyzer** | Digital signals (0/1) vs time | Bus protocol debugging (I2C, SPI, UART) |
| **Spectrum analyzer** | Frequency domain | RF debugging, EMI analysis |
| **Multimeter** | Voltage, current, resistance | Basic electrical measurements |

**FPGA prototyping:** Before committing a design to silicon (months, millions of dollars), prototype on an FPGA. The logic is programmable — you can test and iterate.

\`\`\`mermaid
flowchart TD
    SYM[Symptom<br/>Bus not working?] --> Q1{Analog or<br/>digital issue?}
    Q1 -->|Voltage levels wrong<br/>Signal integrity| SCOPE[Oscilloscope<br/>Check rise/fall times<br/>voltage levels]
    Q1 -->|Protocol violation<br/>Wrong data| LA[Logic Analyzer<br/>Decode I2C/SPI/UART<br/>Check timing]
    SCOPE --> FIX1[Fix pull-ups<br/>Check termination<br/>Reduce bus length]
    LA --> FIX2[Fix address<br/>Check clock polarity<br/>Verify CS timing]
\`\`\`

**JTAG/SWD debugging:** Connects your host PC directly to the CPU's debug port. You can halt the processor, set breakpoints, inspect registers and memory, and single-step through code. OpenOCD provides the debug server; GDB is the client. Essential for debugging crashes, hard faults, and boot failures where printf is not available.

## ⌨️ Do This

1. If you have access to an oscilloscope, probe a UART TX line and observe the waveform — identify start bit, data bits, stop bit
2. Download and try Sigrok/PulseView (open-source logic analyzer software) — it can decode I2C, SPI, UART protocols from captured waveforms
3. Look at open-source FPGA projects (e.g., on GitHub) to understand what FPGA development looks like
4. Read about Hardware-in-the-Loop (HIL) testing: how automotive companies test ECU software without a physical car

## ⚠️ Gotcha

**An oscilloscope shows you voltage; a logic analyzer shows you protocol.** If your I2C bus isn't working, the oscilloscope tells you if the signal integrity is bad (voltage levels, rise times). The logic analyzer tells you if the protocol is wrong (wrong address, missing ACK). Use the right tool for the right question.

**FPGA ≠ production silicon.** FPGA prototypes typically clock at 5–50 MHz against an ASIC's 2–3 GHz — that is **50–500x slower**, not a small factor. It is why booting Linux on an FPGA prototype can take hours, and why hardware emulators exist as a separate (and very expensive) tier between simulation and FPGA. Prototypes also draw more power and have different timing characteristics, so a design that works on FPGA can still fail silicon timing closure. FPGA prototyping validates functionality, not performance.

## 🛠️ Mini-Project

Create a debugging toolkit reference card:
1. For each common symptom (bus not responding, data corruption, intermittent crashes, power issues), list: which instrument to use, what to look for, and common root causes
2. Write a step-by-step I2C debugging checklist: check pull-ups, verify addresses with logic analyzer, check clock speed, verify signal integrity with oscilloscope
3. Design a simple HIL test setup for a temperature monitoring system: simulate sensor inputs, verify system outputs, test edge cases (sensor disconnect, over-temperature)
4. Document the FPGA prototyping workflow: write RTL → simulate (ModelSim/Verilator) → synthesize (Vivado/Quartus) → place and route → generate bitstream → program FPGA → test on hardware
5. Create a JTAG/SWD debugging cheat sheet: OpenOCD connection commands, GDB commands for reading registers (\`info registers\`), setting hardware breakpoints (\`hbreak\`), examining memory (\`x/16xw 0x40020000\`), and recovering from a hard fault

## ✅ You've mastered this when…
- You know which instrument to reach for given a symptom
- You can interpret an oscilloscope waveform (voltage levels, rise times, ringing)
- You understand FPGA's role in the chip development process
- You know what HIL testing is and why it matters for embedded systems
- You can set up a JTAG/SWD debug session with OpenOCD and GDB
`},

{id:'hw-13',num:'13',title:'Power & Thermal Management',hours:8,phase:2,topics:['TDP','Sleep states','Battery','Thermal','Leakage'],content:`
## 🎯 Goal
Understand power budgets, thermal design, and sleep states — the constraints that shape every hardware product from phones to data centers.


## 📱 In Your Pocket, On Your Bench
**In your phone.** Record 4K video for ten minutes and your phone gets hot, then visibly slows down. Nothing failed: the thermal governor is trading frequency for temperature, because the case has no fan and skin temperature is a safety limit. Phone SoCs are designed to exceed their sustainable power for short bursts and then throttle — the burst is the product feature, the throttle is the physics.

**On your bench.** A Pi 5 reproduces the whole cycle in about ninety seconds:

\`\`\`bash
vcgencmd measure_temp
vcgencmd get_throttled          # bit flags: 0x0 is healthy
\`\`\`

Run those in a loop, start a four-core busy loop, and watch temperature climb and the throttle flags set. Then attach the active cooler and run it again: same silicon, same workload, sustained performance — thermal design as a measurable variable.

## 🧠 Power Equation

Dynamic power: P = α × C × V² × f (activity × capacitance × voltage² × frequency)
Static power (leakage): Always present, increases with temperature and smaller process nodes.

**TDP (Thermal Design Power):** The maximum sustained power a cooling system must dissipate. Not the peak power — chips can boost above TDP briefly.

\`\`\`mermaid
flowchart LR
    subgraph "Power Reduction Techniques"
        CG[Clock Gating<br/>Stop clock to idle blocks<br/>Saves dynamic power]
        DVFS_B[DVFS<br/>Lower V and F<br/>P drops cubically]
        PG[Power Gating<br/>Cut power entirely<br/>Eliminates leakage]
    end
    CG -->|Quick, no state loss| SAVE1[~30% savings]
    DVFS_B -->|Medium latency| SAVE2[~60% savings]
    PG -->|Slow wake, state lost| SAVE3[~95% savings]
\`\`\`

## 🧠 Sleep States

| State | Description | Wake time | Power |
|-------|------------|-----------|-------|
| Active | Full operation | — | 100% |
| Idle | Clock gated, retention | μs | ~30% |
| Standby | Most blocks off, RAM retained | ms | ~5% |
| Off | Everything powered down | seconds | ~0% |

## ⌨️ Do This

1. Measure your laptop's power consumption: check battery discharge rate or use a USB power meter
2. Calculate: if a phone has a 5000 mAh battery at 3.7V and the SoC draws 2W average, how long does the battery last? (Answer: 5Ah × 3.7V = 18.5Wh ÷ 2W = 9.25 hours)
3. Check CPU temperature: \`cat /sys/class/thermal/thermal_zone0/temp\` (value in millidegrees)
4. Run a CPU stress test and watch temperature rise: \`stress-ng --cpu 4 --timeout 30\` while monitoring temperature

## ⚠️ Gotcha

**TDP is not maximum power draw.** A chip rated at 15W TDP can briefly draw 25W+ during turbo boost. The cooling system must handle TDP (sustained), but the power delivery must handle peak (instantaneous). Undersizing the power supply for TDP alone causes crashes under heavy load.

**Leakage power dominates at advanced process nodes.** At 5nm and below, static power (current flowing even when transistors are "off") can be 30-50% of total power. This means a chip draws significant power even when idle. Power gating (cutting power to entire blocks) is the only way to eliminate leakage from unused subsystems.

## 🛠️ Mini-Project

Estimate battery life for a hypothetical wearable device:
1. Define the workload profile: 10% active (full CPU + display + BLE), 30% light use (display + idle CPU), 60% deep sleep
2. Assign power consumption for each state: research realistic numbers for a Cortex-M4 SoC + OLED display + BLE radio
3. Calculate weighted average power draw
4. Given a 200 mAh battery, calculate battery life
5. Propose three design changes that would extend battery life by 2x, with trade-offs for each

## ✅ You've mastered this when…
- You can explain the power equation (P = alpha * C * V^2 * f) and why voltage matters most
- You understand TDP, thermal throttling, and the difference between sustained and peak power
- You know the trade-off between sleep depth and wake latency for each power state
- You can estimate battery life for a mobile device given a workload profile
- You understand leakage current and why power gating is essential at advanced process nodes
`},

{id:'hw-14',num:'14',title:'Silicon Lifecycle',hours:10,phase:2,topics:['RTL','Tapeout','Process nodes','Packaging','Bring-up'],content:`
## 🎯 Goal
Understand the journey from chip concept to production silicon — design flow, process nodes, packaging, and bring-up.


## 📱 In Your Pocket, On Your Bench
**In your phone.** Your handset's SoC is the visible end of a three-to-four-year pipeline: architecture, RTL, verification, tapeout, bring-up, mass production. The annual phone launch cadence you see is the *output* of a schedule where the tapeout happened well over a year before the keynote, and where a bug found after tapeout costs a respin measured in months and millions.

**On your bench.** The Pi lineage makes the cadence concrete — BCM2711 in the Pi 4, BCM2712 in the Pi 5, each a full silicon program. More striking is RP2040 and RP2350: a small team inside a not-very-large company shipped its own chips.

\`\`\`bash
cat /proc/device-tree/compatible | tr '\0' '\n'   # the exact SoC you are on
\`\`\`

That string is a product of the whole lifecycle in this module — it is what the silicon tells software about which bugs and errata apply to it.

## 🧠 Chip Design Flow

\`\`\`mermaid
flowchart LR
    SPEC[Specification] --> RTL[RTL Design<br/>Verilog/VHDL]
    RTL --> SIM[Simulation &<br/>Verification]
    SIM --> SYN[Synthesis<br/>→ Gate netlist]
    SYN --> PNR[Place & Route<br/>Physical layout]
    PNR --> SIGN[Signoff<br/>Timing, power, DRC]
    SIGN --> TO[Tapeout<br/>Send to fab]
    TO --> FAB[Fabrication<br/>~3 months]
    FAB --> PKG[Packaging<br/>& Testing]
    PKG --> BU[Silicon Bring-up<br/>First boot!]
\`\`\`

**Process nodes:** "7nm" and "5nm" are marketing names now — they don't correspond to actual transistor dimensions. What matters: smaller nodes = more transistors per mm², lower power, but higher design/fab cost.

**Silicon bring-up** is the critical moment when the first physical chip arrives and engineers try to boot it. The BSP team plays a central role here — they're the ones getting Linux running on brand-new silicon.

## 🧠 Packaging & Advanced Integration

\`\`\`mermaid
flowchart LR
    subgraph "Traditional"
        MONO[Monolithic Die<br/>One chip, one package]
    end
    subgraph "Advanced Packaging"
        MCM[Multi-Chip Module<br/>Multiple dies, one package]
        CHIPLET[Chiplets<br/>Mix-and-match dies<br/>Different process nodes]
        STACK[3D Stacking<br/>Dies stacked vertically<br/>HBM memory on top]
    end
    MONO -->|Cost scaling wall| MCM
    MCM -->|Design flexibility| CHIPLET
    CHIPLET -->|Bandwidth density| STACK
\`\`\`

**Why chiplets matter:** A monolithic 600mm^2 die at 3nm costs ~$2000+ per good die (yield drops exponentially with area). Four 150mm^2 chiplets at 5nm connected via an advanced package cost far less total and can mix process nodes — compute chiplets on 3nm, I/O chiplets on cheaper 6nm.

## ⌨️ Do This

1. Read about the TSMC N3 (3nm) process — what performance and power improvements does it claim over N5?
2. Look up the cost of a tapeout at different process nodes — understand why only a few companies can afford leading-edge nodes
3. Research chiplet architectures: how AMD's EPYC uses multiple chiplets connected via Infinity Fabric
4. Read a silicon bring-up war story — engineers have published fascinating accounts of first silicon boot-up

## ⚠️ Gotcha

**Process node names are marketing, not measurements.** "3nm" doesn't mean any transistor feature is 3 nanometers. Intel's "Intel 7" lands near TSMC's **N7** on density — roughly 100 vs 91 million transistors per mm² — which is exactly why Intel renamed it from "10nm Enhanced SuperFin": the old name made a competitive node sound two generations behind. Intel's N5-class analogue is **Intel 4**. Compare nodes by transistor density and power/performance metrics, never by name.

**Silicon bring-up has no undo button.** If OTP fuses are blown incorrectly (wrong security keys, wrong configuration), those chips are permanently bricked. Bring-up engineers work with million-dollar wafers and irreversible operations. This is why simulation and emulation happen exhaustively before tapeout.

## 🛠️ Mini-Project

Create a chip development timeline and cost model:
1. Research and document each phase: specification (3 months), RTL design (12 months), verification (12 months, overlapping), synthesis + P&R (3 months), tapeout, fabrication (3 months), packaging + testing (2 months), bring-up (3 months)
2. Estimate costs at 7nm: mask set ($10-30M), engineering team (50-200 engineers × $200K/year), EDA tool licenses ($5-20M/year), fab costs
3. Calculate break-even: if you sell the chip for $50 with 30% margin, how many units must you sell to recoup a $500M development cost?
4. Explain why chiplets and advanced packaging (CoWoS, 3D stacking) change this economic equation — calculate the yield advantage of four 150mm^2 chiplets vs one 600mm^2 monolithic die
5. Research one real tapeout story: find a published account of a chip going from RTL freeze to first silicon boot, and document the timeline, team size, and the first bug found during bring-up

## ✅ You've mastered this when…
- You can trace the chip design flow from RTL to tapeout and explain each stage's purpose
- You understand what process nodes mean (and what they don't) — you compare by transistor density, not name
- You know what happens during silicon bring-up and why OTP fuse blowing is irreversible
- You understand chip packaging options (SiP, chiplet, CoWoS, 3D stacking) and the economics driving chiplet adoption
- You can estimate the cost of a tapeout and explain why only a few companies can afford leading-edge nodes
`}
];
