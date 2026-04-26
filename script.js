(() => {
  const doc = document;
  const $ = (selector, root = doc) => root.querySelector(selector);
  const $$ = (selector, root = doc) => Array.from(root.querySelectorAll(selector));

  const setCurrentYear = () => {
    const yearNode = $('#year');
    if (yearNode) yearNode.textContent = String(new Date().getFullYear());
  };

  const initMenu = () => {
    const toggle = $('.nav-toggle');
    const menu = $('#menu');
    if (!toggle || !menu) return;
    const mobileMenu = window.matchMedia('(max-width: 920px)');

    const setMenuState = (isOpen) => {
      menu.classList.toggle('is-open', isOpen);
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
      doc.body.classList.toggle('menu-open', isOpen && mobileMenu.matches);
    };

    const closeMenu = () => {
      setMenuState(false);
    };

    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      setMenuState(!menu.classList.contains('is-open'));
    });

    $$('a', menu).forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    doc.addEventListener('click', (event) => {
      if (!mobileMenu.matches || !menu.classList.contains('is-open')) return;
      if (menu.contains(event.target) || toggle.contains(event.target)) return;
      closeMenu();
    });

    const syncMenu = () => {
      if (!mobileMenu.matches) {
        closeMenu();
        return;
      }

      doc.body.classList.toggle('menu-open', menu.classList.contains('is-open'));
    };

    window.addEventListener('resize', () => {
      syncMenu();
    }, { passive: true });

    if (typeof mobileMenu.addEventListener === 'function') {
      mobileMenu.addEventListener('change', syncMenu);
    } else if (typeof mobileMenu.addListener === 'function') {
      mobileMenu.addListener(syncMenu);
    }

    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    syncMenu();
  };

  const initReveal = () => {
    const sections = $$('.reveal');
    if (!sections.length) return;

    if (!('IntersectionObserver' in window)) {
      sections.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        current.unobserve(entry.target);
      });
    }, { threshold: 0.14 });

    sections.forEach((item) => observer.observe(item));
  };

  const initHeroFeather = () => {
    const featherMark = $('.feather-mark');
    if (!featherMark) return;

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      featherMark.style.opacity = '0.36';
      return;
    }

    let rafId = 0;
    let latestY = window.scrollY || 0;

    const update = (time = 0) => {
      const shift = Math.min(latestY * 0.14, 96);
      const bob = Math.sin(time * 0.002) * 6;
      const tilt = Math.sin(time * 0.0016) * 5;

      featherMark.style.transform = `translate3d(${-shift * 0.32}px, ${shift + bob}px, 0) rotate(${18 + shift * 0.06 + tilt}deg)`;
      featherMark.style.opacity = String(Math.max(0.16, 0.44 - shift * 0.0024));
      rafId = 0;
    };

    const requestUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', () => {
      latestY = window.scrollY || 0;
      requestUpdate();
    }, { passive: true });

    window.addEventListener('resize', requestUpdate, { passive: true });
    window.requestAnimationFrame(update);
  };

  const initFeatherFollower = () => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const existing = $('.feather-follower');
    const follower = existing || doc.createElement('div');

    if (!existing) {
      follower.className = 'feather-follower';
      follower.setAttribute('aria-hidden', 'true');
      doc.body.appendChild(follower);
    }

    if (reduceMotion) return;

    let targetY = window.scrollY || 0;
    let currentY = targetY;
    let rafId = 0;

    const tick = (time = 0) => {
      currentY += (targetY - currentY) * 0.08;

      const maxScroll = Math.max(doc.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(currentY / maxScroll, 0), 1);

      const swayX = Math.sin(time * 0.0013) * 14 - progress * 18;
      const swayY = Math.cos(time * 0.0011) * 10 + progress * 130;
      const rotate = -14 + Math.sin(time * 0.0012) * 7 + progress * 12;
      const scale = 0.88 + Math.sin(time * 0.0015) * 0.04;
      const opacity = Math.max(0.16, 0.48 - progress * 0.24);

      follower.style.transform = `translate3d(${swayX}px, ${swayY}px, 0) rotate(${rotate}deg) scale(${scale})`;
      follower.style.opacity = String(opacity);

      rafId = window.requestAnimationFrame(tick);
    };

    const onScroll = () => {
      targetY = window.scrollY || 0;
      if (!rafId) rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    rafId = window.requestAnimationFrame(tick);
  };


  const initSideFeathers = () => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ensureFeather = (cls) => {
      let node = doc.querySelector(`.${cls}`);
      if (!node) {
        node = doc.createElement('div');
        node.className = `feather-side ${cls}`;
        node.setAttribute('aria-hidden', 'true');
        doc.body.appendChild(node);
      }
      return node;
    };

    const left = ensureFeather('feather-side--left');
    const right = ensureFeather('feather-side--right');

    if (reduceMotion) {
      left.style.opacity = '0.2';
      right.style.opacity = '0.2';
      return;
    }

    let targetY = window.scrollY || 0;
    let currentY = targetY;
    let rafId = 0;

    const animate = (time = 0) => {
      currentY += (targetY - currentY) * 0.065;
      const maxScroll = Math.max(doc.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(currentY / maxScroll, 0), 1);
      const wind = Math.sin(time * 0.00055 + progress * 3.6);
      const phase = 1.9;

      const leftX = Math.sin(time * 0.0013) * 11 - progress * 7 + wind * 4;
      const leftY = Math.cos(time * 0.00106) * 14 + progress * 78;
      const leftR = -22 + Math.sin(time * 0.00155) * 7 + progress * 10 + wind * 4;
      const leftScale = 0.92 + Math.sin(time * 0.00195) * 0.03 + progress * 0.03;

      const rightX = Math.cos(time * 0.00118 + phase) * 11 + progress * 6 - wind * 4;
      const rightY = Math.sin(time * 0.00108 + phase) * 13 + progress * 66;
      const rightR = 18 + Math.cos(time * 0.0015 + phase) * 7 - progress * 9 - wind * 4;
      const rightScale = 0.9 + Math.cos(time * 0.00185 + phase) * 0.03 + progress * 0.024;

      left.style.transform = `translate3d(${leftX.toFixed(2)}px, ${leftY.toFixed(2)}px, 0) rotate(${leftR.toFixed(2)}deg) scale(${leftScale.toFixed(3)})`;
      right.style.transform = `translate3d(${rightX.toFixed(2)}px, ${rightY.toFixed(2)}px, 0) rotate(${rightR.toFixed(2)}deg) scale(${rightScale.toFixed(3)})`;
      left.style.opacity = String(Math.max(0.17, 0.42 - progress * 0.16));
      right.style.opacity = String(Math.max(0.17, 0.4 - progress * 0.15));

      rafId = window.requestAnimationFrame(animate);
    };

    const onScroll = () => {
      targetY = window.scrollY || 0;
      if (!rafId) rafId = window.requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    rafId = window.requestAnimationFrame(animate);
  };
  const initBackToTop = () => {
    const backToTop = $('#back-to-top');
    if (!backToTop) return;

    const toggle = () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 320);
    };

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  };

  const initPickupMap = () => {
    const pickupList = $('#pickup-list');
    const pickupMap = $('#pickup-map');
    if (!pickupList || !pickupMap) return;

    const buttons = $$('.pickup-item', pickupList);
    if (!buttons.length) return;

    const pickupCoords = {
      'Иркутск, улица Баумана, 203': { lat: '52.3483916', lon: '104.1604241', zoom: 16 },
      'Иркутск, бульвар Рябикова, 36/3': { lat: '52.2615677', lon: '104.2111435', zoom: 16 },
      'Иркутский район, Маркова, микрорайон Березовый, 125/4': { lat: '52.2193264', lon: '104.2418201', zoom: 16 },
      'Иркутск, улица Терешковой, 26': { lat: '52.2792237', lon: '104.2517835', zoom: 16 },
      'Ангарск, 10-й микрорайон, 46': { lat: '52.5090525', lon: '103.8624851', zoom: 16 },
      'Ангарск, 2-я Московская улица, 20': { lat: '52.521707', lon: '103.9073211', zoom: 16 }
    };

    const buildPointMapSrc = (point) => {
      const ll = `${point.lon},${point.lat}`;
      const pt = `${ll},pm2rdm`;
      return `https://yandex.ru/map-widget/v1/?l=map&ll=${encodeURIComponent(ll)}&z=${point.zoom || 16}&pt=${encodeURIComponent(pt)}`;
    };

    const buildSearchMapSrc = (address) => `https://yandex.ru/map-widget/v1/?mode=search&text=${encodeURIComponent(address)}`;

    const setActive = (activeButton) => {
      buttons.forEach((button) => {
        const isActive = button === activeButton;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });

      const address = activeButton.dataset.address || '';
      const point = pickupCoords[address];
      const nextSrc = point ? buildPointMapSrc(point) : buildSearchMapSrc(address);
      if (pickupMap.src !== nextSrc) pickupMap.src = nextSrc;
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => setActive(button));
    });

    setActive(buttons.find((button) => button.classList.contains('is-active')) || buttons[0]);
  };

  const initReviews = () => {
    const track = $('#reviews-track');
    const slider = $('#reviews-slider');
    const dotsWrap = $('#reviews-dots');
    if (!track || !slider) return;

    const viewport = track.parentElement;
    const slides = Array.from(track.children);
    if (!slides.length) return;

    const dots = [];
    let current = 0;
    let autoplay = 0;
    const autoplayDelay = 10000;

    const updateHeight = () => {
      if (!viewport || !slides[current]) return;
      viewport.style.height = `${slides[current].offsetHeight}px`;
    };

    const render = () => {
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((dot, index) => dot.classList.toggle('is-active', index === current));
      updateHeight();
    };

    const goTo = (index) => {
      const max = slides.length - 1;
      if (index < 0) current = max;
      else if (index > max) current = 0;
      else current = index;
      render();
    };

    const prev = () => goTo(current - 1);
    const next = () => goTo(current + 1);

    const stopAutoplay = () => {
      if (!autoplay) return;
      window.clearInterval(autoplay);
      autoplay = 0;
    };

    const startAutoplay = () => {
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion || slides.length <= 1) return;
      stopAutoplay();
      autoplay = window.setInterval(next, autoplayDelay);
    };

    if (dotsWrap) {
      slides.forEach((_, index) => {
        const dot = doc.createElement('button');
        dot.type = 'button';
        dot.className = 'reviews-dot';
        dot.setAttribute('aria-label', `Перейти к отзыву ${index + 1}`);
        dot.addEventListener('click', () => {
          goTo(index);
          startAutoplay();
        });
        dots.push(dot);
        dotsWrap.appendChild(dot);
      });
    }

    let touchStartX = 0;
    let touchStartY = 0;

    slider.addEventListener('touchstart', (event) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    slider.addEventListener('touchend', (event) => {
      const touch = event.changedTouches[0];
      if (!touch) return;

      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.15) return;

      if (dx < 0) next();
      else prev();
      startAutoplay();
    }, { passive: true });

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('focusin', stopAutoplay);
    slider.addEventListener('focusout', startAutoplay);
    doc.addEventListener('visibilitychange', () => {
      if (doc.hidden) stopAutoplay();
      else startAutoplay();
    });

    window.addEventListener('resize', updateHeight, { passive: true });
    render();
    startAutoplay();
  };

  const initCounters = () => {
    const counters = $$('[data-counter]');
    if (!counters.length) return;

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const paintFinal = (node) => {
      const target = Number.parseInt(node.dataset.counter || '0', 10);
      const suffix = node.dataset.suffix || '';
      if (Number.isFinite(target)) node.textContent = `${target}${suffix}`;
    };

    const animateCounter = (node) => {
      const target = Number.parseInt(node.dataset.counter || '0', 10);
      if (!Number.isFinite(target) || target < 0) return;

      const suffix = node.dataset.suffix || '';
      const duration = Math.min(1800, Math.max(900, target * 90));
      let startTime = 0;

      const tick = (time) => {
        if (!startTime) startTime = time;
        const progress = Math.min(1, (time - startTime) / duration);
        const value = Math.floor(target * easeOut(progress));
        node.textContent = `${value}${suffix}`;

        if (progress < 1) {
          window.requestAnimationFrame(tick);
        } else {
          node.textContent = `${target}${suffix}`;
        }
      };

      window.requestAnimationFrame(tick);
    };

    if (reduceMotion || !('IntersectionObserver' in window)) {
      counters.forEach(paintFinal);
      return;
    }

    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        current.unobserve(entry.target);
      });
    }, { threshold: 0.45 });

    counters.forEach((node) => {
      node.textContent = '0';
      observer.observe(node);
    });
  };

  const initRequestForm = () => {
    const form = $('#request-form');
    if (!form) return;

    const nameInput = form.elements.namedItem('name');
    const phoneInput = form.elements.namedItem('phone');
    const dateInput = form.elements.namedItem('date');
    const commentInput = form.elements.namedItem('comment');
    const callTimeFromInput = form.elements.namedItem('callTimeFrom');
    const callTimeToInput = form.elements.namedItem('callTimeTo');
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const sanitizeName = (value) => value
      .replace(/[^A-Za-zА-Яа-яЁё\s-]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/-{2,}/g, '-')
      .trimStart()
      .slice(0, 40);

    const formatPhone = (value) => {
      let digits = value.replace(/\D/g, '');
      if (digits.startsWith('7') || digits.startsWith('8')) digits = digits.slice(1);
      digits = digits.slice(0, 10);

      let out = '+7';
      if (digits.length > 0) out += ` (${digits.slice(0, 3)}`;
      if (digits.length >= 4) out += `) ${digits.slice(3, 6)}`;
      if (digits.length >= 7) out += `-${digits.slice(6, 8)}`;
      if (digits.length >= 9) out += `-${digits.slice(8, 10)}`;
      return out;
    };

    const isPhoneComplete = (value) => /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value);

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
      ) return null;

      return date;
    };

    const isDateTodayOrFuture = (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date.getTime() >= today.getTime();
    };

    const formatDate = (value) => {
      const digits = value.replace(/\D/g, '').slice(0, 8);
      const dayRaw = digits.slice(0, 2);
      const monthRaw = digits.slice(2, 4);
      const yearRaw = digits.slice(4, 8);

      let day = dayRaw;
      let month = monthRaw;
      let year = yearRaw;

      if (day.length === 2) day = String(clamp(Number(day), 1, 31)).padStart(2, '0');
      if (month.length === 2) month = String(clamp(Number(month), 1, 12)).padStart(2, '0');
      if (year.length === 4) {
        const currentYear = new Date().getFullYear();
        year = String(clamp(Number(year), currentYear, currentYear + 5));
      }

      const parts = [];
      if (day) parts.push(day);
      if (month) parts.push(month);
      if (year) parts.push(year);
      return parts.join('.');
    };

    const parseTimeToMinutes = (value) => {
      const match = /^(\d{2}):(\d{2})$/.exec(String(value || ''));
      if (!match) return null;
      return Number(match[1]) * 60 + Number(match[2]);
    };

    const fillTimeSelect = (select) => {
      if (!select || select.options.length > 1) return;
      for (let hour = 0; hour < 24; hour += 1) {
        for (let minute = 0; minute < 60; minute += 15) {
          const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          const option = doc.createElement('option');
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        }
      }
    };

    const validateCallRange = () => {
      if (!callTimeFromInput || !callTimeToInput) return;
      callTimeFromInput.setCustomValidity('');
      callTimeToInput.setCustomValidity('');
      if (!callTimeFromInput.value || !callTimeToInput.value) return;

      const from = parseTimeToMinutes(callTimeFromInput.value);
      const to = parseTimeToMinutes(callTimeToInput.value);
      if (from === null || to === null) return;

      if (to <= from) callTimeToInput.setCustomValidity('Время "до" должно быть позже времени "с".');
    };

    if (nameInput) {
      nameInput.addEventListener('input', () => {
        nameInput.value = sanitizeName(nameInput.value);
        nameInput.setCustomValidity('');
      });
    }

    if (phoneInput) {
      phoneInput.addEventListener('focus', () => {
        if (!phoneInput.value.trim()) phoneInput.value = '+7';
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

    if (commentInput) {
      commentInput.addEventListener('input', () => {
        commentInput.value = commentInput.value.slice(0, 300);
      });
    }

    if (callTimeFromInput && callTimeToInput) {
      fillTimeSelect(callTimeFromInput);
      fillTimeSelect(callTimeToInput);

      callTimeFromInput.addEventListener('change', validateCallRange);
      callTimeToInput.addEventListener('change', validateCallRange);
    }

    form.addEventListener('submit', (event) => {
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

      validateCallRange();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const phone = String(data.get('phone') || '').trim();
      const service = String(data.get('service') || '').trim();
      const city = String(data.get('city') || '').trim();
      const date = String(data.get('date') || '').trim();
      const callFrom = String(data.get('callTimeFrom') || '').trim();
      const callTo = String(data.get('callTimeTo') || '').trim();
      const comment = String(data.get('comment') || '').trim() || 'не указан';

      const message = [
        'Здравствуйте! Новая заявка с сайта.',
        `Имя: ${name}`,
        `Телефон: ${phone}`,
        `Услуга: ${service}`,
        `Город: ${city}`,
        `Дата: ${date}`,
        `Удобно звонить: с ${callFrom} до ${callTo}`,
        `Комментарий: ${comment}`
      ].join('\n');

      const url = `https://wa.me/79086668700?text=${encodeURIComponent(message)}`;
      window.location.href = url;
    });
  };

  setCurrentYear();
  initMenu();
  initReveal();
  initCounters();
  initHeroFeather();
  initFeatherFollower();
  initSideFeathers();
  initBackToTop();
  initReviews();
  initPickupMap();
  initRequestForm();
})();




