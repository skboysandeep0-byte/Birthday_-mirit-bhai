(()=>{"use strict";
const $=s=>document.querySelector(s),a=$("#birthdayAudio"),b=$("#soundBtn"),m=$("#musicStatus"),ls=$("#lyricsStatus"),w=$("#lyricsWindow"),l=$("#lyricsList"),c=$("#celebration"),x=c&&c.getContext("2d"),reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const lines=["L'âme en peine, il vit mais parle à peine","Il attend devant cette photo d'antan","Il, il n'est pas fou, il y croit, c'est tout","Il la voit partout, il l'attend debout","Une rose à la main, ah, à part elle, il n'attend rien","Rien autour n'a de sens et l'air est lourd","Le regard absent, il est seul et lui parle souvent","Il, il n'est pas fou, il l'aime, c'est tout","Dans sa love story","Prends ma main, promets-moi que tout ira bien","Serre-moi fort, près de toi, je rêve encore","J'ai été trop bête, je t'en prie, arrête","Je serai riche et je t'offrirai tout mon or","Dans ma love story","Une bougie peut illuminer la nuit","Un sourire peut bâtir tout un empire","Et il y a toi, et il y a moi","L'amour fait d'un fou un roi","C'est ta love story","Love story"];
let rows=[],times=[],active=-1;
lines.forEach((line,i)=>{const p=document.createElement("p");p.className="lyric-line";p.dataset.i=i;line.split(/(\s+)/).forEach(part=>{if(/^\s+$/.test(part))p.append(document.createTextNode(part));else{const s=document.createElement("span");s.className="lyric-word";s.textContent=part;p.append(s)}});l.append(p);rows.push(p)});
function timing(){const d=Number.isFinite(a.duration)?a.duration:240,weights=lines.map(s=>Math.max(3,s.length)),sum=weights.reduce((q,n)=>q+n,0);let t=0;times=weights.map(n=>{const v=t;t+=d*n/sum;return v})}
function sync(){if(!rows.length)return;if(!times.length)timing();let i=0;for(let n=0;n<times.length;n++){if(a.currentTime>=times[n])i=n;else break}const d=times[i+1]??a.duration??240,p=Math.max(0,Math.min(1,(a.currentTime-times[i])/Math.max(.1,d-times[i])));if(i!==active){rows[active]?.classList.remove("active");active=i;rows[i].classList.add("active");w.scrollTo({top:Math.max(0,rows[i].offsetTop-(w.clientHeight-rows[i].offsetHeight)/2),behavior:reduce?"auto":"smooth"});ls.textContent="Now singing · Line "+(i+1)+" of "+lines.length}const words=rows[i].querySelectorAll(".lyric-word");words.forEach((el,n)=>el.classList.toggle("sung",n<=Math.floor(p*words.length)))}
function reset(){active=-1;times=[];rows.forEach(r=>{r.classList.remove("active");r.querySelectorAll(".sung").forEach(s=>s.classList.remove("sung"))});ls.textContent="Lyrics will follow the song when playback starts"}
a.addEventListener("loadedmetadata",()=>{timing();sync()});a.addEventListener("timeupdate",sync);a.addEventListener("seeked",sync);a.addEventListener("play",()=>{b.textContent="Ⅱ  Pause birthday song";b.setAttribute("aria-pressed","true");m.textContent="Now playing · Enjoy the music";ls.textContent="Sing along · Lyrics follow the song"});a.addEventListener("pause",()=>{if(!a.ended){b.textContent="♫  Play birthday song";b.setAttribute("aria-pressed","false");m.textContent="Paused · Tap play to continue";ls.textContent="Paused · Lyrics will continue when you resume"}});a.addEventListener("ended",()=>{b.textContent="↻  Replay birthday song";b.setAttribute("aria-pressed","false");m.textContent="Finished · Replay whenever you like";ls.textContent="Beautiful song · Replay to sing along again"});a.addEventListener("error",()=>{m.textContent="Could not load the MP3. Check the song file link.";b.textContent="↻  Retry birthday song"});
function play(){if(a.ended)a.currentTime=0;m.textContent="Loading song…";const p=a.play();if(p&&p.catch)p.catch(()=>{m.textContent="Playback blocked or file unavailable. Press Play in the player.";$("#birthdayAudio").scrollIntoView({behavior:"smooth",block:"center"})})}
b.addEventListener("click",()=>a.paused?play():a.pause());
$("#celebrateBtn").addEventListener("click",()=>{fireworks(5);play();$("#surprise").scrollIntoView({behavior:reduce?"auto":"smooth"})});
$("#wishBtn").addEventListener("click",()=>{$("#cakeStage").classList.add("wished");$("#cakeInstruction").textContent="A beautiful wish, sent with love to AMIRIT BHAI ✨";$("#wishBtn").textContent="Birthday wish sent ✓";$("#wishMessage").classList.add("show");fireworks(3)});
$("#fireworksBtn").addEventListener("click",()=>fireworks(7));
const video=$("#selfieVideo"),preview=$("#selfiePreview"),placeholder=$("#cameraPlaceholder"),startCamera=$("#startCameraBtn"),takePhoto=$("#takePhotoBtn"),retakePhoto=$("#retakePhotoBtn"),downloadPhoto=$("#downloadSelfie"),selfieStatus=$("#selfieStatus");
let cameraStream=null,selfieUrl=null;
function stopCamera(){if(cameraStream){cameraStream.getTracks().forEach(track=>track.stop());cameraStream=null}video.srcObject=null}
startCamera.addEventListener("click",async()=>{
 if(!navigator.mediaDevices?.getUserMedia){selfieStatus.textContent="Camera is unavailable. Open this page in a supported browser over HTTPS.";return}
 startCamera.disabled=true;selfieStatus.textContent="Waiting for camera permission…";
 try{stopCamera();cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:false});video.srcObject=cameraStream;video.hidden=false;preview.hidden=true;placeholder.hidden=true;takePhoto.disabled=false;retakePhoto.hidden=true;downloadPhoto.hidden=true;selfieStatus.textContent="Camera is ready. Smile and tap Take selfie!"}
 catch(error){selfieStatus.textContent=error.name==="NotAllowedError"?"Camera permission was denied. Allow camera access in your browser settings and try again.":"Could not open the camera. Check that no other app is using it."}
 finally{startCamera.disabled=false}
});
takePhoto.addEventListener("click",()=>{
 if(!cameraStream||!video.videoWidth){selfieStatus.textContent="Start the camera first.";return}
 const shot=document.createElement("canvas");shot.width=video.videoWidth;shot.height=video.videoHeight;const ctx=shot.getContext("2d");
 ctx.translate(shot.width,0);ctx.scale(-1,1);ctx.drawImage(video,0,0,shot.width,shot.height);
 shot.toBlob(blob=>{if(!blob){selfieStatus.textContent="Could not capture the photo. Please try again.";return}
 if(selfieUrl)URL.revokeObjectURL(selfieUrl);selfieUrl=URL.createObjectURL(blob);preview.src=selfieUrl;preview.hidden=false;video.hidden=true;stopCamera();takePhoto.disabled=true;retakePhoto.hidden=false;downloadPhoto.href=selfieUrl;downloadPhoto.hidden=false;selfieStatus.textContent="Selfie captured! Download it to save your photo on your device. 💜"
 },"image/png");
});
retakePhoto.addEventListener("click",()=>{preview.hidden=true;downloadPhoto.hidden=true;retakePhoto.hidden=true;startCamera.click()});
addEventListener("pagehide",stopCamera);

