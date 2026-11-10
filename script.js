(() => {
"use strict";
const $ = s => document.querySelector(s), stars = $("#stars"), canvas = $("#celebration"), ctx = canvas.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
for(let i=0;i<115;i++){const star=document.createElement("i");star.className="star";star.style.left=Math.random()*100+"%";star.style.top=Math.random()*100+"%";star.style.opacity=(.25+Math.random()*.75).toFixed(2);star.style.setProperty("--duration",(1.4+Math.random()*3.2)+"s");stars.appendChild(star)}
let width=0,height=0,particles=[],animationId=0;
function resize(){const ratio=Math.min(window.devicePixelRatio||1,2);width=innerWidth;height=innerHeight;canvas.width=width*ratio;canvas.height=height*ratio;canvas.style.width=width+"px";canvas.style.height=height+"px";ctx.setTransform(ratio,0,0,ratio,0,0)}
addEventListener("resize",resize);resize();
const colors=["#ffd88a","#ff8fbe","#bba3ff","#8ee7d1","#fff4d5","#ef9cff"];
function burst(x,y,count=85,force=5){for(let i=0;i<count;i++){const angle=Math.random()*Math.PI*2,speed=Math.random()*force+1;particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:55+Math.random()*45,maxLife:100,size:2+Math.random()*3,color:colors[Math.floor(Math.random()*colors.length)],gravity:.055+Math.random()*.04})}if(!animationId)animate()}
function animate(){ctx.clearRect(0,0,width,height);particles=particles.filter(p=>p.life>0);for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=p.gravity;p.vx*=.992;p.life--;ctx.globalAlpha=Math.max(0,p.life/p.maxLife);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;if(particles.length)animationId=requestAnimationFrame(animate);else{cancelAnimationFrame(animationId);animationId=0;ctx.clearRect(0,0,width,height)}}
function celebrate(){burst(width*(.2+Math.random()*.6),height*(.2+Math.random()*.35),reducedMotion?24:90,5.5);if(!reducedMotion){setTimeout(()=>burst(width*.25,height*.42,60),180);setTimeout(()=>burst(width*.76,height*.32,60),430)}}
$("#celebrateBtn").addEventListener("click",()=>{celebrate();$("#surprise").scrollIntoView({behavior:reducedMotion?"auto":"smooth"})});
$("#fireworksBtn").addEventListener("click",()=>{for(let i=0;i<(reducedMotion?2:7);i++)setTimeout(()=>burst(width*(.12+Math.random()*.76),height*(.12+Math.random()*.52),90,6),i*240)});
let wished=false;
function blowCandles(){if(wished){$("#wishMessage").classList.add("show");return}wished=true;document.querySelectorAll(".candle").forEach((c,i)=>setTimeout(()=>c.classList.add("out"),i*180));$("#cakeInstruction").textContent="Wish made. Let the magic begin! ✨";$("#wishBtn").textContent="Wish sent into the universe ✓";$("#wishMessage").classList.add("show");burst(width/2,height*.49,reducedMotion?24:115,5);setTimeout(()=>burst(width*.28,height*.43,50,4),250);setTimeout(()=>burst(width*.72,height*.4,50,4),420)}
$("#wishBtn").addEventListener("click",blowCandles);
document.querySelectorAll(".candle").forEach(c=>{c.setAttribute("role","button");c.setAttribute("tabindex","0");c.setAttribute("aria-label","Blow out a birthday candle");c.addEventListener("click",blowCandles);c.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();blowCandles()}})});
const YOUTUBE_EMBED = "https://www.youtube-nocookie.com/embed/8kfP22meDL0?autoplay=1&rel=0";
$("#soundBtn").addEventListener("click", () => {
  const player = $("#youtubePlayer"), frame = $("#youtubeFrame");
  if (player.hidden) {
    frame.src = YOUTUBE_EMBED;
    player.hidden = false;
    $("#soundBtn").setAttribute("aria-expanded", "true");
    $("#soundBtn").innerHTML = "<span>♫</span> Birthday song is ready below";
    player.scrollIntoView({behavior: reducedMotion ? "auto" : "smooth", block: "center"});
  } else {
    frame.src = "";
    player.hidden = true;
    $("#soundBtn").setAttribute("aria-expanded", "false");
    $("#soundBtn").innerHTML = "<span>▶</span> Play birthday song on YouTube";
  }
});
})();