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

if (requestForm) {
  const setFormStatus = (message) => {
    if (formStatus) {
      formStatus.textContent = message;
    }
  };

  const nameInput = requestForm.elements.namedItem('name');
  const phoneInput = requestForm.elements.namedItem('phone');
  const dateInput = requestForm.elements.namedItem('date');
  const commentInput = requestForm.elements.namedItem('comment');
  const callTimeFromInput = requestForm.elements.namedItem('callTimeFrom');
  const callTimeToInput = requestForm.elements.namedItem('callTimeTo');
  const serviceMain = document.getElementById('service-main');
  const addServiceBtn = document.getElementById('add-service-btn');
  const extraServicesList = document.getElementById('extra-services-list');

  const sanitizeName = (value) =>
    value
      .replace(/[^A-Za-zА-Яа-яЁё\s-]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/-{2,}/g, '-')
      .trimStart()
      .slice(0, 40);

  const formatDate = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const parts = [];

    let day = digits.slice(0, 2);
    let month = digits.slice(2, 4);
    let year = digits.slice(4, 8);

    if (day.length === 2) {
      day = String(Math.min(31, Math.max(1, Number(day)))).padStart(2, '0');
    }
    if (month.length === 2) {
      month = String(Math.min(12, Math.max(1, Number(month)))).padStart(2, '0');
    }
    if (year.length === 4) {
      const currentYear = new Date().getFullYear();
      year = String(Math.min(currentYear + 5, Math.max(currentYear, Number(year))));
    }

    if (day.length > 0) parts.push(day);
    if (month.length > 0) parts.push(month);
    if (year.length > 0) parts.push(year);
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
  const parseTimeToMinutes = (value) => {
    const match = /^(\d{2}):(\d{2})$/.exec(value || '');
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
  };

  const fillTimeSelect = (select) => {
    if (!select) return;
    for (let hour = 0; hour < 24; hour += 1) {
      for (let minute = 0; minute < 60; minute += 15) {
        const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      }
    }
  };

  const validateCallTimeRange = () => {
    if (!callTimeFromInput || !callTimeToInput) return;
    callTimeFromInput.setCustomValidity('');
    callTimeToInput.setCustomValidity('');
    if (!callTimeFromInput.value || !callTimeToInput.value) return;

    const from = parseTimeToMinutes(callTimeFromInput.value);
    const to = parseTimeToMinutes(callTimeToInput.value);
    if (from === null || to === null) return;

    if (to <= from) {
      callTimeToInput.setCustomValidity('Время "до" должно быть позже времени "с".');
    }
  };

  const createExtraServiceItem = () => {
    if (!serviceMain || !extraServicesList) return;
    const item = document.createElement('div');
    item.className = 'extra-service-item';

    const select = document.createElement('select');
    select.name = 'extraServices[]';
    select.required = true;
    select.innerHTML = serviceMain.innerHTML;
    select.value = '';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'extra-service-remove';
    removeBtn.textContent = 'Удалить';
    removeBtn.addEventListener('click', () => {
      item.remove();
    });

    item.appendChild(select);
    item.appendChild(removeBtn);
    extraServicesList.appendChild(item);
  };

  if (addServiceBtn) {
    addServiceBtn.addEventListener('click', createExtraServiceItem);
  }

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

  if (callTimeFromInput && callTimeToInput) {
    fillTimeSelect(callTimeFromInput);
    fillTimeSelect(callTimeToInput);

    callTimeFromInput.addEventListener('change', () => {
      callTimeFromInput.setCustomValidity('');
      validateCallTimeRange();
    });
    callTimeToInput.addEventListener('change', () => {
      callTimeToInput.setCustomValidity('');
      validateCallTimeRange();
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

    validateCallTimeRange();

    if (!requestForm.checkValidity()) {
      setFormStatus('Заполните обязательные поля формы.');
      requestForm.reportValidity();
      return;
    }

    const data = new FormData(requestForm);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const services = [String(data.get('service') || '').trim()];
    data.getAll('extraServices[]').forEach((value) => {
      const item = String(value || '').trim();
      if (item) services.push(item);
    });
    const city = String(data.get('city') || '').trim();
    const date = String(data.get('date') || '').trim();
    const callTimeFrom = String(data.get('callTimeFrom') || '').trim();
    const callTimeTo = String(data.get('callTimeTo') || '').trim();
    const comment = String(data.get('comment') || '').trim();

    const lines = [
      'Здравствуйте! Новая заявка с сайта.',
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      `Услуги: ${services.join(', ')}`,
      `Город: ${city}`,
      `Дата: ${date}`,
      `Удобно звонить: с ${callTimeFrom} до ${callTimeTo}`,
      `Комментарий: ${comment || 'не указан'}`
    ];

    const whatsappNumber = '79086668700';
    const message = encodeURIComponent(lines.join('\n'));
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    setFormStatus('Открываем WhatsApp для отправки заявки...');
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

const priceTabsWrap = document.getElementById('price-tabs');
const pricePanelsWrap = document.getElementById('price-panels');

if (priceTabsWrap && pricePanelsWrap) {
  const tabs = Array.from(priceTabsWrap.querySelectorAll('.price-tab'));
  const panels = Array.from(pricePanelsWrap.querySelectorAll('.price-panel'));

  const showPricePanel = (targetId) => {
    tabs.forEach((tab) => {
      tab.classList.toggle('is-active', tab.dataset.priceTarget === targetId);
    });

    panels.forEach((panel) => {
      const isCurrent = panel.id === targetId;
      if (isCurrent) {
        panel.hidden = false;
        requestAnimationFrame(() => {
          panel.classList.add('is-visible');
        });
      } else {
        panel.classList.remove('is-visible');
        setTimeout(() => {
          if (!panel.classList.contains('is-visible')) {
            panel.hidden = true;
          }
        }, 220);
      }
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.priceTarget;
      showPricePanel(targetId);
    });
  });

  const activeTab = tabs.find((tab) => tab.classList.contains('is-active'));
  showPricePanel(activeTab ? activeTab.dataset.priceTarget : tabs[0].dataset.priceTarget);
}

const reviewsTrack = document.getElementById('reviews-track');
const reviewsPrev = document.getElementById('reviews-prev');
const reviewsNext = document.getElementById('reviews-next');
const reviewsDots = document.getElementById('reviews-dots');

if (reviewsTrack && reviewsPrev && reviewsNext) {
  const slides = Array.from(reviewsTrack.children);
  const dots = [];
  let current = 0;

  if (reviewsDots) {
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'reviews-dot';
      dot.setAttribute('aria-label', `Перейти к отзыву ${index + 1}`);
      dot.addEventListener('click', () => {
        current = index;
        renderReviewSlide();
      });
      reviewsDots.appendChild(dot);
      dots.push(dot);
    });
  }

  const renderReviewSlide = () => {
    reviewsTrack.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, idx) => dot.classList.toggle('is-active', idx === current));
    reviewsPrev.disabled = current === 0;
    reviewsNext.disabled = current === slides.length - 1;
  };

  reviewsPrev.addEventListener('click', () => {
    if (current > 0) {
      current -= 1;
      renderReviewSlide();
    }
  });

  reviewsNext.addEventListener('click', () => {
    if (current < slides.length - 1) {
      current += 1;
      renderReviewSlide();
    }
  });

  renderReviewSlide();
}