let W=innerWidth,H=innerHeight,particles=[],raf=0;
function resize(){W=innerWidth;H=innerHeight;if(c){const d=Math.min(devicePixelRatio||1,2);c.width=W*d;c.height=H*d;c.style.width=W+"px";c.style.height=H+"px";x?.setTransform(d,0,0,d,0,0)}}addEventListener("resize",resize);resize();
function burst(px,py,count){const colors=["#ffd88a","#ff8fbe","#bba3ff","#8ee7d1","#fff4d5"];for(let i=0;i<count;i++){const q=Math.random()*Math.PI*2,s=1+Math.random()*5;particles.push({x:px,y:py,vx:Math.cos(q)*s,vy:Math.sin(q)*s,life:70+Math.random()*35,color:colors[i%colors.length],size:1+Math.random()*3})}if(!raf)animate()}
function animate(){if(!x)return;x.clearRect(0,0,W,H);particles=particles.filter(p=>p.life>0);particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.04;p.life--;x.globalAlpha=p.life/105;x.fillStyle=p.color;x.beginPath();x.arc(p.x,p.y,p.size,0,7);x.fill()});x.globalAlpha=1;if(particles.length)raf=requestAnimationFrame(animate);else{raf=0;x.clearRect(0,0,W,H)}}
function fireworks(n){for(let i=0;i<n;i++)setTimeout(()=>burst(W*(.15+Math.random()*.7),H*(.12+Math.random()*.42),reduce?18:65),i*220)}
const stars=$("#stars");for(let i=0;i<90;i++){const s=document.createElement("i");s.className="star";s.style.left=Math.random()*100+"%";s.style.top=Math.random()*100+"%";s.style.setProperty("--delay",Math.random()*4+"s");stars.append(s)}
const progress=$("#readingProgress");function update(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+"%"}addEventListener("scroll",update,{passive:true});update();
if("IntersectionObserver"in window&&!reduce){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll(".section,.music-card,.wish-message").forEach(e=>{e.classList.add("reveal");io.observe(e)})}
})();