export const biographyFields = [
  ["birthDate", "Ngày sinh"], ["gender", "Giới tính"], ["phone", "Số điện thoại"],
  ["birthPlace", "Nơi sinh"], ["hometown", "Quê quán"], ["nationality", "Quốc tịch"],
  ["address", "Địa chỉ hiện tại"], ["education", "Học vấn"],
  ["interests", "Sở thích"], ["passions", "Đam mê"], ["personality", "Tính cách"],
  ["values", "Giá trị sống"], ["maritalStatus", "Tình trạng hôn nhân"],
  ["health", "Sức khỏe"], ["familyNotes", "Giới thiệu gia đình"], ["notes", "Thông tin bổ sung"],
] as const;
export type BiographyField = typeof biographyFields[number][0];
export type FamilyMember = { name: string; relationship: string; birthYear: string; occupation: string; education?: string; notes: string };
export type Biography = Record<BiographyField, string> & {
  family: FamilyMember[];
  customFields: { label: string; value: string }[];
};
export function emptyBiography(): Biography {
  const fields = Object.fromEntries(biographyFields.map(([key]) => [key, ""])) as Record<BiographyField, string>;
  return { ...fields, family: [], customFields: [] };
}
export type Project = { title: string; category: string; description: string; tags: string; result: string; url: string };
export type Experience = { company: string; role: string; period: string; description: string };
export type Profile = {
  name: string; role: string; location: string; intro: string; about: string; email: string; github: string; linkedin: string; cv: string;
  avatar?: string;
  biography?: Biography;
  available: boolean; years: string; skills: string; projects: Project[]; experience: Experience[];
};
export const initial: Profile = {
 name: "Nguyễn Minh", role: "Full-stack Developer", location: "Hồ Chí Minh, Việt Nam",
 intro: "Tôi biến những ý tưởng phức tạp thành trải nghiệm số đơn giản, chỉn chu và có giá trị.",
 about: "Tôi là một lập trình viên yêu thích điểm giao giữa công nghệ và thiết kế. Tôi xây dựng sản phẩm web từ giao diện đến hệ thống phía sau, với sự quan tâm đặc biệt đến hiệu năng, khả năng tiếp cận và từng chi tiết nhỏ.\nNgoài những dòng code, tôi thích khám phá công nghệ mới, chia sẻ kiến thức và làm việc cùng những người luôn tò mò.",
 email: "hello@example.com", github: "", linkedin: "", cv: "", available: true, years: "4+",
 skills: "React, Next.js, TypeScript, Node.js, PostgreSQL, Docker, Figma, Git",
 projects: [
 {title:"Orbit Analytics", category:"Full-stack · SaaS",description:"Nền tảng phân tích dữ liệu giúp đội ngũ biến những con số thành quyết định có ý nghĩa.",tags:"Next.js, TypeScript, PostgreSQL",result:"Dashboard · Phân tích thời gian thực",url:""},
 {title:"Forma Commerce",category:"Front-end · E-commerce",description:"Trải nghiệm mua sắm tối giản, nhanh và liền mạch trên mọi thiết bị.",tags:"React, Tailwind CSS, Stripe",result:"E-commerce · Trải nghiệm đa thiết bị",url:""},
 {title:"DevSpace",category:"Full-stack · Community",description:"Không gian kết nối, chia sẻ kiến thức và cùng phát triển dành cho lập trình viên.",tags:"Next.js, Node.js, Docker",result:"Community · Chia sẻ kiến thức",url:""}
 ],
 experience: [
 {company:"Product Studio",role:"Full-stack Developer",period:"2023 — Hiện tại",description:"Phát triển ứng dụng web từ ý tưởng đến sản phẩm. Phối hợp cùng designer và product manager để cải thiện trải nghiệm người dùng."},
 {company:"Digital Lab",role:"Front-end Developer",period:"2021 — 2023",description:"Xây dựng giao diện responsive, hệ thống component dùng chung và tối ưu hiệu năng ứng dụng React."}
 ]
};
export function safeUrl(value: string) { try { const u = new URL(value); return ["https:", "http:"].includes(u.protocol) ? u.href : ""; } catch { return ""; } }

export const AVATAR_MAX_LENGTH = 32000;
export const PROFILE_BODY_MAX_BYTES = 200000;
export function validAvatar(value: unknown): value is string {
 return typeof value === "string" && (value === "" || (value.length <= AVATAR_MAX_LENGTH && /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)));
}
