"use client";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, UserRound, Heart, Fingerprint, UsersRound, FileText, Pencil, Share2, Eye, MapPin, Mail } from "lucide-react";
import { initial, emptyBiography, biographyFields, type Profile } from "@/lib/profile";
import { DRAFT_KEY, validateProfile, decodeProfile, fetchSharedProfile, profilePageHref } from "@/lib/sharing";
import { PortfolioHeader } from "@/components/portfolio-header";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Editor, ShareDialog } from "@/components/portfolio-editor";

function Details({rows}:{rows:ReadonlyArray<readonly [string,string]>}) {
 const filled=rows.filter(([,value])=>value.trim());
 if(!filled.length)return null;
 return <dl className="bio-details">{filled.map(([label,value],index)=><div key={index}>{label.trim()&&<dt>{label}</dt>}<dd>{value}</dd></div>)}</dl>;
}
function Card({id,number,title,icon,children}:{id:string;number:string;title:string;icon:ReactNode;children:ReactNode}) {
 return <section id={id} className="bio-card reveal"><div className="bio-card-heading"><span className="bio-icon">{icon}</span><h2>{title}</h2><span className="bio-number">{number}</span></div>{children}</section>;
}
export function BiographyPage() {
 const [profile,setProfile]=useState<Profile>(initial);
 const [ready,setReady]=useState(false);
 const [shared,setShared]=useState(false);
 const [preview,setPreview]=useState(false);
 const [editing,setEditing]=useState(false);
 const [shareOpen,setShareOpen]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [portfolioHref,setPortfolioHref]=useState("/");
 useEffect(()=>{
  const controller=new AbortController();
  const shortId=new URLSearchParams(window.location.search).get("s");
  const isShared=shortId!==null||window.location.hash.startsWith("#p=");
  void Promise.resolve().then(async()=>{
   if(controller.signal.aborted)return;
   setShared(isShared);
   setPortfolioHref(profilePageHref("/",window.location.search,window.location.hash));
   try {
    let next:Profile=initial;
    if(shortId!==null) next=await fetchSharedProfile(shortId,controller.signal);
    else if(isShared) next=decodeProfile(window.location.hash.slice(3));
    else {const raw=localStorage.getItem(DRAFT_KEY);if(raw)next=validateProfile(JSON.parse(raw));}
    if(!controller.signal.aborted)setProfile(next);
   } catch(err) {
    if(controller.signal.aborted)return;
    if(isShared)setError(err instanceof Error?err.message:"Không thể mở hồ sơ.");
    else setNotice("Không thể đọc bản nháp. Bạn có thể nhập bản sao JSON trong trình chỉnh sửa.");
   } finally {if(!controller.signal.aborted)setReady(true);}
  });
  const navigate=(event:MouseEvent)=>{
   const link=(event.target as Element).closest('a[href^="#"]');
   const href=link?.getAttribute("href");
   if(!href||href.startsWith("#p="))return;
   event.preventDefault();
   document.getElementById(href.slice(1))?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
  };
  document.addEventListener("click",navigate);
  return()=>{controller.abort();document.removeEventListener("click",navigate);};
 },[]);
 useEffect(()=>{if(ready&&!error)document.title=profile.name+" — Sơ yếu lý lịch";},[ready,error,profile.name]);
 useEffect(()=>{
  if(!ready||error)return;
  const elements=Array.from(document.querySelectorAll<HTMLElement>(".bio-card.reveal"));
  const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
  if(motion.matches||!("IntersectionObserver" in window))return;
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.remove("reveal-pending");entry.target.classList.add("visible");observer.unobserve(entry.target);}
  }),{threshold:0,rootMargin:"0px 0px -24px 0px"});
  elements.forEach(element=>{element.classList.add("reveal-pending");observer.observe(element);});
  const show=()=>{if(motion.matches){observer.disconnect();elements.forEach(element=>element.classList.remove("reveal-pending"));}};
  motion.addEventListener("change",show);
  return()=>{observer.disconnect();motion.removeEventListener("change",show);elements.forEach(element=>element.classList.remove("reveal-pending"));};
 },[ready,error,profile]);
 if(!ready)return <output className="loading-profile">Đang mở sơ yếu lý lịch…</output>;
 if(error)return <main className="invalid-share"><FileText size={40}/><h1>Không thể mở hồ sơ này.</h1><p>{error}</p><button className="btn subtle" onClick={()=>window.location.reload()}>Tải lại hồ sơ</button></main>;
 const bio=profile.biography??emptyBiography();
 const personalRows=biographyFields.slice(0,8).map(([key,label])=>[label,bio[key]] as const);
 const characterRows=biographyFields.slice(8,12).map(([key,label])=>[label,bio[key]] as const);
 const family=bio.family.filter(member=>Object.values(member).some(value=>value.trim()));
 const extra=bio.customFields.filter(row=>row.value.trim());
 const hasPersonal=personalRows.some(([,value])=>value.trim());
 const hasCharacter=characterRows.some(([,value])=>value.trim());
 const hasLife=Boolean(bio.maritalStatus.trim()||bio.health.trim());
 const hasFamily=Boolean(family.length||bio.familyNotes.trim());
 const hasExtra=Boolean(extra.length||bio.notes.trim());
 const owner=!shared&&!preview;
 return <>
  <a href="#bio-main" className="skip">Đến nội dung</a>
  <PortfolioHeader name={profile.name} portfolioHref={portfolioHref}/>
  <main className="shell bio-main" id="bio-main">
   <div className="bio-intro"><p className="eyebrow"><span className="live-dot"/> HỒ SƠ CÁ NHÂN</p><h1>Sơ yếu <span>lý lịch.</span></h1><p>Một góc nhìn đầy đủ hơn về con người phía sau những dòng code.</p></div>
   <div className="bio-layout">
    <aside className="bio-sidebar"><div className="bio-identity"><ProfileAvatar name={profile.name} photo={profile.avatar}/><p className="eyebrow">XIN CHÀO, TÔI LÀ</p><h2>{profile.name}</h2><p className="bio-role">{profile.role}</p><div className="bio-identity-contact">{profile.location.trim()&&<p><MapPin size={15}/>{profile.location}</p>}<a href={"mailto:"+profile.email}><Mail size={15}/>{profile.email}</a></div><a className="bio-portfolio-link" href={portfolioHref}>Khám phá portfolio <ArrowUpRight size={16}/></a></div>
     <nav className="bio-nav" aria-label="Các phần sơ yếu lý lịch">
      {(hasPersonal)&&<a href="#personal">01 <span>Thông tin cá nhân</span></a>}
      {(hasCharacter)&&<a href="#character">02 <span>Con người & đam mê</span></a>}
      {(hasLife)&&<a href="#life">03 <span>Cuộc sống & sức khỏe</span></a>}
      {(hasFamily)&&<a href="#family">04 <span>Gia đình</span></a>}
      {(hasExtra)&&<a href="#extra">05 <span>Thông tin bổ sung</span></a>}
     </nav>
    </aside>
    <div className="bio-sections">
     {(hasPersonal)&&<Card id="personal" number="01" title="Thông tin cá nhân" icon={<UserRound size={21}/>} ><Details rows={personalRows}/></Card>}
     {(hasCharacter)&&<Card id="character" number="02" title="Con người & đam mê" icon={<Fingerprint size={21}/>} ><Details rows={characterRows}/></Card>}
     {(hasLife)&&<Card id="life" number="03" title="Cuộc sống & sức khỏe" icon={<Heart size={21}/>} ><Details rows={[["Tình trạng hôn nhân",bio.maritalStatus],["Sức khỏe",bio.health]]}/></Card>}
     {(hasFamily)&&<Card id="family" number="04" title="Gia đình" icon={<UsersRound size={21}/>} >{bio.familyNotes.trim()&&<p className="bio-prose">{bio.familyNotes}</p>}{family.length>0&&<div className="bio-family">{family.map((member,index)=><article className="bio-family-member" key={index}>{(member.name.trim()||member.relationship.trim())&&<div className="bio-family-title">{member.name.trim()&&<h3>{member.name}</h3>}{member.relationship.trim()&&<span>{member.relationship}</span>}</div>}<Details rows={[["Năm sinh",member.birthYear],["Nghề nghiệp",member.occupation],["Học vấn",member.education??""],["Thông tin thêm",member.notes]]}/></article>)}</div>}</Card>}
     {(hasExtra)&&<Card id="extra" number="05" title="Thông tin bổ sung" icon={<FileText size={21}/>} >{bio.notes.trim()&&<p className="bio-prose">{bio.notes}</p>}{extra.length>0&&<Details rows={extra.map(row=>[row.label.trim(),row.value])}/>}</Card>}
     {!hasPersonal&&!hasCharacter&&!hasLife&&!hasFamily&&!hasExtra&&<div className="bio-card"><FileText className="mint" size={30}/><h2 className="bio-empty-title">Chưa có thông tin bổ sung.</h2><p className="bio-empty">Bạn có thể tìm hiểu dự án và kinh nghiệm của {profile.name} tại portfolio.</p><a className="btn subtle" href={portfolioHref}>Xem portfolio <ArrowUpRight size={16}/></a></div>}
    </div>
   </div>
  </main>
  <footer className="shell footer"><span>© {new Date().getFullYear()} {profile.name}</span><span>Mỗi người đều có một câu chuyện riêng.</span><a href={portfolioHref}>Portfolio ↗</a></footer>
  {owner&&<div className="owner-bar"><span className="owner-label"><span className="live-dot"/>SƠ YẾU LÝ LỊCH<small>Bản nháp trên thiết bị này</small></span><div><button onClick={()=>setPreview(true)}><Eye size={16}/><span>Xem trước</span></button><button className="edit-button" onClick={()=>setEditing(true)}><Pencil size={15}/>Chỉnh sửa</button><button className="share-button" onClick={()=>setShareOpen(true)}><Share2 size={15}/><span>Gửi HR</span></button></div></div>}
  {preview&&!shared&&<button className="back-edit" onClick={()=>setPreview(false)}><Pencil size={15}/>Về trình chỉnh sửa</button>}
  {editing&&!shared&&<Editor open={editing} onOpenChange={setEditing} initialTab="biography" profile={profile} onSave={next=>{setProfile(next);setNotice("Đã lưu sơ yếu lý lịch trên thiết bị này.");}}/>}
  {shareOpen&&!shared&&<ShareDialog open={shareOpen} onOpenChange={setShareOpen} profile={profile}/>}
  {notice&&<output className="status-message">{notice}<button className="bio-dismiss" onClick={()=>setNotice("")} aria-label="Đóng thông báo">×</button></output>}
 </>;
}
