class OrbitAnimation {
    constructor(canvasId) {
        this.starRadius = 30;
        this.planets = [];
        this.animationId = null;
        this.baseOrbitRadius = 80;
        this.orbitSpacing = 40;
        this.draggingPlanet = null;
        this.isDragging = false;
        this.dragStartRadius = 0;
        this.hasMoved = false;
        this.animate = () => {
            this.draw();
            this.animationId = requestAnimationFrame(this.animate);
        };
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas with id "${canvasId}" not found`);
        }
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get 2d context');
        }
        this.ctx = context;
        this.container = this.canvas.parentElement;
        if (!this.container) {
            throw new Error('Canvas must have a parent element');
        }
        this.setupCanvas();
        this.addButton = this.createAddButton();
        this.addPlanet(); // Start with one planet
        this.setupCanvasInteraction();
        this.animate();
    }
    setupCanvasInteraction() {
        this.canvas.style.cursor = 'default';
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const distanceFromCenter = Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2));
            // Check if clicking on any orbit to start dragging
            for (const planet of this.planets) {
                const distanceFromOrbit = Math.abs(distanceFromCenter - planet.baseOrbitRadius);
                if (distanceFromOrbit < 15) {
                    this.isDragging = true;
                    this.draggingPlanet = planet;
                    this.dragStartRadius = planet.baseOrbitRadius;
                    this.hasMoved = false;
                    e.preventDefault();
                    return;
                }
            }
        });
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            // Calculate distance from center to mouse
            const distanceFromCenter = Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2));
            if (this.isDragging && this.draggingPlanet) {
                // Update the orbit radius while dragging
                const minRadius = this.starRadius + 20; // Minimum distance from star
                const maxRadius = (this.canvas.width / 2) - this.draggingPlanet.radius - 10; // Keep planet inside canvas
                const newRadius = Math.max(minRadius, Math.min(maxRadius, distanceFromCenter));
                // Check if we've moved significantly
                if (Math.abs(newRadius - this.dragStartRadius) > 5) {
                    this.hasMoved = true;
                }
                this.draggingPlanet.baseOrbitRadius = newRadius;
                this.draggingPlanet.targetOrbitRadius = newRadius;
                this.draggingPlanet.orbitRadius = newRadius;
                this.canvas.style.cursor = 'grabbing';
            }
            else {
                // Normal hover behavior
                let hoveredAny = false;
                for (const planet of this.planets) {
                    // Check if mouse is close to the planet's orbit
                    const distanceFromOrbit = Math.abs(distanceFromCenter - planet.baseOrbitRadius);
                    if (distanceFromOrbit < 15) {
                        planet.hovered = true;
                        planet.targetOrbitRadius = planet.baseOrbitRadius * 0.95;
                        hoveredAny = true;
                    }
                    else {
                        planet.hovered = false;
                        planet.targetOrbitRadius = planet.baseOrbitRadius;
                    }
                }
                this.canvas.style.cursor = hoveredAny ? 'grab' : 'default';
            }
        });
        this.canvas.addEventListener('mouseup', (e) => {
            if (this.isDragging && this.draggingPlanet) {
                this.isDragging = false;
                this.draggingPlanet = null;
                this.canvas.style.cursor = 'default';
            }
        });
        this.canvas.addEventListener('click', (e) => {
            // Only delete if we didn't actually drag
            if (this.hasMoved) {
                this.hasMoved = false;
                return;
            }
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            // Calculate distance from center to mouse
            const distanceFromCenter = Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2));
            for (let i = this.planets.length - 1; i >= 0; i--) {
                const planet = this.planets[i];
                const distanceFromOrbit = Math.abs(distanceFromCenter - planet.baseOrbitRadius);
                if (distanceFromOrbit < 15) {
                    this.planets.splice(i, 1);
                    break;
                }
            }
        });
        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.draggingPlanet = null;
            this.hasMoved = false;
            for (const planet of this.planets) {
                planet.hovered = false;
                planet.targetOrbitRadius = planet.baseOrbitRadius;
            }
            this.canvas.style.cursor = 'default';
        });
    }
    createAddButton() {
        const button = document.createElement('button');
        button.textContent = '+';
        button.style.position = 'absolute';
        button.style.bottom = '10px';
        button.style.right = '10px';
        button.style.width = '40px';
        button.style.height = '40px';
        button.style.borderRadius = '50%';
        button.style.border = 'none';
        button.style.backgroundColor = 'transparent';
        button.style.color = '#666';
        button.style.fontSize = '24px';
        button.style.cursor = 'pointer';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.fontFamily = 'et-book, serif';
        button.style.lineHeight = '1';
        button.style.opacity = '0';
        button.style.transition = 'opacity 0.3s ease, color 0.2s ease';
        button.addEventListener('mouseenter', () => {
            button.style.color = '#333';
        });
        button.addEventListener('mouseleave', () => {
            button.style.color = '#666';
        });
        button.addEventListener('click', () => {
            this.addPlanet();
        });
        this.container.style.position = 'relative';
        this.container.appendChild(button);
        // Show button when mouse is near the bottom-right corner
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const distanceFromBottomRight = Math.sqrt(Math.pow(rect.width - x, 2) + Math.pow(rect.height - y, 2));
            if (distanceFromBottomRight < 200) {
                button.style.opacity = '1';
            }
            else {
                button.style.opacity = '0';
            }
        });
        this.container.addEventListener('mouseleave', () => {
            button.style.opacity = '0';
        });
        return button;
    }
    addPlanet() {
        const planetColors = ['#6a9fb5', '#b58a6a', '#8ab56a', '#b56a8a', '#6ab5b5', '#b5b56a'];
        const baseOrbitRadius = this.planets.length === 0
            ? this.baseOrbitRadius
            : Math.max(...this.planets.map(p => p.baseOrbitRadius)) + this.orbitSpacing;
        const radius = 8 + Math.random() * 4;
        const planet = {
            orbitRadius: baseOrbitRadius,
            baseOrbitRadius: baseOrbitRadius,
            targetOrbitRadius: baseOrbitRadius,
            angle: Math.random() * Math.PI * 2,
            radius: radius,
            color: planetColors[this.planets.length % planetColors.length],
            hovered: false
        };
        this.planets.push(planet);
    }
    setupCanvas() {
        const size = 500;
        this.canvas.width = size;
        this.canvas.height = size;
    }
    draw() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw orbit paths and update planet positions
        for (const planet of this.planets) {
            // Smoothly interpolate orbit radius
            const lerpFactor = 0.15;
            planet.orbitRadius += (planet.targetOrbitRadius - planet.orbitRadius) * lerpFactor;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, planet.orbitRadius, 0, Math.PI * 2);
            this.ctx.strokeStyle = '#d4cfc0';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
        // Draw star (larger circle)
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.starRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#f0c674';
        this.ctx.fill();
        // Draw planets
        for (const planet of this.planets) {
            const planetX = centerX + Math.cos(planet.angle) * planet.orbitRadius;
            const planetY = centerY + Math.sin(planet.angle) * planet.orbitRadius;
            this.ctx.beginPath();
            this.ctx.arc(planetX, planetY, planet.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = planet.color;
            this.ctx.fill();
            // Update angle for next frame
            planet.angle += 0.01;
        }
    }
    stop() {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}
// Initialize animation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new OrbitAnimation('orbit-canvas');
});
