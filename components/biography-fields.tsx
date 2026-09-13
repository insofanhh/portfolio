"use client";
import { Plus, Trash2 } from "lucide-react";
import { Field } from "@/components/editor-field";
import { biographyFields, type Biography, type BiographyField } from "@/lib/profile";

export function BiographyFields({value,onChange}:{value:Biography;onChange:(next:Biography)=>void}) {
 const field=(key:BiographyField,text:string)=>onChange({...value,[key]:text});
 return <>
  <p className="field-help biography-editor-note">Mọi mục đều không bắt buộc. Mục để trống sẽ được ẩn. Khi tạo link gửi HR, sơ yếu lý lịch cũng được chia sẻ cùng portfolio.</p>
  <div className="editor-grid">{biographyFields.slice(0,8).map(([key,label])=><Field key={key} label={label} type={key==="phone"?"tel":"text"} value={value[key]} onChange={text=>field(key,text)}/>)}</div>
  {biographyFields.slice(8).map(([key,label])=><Field key={key} label={label} multiline={key!=="maritalStatus"} value={value[key]} onChange={text=>field(key,text)}/>)}
  <h3 className="biography-editor-heading">Thành viên gia đình</h3>
  {value.family.map((member,index)=><div className="editor-item" key={index}>
   <div className="item-heading"><b>Thành viên {index+1}</b><button type="button" aria-label={"Xóa thành viên "+(index+1)} onClick={()=>onChange({...value,family:value.family.filter((_,i)=>i!==index)})}><Trash2 size={16}/></button></div>
   <div className="editor-grid">{([["name","Họ và tên"],["relationship","Mối quan hệ"],["birthYear","Năm sinh"],["occupation","Nghề nghiệp"],["education","Học vấn"],["notes","Thông tin thêm"]] as const).map(([key,label])=><Field key={key} label={label} value={member[key]??""} multiline={key==="notes"} onChange={text=>onChange({...value,family:value.family.map((row,i)=>i===index?{...row,[key]:text}:row)})}/>)}</div>
  </div>)}
  <button className="btn subtle add-item" type="button" disabled={value.family.length>=12} onClick={()=>onChange({...value,family:[...value.family,{name:"",relationship:"",birthYear:"",occupation:"",education:"",notes:""}]})}><Plus size={16}/>Thêm thành viên</button>
  <h3 className="biography-editor-heading">Thông tin tùy chỉnh</h3>
  {value.customFields.map((row,index)=><div className="editor-item" key={index}>
   <div className="item-heading"><b>Mục {index+1}</b><button type="button" aria-label={"Xóa mục tùy chỉnh "+(index+1)} onClick={()=>onChange({...value,customFields:value.customFields.filter((_,i)=>i!==index)})}><Trash2 size={16}/></button></div>
   <Field label="Tên mục" value={row.label} onChange={text=>onChange({...value,customFields:value.customFields.map((item,i)=>i===index?{...item,label:text}:item)})}/>
   <Field label="Nội dung" multiline value={row.value} onChange={text=>onChange({...value,customFields:value.customFields.map((item,i)=>i===index?{...item,value:text}:item)})}/>
  </div>)}
  <button className="btn subtle add-item" type="button" disabled={value.customFields.length>=12} onClick={()=>onChange({...value,customFields:[...value.customFields,{label:"",value:""}]})}><Plus size={16}/>Thêm thông tin</button>
 </>;
}
