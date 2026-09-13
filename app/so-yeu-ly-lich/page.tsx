import type { Metadata } from "next";
import { BiographyPage } from "@/components/biography-page";
export const metadata: Metadata = { title: "Sơ yếu lý lịch — Portfolio Studio", description: "Thông tin cá nhân và câu chuyện phía sau portfolio." };
export default function Page() { return <BiographyPage/>; }
