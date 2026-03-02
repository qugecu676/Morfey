const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('menu');

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const yearNode = document.getElementById('year');
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('.reveal').forEach((section) => observer.observe(section));

const requestForm = document.getElementById('request-form');
const formStatus = document.getElementById('form-status');

if (requestForm && formStatus) {
  const nameInput = requestForm.elements.namedItem('name');
  const phoneInput = requestForm.elements.namedItem('phone');
  const dateInput = requestForm.elements.namedItem('date');
  const commentInput = requestForm.elements.namedItem('comment');

  const sanitizeName = (value) =>
    value
      .replace(/[^A-Za-zА-Яа-яЁё\s-]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/-{2,}/g, '-')
      .trimStart()
      .slice(0, 40);

  const formatPhone = (value) => {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('7') || digits.startsWith('8')) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);

    let out = '+7';
    if (digits.length > 0) out += ` (${digits.slice(0, 3)}`;
    if (digits.length >= 4) out += `) ${digits.slice(3, 6)}`;
    if (digits.length >= 7) out += `-${digits.slice(6, 8)}`;
    if (digits.length >= 9) out += `-${digits.slice(8, 10)}`;
    return out;
  };

  const isPhoneComplete = (value) => /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value);

  const formatDate = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const parts = [];
    if (digits.length > 0) parts.push(digits.slice(0, 2));
    if (digits.length > 2) parts.push(digits.slice(2, 4));
    if (digits.length > 4) parts.push(digits.slice(4, 8));
    return parts.join('.');
  };

  const parseDateRu = (value) => {
    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  };

  const isDateTodayOrFuture = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() >= today.getTime();
  };

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      nameInput.value = sanitizeName(nameInput.value);
      nameInput.setCustomValidity('');
    });
  }

  if (commentInput) {
    commentInput.addEventListener('input', () => {
      commentInput.value = commentInput.value.slice(0, 300);
    });
  }

  if (dateInput) {
    dateInput.addEventListener('input', () => {
      dateInput.value = formatDate(dateInput.value);
      dateInput.setCustomValidity('');
    });

    dateInput.addEventListener('blur', () => {
      const parsed = parseDateRu(dateInput.value);
      if (!parsed) {
        dateInput.setCustomValidity('Введите корректную дату в формате ДД.ММ.ГГГГ');
        return;
      }
      if (!isDateTodayOrFuture(parsed)) {
        dateInput.setCustomValidity('Дата не может быть в прошлом.');
        return;
      }
      dateInput.setCustomValidity('');
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('focus', () => {
      if (!phoneInput.value.trim()) {
        phoneInput.value = '+7';
      }
    });

    phoneInput.addEventListener('input', () => {
      phoneInput.value = formatPhone(phoneInput.value);
      phoneInput.setCustomValidity('');
    });

    phoneInput.addEventListener('blur', () => {
      if (phoneInput.value && !isPhoneComplete(phoneInput.value)) {
        phoneInput.setCustomValidity('Введите полный номер: +7 (XXX) XXX-XX-XX');
      } else {
        phoneInput.setCustomValidity('');
      }
    });
  }

  requestForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (nameInput) {
      nameInput.value = sanitizeName(nameInput.value).trim();
      if (nameInput.value.length < 2) {
        nameInput.setCustomValidity('Введите имя (минимум 2 символа).');
      } else {
        nameInput.setCustomValidity('');
      }
    }

    if (phoneInput) {
      phoneInput.value = formatPhone(phoneInput.value);
      if (!isPhoneComplete(phoneInput.value)) {
        phoneInput.setCustomValidity('Введите полный номер: +7 (XXX) XXX-XX-XX');
      } else {
        phoneInput.setCustomValidity('');
      }
    }

    if (dateInput) {
      dateInput.value = formatDate(dateInput.value);
      const parsed = parseDateRu(dateInput.value);
      if (!parsed) {
        dateInput.setCustomValidity('Введите корректную дату в формате ДД.ММ.ГГГГ');
      } else if (!isDateTodayOrFuture(parsed)) {
        dateInput.setCustomValidity('Дата не может быть в прошлом.');
      } else {
        dateInput.setCustomValidity('');
      }
    }

    if (!requestForm.checkValidity()) {
      formStatus.textContent = 'Заполните обязательные поля формы.';
      requestForm.reportValidity();
      return;
    }

    const data = new FormData(requestForm);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const service = String(data.get('service') || '').trim();
    const city = String(data.get('city') || '').trim();
    const date = String(data.get('date') || '').trim();
    const comment = String(data.get('comment') || '').trim();

    const lines = [
      'Здравствуйте! Новая заявка с сайта Морфей38.',
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      `Услуга: ${service}`,
      `Город: ${city}`,
      `Дата: ${date}`,
      `Комментарий: ${comment || 'не указан'}`
    ];

    const whatsappNumber = '79086668700';
    const message = encodeURIComponent(lines.join('\n'));
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    formStatus.textContent = 'Открываем WhatsApp для отправки заявки...';
    window.location.href = whatsappUrl;
  });
}

const backToTop = document.getElementById('back-to-top');

if (backToTop) {
  const toggleBackToTop = () => {
    if (window.scrollY > 320) {
      backToTop.classList.add('is-visible');
    } else {
      backToTop.classList.remove('is-visible');
    }
  };

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();
}
