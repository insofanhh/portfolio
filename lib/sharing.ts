import LZString from "lz-string";
import { initial, safeUrl, type Profile } from "./profile";
export const DRAFT_KEY="portfolio-studio-draft-v1";
export function validateProfile(input: unknown): Profile {
 if(!input || typeof input!=="object" || Array.isArray(input)) throw new Error("Dữ liệu hồ sơ không hợp lệ.");
 const x=input as Record<string,unknown>;
 for(const key of ["name","role","location","intro","about","email","github","linkedin","cv","years","skills"]){
  if(typeof x[key]!=="string" || (x[key] as string).length>5000) throw new Error("Trường thông tin không hợp lệ: "+key);
 }
 if(!(x.name as string).trim() || !(x.role as string).trim()) throw new Error("Vui lòng điền họ tên và vị trí.");
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.email as string)) throw new Error("Địa chỉ email chưa hợp lệ.");
 if(typeof x.available!=="boolean") throw new Error("Trạng thái chưa hợp lệ.");
 for(const k of ["cv","github","linkedin"]) if(x[k]&&!safeUrl(x[k] as string)) throw new Error("Liên kết phải bắt đầu bằng https:// hoặc http://.");
 for(const [list,keys] of [["projects",["title","category","description","tags","result","url"]],["experience",["company","role","period","description"]]] as const){
  const rows=x[list]; if(!Array.isArray(rows)||rows.length>12) throw new Error("Tối đa 12 mục cho mỗi danh sách.");
  for(const row of rows) { if(!row || typeof row!=="object" || keys.some(k=>typeof row[k]!=="string"||row[k].length>5000)) throw new Error("Nội dung danh sách không hợp lệ."); if("url" in row && row.url && !safeUrl(row.url)) throw new Error("Link dự án chưa hợp lệ."); }
 }
 const result=Object.fromEntries(Object.keys(initial).map(k=>[k,x[k]])) as Profile;
 if(JSON.stringify(result).length>40000) throw new Error("Hồ sơ quá dài. Vui lòng rút gọn xuống dưới 40.000 ký tự.");
 return result;
}
export function encodeProfile(profile:Profile){ return LZString.compressToEncodedURIComponent(JSON.stringify(validateProfile(profile))); }
export function decodeProfile(encoded:string){ if(encoded.length>55000) throw new Error("Link hồ sơ quá dài."); const json=LZString.decompressFromEncodedURIComponent(encoded);if(!json || json.length>40000)throw new Error("Link hồ sơ bị thiếu hoặc hỏng.");return validateProfile(JSON.parse(json)); }
export function profileLink(profile:Profile){return window.location.origin+window.location.pathname+"#p="+encodeProfile(profile);}

export async function createShortProfileLink(profile: Profile, signal?: AbortSignal): Promise<string> {
 const response = await fetch("/api/shares", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify(validateProfile(profile)), signal,
 });
 let result;
 try { result = await response.json(); } catch { throw new Error("Dịch vụ link ngắn chưa hoạt động trên website này."); }
 if (!response.ok) throw new Error(result.error || "Không thể tạo link ngắn.");
 if (typeof result.id !== "string" || !/^[A-Za-z0-9_-]{22}$/.test(result.id)) throw new Error("Link trả về không hợp lệ.");
 return window.location.origin + "/?s=" + result.id;
}
export async function fetchSharedProfile(id: string, signal?: AbortSignal): Promise<Profile> {
 if (!/^[A-Za-z0-9_-]{22}$/.test(id)) throw new Error("Link hồ sơ không hợp lệ.");
 const response = await fetch("/api/shares/" + id, { signal, cache: "no-store" });
 let result;
 try { result = await response.json(); } catch { throw new Error("Dịch vụ chia sẻ chưa hoạt động trên website này."); }
 if (!response.ok) throw new Error(result.error || "Không thể tải hồ sơ.");
 return validateProfile(result.profile);
}
