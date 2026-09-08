import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, rename, unlink } from "node:fs/promises";
import { resolve, join } from "node:path";
import { validateProfile } from "./sharing";
import type { Profile } from "./profile";

export const SHARE_ID = /^[A-Za-z0-9_-]{22}$/;
export class ShareStorageUnavailable extends Error {}
function directory() {
  const configured = process.env.SHARE_STORAGE_DIR;
  if (process.env.NODE_ENV === "production" && !configured) {
    throw new ShareStorageUnavailable("Chưa cấu hình nơi lưu hồ sơ trên máy chủ.");
  }
  return resolve(configured || join(process.cwd(), ".data", "shares"));
}
export async function readShare(id: string): Promise<Profile | null> {
  if (!SHARE_ID.test(id)) return null;
  try {
    const contents = await readFile(join(directory(), id + ".json"), "utf8");
    return validateProfile(JSON.parse(contents));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
export async function saveShare(input: unknown): Promise<string> {
  const profile = validateProfile(input);
  const contents = JSON.stringify(profile);
  // Reuse identical snapshots; editing produces a different link.
  const id = createHash("sha256").update(contents).digest("base64url").slice(0, 22);
  const root = directory();
  await mkdir(root, { recursive: true });
  const existing = await readShare(id);
  if (existing) {
    if (JSON.stringify(existing) !== contents) throw new Error("Share identifier conflict.");
    return id;
  }
  const temporary = join(root, "." + randomUUID() + ".tmp");
  try {
    await writeFile(temporary, contents, { encoding: "utf8", flag: "wx", mode: 0o600 });
    // Atomic rename prevents readers from receiving an incomplete snapshot.
    try {
      await rename(temporary, join(root, id + ".json"));
    } catch (error) {
      // Windows may reject replacing a concurrently-created immutable snapshot.
      const winner = await readShare(id);
      if (!winner || JSON.stringify(winner) !== contents) throw error;
    }
  } finally {
    await unlink(temporary).catch(error => {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    });
  }
  return id;
}
