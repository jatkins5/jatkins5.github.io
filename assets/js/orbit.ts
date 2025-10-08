interface Planet {
    orbitRadius: number;
    angle: number;
    radius: number;
    baseRadius: number;
    color: string;
    hovered: boolean;
}

class OrbitAnimation {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private container: HTMLElement;
    private addButton: HTMLButtonElement;
    private starRadius: number = 30;
    private planets: Planet[] = [];
    private animationId: number | null = null;
    private baseOrbitRadius: number = 80;
    private orbitSpacing: number = 40;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error(`Canvas with id "${canvasId}" not found`);
        }

        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get 2d context');
        }
        this.ctx = context;

        this.container = this.canvas.parentElement as HTMLElement;
        if (!this.container) {
            throw new Error('Canvas must have a parent element');
        }

        this.setupCanvas();
        this.addButton = this.createAddButton();
        this.addPlanet(); // Start with one planet
        this.setupCanvasInteraction();
        this.animate();
    }

    private setupCanvasInteraction(): void {
        this.canvas.style.cursor = 'default';

        this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;

            let hoveredAny = false;
            for (const planet of this.planets) {
                const planetX = centerX + Math.cos(planet.angle) * planet.orbitRadius;
                const planetY = centerY + Math.sin(planet.angle) * planet.orbitRadius;
                const distance = Math.sqrt(
                    Math.pow(mouseX - planetX, 2) + Math.pow(mouseY - planetY, 2)
                );

                if (distance < planet.baseRadius + 10) {
                    planet.hovered = true;
                    planet.radius = planet.baseRadius * 1.3;
                    hoveredAny = true;
                } else {
                    planet.hovered = false;
                    planet.radius = planet.baseRadius;
                }
            }

            this.canvas.style.cursor = hoveredAny ? 'pointer' : 'default';
        });

        this.canvas.addEventListener('click', (e: MouseEvent) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;

            for (let i = this.planets.length - 1; i >= 0; i--) {
                const planet = this.planets[i];
                const planetX = centerX + Math.cos(planet.angle) * planet.orbitRadius;
                const planetY = centerY + Math.sin(planet.angle) * planet.orbitRadius;
                const distance = Math.sqrt(
                    Math.pow(mouseX - planetX, 2) + Math.pow(mouseY - planetY, 2)
                );

                if (distance < planet.radius) {
                    this.planets.splice(i, 1);
                    break;
                }
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            for (const planet of this.planets) {
                planet.hovered = false;
                planet.radius = planet.baseRadius;
            }
            this.canvas.style.cursor = 'default';
        });
    }

    private createAddButton(): HTMLButtonElement {
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
        button.style.padding = '-2rem';
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
        this.container.addEventListener('mousemove', (e: MouseEvent) => {
            const rect = this.container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const distanceFromBottomRight = Math.sqrt(
                Math.pow(rect.width - x, 2) + Math.pow(rect.height - y, 2)
            );

            if (distanceFromBottomRight < 200) {
                button.style.opacity = '1';
            } else {
                button.style.opacity = '0';
            }
        });

        this.container.addEventListener('mouseleave', () => {
            button.style.opacity = '0';
        });

        return button;
    }

    private addPlanet(): void {
        const planetColors = ['#6a9fb5', '#b58a6a', '#8ab56a', '#b56a8a', '#6ab5b5', '#b5b56a'];
        const orbitRadius = this.planets.length === 0
          ? this.baseOrbitRadius
          : Math.max(...this.planets.map(p => p.orbitRadius)) + this.orbitSpacing;
        const baseRadius = 8 + Math.random() * 4;
        const planet: Planet = {
            orbitRadius: orbitRadius,
            angle: Math.random() * Math.PI * 2,
            radius: baseRadius,
            baseRadius: baseRadius,
            color: planetColors[this.planets.length % planetColors.length],
            hovered: false
        };
        this.planets.push(planet);
    }

    private setupCanvas(): void {
        const size = 400;
        this.canvas.width = size;
        this.canvas.height = size;
    }

    private draw(): void {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw orbit paths
        for (const planet of this.planets) {
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

    private animate = (): void => {
        this.draw();
        this.animationId = requestAnimationFrame(this.animate);
    }

    public stop(): void {
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
