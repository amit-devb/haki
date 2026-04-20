# 🥷 Haki — Visualizer

**Haki** is a premium, high-performance execution visualizer designed to help developers and students understand complex recursive algorithms, memory management, and performance characteristics — all entirely within the browser.

![Haki Visualizer UI](./screenshot.png)

## ✨ Key Features

### 🔍 Deep Visualization
- **Live Trace**: Step through execution with a granular call stack, frame-by-frame.
- **Heap Inspection**: Interactive heap cards that track object history and mutation across steps.
- **Narrative Overlay**: Automatic natural language explanations of what the code is doing at each step.
- **Story Mode**: Kid-friendly narration with an optional “explain” expansion.

### ⚖️ Side-by-Side Comparison
- **Perf Benchmarking**: Compare two versions of an algorithm (e.g., Recursion vs. Iteration).
- **Step Analytics**: See exactly which version is more "lean" in terms of step count and memory depth.
- **Scorecard**: Get a winner badge (e.g., "25% Leaner") based on execution metrics.

### 📈 Complexity Analysis
- **Big-O Inference**: Runs code against varying input sizes (N) and plots the results.
- **Automated Fitting**: Estimates complexity (O(1), O(N), O(N²), etc.) with R² fit quality metrics.

### 🛠 Tools for Education
- **Slides Mode**: Suddenly turn any code trace into a polished presentation.
- **Quiz Mode**: Interactive challenges that test your understanding of variable states.
- **Embeddable**: Generate self-contained snippet to embed Haki visualizations anywhere.

### 🧪 Mistake Playground
- Curated “wrong on purpose” examples (blocking, missed await, shared-state race).
- **Fix it** button applies a safe edit and shows a GitHub-style diff (green adds / red deletes).

### ⏱ Event Loop (Python + JavaScript)
- **Python `asyncio`**: task list + request id (for ASGI-style demos) + task switching.
- **JavaScript**: microtask/macrotask queues + causality + optional “traffic light” view.

---

## 🚀 Getting Started

### Hosted version
The project is hosted on GitHub Pages. You can access it at:
[https://amit-devb.github.io/haki/](https://amit-devb.github.io/haki/)

### Local Development
Haki is a static web app. You *can* open `index.html` directly, but a local static server is recommended (better browser compatibility).

1. Clone the repository:
   ```bash
   git clone git@github.com:amit-devb/haki.git
   cd haki
   ```
2. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open `http://127.0.0.1:8000/`.

---

## 🏗 Technology Stack

- **[Pyodide](https://pyodide.org/)**: Python 3.11+ runtime compiled to WebAssembly (WASM).
- **[CodeMirror](https://codemirror.net/)**: High-performance code editing with Python syntax highlighting and autocompletion.
- **Vanilla JS & CSS**: A zero-dependency frontend architecture for maximum speed and control.
- **Flexbox & CSS Grid**: A bespoke, responsive "3-Column" layout designed for productivity.

## 🧵 Async + Threading (GitHub Pages)

Haki runs fully client-side on GitHub Pages (no server). That means:

- **Async (recommended):** You can visualize `asyncio` behavior directly in the browser (tasks, `await` points, interleaving). Use the **“asyncio tasks”** example in the Python examples menu.
- **Threading:** True shared-memory Python threads are generally **not available** in a default GitHub Pages + Pyodide setup because WebAssembly threads require cross-origin isolation headers (COOP/COEP). Haki still shows the current Python thread metadata, but multi-thread traces may not be possible without different hosting headers.

## 🧭 Quick Tour

- Pick a language (Python/JavaScript), then pick an example.
- Turn on **story** for kid-friendly narration.
- In **Event Loop**, turn on **traffic** for a simpler RUNNING/WAITING/DONE view (still shows IDs/details).
- In Mistake examples, click **Fix it** to apply a fix and review the diff.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
