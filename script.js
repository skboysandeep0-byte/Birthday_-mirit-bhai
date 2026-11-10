(() => {
"use strict";
const $ = selector => document.querySelector(selector);
const stars = $("#stars");
const canvas = $("#celebration");
const ctx = canvas.getContext("2d");
const audio = $("#birthdayAudio");
const soundButton = $("#soundBtn");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const progressBar = $("#readingProgress");
const musicStatus = $("#musicStatus");
const lyricsList = $("#lyricsList");
const lyricsWindow = $("#lyricsWindow");
const lyricsStatus = $("#lyricsStatus");
let scrollTicking = false;
function updateProgress() {
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  const progress = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
  if (progressBar) progressBar.style.width = progress + "%";
  scrollTicking = false;
}
addEventListener("scroll", () => {
  if (!scrollTicking) { requestAnimationFrame(updateProgress); scrollTicking = true; }
}, { passive: true });
updateProgress();
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

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".surprise, .message, .finale, .music-card, .wish-message").forEach(el => {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });
}


/* Compact in-card karaoke. Timing is estimated from audio length; LRC timestamps can replace it. */
const lyricLines = ["L'âme en peine, il vit mais parle à peine","Il attend devant cette photo d'antan","Il, il n'est pas fou, il y croit, c'est tout","Il la voit partout, il l'attend debout","Une rose à la main, ah, à part elle, il n'attend rien","Rien autour n'a de sens et l'air est lourd","Le regard absent, il est seul et lui parle souvent","Il, il n'est pas fou, il l'aime, c'est tout","Il la voit partout, il l'attend debout","Debout, une rose à la main, non, non, plus rien ne le retient","Dans sa love story","Dans sa love story","Dans sa love story","Sa love story","Prends ma main, promets-moi que tout ira bien","Serre-moi fort, près de toi, je rêve encore","Oui, oui, je veux rester, mais, je n'sais plus aimer","J'ai été trop bête, je t'en prie, arrête","Arrête, comme je regrette, non, je ne voulais pas tout ça","Je serai riche et je t'offrirai tout mon or","Si tu t'en fiches, je t'attendrai sur le port","Et si tu m'ignores, je t'offrirai mon dernier souffle de vie","Dans ma love story","Dans ma love story","Dans ma love story","Ma love story","Une bougie peut illuminer la nuit","Un sourir peut bâtir tout un empire","Et il y a toi, et il y a moi","Et personne n'y croit, mais l'amour fait d'un fou un roi","Et si tu m'ignores, j'me battrai encore et encore","C'est ta love story","C'est ta love story","C'est l'histoire d'une vie","Love story","Des cris de joie, quelques larmes, on s'en va","On vit dans cette love story","Love story, love story","Love story, love story","Love story, love story","Love story, love story","Love story, love story"];
let lyricNodes = [];
let activeLyricIndex = -1;
function buildLyrics() {
  if (!lyricsList) return;
  lyricsList.innerHTML = "";
  lyricNodes = lyricLines.map((line, index) => {
    const row = document.createElement("p");
    row.className = "lyric-line";
    row.dataset.index = String(index);
    const words = line.split(/(\s+)/);
    words.forEach(part => {
      if (/^\s+$/.test(part)) {
        row.appendChild(document.createTextNode(part));
      } else {
        const word = document.createElement("span");
        word.className = "lyric-word";
        word.textContent = part;
        row.appendChild(word);
      }
    });
    lyricsList.appendChild(row);
    return row;
  });
}
function lyricStartTimes() {
  const duration = Number.isFinite(audio.duration) ? audio.duration : 240;
  const weights = lyricLines.map(line => Math.max(3, line.replace(/[^\p{L}\p{N}]/gu, "").length));
  const total = weights.reduce((sum, value) => sum + value, 0);
  let cursor = 0;
  return weights.map(weight => {
    const start = cursor;
    cursor += duration * (weight / total);
    return start;
  });
}
let lyricTimes = [];
function updateLyrics() {
  if (!lyricsList || !audio || !lyricNodes.length) return;
  const current = audio.currentTime || 0;
  if (!lyricTimes.length || !Number.isFinite(audio.duration)) lyricTimes = lyricStartTimes();
  let index = 0;
  for (let i = 0; i < lyricTimes.length; i++) {
    if (current >= lyricTimes[i]) index = i;
    else break;
  }
  const duration = Number.isFinite(audio.duration) ? audio.duration : 240;
  const nextStart = index < lyricTimes.length - 1 ? lyricTimes[index + 1] : duration;
  const start = lyricTimes[index] || 0;
  const progress = Math.max(0, Math.min(1, (current - start) / Math.max(.1, nextStart - start)));
  if (index !== activeLyricIndex) {
    if (activeLyricIndex >= 0) lyricNodes[activeLyricIndex].classList.remove("is-active");
    activeLyricIndex = index;
    lyricNodes[index].classList.add("is-active");
    lyricNodes[index].scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    if (lyricsStatus) lyricsStatus.textContent = "Now singing · Line " + (index + 1) + " of " + lyricLines.length;
  }
  const words = lyricNodes[index].querySelectorAll(".lyric-word");
  const wordIndex = Math.min(words.length - 1, Math.floor(progress * words.length));
  words.forEach((word, i) => word.classList.toggle("is-sung", i <= wordIndex));
}
function resetLyrics() {
  activeLyricIndex = -1;
  lyricTimes = [];
  lyricNodes.forEach(node => {
    node.classList.remove("is-active");
    node.querySelectorAll(".lyric-word").forEach(word => word.classList.remove("is-sung"));
  });
  if (lyricsStatus) lyricsStatus.textContent = "Lyrics will follow the song when playback starts";
}
buildLyrics();
audio.addEventListener("loadedmetadata", () => { lyricTimes = lyricStartTimes(); updateLyrics(); });
audio.addEventListener("timeupdate", updateLyrics);
audio.addEventListener("seeked", updateLyrics);
audio.addEventListener("play", () => { if (lyricsStatus) lyricsStatus.textContent = "Sing along · Lyrics are moving with the song"; });
audio.addEventListener("pause", () => { if (lyricsStatus && !audio.ended) lyricsStatus.textContent = "Paused · Lyrics will continue when you resume"; });
audio.addEventListener("ended", () => { if (lyricsStatus) lyricsStatus.textContent = "Beautiful song · Replay to sing along again"; });

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
async function toggleBirthdaySong(forcePlay = false) {
  if (!audio || !soundButton) return;
  if (!forcePlay && !audio.paused) {
    audio.pause();
    return;
  }
  soundButton.disabled = true;
  soundButton.innerHTML = "<span>…</span> Loading song";
  if (musicStatus) musicStatus.textContent = "Loading your birthday song…";
  try {
    // Calling play() directly from this click preserves the browser's user-gesture permission.
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === "function") await playPromise;
  } catch (error) {
    console.error("Birthday audio playback failed:", error);
    if (musicStatus) musicStatus.textContent =
      audio.error ? "Song file could not be loaded. Check the MP3 link." :
      "Playback was blocked. Press Play in the audio player below.";
    if (lyricsStatus) lyricsStatus.textContent = "Lyrics are waiting for the song to play";
    soundButton.innerHTML = "<span>▶</span> Try play again";
    $("#birthdayAudio").scrollIntoView({behavior: reducedMotion ? "auto" : "smooth", block: "center"});
  } finally {
    soundButton.disabled = false;
  }
}
$("#celebrateBtn").addEventListener("click", () => {
  celebrate();
  toggleBirthdaySong(true);
  $("#surprise").scrollIntoView({behavior: reducedMotion ? "auto" : "smooth"});
});
soundButton.addEventListener("click", () => toggleBirthdaySong(false));
audio.addEventListener("play", () => {
  soundButton.disabled = false;
  soundButton.innerHTML = "<span>Ⅱ</span> Pause birthday song";
  if (musicStatus) musicStatus.textContent = "Now playing · Birthday soundtrack";
  if (lyricsStatus) lyricsStatus.textContent = "Sing along · Lyrics are moving with the song";
});
audio.addEventListener("playing", () => {
  if (musicStatus) musicStatus.textContent = "Now playing · Enjoy the music!";
});
audio.addEventListener("waiting", () => {
  if (musicStatus) musicStatus.textContent = "Buffering song…";
});
audio.addEventListener("pause", () => {
  soundButton.disabled = false;
  if (!audio.ended) {
    soundButton.innerHTML = "<span>♫</span> Play birthday song";
    if (musicStatus) musicStatus.textContent = "Paused · Tap play to continue";
    if (lyricsStatus) lyricsStatus.textContent = "Paused · Lyrics will continue when you resume";
  }
});
audio.addEventListener("ended", () => {
  soundButton.disabled = false;
  soundButton.innerHTML = "<span>↻</span> Replay birthday song";
  if (musicStatus) musicStatus.textContent = "Finished · Replay whenever you like";
  if (lyricsStatus) lyricsStatus.textContent = "Beautiful song · Replay to sing along again";
});
audio.addEventListener("loadedmetadata", () => {
  if (musicStatus && audio.paused) musicStatus.textContent = "Ready to play · " +
    (Number.isFinite(audio.duration) ? Math.floor(audio.duration / 60) + ":" + String(Math.floor(audio.duration % 60)).padStart(2,"0") : "audio loaded");
});
audio.addEventListener("error", () => {
  soundButton.disabled = false;
  soundButton.innerHTML = "<span>↻</span> Retry birthday song";
  if (musicStatus) musicStatus.textContent = "Could not load the MP3. Check your internet connection.";
  if (lyricsStatus) lyricsStatus.textContent = "Lyrics will start when the song loads";
  console.error("Audio element error:", audio.error?.code);
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


})();