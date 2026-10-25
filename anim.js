const links = document.querySelectorAll('.menu-link');
const sections = document.querySelectorAll('main section');
const shapka = document.querySelector('.shapka');

function podsvetka() {
    let current = sections[0];

    sections.forEach(s => {
        if (s.getBoundingClientRect().top <= 160) current = s;
    });

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

shiroko.addEventListener('change', obnovit);

window.addEventListener('scroll', obnovit, { passive: true });
window.addEventListener('load', obnovit);

const bezAnimacii = window.matchMedia('(prefers-reduced-motion: reduce)');
const skorost = 30;

const lenty = [...document.querySelectorAll('.marquee')].map(okno => ({
    okno,
    track: okno.querySelector('.marquee-track'),
    list: okno.querySelector('.marquee-list'),
    napravlenie: okno.classList.contains('marquee--reverse') ? -1 : 1,
    shag: 0,
    smestit: 0,
    poslednee: 0
}));

let zadacha = 0;

function sobrat() {
    cancelAnimationFrame(zadacha);
    zadacha = 0;

    lenty.forEach(lenta => {
        while (lenta.track.children.length > 1) {
            lenta.track.removeChild(lenta.track.lastElementChild);
        }

        if (bezAnimacii.matches) {
            lenta.track.style.transform = '';
            lenta.okno.style.overflowX = 'auto';
            return;
        }

        lenta.okno.style.overflowX = '';
        lenta.shag = lenta.list.getBoundingClientRect().width;

        while (lenta.track.scrollWidth < lenta.okno.clientWidth + lenta.shag * 2) {
            lenta.track.appendChild(lenta.list.cloneNode(true));
        }

        lenta.smestit = -lenta.shag;
        lenta.poslednee = performance.now();
    });

    if (bezAnimacii.matches) return;

    zadacha = requestAnimationFrame(kruit);
}

function kruit(teper) {
    const dpr = window.devicePixelRatio || 1;

    lenty.forEach(lenta => {
        const proshlo = Math.min((teper - lenta.poslednee) / 1000, 0.05);
        lenta.poslednee = teper;

        lenta.smestit += lenta.napravlenie * skorost * proshlo;

        if (lenta.smestit >= 0) lenta.smestit -= lenta.shag;
        if (lenta.smestit <= -lenta.shag) lenta.smestit += lenta.shag;

        const tochka = Math.round(lenta.smestit * dpr) / dpr;
        lenta.track.style.transform = `translateX(${tochka}px)`;
    });

    zadacha = requestAnimationFrame(kruit);
}

bezAnimacii.addEventListener('change', sobrat);

let tajmer = 0;
window.addEventListener('resize', () => {
    clearTimeout(tajmer);
    tajmer = setTimeout(sobrat, 150);
});
window.addEventListener('load', sobrat);

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
