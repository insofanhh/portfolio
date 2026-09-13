"use client";
import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { Upload, Trash2 } from "lucide-react";
import { AVATAR_MAX_LENGTH } from "@/lib/profile";
import { ProfileAvatar } from "@/components/profile-avatar";
async function preparePhoto(file:File):Promise<string> {
 if(!["image/jpeg","image/png","image/webp"].includes(file.type))throw new Error("Vui lòng chọn ảnh JPG, PNG hoặc WebP.");
 if(file.size>8*1024*1024)throw new Error("Vui lòng chọn ảnh nhỏ hơn 8 MB.");
 const url=URL.createObjectURL(file);
 try {
  const picture=new Image();
  picture.src=url;
  try {await picture.decode();} catch {throw new Error("Không đọc được ảnh. Vui lòng chọn tệp ảnh khác.");}
  if(!picture.naturalWidth||!picture.naturalHeight)throw new Error("Ảnh không hợp lệ.");
  const edge=Math.min(picture.naturalWidth,picture.naturalHeight);
  const canvas=document.createElement("canvas");
  for(const size of [320,256,192]){
   canvas.width=size;canvas.height=size;
   const context=canvas.getContext("2d");if(!context)throw new Error("Trình duyệt chưa hỗ trợ xử lý ảnh.");
   context.fillStyle="#e5eee8";context.fillRect(0,0,size,size);
   context.drawImage(picture,(picture.naturalWidth-edge)/2,(picture.naturalHeight-edge)/2,edge,edge,0,0,size,size);
   for(const quality of [.85,.65,.45]){
    const data=canvas.toDataURL("image/jpeg",quality);
    if(data.length<=AVATAR_MAX_LENGTH)return data;
   }
  }
  throw new Error("Ảnh còn quá lớn. Hãy chọn một ảnh đơn giản hơn.");
 } finally {URL.revokeObjectURL(url);}
}
export function AvatarUpload({name,value,onChange,onBusyChange}:{name:string;value?:string;onChange:(photo:string)=>void;onBusyChange:(busy:boolean)=>void}) {
 const id=useId();const request=useRef(0);const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 useEffect(()=>()=>{request.current++;},[]);
 const upload=async(event:ChangeEvent<HTMLInputElement>)=>{
  const file=event.target.files?.[0];event.target.value="";if(!file)return;
  const current=++request.current;setBusy(true);onBusyChange(true);setError("");
  try {const photo=await preparePhoto(file);if(current===request.current)onChange(photo);}
  catch(err){if(current===request.current)setError(err instanceof Error?err.message:"Không thể tải ảnh.");}
  finally {if(current===request.current){setBusy(false);onBusyChange(false);}}
 };
 return <div className="avatar-upload"><ProfileAvatar name={name} photo={value}/><div className="avatar-upload-controls"><h3>Ảnh đại diện</h3><p className="field-help">JPG, PNG hoặc WebP, tối đa 8 MB. Ảnh được cắt vuông ở giữa và thu nhỏ tự động.</p><div className="avatar-upload-actions"><label className="btn subtle import-label" htmlFor={id}><Upload size={16}/>{busy?"Đang xử lý…":value?"Đổi ảnh":"Tải ảnh lên"}<input id={id} type="file" aria-label="Tải ảnh đại diện" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={upload}/></label>{value&&<button className="btn subtle" type="button" disabled={busy} onClick={()=>{onChange("");setError("");}}><Trash2 size={16}/>Xóa ảnh</button>}</div>{busy&&<output className="field-help">Đang xử lý ảnh…</output>}{error&&<p className="form-error" role="alert">{error}</p>}</div></div>;
}
