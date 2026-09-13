import { Code2, ArrowUpRight } from "lucide-react";
export function PortfolioHeader({name,portfolioHref}:{name:string;portfolioHref?:string}) {
 const sectionHref=(section:string)=>{
  if(!portfolioHref)return "#"+section;
  // Legacy shares already use the hash for their payload.
  if(portfolioHref.includes("#p="))return portfolioHref.replace("#p=","?section="+section+"#p=");
  return portfolioHref+"#"+section;
 };
 return <header className="header"><a href={portfolioHref??"#main"} className="logo" aria-label="Về trang portfolio"><Code2 size={25}/><span>{name.split(" ").at(-1)?.toLowerCase()}<i>.dev</i></span></a><nav aria-label="Điều hướng"><a href={sectionHref("about")}>Giới thiệu</a><a href={sectionHref("projects")}>Dự án</a><a href={sectionHref("experience")}>Kinh nghiệm</a></nav><a className="nav-contact" href={sectionHref("contact")}>Kết nối <ArrowUpRight size={17}/></a></header>;
}
