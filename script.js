const canvas = document.getElementById('starCanvas');
const context = canvas ? canvas.getContext('2d') : null;
const navLinks = document.querySelectorAll('.floating-navbar a');
const internalLinks = document.querySelectorAll('a[href^="#"]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let activeTheme = localStorage.getItem('portfolio-theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
let stars = [];
let mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
};

function resizeCanvas() {
    if (!canvas || !context) {
        return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.body.classList.toggle('theme-light', theme === 'light');
    document.body.classList.toggle('theme-dark', theme !== 'light');
}

function toggleTheme(themeToggle) {
    activeTheme = activeTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('portfolio-theme', activeTheme);
    applyTheme(activeTheme);

    if (themeToggle) {
        const label = themeToggle.querySelector('[data-theme-label]');
        themeToggle.setAttribute('aria-pressed', activeTheme === 'light' ? 'true' : 'false');
        themeToggle.setAttribute('title', activeTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
        if (label) {
            label.textContent = activeTheme === 'light' ? 'Dark' : 'Light';
        }
    }
}

class Star {
    constructor(width, height) {
        this.reset(width, height);
    }

    reset(width, height) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.4 + 0.3;
        this.baseOpacity = Math.random() * 0.5 + 0.25;
        this.opacity = this.baseOpacity;
        this.twinkleSpeed = Math.random() * 0.012 + 0.006;
        this.driftX = (Math.random() - 0.5) * 0.2;
        this.driftY = (Math.random() - 0.5) * 0.2;
    }

    update() {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const repelDistance = 160;

        if (distance > 0 && distance < repelDistance) {
            const force = (repelDistance - distance) / repelDistance;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 2.2;
            this.y += Math.sin(angle) * force * 2.2;
        }

        this.x += this.driftX;
        this.y += this.driftY;

        if (this.x < -20) this.x = window.innerWidth + 20;
        if (this.x > window.innerWidth + 20) this.x = -20;
        if (this.y < -20) this.y = window.innerHeight + 20;
        if (this.y > window.innerHeight + 20) this.y = -20;

        const twinkle = Math.sin(Date.now() * this.twinkleSpeed + this.x * 0.01) * 0.25;
        this.opacity = Math.max(0.08, Math.min(1, this.baseOpacity + twinkle));
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createStars() {
    if (!canvas || !context) {
        return;
    }

    const count = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 12000), 180);
    stars = Array.from({ length: count }, () => new Star(window.innerWidth, window.innerHeight));
}

function animateStars() {
    if (!canvas || !context) {
        return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(0, 0, 0, 0.35)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (const star of stars) {
        star.update();
        star.draw(context);
    }

    requestAnimationFrame(animateStars);
}

function updateActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === currentPage || (currentPage === '' && href === 'index.html'));
    });
}

function initNavbar() {
    const themeToggle = document.querySelector('[data-theme-toggle]');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => toggleTheme(themeToggle));
        themeToggle.setAttribute('aria-pressed', activeTheme === 'light' ? 'true' : 'false');
        themeToggle.setAttribute('title', activeTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');

        const label = themeToggle.querySelector('[data-theme-label]');
        if (label) {
            label.textContent = activeTheme === 'light' ? 'Dark' : 'Light';
        }
    }
}

function initInternalLinks() {
    internalLinks.forEach(anchor => {
        anchor.addEventListener('click', event => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') {
                return;
            }

            const target = document.querySelector(href);
            if (!target) {
                return;
            }

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function initHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarDrawer = document.getElementById('sidebarDrawer');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const navbarLinks = document.getElementById('navbarLinks');

    if (!hamburgerBtn || !sidebarDrawer || !sidebarOverlay) {
        return;
    }

    function closeSidebar() {
        hamburgerBtn.classList.remove('active');
        sidebarDrawer.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
    }

    function openSidebar() {
        hamburgerBtn.classList.add('active');
        sidebarDrawer.classList.add('active');
        sidebarOverlay.classList.add('active');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
    }

    hamburgerBtn.addEventListener('click', () => {
        if (hamburgerBtn.classList.contains('active')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    // Close sidebar when a link is clicked
    navbarLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeSidebar);
    });

    // Close sidebar when overlay is clicked
    sidebarOverlay.addEventListener('click', closeSidebar);
}

function init() {
    applyTheme(activeTheme);
    updateActiveLink();
    initNavbar();
    initInternalLinks();
    initHamburgerMenu();

    if (canvas && context && !prefersReducedMotion) {
        resizeCanvas();
        createStars();
        animateStars();

        window.addEventListener('resize', () => {
            resizeCanvas();
            createStars();
        });

        window.addEventListener('mousemove', event => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        });
    }
}

window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-fade-out');
    updateActiveLink();
});

document.addEventListener('DOMContentLoaded', init);