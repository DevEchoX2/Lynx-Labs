const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];
let animationFrameId;
const config = {
particleCount: 120,
particleColor: 'rgba(255, 255, 255, 0.8)',
lineColor: 'rgba(255, 255, 255, 0.2)',
maxDistance: 130,
baseSpeed: 0.6,
mouseRepelRadius: 150,
mouseRepelForce: 3
};
const mouse = {
x: null,
y: null,
radius: config.mouseRepelRadius
};
class Particle {
constructor() {
this.x = Math.random() * canvas.width;
this.y = Math.random() * canvas.height;
this.size = Math.random() * 2 + 0.5;
this.baseX = this.x;
this.baseY = this.y;
this.density = (Math.random() * 30) + 1;
this.velocityX = (Math.random() - 0.5) * config.baseSpeed;
this.velocityY = (Math.random() - 0.5) * config.baseSpeed;
}
draw() {
ctx.beginPath();
ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
ctx.fillStyle = config.particleColor;
ctx.fill();
}
update() {
this.x += this.velocityX;
this.y += this.velocityY;
if (this.x < 0) {
this.x = canvas.width;
}
if (this.x > canvas.width) {
this.x = 0;
}
if (this.y < 0) {
this.y = canvas.height;
}
if (this.y > canvas.height) {
this.y = 0;
}
let dx = mouse.x - this.x;
let dy = mouse.y - this.y;
let distance = Math.sqrt(dx * dx + dy * dy);
let forceDirectionX = dx / distance;
let forceDirectionY = dy / distance;
let maxDistance = mouse.radius;
let force = (maxDistance - distance) / maxDistance;
let directionX = forceDirectionX * force * this.density;
let directionY = forceDirectionY * force * this.density;
if (distance < mouse.radius) {
this.x -= directionX * config.mouseRepelForce;
this.y -= directionY * config.mouseRepelForce;
}
this.draw();
}
}
function initParticles() {
particlesArray = [];
let calculatedCount = Math.floor((canvas.width * canvas.height) / 9000);
if (calculatedCount > config.particleCount) {
calculatedCount = config.particleCount;
}
for (let i = 0; i < calculatedCount; i++) {
particlesArray.push(new Particle());
}
}
function connectParticles() {
let opacityValue = 1;
for (let a = 0; a < particlesArray.length; a++) {
for (let b = a; b < particlesArray.length; b++) {
let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
if (distance < (config.maxDistance * config.maxDistance)) {
opacityValue = 1 - (distance / (config.maxDistance * config.maxDistance));
let colorString = config.lineColor.replace(/[\d\.]+\)$/g, opacityValue + ')');
ctx.strokeStyle = colorString;
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
ctx.stroke();
}
}
}
}
function animateParticles() {
ctx.clearRect(0, 0, canvas.width, canvas.height);
for (let i = 0; i < particlesArray.length; i++) {
particlesArray[i].update();
}
connectParticles();
animationFrameId = requestAnimationFrame(animateParticles);
}
function resizeCanvas() {
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
initParticles();
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('mousemove', function(event) {
mouse.x = event.x;
mouse.y = event.y;
});
window.addEventListener('mouseout', function() {
mouse.x = undefined;
mouse.y = undefined;
});
function startEngine() {
resizeCanvas();
if (animationFrameId) {
cancelAnimationFrame(animationFrameId);
}
animateParticles();
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', startEngine);
} else {
startEngine();
}
const exportObj = {
resizeCanvas: resizeCanvas,
initParticles: initParticles,
startEngine: startEngine,
particlesArray: particlesArray,
config: config
};
window.WavesParticleEngine = exportObj;
