"use client";
import { useId } from "react";
export function Field({label,value,onChange,multiline=false,type="text",required=false}:{label:string;value:string;onChange:(s:string)=>void;multiline?:boolean;type?:string;required?:boolean}) {
 const id=useId();
 return <div className="editor-field"><label htmlFor={id}>{label}{required?" *":""}</label>{multiline?<textarea id={id} value={value} onChange={e=>onChange(e.target.value)} rows={3} maxLength={5000} required={required}/>:<input id={id} type={type} value={value} onChange={e=>onChange(e.target.value)} maxLength={5000} required={required}/>}</div>;
}
