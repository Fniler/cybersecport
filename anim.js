// ШАПКА И НАВИГАЦИЯ
const navLinks = document.querySelectorAll('.menu-link');
const sections = document.querySelectorAll('#home, #biography, #skills, #contacts');
const header = document.querySelector('.shapka');
const wideScreenQuery = window.matchMedia('(min-width: 901px)');

function updateActiveNav() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;
    const isBottom = (windowHeight + scrollPosition) >= (pageHeight - 60);

    let activeSection = sections[0];

    if (isBottom) {
        activeSection = sections[sections.length - 1];
    } else {
        const threshold = windowHeight * 0.4;
        sections.forEach(section => {
            if (section.getBoundingClientRect().top <= threshold) {
                activeSection = section;
            }
        });
    }

    navLinks.forEach(link => {
        const isActive = link.getAttribute('href') === '#' + activeSection.id;
        link.classList.toggle('active', isActive);

        if (isActive) {
            link.setAttribute('aria-current', 'location');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

function updateHeader() {
    updateActiveNav();
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const isCentered = header.classList.contains('shapka--center');
    const shouldCenter = isCentered ? scrollPosition > 35 : scrollPosition > 65;
    header.classList.toggle('shapka--center', wideScreenQuery.matches && shouldCenter);
}

// СКРОЛЛ И ПЕРЕЗАГРУЗКА
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

let isScrolling = false;
function onScroll() {
    if (!isScrolling) {
        requestAnimationFrame(() => {
            updateHeader();
            isScrolling = false;
        });
        isScrolling = true;
    }
}

wideScreenQuery.addEventListener('change', updateHeader);
window.addEventListener('scroll', onScroll, { passive: true });

window.addEventListener('load', () => {
    if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
        window.scrollTo(0, 0);
    }
    updateHeader();
});

// ПЛАВНАЯ НАВИГАЦИЯ
const anchorLinks = document.querySelectorAll('a[href^="#"]');
anchorLinks.forEach(link => {
    link.addEventListener('click', event => {
        const targetId = link.getAttribute('href');
        if (targetId === '#' || targetId === '') return;
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            event.preventDefault();
            targetSection.scrollIntoView({ behavior: 'smooth' });
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    });
});

// БУФЕР ОБМЕНА
async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
        }
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    let isSuccess = false;
    try {
        isSuccess = document.execCommand('copy');
    } catch (e) {
        isSuccess = false;
    }
    document.body.removeChild(textArea);
    return isSuccess;
}

// УВЕДОМЛЕНИЕ
let toastTimer = 0;
function showToast(text = 'Скопировано') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const toastText = toast.querySelector('.toast-text');
    if (toastText) {
        toastText.textContent = text;
    }

    toast.classList.add('toast--show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('toast--show');
    }, 2400);
}

// КОПИРОВАНИЕ ДАННЫХ
const copyButtons = document.querySelectorAll('.footer-pill--copy');
copyButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const dataToCopy = button.getAttribute('data-copy');
        if (!dataToCopy) return;

        await copyToClipboard(dataToCopy);
        showToast('Скопировано');

        const textSpan = button.querySelector('.footer-pill-text');
        if (!textSpan) return;

        if (!button._originalText) {
            button._originalText = textSpan.textContent;
        }

        textSpan.textContent = dataToCopy;
        button.classList.add('footer-pill--copied');

        clearTimeout(button._timer);
        button._timer = setTimeout(() => {
            textSpan.textContent = button._originalText;
            button.classList.remove('footer-pill--copied');
        }, 10000);
    });
});
