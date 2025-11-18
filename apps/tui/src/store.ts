import { promises as fs } from "fs";
import path from "path";
import type { ReadonlyJSONValue, ZeroOptions } from "@rocicorp/zero";
import { config } from "./config";

type StoreProvider = ZeroOptions<any>["kvStore"];

const DATA_DIR = config.dir;

// async function ensureDir() {
//   await fs.mkdir(DATA_DIR, { recursive: true });
// }
//
function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === "object" && !Object.isFrozen(obj)) {
    Object.freeze(obj);
    for (const value of Object.values(obj as any)) {
      deepFreeze(value);
    }
  }
  return obj;
}

async function loadFile(name: string): Promise<Map<string, ReadonlyJSONValue>> {
  // await ensureDir();
  const filePath = path.join(DATA_DIR, `${name}.json`);
  try {
    const buf = await fs.readFile(filePath, "utf8");
    const obj = JSON.parse(buf) as Record<string, ReadonlyJSONValue>;
    const frozen = Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, deepFreeze(v)])
    );
    return new Map(Object.entries(frozen));
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return new Map();
    }
    throw err;
  }
}

async function saveFile(name: string, data: Map<string, ReadonlyJSONValue>) {
  // await ensureDir();
  const filePath = path.join(DATA_DIR, `${name}.json`);
  const obj = Object.fromEntries(data.entries());
  await fs.writeFile(filePath, JSON.stringify(obj, null, 2), "utf8");
}

export const kvStore: StoreProvider = {
  create: (name: string) => {
    let closed = false;
    let dataPromise = loadFile(name);

    const makeRead = async () => {
      const data = await dataPromise;
      let txClosed = false;
      return {
        closed: txClosed,
        async has(key: string) {
          if (txClosed) throw new Error("transaction closed");
          return data.has(key);
        },
        async get(key: string) {
          if (txClosed) throw new Error("transaction closed");
          return data.get(key);
        },
        release() {
          txClosed = true;
        },
      };
    };

    const makeWrite = async () => {
      const data = await dataPromise;
      let txClosed = false;
      const staging = new Map<string, ReadonlyJSONValue | undefined>();

      return {
        closed: txClosed,
        async has(key: string) {
          if (txClosed) throw new Error("transaction closed");
          return staging.has(key) ? staging.get(key) !== undefined : data.has(key);
        },
        async get(key: string) {
          if (txClosed) throw new Error("transaction closed");
          return staging.has(key) ? staging.get(key) : data.get(key);
        },
        async put(key: string, value: ReadonlyJSONValue) {
          if (txClosed) throw new Error("transaction closed");
          staging.set(key, deepFreeze(value)); // 🔒 freeze before staging
        },
        async del(key: string) {
          if (txClosed) throw new Error("transaction closed");
          staging.set(key, undefined);
        },
        async commit() {
          if (txClosed) throw new Error("transaction closed");
          for (const [k, v] of staging.entries()) {
            if (v === undefined) {
              data.delete(k);
            } else {
              data.set(k, v);
            }
          }
          await saveFile(name, data);
          txClosed = true;
        },
        release() {
          txClosed = true;
        },
      };
    };

    return {
      closed,
      async read() {
        if (closed) throw new Error("store closed");
        return makeRead();
      },
      async write() {
        if (closed) throw new Error("store closed");
        return makeWrite();
      },
      async close() {
        closed = true;
      },
    };
  },

  async drop(name: string) {
    // await ensureDir();
    const filePath = path.join(DATA_DIR, `${name}.json`);
    await fs.rm(filePath, { force: true });
    console.log("destroy db:", name);
  },
};
