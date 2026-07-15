// RoboPrompt standard scaffold — Web Serial control panel.
// Hardware layout comes from config.js (window.ARM_CONFIG); the protocol
// matches firmware/arm_controller/arm_controller.ino.

(() => {
  const cfg = window.ARM_CONFIG;

  const statusEl = document.getElementById("status");
  const connectBtn = document.getElementById("connect");
  const homeBtn = document.getElementById("home");
  const jointsEl = document.getElementById("joints");
  const logEl = document.getElementById("log");
  const titleEl = document.getElementById("project-name");
  const warningEl = document.getElementById("serial-warning");

  if (cfg.projectName) {
    titleEl.textContent = cfg.projectName;
    document.title = cfg.projectName;
  }

  if (!("serial" in navigator)) {
    warningEl.hidden = false;
    connectBtn.disabled = true;
  }

  let port = null;
  let writer = null;
  let connected = false;

  // Sliders fire faster than a serial line should be written; keep only the
  // latest requested angle per joint and flush on a short interval.
  const pendingAngles = new Map();
  let flushTimer = null;

  function log(line, cls) {
    const atBottom = logEl.scrollTop + logEl.clientHeight >= logEl.scrollHeight - 4;
    const span = document.createElement("span");
    span.textContent = line + "\n";
    if (cls) span.className = cls;
    logEl.appendChild(span);
    while (logEl.childNodes.length > 200) logEl.removeChild(logEl.firstChild);
    if (atBottom) logEl.scrollTop = logEl.scrollHeight;
  }

  function setConnected(next) {
    connected = next;
    statusEl.textContent = next ? "Connected" : "Disconnected";
    statusEl.className = "status " + (next ? "connected" : "disconnected");
    connectBtn.textContent = next ? "Disconnect" : "Connect";
    homeBtn.disabled = !next;
  }

  async function writeLine(text) {
    if (!writer) return;
    try {
      await writer.write(new TextEncoder().encode(text + "\n"));
      log("> " + text, "sent");
    } catch (err) {
      log("Write failed: " + err.message, "error");
    }
  }

  function flushPending() {
    for (const [joint, angle] of pendingAngles) {
      pendingAngles.delete(joint);
      writeLine("M " + joint + " " + angle);
    }
  }

  async function readLoop() {
    const decoder = new TextDecoder();
    let buffer = "";
    const reader = port.readable.getReader();
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop();
        for (const line of lines) {
          if (line.trim()) log("< " + line.trim(), "received");
        }
      }
    } catch (err) {
      log("Read error: " + err.message, "error");
    } finally {
      reader.releaseLock();
    }
    await disconnect();
  }

  async function connect() {
    try {
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: cfg.baudRate });
    } catch (err) {
      log("Could not open port: " + err.message, "error");
      port = null;
      return;
    }
    writer = port.writable.getWriter();
    setConnected(true);
    log("Port open at " + cfg.baudRate + " baud.");
    flushTimer = setInterval(flushPending, 60);
    readLoop();
    writeLine("PING");
  }

  async function disconnect() {
    if (!connected && !port) return;
    setConnected(false);
    clearInterval(flushTimer);
    pendingAngles.clear();
    try {
      if (writer) {
        writer.releaseLock();
        writer = null;
      }
      if (port) {
        await port.close();
      }
    } catch {
      // port may already be gone (unplugged) — nothing to clean up
    }
    port = null;
    log("Disconnected.");
  }

  connectBtn.addEventListener("click", () => {
    if (connected) disconnect();
    else connect();
  });

  homeBtn.addEventListener("click", () => {
    pendingAngles.clear();
    writeLine("HOME");
    cfg.joints.forEach((joint, i) => {
      const slider = document.getElementById("joint-" + i);
      const value = document.getElementById("joint-value-" + i);
      slider.value = joint.home;
      value.textContent = joint.home + "°";
    });
  });

  // Build one slider row per configured joint.
  cfg.joints.forEach((joint, i) => {
    const row = document.createElement("div");
    row.className = "joint-row";

    const label = document.createElement("label");
    label.textContent = joint.name;
    label.htmlFor = "joint-" + i;

    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = "joint-" + i;
    slider.min = joint.min;
    slider.max = joint.max;
    slider.value = joint.home;

    const value = document.createElement("span");
    value.className = "joint-value";
    value.id = "joint-value-" + i;
    value.textContent = joint.home + "°";

    slider.addEventListener("input", () => {
      value.textContent = slider.value + "°";
      if (connected) pendingAngles.set(i, slider.value);
    });

    row.append(label, slider, value);
    jointsEl.appendChild(row);
  });
})();
