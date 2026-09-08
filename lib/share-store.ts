import { createHash, randomUUID } from "node:crypto";
import { get, put } from "@vercel/blob";
import { mkdir, readFile, writeFile, rename, unlink } from "node:fs/promises";
import { resolve, join } from "node:path";
import { validateProfile } from "./sharing";
import type { Profile } from "./profile";

export const SHARE_ID = /^[A-Za-z0-9_-]{22}$/;
export class ShareStorageUnavailable extends Error {}
function hasBlobStore() {
  // The SDK resolves OIDC credentials or the private read-write token itself.
  return Boolean(process.env.BLOB_STORE_ID?.trim() || process.env.BLOB_READ_WRITE_TOKEN?.trim());
}
function blobPath(id: string) { return "portfolio-shares/v1/" + id + ".json"; }
async function readBlobShare(id: string): Promise<Profile | null> {
  const result = await get(blobPath(id), { access: "private", useCache: false });
  if (!result) return null;
  if (result.statusCode !== 200) throw new Error("Unexpected blob response.");
  return validateProfile(await new Response(result.stream).json());
}
function directory() {
  if (process.env.VERCEL === "1") {
    throw new ShareStorageUnavailable("Chưa kết nối Vercel Blob. Hãy kết nối kho Private trong Storage của project và redeploy.");
  }
  const configured = process.env.SHARE_STORAGE_DIR;
  if (process.env.NODE_ENV === "production" && !configured) {
    throw new ShareStorageUnavailable("Chưa cấu hình nơi lưu hồ sơ trên máy chủ.");
  }
  return resolve(configured || join(process.cwd(), ".data", "shares"));
}
export async function readShare(id: string): Promise<Profile | null> {
  if (!SHARE_ID.test(id)) return null;
  if (hasBlobStore()) return readBlobShare(id);
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

  const existing = await readShare(id);
  if (existing) {
    if (JSON.stringify(existing) !== contents) throw new Error("Share identifier conflict.");
    return id;
  }
  if (hasBlobStore()) {
    try {
      await put(blobPath(id), contents, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: "application/json",
      });
    } catch (error) {
      const winner = await readBlobShare(id);
      if (!winner || JSON.stringify(winner) !== contents) throw error;
    }
    return id;
  }
  const root = directory();
  await mkdir(root, { recursive: true });
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
