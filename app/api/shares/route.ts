import { saveShare, ShareStorageUnavailable } from "@/lib/share-store";
import { validateProfile } from "@/lib/sharing";
import { PROFILE_BODY_MAX_BYTES } from "@/lib/profile";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  // Next.js may use an internal origin in request.url behind a proxy.
  // Compare the browser origin with the actual request Host instead.
  let validOrigin = true;
  if (origin) {
    try {
      const source = new URL(origin);
      validOrigin = ["http:", "https:"].includes(source.protocol)
        && source.host === (request.headers.get("host") || new URL(request.url).host);
    } catch { validOrigin = false; }
  }
  if (!validOrigin) {
    return Response.json({ error: "Yêu cầu chia sẻ không hợp lệ." }, { status: 403, headers });
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "Yêu cầu phải là JSON." }, { status: 415, headers });
  }
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "Thiếu hồ sơ." }, { status: 400, headers });
  let text = "";
  let length = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > PROFILE_BODY_MAX_BYTES) {
        await reader.cancel();
        return Response.json({ error: "Hồ sơ quá lớn." }, { status: 413, headers });
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } catch {
    return Response.json({ error: "Không thể đọc hồ sơ." }, { status: 400, headers });
  }
  let profile;
  try { profile = validateProfile(JSON.parse(text)); }
  catch (error) {
    return Response.json({ error: error instanceof SyntaxError ? "JSON không hợp lệ." : error instanceof Error ? error.message : "Hồ sơ không hợp lệ." }, { status: 400, headers });
  }
  try {
    const id = await saveShare(profile);
    return Response.json({ id, path: "/?s=" + id }, { status: 201, headers });
  } catch (error) {
    return Response.json({ error: error instanceof ShareStorageUnavailable ? error.message : "Chưa lưu được hồ sơ. Vui lòng thử lại." }, { status: 503, headers });
  }
}
