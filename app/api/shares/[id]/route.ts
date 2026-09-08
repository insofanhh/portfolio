import { readShare, SHARE_ID, ShareStorageUnavailable } from "@/lib/share-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!SHARE_ID.test(id)) return Response.json({ error: "Link hồ sơ không hợp lệ." }, { status: 400, headers });
  try {
    const profile = await readShare(id);
    if (!profile) return Response.json({ error: "Không tìm thấy hồ sơ. Hãy kiểm tra lại link với người gửi." }, { status: 404, headers });
    return Response.json({ profile }, { headers });
  } catch (error) {
    return Response.json({ error: error instanceof ShareStorageUnavailable ? error.message : "Tạm thời không thể tải hồ sơ. Vui lòng thử lại." }, { status: 503, headers });
  }
}
