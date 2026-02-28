const navLinks = Array.from(document.querySelectorAll('#main-nav a'));
const sections = Array.from(document.querySelectorAll('main section[id]'));
const cards = Array.from(document.querySelectorAll('.card'));

function updateActiveLink() {
  const y = window.scrollY + 120;
  let activeId = sections[0]?.id;

  for (const section of sections) {
    if (y >= section.offsetTop) {
      activeId = section.id;
    }
  }

  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${activeId}`);
  });
}

function revealCards() {
  const trigger = window.innerHeight * 0.9;
  cards.forEach((card) => {
    const top = card.getBoundingClientRect().top;
    if (top < trigger) {
      card.classList.add('in-view');
    }
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    const target = document.querySelector(targetId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

window.addEventListener('scroll', () => {
  updateActiveLink();
  revealCards();
});

updateActiveLink();
revealCards();

const leadForm = document.getElementById('lead-form');
const formMessage = document.getElementById('form-message');

if (leadForm && formMessage) {
  const phoneInput = leadForm.querySelector('input[name="phone"]');
  const requiredFields = [
    leadForm.querySelector('input[name="name"]'),
    phoneInput,
    leadForm.querySelector('select[name="service"]'),
  ];
  const consent = leadForm.querySelector('input[name="consent"]');

  const onlyDigits = (value) => value.replace(/\D/g, '');

  phoneInput?.addEventListener('input', () => {
    const digits = onlyDigits(phoneInput.value).slice(0, 11);
    phoneInput.value = digits ? `+${digits}` : '';
  });

  leadForm.addEventListener('submit', (event) => {
    event.preventDefault();

    formMessage.textContent = '';
    formMessage.className = 'form-message';
    requiredFields.forEach((field) => field?.classList.remove('is-invalid'));

    let hasError = false;
    requiredFields.forEach((field) => {
      if (!field || !field.value.trim()) {
        field?.classList.add('is-invalid');
        hasError = true;
      }
    });

    const phoneDigits = onlyDigits(phoneInput?.value || '');
    if (phoneDigits.length < 11) {
      phoneInput?.classList.add('is-invalid');
      hasError = true;
    }

    if (!consent?.checked) {
      hasError = true;
    }

    if (hasError) {
      formMessage.textContent = 'Проверьте обязательные поля: имя, телефон, услугу и согласие.';
      formMessage.classList.add('is-error');
      return;
    }

    const name = leadForm.elements.name.value.trim();
    const phone = leadForm.elements.phone.value.trim();
    const service = leadForm.elements.service.value.trim();
    const comment = leadForm.elements.comment.value.trim() || 'Без комментария';

    const text = [
      'Здравствуйте! Хочу оставить заявку в химчистку Морфей.',
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      `Услуга: ${service}`,
      `Комментарий: ${comment}`,
    ].join('\n');

    const url = `https://wa.me/79086668700?text=${encodeURIComponent(text)}`;
    formMessage.textContent = 'Заявка подготовлена. Открываем WhatsApp...';
    formMessage.classList.add('is-success');
    window.open(url, '_blank', 'noopener');
  });
}
