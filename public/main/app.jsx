const journey = [
  {
    year: '2025 — 2027',
    title: 'IT-техникум',
    description: 'Продолжаю профильное обучение: базы данных, операционные системы и программирование.',
    kind: 'current',
  },
  {
    year: '2024 — 2025',
    title: 'Колледж кибернетики',
    description: 'Изучал JavaScript frontend и backend, веб-разработку и основы веб-дизайна.',
  },
  {
    year: '2023 — сейчас',
    title: 'Freelance и pet-проекты',
    description: 'E-commerce, лендинги, браузерные игры и личные проекты на GitHub.',
  },
  {
    year: '2020 — сейчас',
    title: 'Веб-разработка',
    description: 'От первых HTML/CSS страниц к полноценным веб-приложениям и серверной логике.',
  },
];

const root = document.querySelector('.root');

root.innerHTML = `
  <div class="journey-grid">
    ${journey.map((item, index) => `
      <article class="journey-card ${item.kind ? `journey-card--${item.kind}` : ''}">
        <div class="journey-card__topline">
          <span>0${index + 1}</span>
          <span>${item.year}</span>
        </div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <span class="journey-card__arrow" aria-hidden="true">↗</span>
      </article>
    `).join('')}
  </div>
`;
