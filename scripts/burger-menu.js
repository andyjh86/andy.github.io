// Get elements
const burger = document.querySelector('.navbar-toggler');
const navCollapse = document.getElementById('navbarNav');

// Prevent Bootstrap from handling the toggle
burger.removeAttribute('data-bs-toggle');
burger.removeAttribute('data-bs-target');

// Custom toggle function for instant response with animation
burger.addEventListener('click', (e) => {
    e.preventDefault();
    const isExpanded = burger.getAttribute('aria-expanded') === 'true';
    
    if (isExpanded) {
        navCollapse.classList.remove('show');
        burger.setAttribute('aria-expanded', 'false');
    } else {
        // Force a reflow to trigger the CSS transition
        navCollapse.style.display = 'block';
        navCollapse.offsetHeight; // Trigger reflow
        navCollapse.classList.add('show');
        burger.setAttribute('aria-expanded', 'true');
    }
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navCollapse.classList.remove('show');
        burger.setAttribute('aria-expanded', 'false');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const navbar = document.querySelector('.navbar');
    
    if (navCollapse.classList.contains('show') && 
        !navbar.contains(e.target)) {
        navCollapse.classList.remove('show');
        burger.setAttribute('aria-expanded', 'false');
    }
});
