// Set and persist theme color using CSS variable and localStorage
const root = document.documentElement;
const colorBtns = document.querySelectorAll('.color-btn');
const saveMsg = document.getElementById('saveMsg');
const THEME_KEY = 'synth-theme-color';
// Apply theme color to CSS variable
function setThemeColor(color) {
    root.style.setProperty('--theme-color', color);
    // Update all elements using the theme color
    document.querySelectorAll('.nav-logo, .card-title, .settings-title, .playlist-right h3, .playlist-item.active').forEach(el => {
        el.style.color = color;
    });
}
// Load saved color or default
function loadThemeColor() {
    const saved = localStorage.getItem(THEME_KEY) || '#4ecdc4';
    setThemeColor(saved);
    colorBtns.forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.color === saved);
    });
}
// Handle color button click
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const color = btn.dataset.color;
        setThemeColor(color);
        localStorage.setItem(THEME_KEY, color);
        saveMsg.style.display = 'block';
        setTimeout(() => saveMsg.style.display = 'none', 1200);
    });
});
// On page load
loadThemeColor();