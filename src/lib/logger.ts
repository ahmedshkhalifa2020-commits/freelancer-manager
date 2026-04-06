import pino from "pino";
import path from "path";
import fs from "fs";
import { Writable } from "stream";

// Environment variables with defaults
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const LOG_PATH = process.env.LOG_PATH || "logs";

const LOG_MAX_SIZE = process.env.LOG_MAX_SIZE || "100"; // 100 KB default

function parseSize(size: string) {
  const normalized = size.trim().toLowerCase();
  const match = /^([0-9]+)([kmgt])?$/.exec(normalized);
  if (!match) {
    return 100;
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "k":
      return value * 1000;
    case "m":
      return value * 1000 * 1000;
    case "g":
      return value * 1000 * 1000 * 1000;
    case "t":
      return value * 1000 * 1000 * 1000 * 1000;
    default:
      return value;
  }
}

const LOG_MAX_SIZE_BYTES = parseSize(LOG_MAX_SIZE);

// Create logs directory if it doesn't exist
const logsDir = path.resolve(process.cwd(), LOG_PATH);
try {
  fs.mkdirSync(logsDir, { recursive: true });
} catch (err) {
  throw new Error(`Unable to create log directory ${logsDir}: ${err}`);
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pad(value: number, length: number) {
  return String(value).padStart(length, "0");
}

function formatTimestamp(date: Date) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1, 2);
  const day = pad(date.getDate(), 2);
  const hours = pad(date.getHours(), 2);
  const minutes = pad(date.getMinutes(), 2);
  const seconds = pad(date.getSeconds(), 2);
  const milliseconds = date.getMilliseconds();
  const fraction = pad(milliseconds * 10, 4);
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${fraction}`;
}

function sanitizeMessage(value: string) {
  return value.replace(/\r?\n/g, " ").replace(/\|/g, " ");
}

function getRotatedLogFilePath(date: string) {
  const pattern = new RegExp(`^${escapeRegExp(date)}(?:_(\\d+))?\\.log$`);
  const files = fs
    .readdirSync(logsDir)
    .filter((file) => pattern.test(file))
    .map((file) => {
      const match = pattern.exec(file);
      const index = match && match[1] ? Number(match[1]) : 0;
      return { file, index };
    })
    .sort((a, b) => a.index - b.index);

  for (const entry of files) {
    const filePath = path.join(logsDir, entry.file);
    const fileSize = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
    if (fileSize < LOG_MAX_SIZE_BYTES) {
      return filePath;
    }
  }

  const nextIndex =
    files.length === 0 ? 0 : Math.max(...files.map((entry) => entry.index)) + 1;
  const nextFileName =
    nextIndex === 0 ? `${date}.log` : `${date}_${nextIndex}.log`;
  return path.join(logsDir, nextFileName);
}

function getNextLogFilePath(date: string) {
  const pattern = new RegExp(`^${escapeRegExp(date)}(?:_(\\d+))?\\.log$`);
  const files = fs
    .readdirSync(logsDir)
    .filter((file) => pattern.test(file))
    .map((file) => {
      const match = pattern.exec(file);
      const index = match && match[1] ? Number(match[1]) : 0;
      return { file, index };
    });

  const nextIndex =
    files.length === 0 ? 1 : Math.max(...files.map((entry) => entry.index)) + 1;
  const nextFileName =
    nextIndex === 0 ? `${date}.log` : `${date}_${nextIndex}.log`;
  return path.join(logsDir, nextFileName);
}

class CsvRotatingWriteStream extends Writable {
  private currentDate: string;
  private currentPath: string;
  private currentSize: number;
  private stream: fs.WriteStream;
  private tail: string;

  constructor(date: string) {
    super();
    this.currentDate = date;
    this.currentPath = getRotatedLogFilePath(date);
    this.currentSize = fs.existsSync(this.currentPath)
      ? fs.statSync(this.currentPath).size
      : 0;
    this.stream = fs.createWriteStream(this.currentPath, { flags: "a" });
    this.tail = "";
  }

  private rotate(nextPath: string, callback: () => void) {
    this.stream.end(() => {
      this.currentPath = nextPath;
      this.currentSize = fs.existsSync(nextPath)
        ? fs.statSync(nextPath).size
        : 0;
      this.stream = fs.createWriteStream(nextPath, { flags: "a" });
      callback();
    });
  }

  _write(
    chunk: Buffer | string,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    const chunkString = typeof chunk === "string" ? chunk : chunk.toString();
    const combined = this.tail + chunkString;
    const lines = combined.split(/\r?\n/);
    this.tail = lines.pop() || "";

    const formattedLines = lines
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          const data = JSON.parse(line);
          const time = data.time
            ? formatTimestamp(new Date(String(data.time)))
            : formatTimestamp(new Date());
          const level = String(data.level ?? "").toUpperCase();
          const messageBase = String(data.msg ?? data.message ?? "");
          const extraParts = [
            typeof data.method === "string" ? data.method : "",
            typeof data.url === "string" ? data.url : "",
          ].filter(Boolean);
          const message = sanitizeMessage(
            [messageBase, ...extraParts].filter(Boolean).join(" "),
          );
          return `${time}|${level}|${message}`;
        } catch {
          return null;
        }
      })
      .filter((line): line is string => line !== null)
      .map((line) => `${line}\n`);

    const writeData = formattedLines.join("");
    const totalLength = Buffer.byteLength(writeData, "utf8");

    const write = () => {
      if (!writeData) {
        callback();
        return;
      }
      this.stream.write(writeData, "utf8", (err) => {
        callback(err || undefined);
      });
    };

    const currentFileSize = fs.existsSync(this.currentPath)
      ? fs.statSync(this.currentPath).size
      : 0;

    if (currentFileSize + totalLength > LOG_MAX_SIZE_BYTES) {
      this.rotate(getNextLogFilePath(this.currentDate), write);
      return;
    }

    write();
  }

  _final(callback: (error?: Error | null) => void) {
    if (this.tail) {
      this.stream.write(`${this.tail}\n`, "utf8", (err) => {
        this.tail = "";
        this.stream.end(callback);
      });
    } else {
      this.stream.end(callback);
    }
  }
}

// Function to clean old log files
function cleanOldLogs() {
  try {
    const files = fs
      .readdirSync(logsDir)
      .filter((file) => file.endsWith(".log"))
      .map((file) => ({
        name: file,
        path: path.join(logsDir, file),
        stats: fs.statSync(path.join(logsDir, file)),
      }))
      .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

    // Keep only the most recent LOG_MAX_FILES files
    // if (files.length > LOG_MAX_FILES) {
    //   const filesToDelete = files.slice(LOG_MAX_FILES);
    //   filesToDelete.forEach((file) => {
    //     try {
    //       fs.unlinkSync(file.path);
    //     } catch {
    //       // ignore deletion failures
    //     }
    //   });
    // }
  } catch {
    // ignore cleanup failures
  }
}

// Clean old logs on startup
cleanOldLogs();

// Create the logger with file-only CSV output
const currentDate = "2026-04-06"; // Fixed date for logging
const logStream = new CsvRotatingWriteStream(currentDate);

const logger = pino(
  {
    level: LOG_LEVEL,
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  logStream,
);

export default logger;
