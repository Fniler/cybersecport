const links = document.querySelectorAll('.menu-link');
const sections = document.querySelectorAll('#home, #biography, #skills, #contacts');
const shapka = document.querySelector('.shapka');

function podsvetka() {
    const spusk = window.scrollY || document.documentElement.scrollTop;
    const oknoH = window.innerHeight;
    const vsegoH = document.documentElement.scrollHeight;
    const vnizu = (oknoH + spusk) >= (vsegoH - 60);

    let current = sections[0];

    if (vnizu) {
        current = sections[sections.length - 1];
    } else {
        const porog = oknoH * 0.4;
        sections.forEach(s => {
            if (s.getBoundingClientRect().top <= porog) current = s;
        });
    }

    links.forEach(link => {
        const active = link.getAttribute('href') === '#' + current.id;
        link.classList.toggle('active', active);

        if (active) {
            link.setAttribute('aria-current', 'location');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

const shiroko = window.matchMedia('(min-width: 901px)');

function obnovit() {
    podsvetka();
    const spusk = window.scrollY || document.documentElement.scrollTop;
    const vCentre = shapka.classList.contains('shapka--center');
    const nado = vCentre ? spusk > 35 : spusk > 65;
    shapka.classList.toggle('shapka--center', shiroko.matches && nado);
}

// Throttled scroll to ensure 60/120fps smooth scrolling without layout thrashing
let scrollTicking = false;
function onScroll() {
    if (!scrollTicking) {
        requestAnimationFrame(() => {
            obnovit();
            scrollTicking = false;
        });
        scrollTicking = true;
    }
}

shiroko.addEventListener('change', obnovit);
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('load', obnovit);

async function kopirovatVBufer(tekst) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(tekst);
            return true;
        } catch (e) {
            // fallback
        }
    }
    const pole = document.createElement('textarea');
    pole.value = tekst;
    pole.style.position = 'fixed';
    pole.style.left = '-9999px';
    document.body.appendChild(pole);
    pole.select();
    let uspeh = false;
    try {
        uspeh = document.execCommand('copy');
    } catch (e) {
        uspeh = false;
    }
    document.body.removeChild(pole);
    return uspeh;
}

let toastTajmer = 0;
function pokazatToast(tekst = 'Скопировано') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const tekstElement = toast.querySelector('.toast-text');
    if (tekstElement) {
        tekstElement.textContent = tekst;
    }

    toast.classList.add('toast--show');

    clearTimeout(toastTajmer);
    toastTajmer = setTimeout(() => {
        toast.classList.remove('toast--show');
    }, 2400);
}

document.querySelectorAll('.footer-pill--copy').forEach(knopka => {
    knopka.addEventListener('click', async () => {
        const dannye = knopka.getAttribute('data-copy');
        if (!dannye) return;

        await kopirovatVBufer(dannye);
        pokazatToast('Скопировано');

        const tekst = knopka.querySelector('.footer-pill-text');
        if (!tekst) return;

        if (!knopka._ishodnyjTekst) {
            knopka._ishodnyjTekst = tekst.textContent;
        }

        tekst.textContent = dannye;
        knopka.classList.add('footer-pill--copied');

        clearTimeout(knopka._tajmer);
        knopka._tajmer = setTimeout(() => {
            tekst.textContent = knopka._ishodnyjTekst;
            knopka.classList.remove('footer-pill--copied');
        }, 10000);
    });
});
