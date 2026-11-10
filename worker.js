const CORS={"Access-Control-Allow-Origin":"https://skboysandeep0-byte.github.io","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type, X-Turnstile-Token","Vary":"Origin"};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...CORS,"Content-Type":"application/json","Cache-Control":"no-store"}});
export default {async fetch(request,env){
 const origin=request.headers.get("Origin")||"";if(origin!=="https://skboysandeep0-byte.github.io")return new Response("Forbidden",{status:403});
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});
 if(request.method!=="POST"||new URL(request.url).pathname!=="/upload")return json({error:"Not found"},404);
 if(request.headers.get("Content-Type")!=="image/png")return json({error:"Only PNG images are accepted."},415);
 const length=Number(request.headers.get("Content-Length")||0);if(length>5*1024*1024)return json({error:"Photo exceeds 5 MB."},413);
 const token=request.headers.get("X-Turnstile-Token");if(!token)return json({error:"Complete verification first."},400);
 try{
  const check=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token})});
  if(!(await check.json()).success)return json({error:"Bot verification failed."},403);
  const bytes=new Uint8Array(await request.arrayBuffer());if(!bytes.length||bytes.length>5*1024*1024)return json({error:"Invalid photo size."},413);
  if(bytes[0]!==137||bytes[1]!==80||bytes[2]!==78||bytes[3]!==71)return json({error:"Invalid PNG."},415);
  let binary="";for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,Math.min(i+32768,bytes.length)));
  const filename="selfies/"+new Date().toISOString().replace(/[:.]/g,"-")+"-"+crypto.randomUUID()+".png";
  const api="https://api.github.com/repos/"+env.GITHUB_OWNER+"/"+env.GITHUB_REPO+"/contents/"+filename;
  const gh=await fetch(api,{method:"PUT",headers:{"Authorization":"Bearer "+env.GITHUB_TOKEN,"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"Birthday-Selfie-Uploader"},body:JSON.stringify({message:"Add a birthday selfie",content:btoa(binary)})});
  const result=await gh.json();if(!gh.ok)return json({error:"GitHub upload failed. Check token permissions."},502);
  return json({success:true,url:result.content.html_url,path:filename});
 }catch{return json({error:"Upload service error."},500)}
}};