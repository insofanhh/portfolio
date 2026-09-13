"use client";
import Image from "next/image";
import { useState } from "react";
export function ProfileAvatar({name,photo}:{name:string;photo?:string}) {
 const [failed,setFailed]=useState<string>();
 return <div className="bio-avatar">{photo&&photo!==failed?<Image src={photo} alt={"Ảnh đại diện của "+name} width={320} height={320} unoptimized onError={()=>setFailed(photo)}/>:<span aria-hidden="true">{name.trim().split(/\s+/).slice(-2).map(part=>part[0]).join("").toUpperCase()}</span>}</div>;
}
