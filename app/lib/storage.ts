import type { ProjectSession } from "~/../types";
import { parseAIJson } from "./utils";

const LOCAL_STORAGE_PREFIX = "proof:session:";

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
    return (globalThis as unknown as { localStorage: Storage }).localStorage;
  }
  return null;
}

/**
 * Universal Local-First Storage Adapter for Proof.
 * Allows anonymous guests to create, persist, and retrieve project sessions in localStorage,
 * while automatically syncing with Puter KV cloud storage when authenticated.
 */
export class SessionStorageAdapter {
  /**
   * Retrieves a single project session by ID.
   * Checks localStorage first, then Puter KV if authenticated.
   */
  static async getSession(
    id: string,
    puterKV?: { get: (key: string) => Promise<string | null | undefined> },
    isAuthenticated = false,
  ): Promise<ProjectSession | null> {
    if (!id || id === "new") return null;

    const storage = getStorage();

    // 1. Try localStorage
    if (storage) {
      try {
        const localRaw = storage.getItem(`${LOCAL_STORAGE_PREFIX}${id}`);
        if (localRaw) {
          const parsed = parseAIJson<ProjectSession>(localRaw);
          if (parsed && parsed.id) return parsed;
        }
      } catch (err) {
        console.warn("LocalStorage read error:", err);
      }
    }

    // 2. Try Puter KV if authenticated
    if (isAuthenticated && puterKV) {
      try {
        const cloudRaw = await puterKV.get(`${LOCAL_STORAGE_PREFIX}${id}`);
        if (cloudRaw) {
          const parsed = parseAIJson<ProjectSession>(cloudRaw);
          if (parsed && parsed.id) {
            // Cache back into localStorage for offline speed
            if (typeof window !== "undefined") {
              window.localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${id}`, JSON.stringify(parsed));
            }
            return parsed;
          }
        }
      } catch (err) {
        console.warn("Puter KV read error:", err);
      }
    }

    return null;
  }

  /**
   * Persists a project session.
   * Always writes to localStorage (for instant zero-auth guest resilience),
   * and asynchronously writes to Puter KV if authenticated.
   */
  static async saveSession(
    session: ProjectSession,
    puterKV?: { set: (key: string, value: string) => Promise<boolean | undefined> },
    isAuthenticated = false,
  ): Promise<void> {
    if (!session || !session.id) return;

    const payload = JSON.stringify(session);
    const storage = getStorage();

    // 1. Always write to localStorage
    if (storage) {
      try {
        storage.setItem(`${LOCAL_STORAGE_PREFIX}${session.id}`, payload);
      } catch (err) {
        console.warn("LocalStorage write error:", err);
      }
    }

    // 2. Write to Puter KV if authenticated
    if (isAuthenticated && puterKV) {
      try {
        await puterKV.set(`${LOCAL_STORAGE_PREFIX}${session.id}`, payload);
      } catch (err) {
        console.warn("Puter KV write error:", err);
      }
    }
  }

  /**
   * Lists all sessions across local storage and Puter KV.
   * Merges and deduplicates sessions by ID.
   */
  static async listSessions(
    puterKV?: { list: (pattern: string, returnValues?: boolean) => Promise<unknown> },
    isAuthenticated = false,
  ): Promise<ProjectSession[]> {
    const sessionMap = new Map<string, ProjectSession>();
    const storage = getStorage();

    // 1. Gather all sessions from localStorage
    if (storage) {
      try {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(LOCAL_STORAGE_PREFIX)) {
            const raw = storage.getItem(key);
            if (raw) {
              const session = parseAIJson<ProjectSession>(raw);
              if (session && session.id) {
                sessionMap.set(session.id, session);
              }
            }
          }
        }
      } catch (err) {
        console.warn("LocalStorage list error:", err);
      }
    }

    // 2. If authenticated, fetch from Puter KV and merge
    if (isAuthenticated && puterKV) {
      try {
        const rawItems = await puterKV.list(`${LOCAL_STORAGE_PREFIX}*`, true);
        if (Array.isArray(rawItems)) {
          for (const item of rawItems) {
            const val = typeof item === "string" ? item : (item as { value?: string })?.value;
            if (val) {
              const parsed = parseAIJson<ProjectSession>(val);
              if (parsed && parsed.id) {
                // If cloud version is newer or not in local, use it
                const existing = sessionMap.get(parsed.id);
                const parsedTime = parsed.updatedAt || parsed.createdAt || 0;
                const existingTime = existing?.updatedAt || existing?.createdAt || 0;
                if (!existing || parsedTime >= existingTime) {
                  sessionMap.set(parsed.id, parsed);
                  // Cache in localStorage
                  if (storage) {
                    storage.setItem(`${LOCAL_STORAGE_PREFIX}${parsed.id}`, JSON.stringify(parsed));
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn("Puter KV list error:", err);
      }
    }

    const result = Array.from(sessionMap.values());
    result.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
    return result;
  }

  /**
   * Deletes a session from both localStorage and Puter KV.
   */
  static async deleteSession(
    id: string,
    puterKV?: { delete: (key: string) => Promise<boolean | undefined> },
    isAuthenticated = false,
  ): Promise<void> {
    if (!id) return;
    const storage = getStorage();

    if (storage) {
      try {
        storage.removeItem(`${LOCAL_STORAGE_PREFIX}${id}`);
      } catch (err) {
        console.warn("LocalStorage delete error:", err);
      }
    }

    if (isAuthenticated && puterKV) {
      try {
        await puterKV.delete(`${LOCAL_STORAGE_PREFIX}${id}`);
      } catch (err) {
        console.warn("Puter KV delete error:", err);
      }
    }
  }

  /**
   * Syncs all local-only guest sessions into Puter KV once the user authenticates.
   */
  static async syncLocalToCloud(
    puterKV: { set: (key: string, value: string) => Promise<boolean | undefined> },
  ): Promise<number> {
    const storage = getStorage();
    if (!storage || !puterKV) return 0;
    let syncedCount = 0;

    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(LOCAL_STORAGE_PREFIX)) {
          const raw = storage.getItem(key);
          if (raw) {
            await puterKV.set(key, raw);
            syncedCount++;
          }
        }
      }
    } catch (err) {
      console.warn("Sync to cloud error:", err);
    }

    return syncedCount;
  }
}
