(() => {
"use strict";
const $ = selector => document.querySelector(selector);
const stars = $("#stars");
const canvas = $("#celebration");
const ctx = canvas.getContext("2d");
const audio = $("#birthdayAudio");
const soundButton = $("#soundBtn");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

for (let i = 0; i < 115; i++) {
  const star = document.createElement("i");
  star.className = "star";
  star.style.left = Math.random() * 100 + "%";
  star.style.top = Math.random() * 100 + "%";
  star.style.opacity = (.25 + Math.random() * .75).toFixed(2);
  star.style.setProperty("--duration", (1.4 + Math.random() * 3.2) + "s");
  stars.appendChild(star);
}

let width = 0, height = 0, particles = [], animationId = 0;
function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = innerWidth;
  height = innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
addEventListener("resize", resize);
resize();

const colors = ["#ffd88a", "#ff8fbe", "#bba3ff", "#8ee7d1", "#fff4d5", "#ef9cff"];
function burst(x, y, count = 85, force = 5, palette = colors) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * force + 1;
    particles.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 65 + Math.random() * 45, maxLife: 110,
      size: 1.5 + Math.random() * 2.8,
      color: palette[Math.floor(Math.random() * palette.length)],
      gravity: .045 + Math.random() * .035
    });
  }
  if (!animationId) animate();
}
function animate() {
  ctx.clearRect(0, 0, width, height);
  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.vx *= .992; p.life--;
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (particles.length) animationId = requestAnimationFrame(animate);
  else { cancelAnimationFrame(animationId); animationId = 0; ctx.clearRect(0, 0, width, height); }
}
function celebrate() {
  burst(width * (.2 + Math.random() * .6), height * (.2 + Math.random() * .35), reducedMotion ? 24 : 90, 5.5);
  if (!reducedMotion) {
    setTimeout(() => burst(width * .25, height * .42, 60), 180);
    setTimeout(() => burst(width * .76, height * .32, 60), 430);
  }
}
$("#celebrateBtn").addEventListener("click", () => {
  celebrate();
  $("#surprise").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
});
$("#fireworksBtn").addEventListener("click", () => {
  for (let i = 0; i < (reducedMotion ? 2 : 7); i++) {
    setTimeout(() => burst(width * (.12 + Math.random() * .76), height * (.12 + Math.random() * .52), 90, 6), i * 240);
  }
});

let wished = false;
function sendWish() {
  const warm = ["#fff4c7", "#ffe08a", "#ffc36b", "#ffad9e", "#ffd2df"];
  $("#cakeStage").classList.add("wish-complete");
  $("#cakeInstruction").textContent = "A beautiful wish, sent with love to AMIRIT BHAI ✨";
  $("#wishBtn").textContent = "Birthday wish sent ✓";
  $("#wishMessage").classList.add("show");
  if (!wished) {
    wished = true;
    burst(width / 2, height * .46, reducedMotion ? 22 : 95, 3.8, warm);
    setTimeout(() => burst(width * .28, height * .42, 38, 3.2, warm), 320);
    setTimeout(() => burst(width * .72, height * .4, 38, 3.2, warm), 650);
  } else {
    burst(width / 2, height * .45, 24, 3, warm);
  }
}
$("#wishBtn").addEventListener("click", sendWish);

soundButton.addEventListener("click", async () => {
  if (audio.paused) {
    try {
      await audio.play();
      soundButton.innerHTML = "<span>Ⅱ</span> Pause birthday song";
      $("#birthdayAudio").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    } catch (error) {
      soundButton.innerHTML = "<span>▶</span> Tap play in the music player";
      $("#birthdayAudio").scrollIntoView({ behavior: "smooth", block: "center" });
    }
  } else {
    audio.pause();
    soundButton.innerHTML = "<span>♫</span> Play birthday song";
  }
});
audio.addEventListener("play", () => soundButton.innerHTML = "<span>Ⅱ</span> Pause birthday song");
audio.addEventListener("pause", () => soundButton.innerHTML = "<span>♫</span> Play birthday song");
audio.addEventListener("ended", () => soundButton.innerHTML = "<span>↻</span> Replay birthday song");
})();