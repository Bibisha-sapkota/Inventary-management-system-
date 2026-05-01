export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const clearAuth = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

// Barcode Generator
export const generateBarcodeSVG = (text) => {
  const CODE128_PATTERNS = {
    START_B: "11010010000",
    STOP: "1100011101011",
    "0": "11011001100",
    "1": "11001101100",
    "2": "11001100110",
    "3": "10010011000",
    "4": "10010001100",
    "5": "10001001100",
    "6": "10011001000",
    "7": "10011000100",
    "8": "10001100100",
    "9": "11001001000",
    A: "10100011000",
    B: "10001011000",
    C: "10001000110",
    D: "10110001000",
    E: "10001101000",
    F: "10001100010",
    G: "11010001000",
    H: "11000101000",
    I: "11000100010",
    J: "10110111000",
    K: "10110001110",
    L: "10001101110",
    M: "10111011000",
    N: "10111000110",
    O: "10001110110",
    P: "11101110110",
    Q: "11010001110",
    R: "11000101110",
    S: "11011101000",
    T: "11011100010",
    U: "11011101110",
    V: "11101011000",
    W: "11101000110",
    X: "11100010110",
    Y: "11101101000",
    Z: "11101100010",
    "-": "11011011110",
    ".": "10111101110",
    " ": "11000110110",
    "/": "10111011110",
  };

  let pattern = CODE128_PATTERNS.START_B;
  const safeText = String(text || "INV");
  const upperText = safeText.toUpperCase();

  for (let i = 0; i < upperText.length; i++) {
    const char = upperText[i];
    if (CODE128_PATTERNS[char]) {
      pattern += CODE128_PATTERNS[char];
    } else {
      pattern += CODE128_PATTERNS["0"];
    }
  }
  pattern += CODE128_PATTERNS.STOP;

  const barWidth = 2;
  const height = 60;
  const width = pattern.length * barWidth + 40;

  let bars = "";
  let x = 20;

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === "1") {
      bars += `<rect x="${x}" y="10" width="${barWidth}" height="${height}" fill="black"/>`;
    }
    x += barWidth;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height + 30
    }" viewBox="0 0 ${width} ${height + 30}">
      <rect width="100%" height="100%" fill="white"/>
      ${bars}
      <text x="${width / 2}" y="${height + 25
    }" text-anchor="middle" font-family="monospace" font-size="12" fill="black">${text}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const generateSequentialInvoiceId = (existingInvoices = []) => {
  const postalCode = "44600";
  const year = new Date().getFullYear();
  const prefix = `${postalCode}${year}`;

  const highestSerial = existingInvoices.reduce((max, inv) => {
    const invId = String(inv.invoiceId || inv.id || "");
    if (invId.startsWith(prefix)) {
      const serial = parseInt(invId.slice(prefix.length)) || 0;
      return Math.max(max, serial);
    }
    return max;
  }, 0);

  const nextSerial = String(highestSerial + 1).padStart(3, "0");
  return `${prefix}${nextSerial}`;
};

export const API_URL = "http://localhost:5000/api";

export const groupLogsByDate = (logs) => {
  const groups = {};
  logs.forEach((log) => {
    const date = new Date(log.createdAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
  });
  return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
};

export const statusColor = {
  Pending: "bg-orange-100 text-orange-600",
  Processing: "bg-green-100 text-green-600",
  Delivered: "bg-green-100 text-green-600",
  Completed: "bg-green-100 text-green-600",
  Cancelled: "bg-red-100 text-red-600",
  Paid: "bg-green-100 text-green-600",
};

export const categoryColors = ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#ec4899", "#ef4444", "#06b6d4", "#8b5cf6"];

export const CATEGORY_COLORS = {
  General: "#3b82f6",
  Produce: "#22c55e",
  Dairy: "#a855f7",
  Bakery: "#f59e0b",
  Grains: "#ec4899",
  Grocery: "#ef4444",
  Meat: "#06b6d4",
  Beverages: "#8b5cf6",
  Snacks: "#f43f5e",
};
