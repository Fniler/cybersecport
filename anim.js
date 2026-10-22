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
    shapka.classList.toggle('shapka--center', shiroko.matches && spusk > 60);
}

shiroko.addEventListener('change', obnovit);

window.addEventListener('scroll', obnovit, { passive: true });
window.addEventListener('load', obnovit);
