
const assert=require("node:assert/strict");
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||"playwright");
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
 try {
  for(const [width,height] of [[1280,720],[1024,600],[780,660],[390,644],[844,390],[320,568]]){
   const context=await browser.newContext({viewport:{width,height},reducedMotion:"reduce"});
   const page=await context.newPage();
   await page.goto((process.env.TEST_BASE_URL||"http://127.0.0.1:3000")+"/so-yeu-ly-lich");
   await page.getByRole("button",{name:"Chỉnh sửa",exact:true}).click();
   const png=await page.evaluate(()=>{const c=document.createElement("canvas");c.width=c.height=32;const ctx=c.getContext("2d");ctx.fillStyle="#b5f5d1";ctx.fillRect(0,0,32,32);return c.toDataURL().split(",")[1];});
   await page.getByLabel("Tải ảnh đại diện",{exact:true}).setInputFiles({name:"layout-test.png",mimeType:"image/png",buffer:Buffer.from(png,"base64")});
   await page.getByRole("button",{name:"Xóa ảnh",exact:true}).waitFor();
   await page.waitForFunction(()=>!document.querySelector('.editor-footer button[type="submit"]').disabled);
   for(const scroll of [0,1]){
    await page.locator(".editor-body").evaluate((element,end)=>{element.scrollTop=end?element.scrollHeight:0;},scroll);
    const state=await page.locator('.editor-footer button[type="submit"]').evaluate(element=>{
     const rect=element.getBoundingClientRect();const hit=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);
     return {top:rect.top,bottom:rect.bottom,left:rect.left,right:rect.right,height:innerHeight,width:innerWidth,clickable:!!hit&&element.contains(hit)};
    });
    assert.ok(state.top>=0&&state.bottom<=height&&state.left>=0&&state.right<=width&&state.clickable,JSON.stringify({width,height,scroll,state}));
   }
   await page.locator(".editor-body").evaluate(element=>{element.scrollTop=0;});
   if(width===1024)await page.screenshot({path:".data/editor-save-visible.png"});
   await page.getByRole("button",{name:"Lưu thay đổi",exact:true}).click();
   await page.getByRole("dialog").waitFor({state:"hidden"});
   assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem("portfolio-studio-draft-v1")).avatar.startsWith("data:image/jpeg;base64,")));
   await context.close();
  }
  console.log("Editor layout passed at six viewport sizes: save stays visible and clickable before/after scrolling; uploaded photo saves successfully.");
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
