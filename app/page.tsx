"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDown, Code2, GitBranch, Briefcase, MapPin, Mail, Download, Pencil, Share2, Eye, Layers, Terminal, Sparkles } from "lucide-react";
import { initial, safeUrl, type Profile } from "@/lib/profile";
import { Editor, ShareDialog } from "@/components/portfolio-editor";
import { ToolIcon } from "@/components/tool-icon";
import { Toolkit } from "@/components/toolkit";
import { DRAFT_KEY, validateProfile, decodeProfile, fetchSharedProfile } from "@/lib/sharing";

export default function Home() {
 const [profile,setProfile]=useState<Profile>(initial);
 const [editing,setEditing]=useState(false);
 const [preview,setPreview]=useState(false);
 const [shared,setShared]=useState(false);
 const [ready,setReady]=useState(false);
 const [shareOpen,setShareOpen]=useState(false);
 const [invalid,setInvalid]=useState(false);
 const [shareError,setShareError]=useState("");
 const [notice,setNotice]=useState("");
 useEffect(()=>{
  const controller=new AbortController();
  const shortId=new URLSearchParams(window.location.search).get("s");
  const isShared=shortId!==null||window.location.hash.startsWith("#p=");
  setShared(isShared);setPreview(isShared);
  const loadProfile=async()=>{
   try{
    if(shortId!==null){
     const loaded=await fetchSharedProfile(shortId,controller.signal);
     if(!controller.signal.aborted)setProfile(loaded);
    }
    else if(window.location.hash.startsWith("#p=")){setProfile(decodeProfile(window.location.hash.slice(3)))}
    else{const raw=localStorage.getItem(DRAFT_KEY);if(raw)setProfile(validateProfile(JSON.parse(raw)))}
   }catch(error){
    if(controller.signal.aborted)return;
    if(isShared){setInvalid(true);setShareError(error instanceof Error?error.message:"Không thể mở hồ sơ.")}
    else{setNotice("Không thể đọc bản nháp trên trình duyệt này. Bạn có thể nhập bản sao JSON.")}
   }finally{if(!controller.signal.aborted)setReady(true)}
  };
  void loadProfile();
  const navigate=(event:MouseEvent)=>{const a=(event.target as Element).closest('a[href^="#"]');if(!a)return;const href=a.getAttribute("href");if(!href||href.startsWith("#p="))return;event.preventDefault();if(href==="#")window.scrollTo({top:0,behavior:"smooth"});else document.getElementById(href.slice(1))?.scrollIntoView({behavior:"smooth"});};
  document.addEventListener("click",navigate);return()=>{controller.abort();document.removeEventListener("click",navigate)};
 },[]);
 useEffect(()=>{if(ready)document.title=profile.name+" — "+profile.role;},[profile,ready]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(""),6000);return()=>clearTimeout(timer)},[notice]);
 useEffect(()=>{
  if(!ready||shared)return;
  const context=(document as Document & {modelContext?:{registerTool:(tool:unknown,options:{signal:AbortSignal})=>unknown}}).modelContext;
  if(!context?.registerTool)return;
  const lifecycle=new AbortController();
  try{Promise.resolve(context.registerTool({name:"start_portfolio_editing",description:"Open the portfolio editor. Does not save or share changes.",inputSchema:{type:"object",properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute(input:unknown){if(!input||typeof input!=="object"||Object.keys(input).length)throw new Error("Expected empty object");setEditing(true);return new Promise(resolve=>requestAnimationFrame(()=>resolve({editor:"open"})));}},{signal:lifecycle.signal})).catch(()=>{});}catch{}
  return()=>lifecycle.abort();
 },[ready,shared]);
 useEffect(() => {
  if (!ready || invalid) return;
  const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const show = (element: HTMLElement) => {
    element.classList.remove("reveal-pending");
    element.classList.add("visible");
  };

  // Keep content readable when motion is disabled or observation is unavailable.
  if (motion.matches || !("IntersectionObserver" in window)) {
    elements.forEach(show);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      show(entry.target as HTMLElement);
      observer.unobserve(entry.target);
    });
  }, {
    // A pixel inset also works for sections taller than a mobile viewport.
    threshold: 0,
    rootMargin: "0px 0px -32px 0px",
  });

  const pending = elements.filter((element) => !element.classList.contains("visible"));
  pending.forEach((element) => element.classList.add("reveal-pending"));
  const frame = requestAnimationFrame(() => {
    pending.forEach((element) => observer.observe(element));
  });
  const onMotionChange = () => {
    if (!motion.matches) return;
    cancelAnimationFrame(frame);
    observer.disconnect();
    elements.forEach(show);
  };
  motion.addEventListener("change", onMotionChange);

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    motion.removeEventListener("change", onMotionChange);
    pending.forEach((element) => element.classList.remove("reveal-pending"));
  };
 }, [ready, invalid, profile]);
 if(invalid)return <main className="invalid-share"><Code2 size={40}/><h1>Không thể mở hồ sơ này.</h1><p>{shareError||"Link có thể bị thiếu hoặc không hợp lệ. Hãy kiểm tra lại với người gửi."}</p><button className="btn subtle" onClick={()=>window.location.reload()}>Tải lại hồ sơ</button></main>;
 return <>{!ready&&<div className="loading-profile" role="status">Đang mở hồ sơ…</div>}<a href="#main" className="skip">Đến nội dung</a><div className="scroll-progress"/>
 <header className="header"><a href="#" className="logo"><Code2 size={25}/><span>{profile.name.split(" ").at(-1)?.toLowerCase()}<i>.dev</i></span></a><nav aria-label="Điều hướng"><a href="#about">Giới thiệu</a><a href="#projects">Dự án</a><a href="#experience">Kinh nghiệm</a></nav><a className="nav-contact" href="#contact">Kết nối <ArrowUpRight size={17}/></a></header>
 <main id="main">
 <section className="hero shell"><div className="hero-content"><div className="eyebrow"><span className="live-dot"/>{profile.available?"SẴN SÀNG CHO CƠ HỘI MỚI":"LUÔN SẴN SÀNG KẾT NỐI"}</div><p className="hello">Xin chào, tôi là {profile.name} <span className="wave">✳</span></p><h1>Code with logic.<br/><span>Create with passion.</span></h1><div className="role"><span/> {profile.role}</div><p className="hero-intro">{profile.intro}</p><div className="hero-actions"><a href="#projects" className="btn primary">Khám phá dự án <ArrowUpRight size={19}/></a><a href={safeUrl(profile.cv)||"#experience"} className="btn subtle" target={safeUrl(profile.cv)?"_blank":undefined} rel="noreferrer">{safeUrl(profile.cv)?<Download size={17}/>:<ArrowDown size={17}/>} {safeUrl(profile.cv)?"Xem CV":"Xem kinh nghiệm"}</a></div><div className="hero-location"><MapPin size={14}/>{profile.location}<span className="tiny-line"/>Làm việc từ xa & tại văn phòng</div></div>
 <div className="hero-visual" aria-label="Đoạn mã giới thiệu lập trình viên"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><span className="floating-label label-react"><ToolIcon name="React" size={19}/> React</span><span className="floating-label label-ts"><ToolIcon name="TypeScript" size={18}/> <span>TypeScript</span></span><div className="code-window"><div className="code-toolbar"><div className="window-dots"><b/><b/><b/></div><span>developer.ts</span><Code2 size={15}/></div><div className="code-body"><div><em>01</em><span className="violet">const</span> developer = {"{"}</div><div><em>02</em>  name: <span className="mint">&quot;{profile.name}&quot;</span>,</div><div><em>03</em>  role: <span className="mint">&quot;{profile.role}&quot;</span>,</div><div><em>04</em>  mindset: [</div><div><em>05</em>    <span className="orange">&quot;Stay curious&quot;</span>,</div><div><em>06</em>    <span className="orange">&quot;Build with purpose&quot;</span>,</div><div><em>07</em>    <span className="orange">&quot;Never stop learning&quot;</span></div><div><em>08</em>  ],</div><div><em>09</em>  nextChapter: <span className="violet">await</span> <span className="blue">connect</span>()</div><div><em>10</em>{"}"};</div><div className="code-comment"><em>11</em>// Let's build something meaningful.</div></div><div className="code-footer"><span><span className="live-dot"/> All systems operational</span><span>UTF-8</span></div></div><div className="commit-card"><span className="commit-icon"><Terminal size={20}/></span><div>Ideas → real products<small>Mỗi dòng code, một giá trị.</small></div><Sparkles size={18}/></div></div>
 <div className="hero-bottom"><span>THIẾT KẾ CÓ CHỦ ĐÍCH. LẬP TRÌNH BẰNG ĐAM MÊ.</span><a href="#about">Cuộn để khám phá <ArrowDown size={16}/></a></div></section>
 <Toolkit skills={profile.skills}/>
 <section id="about" className="section shell reveal"><div className="section-heading"><div><p className="eyebrow">01 / MỘT CHÚT VỀ TÔI</p><h2>Hơn cả những<br/>dòng <span>code.</span></h2></div><span className="section-note">TƯ DUY SẢN PHẨM.<br/>TINH THẦN KỸ SƯ.</span></div><div className="about-grid"><div><p className="body-copy">{profile.about}</p><div className="socials">{safeUrl(profile.github)&&<a href={safeUrl(profile.github)} target="_blank" rel="noreferrer"><GitBranch size={18}/>GitHub <ArrowUpRight size={15}/></a>}{safeUrl(profile.linkedin)&&<a href={safeUrl(profile.linkedin)} target="_blank" rel="noreferrer"><Briefcase size={18}/>LinkedIn <ArrowUpRight size={15}/></a>}<a href="#contact"><Mail size={18}/>Liên hệ <ArrowUpRight size={15}/></a></div></div><div className="about-stats"><div><strong>{profile.years}</strong><span>Năm kinh nghiệm</span></div><div><strong>{String(profile.projects.length).padStart(2,"0")}</strong><span>Dự án nổi bật</span></div><div className="stat-wide"><Code2/><span>Luôn học hỏi.<br/><b>Luôn tiến về phía trước.</b></span></div></div></div></section>
 <section id="projects" className="section shell"><div className="section-heading reveal"><div><p className="eyebrow">02 / DỰ ÁN NỔI BẬT</p><h2>Ý tưởng thành <span>hiện thực.</span></h2></div><span className="section-note">MỘT VÀI SẢN PHẨM<br/>TÔI ĐÃ XÂY DỰNG.</span></div><div className="projects-grid">{profile.projects.map((p,i)=><article className={"project reveal project-"+(i%3)} key={i}><div className="project-cover"><div className="project-number">0{i+1} / PROJECT</div><div className="project-emblem"><Layers size={42}/></div><div className="cover-title">{p.title}<span>{p.category}</span></div><span className="cover-star">✳</span></div><div className="project-info"><div className="project-title"><h3>{p.title}</h3>{safeUrl(p.url)&&<a href={safeUrl(p.url)} target="_blank" rel="noreferrer" aria-label={"Xem "+p.title}><ArrowUpRight size={22}/></a>}</div><p>{p.description}</p><div className="tags">{p.tags.split(",").map((tag,j)=><span key={j}>{tag.trim()}</span>)}</div><div className="project-result"><span className="live-dot"/>{p.result}</div></div></article>)}</div></section>
 <section id="experience" className="section shell reveal"><div className="section-heading"><div><p className="eyebrow">03 / HÀNH TRÌNH</p><h2>Không ngừng <span>phát triển.</span></h2></div></div><div className="experience-layout"><div className="experience-intro"><p>Mỗi trải nghiệm là một cơ hội để xây dựng tốt hơn.</p><a href="#contact">Cùng viết chương tiếp theo <ArrowUpRight size={17}/></a></div><div className="timeline">{profile.experience.map((e,i)=><article key={i}><span className="timeline-dot"/><div className="timeline-meta">{e.company}<span>{e.period}</span></div><h3>{e.role}</h3><p>{e.description}</p></article>)}</div></div></section>
 <section className="section shell reveal"><div className="section-heading"><div><p className="eyebrow">04 / CÔNG CỤ & KỸ NĂNG</p><h2>Đúng công cụ.<br/><span>Đúng giải pháp.</span></h2></div><p className="skill-description">Công nghệ thay đổi mỗi ngày.<br/>Tư duy giải quyết vấn đề luôn ở lại.</p></div><div className="skills">{profile.skills.split(",").filter(s=>s.trim()).map((s,i)=><div key={i}><ToolIcon name={s} size={24}/><span>{s.trim()}</span><small>{String(i+1).padStart(2,"0")}</small></div>)}</div></section>
 <section id="contact" className="contact shell reveal"><p className="eyebrow"><span className="live-dot"/> LET'S BUILD SOMETHING GREAT</p><h2>Chương tiếp theo,<br/><span>cùng bạn.</span><ArrowUpRight className="contact-arrow"/></h2><div className="contact-bottom"><p>Bạn đang tìm một người đồng đội?<br/>Tôi luôn sẵn sàng lắng nghe.</p><a className="btn primary" href={"mailto:"+profile.email}>Bắt đầu cuộc trò chuyện <ArrowUpRight size={19}/></a></div><a className="email-link" href={"mailto:"+profile.email}>{profile.email} <ArrowUpRight size={18}/></a></section>
 </main><footer className="shell footer"><span>© {new Date().getFullYear()} {profile.name}</span><span>Built with care. Powered by curiosity.</span><a href="#">Về đầu trang ↑</a></footer>
 {ready&&!preview&&!shared&&<div className="owner-bar"><span className="owner-label"><span className="live-dot"/>PORTFOLIO STUDIO <small>Bản nháp trên thiết bị này</small></span><div><button onClick={()=>setPreview(true)}><Eye size={16}/><span>Xem trước</span></button><button onClick={()=>setEditing(true)} className="edit-button"><Pencil size={15}/>Chỉnh sửa</button><button className="share-button" onClick={()=>setShareOpen(true)}><Share2 size={15}/><span>Gửi HR</span></button></div></div>}
 {preview&&!shared&&<button className="back-edit" onClick={()=>setPreview(false)}><Pencil size={15}/>Về trình chỉnh sửa</button>}
 {editing&&!shared&&<Editor open={editing} onOpenChange={setEditing} profile={profile} onSave={p=>{setProfile(p);setNotice("Đã lưu thay đổi trên thiết bị này.");}}/>}
 {shareOpen&&!shared&&<ShareDialog open={shareOpen} onOpenChange={setShareOpen} profile={profile}/>}
 {notice&&<div className="status-message" role="status">{notice}</div>}
 </>;
}
