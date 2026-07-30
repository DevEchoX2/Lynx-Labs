document.addEventListener('DOMContentLoaded', () => {
    const applyBackground = () => {
        const homeBg = localStorage.getItem('lynx_home_bg');
        if (homeBg && homeBg !== 'none') {
            document.body.style.backgroundImage = `url('assets/${homeBg}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
        } else {
            document.body.style.backgroundImage = 'none';
        }
    };

    const applyTheme = (color) => {
        if (color) document.documentElement.style.setProperty('--accent', color);
    };

    applyBackground();
    applyTheme(localStorage.getItem('lynx_theme_color'));

    window.addEventListener('message', (event) => {
        if (event.data && event.data.action === 'lynx_theme_sync') {
            applyTheme(event.data.color);
        }
    });

    const canvas = document.getElementById('particle-canvas');
    const showParticles = localStorage.getItem('lynx_particles') !== 'false';

    if (!canvas) return;

    if (!showParticles) {
        canvas.style.display = 'none';
        return; 
    }

    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    let width, height, particles;

    const properties = {
        particleColor: 'rgba(255, 255, 255, 0.4)',
        lineColor: 'rgba(255, 255, 255, 0.15)',
        particleAmount: 80,
        defaultRadius: 2,
        variantRadius: 2,
        defaultSpeed: 0.5,
        variantSpeed: 0.5,
        linkRadius: 150
    };

    function resizeReset() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.speed = properties.defaultSpeed + Math.random() * properties.variantSpeed;
            this.directionAngle = Math.floor(Math.random() * 360);
            this.color = properties.particleColor;
            this.radius = properties.defaultRadius + Math.random() * properties.variantRadius;
            this.vector = {
                x: Math.cos(this.directionAngle) * this.speed,
                y: Math.sin(this.directionAngle) * this.speed
            };
        }
        update() {
            this.border();
            this.x += this.vector.x;
            this.y += this.vector.y;
        }
        border() {
            if (this.x >= width || this.x <= 0) {
                this.vector.x *= -1;
            }
            if (this.y >= height || this.y <= 0) {
                this.vector.y *= -1;
            }
            if (this.x > width) this.x = width;
            if (this.y > height) this.y = height;
            if (this.x < 0) this.x = 0;
            if (this.y < 0) this.y = 0;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function setupParticles() {
        particles = [];
        for (let i = 0; i < properties.particleAmount; i++) {
            particles.push(new Particle());
        }
    }

    function drawLines() {
        let x1, y1, x2, y2, length, opacity;
        for (let i = 0; i < properties.particleAmount; i++) {
            for (let j = i + 1; j < properties.particleAmount; j++) {
                x1 = particles[i].x;
                y1 = particles[i].y;
                x2 = particles[j].x;
                y2 = particles[j].y;
                length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                if (length < properties.linkRadius) {
                    opacity = 1 - length / properties.linkRadius;
                    ctx.lineWidth = 0.5;
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.closePath();
                    ctx.stroke();
                }
            }
        }
    }

    function loop() {
        requestAnimationFrame(loop);
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < properties.particleAmount; i++) {
            particles[i].update();
            particles[i].draw();
        }
        drawLines();
    }

    window.addEventListener('resize', resizeReset);
    resizeReset();
    setupParticles();
    loop();
});
