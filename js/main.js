// ============================================================
// MAKANI — Main JS (v2)
// No Lenis. No Particles.js. Pure GSAP + native scroll.
// ============================================================

'use strict';

// Default data shown on homepage when admin hasn't set up data yet
const DEFAULT_PROGRAMS = [
    { id: 1, name: 'كيك بوكسينغ', nameEn: 'Kick Boxing', desc: 'ضربات متفجرة ولياقة بدنية.', descEn: 'Explosive striking and conditioning.', color: '#C1121F', emoji: '🥊', price_session: null, price_month: null },
    { id: 2, name: 'أيكيدو', nameEn: 'Aikido', desc: 'التحكم، إعادة التوجيه، الانضباط.', descEn: 'Control, redirection, discipline.', color: '#1a237e', emoji: '🥋', price_session: null, price_month: null },
    { id: 3, name: 'ووشو ساندا', nameEn: 'Wushu Sanda', desc: 'السرعة، الرميات، استراتيجية القتال.', descEn: 'Speed, throws, combat strategy.', color: '#b71c1c', emoji: '⚡', price_session: null, price_month: null },
    { id: 4, name: 'ملاكمة', nameEn: 'Boxing', desc: 'الدقة، حركة القدمين، التحمل.', descEn: 'Precision, footwork, endurance.', color: '#e65100', emoji: '🎯', price_session: null, price_month: null },
    { id: 5, name: 'جيو جيتسو', nameEn: 'Jiu Jitsu', desc: 'المصارعة، الاستسلام، السيطرة الأرضية.', descEn: 'Grappling, submissions, ground dominance.', color: '#1b5e20', emoji: '🤼', price_session: null, price_month: null },
];

const DEFAULT_COACHES = [
    { id: 1, name: 'أحمد محمود', specialty: 'كبير مدربي الملاكمة', specialtyEn: 'Head Boxing Coach', bio: '', emoji: '🥊' },
    { id: 2, name: 'عمر حسن', specialty: 'حزام أسود جيو جيتسو', specialtyEn: 'BJJ Black Belt', bio: '', emoji: '🥋' },
    { id: 3, name: 'طارق زيدان', specialty: 'مواي تاي / كيك بوكسينغ', specialtyEn: 'Muay Thai / Kickboxing', bio: '', emoji: '⚡' },
];

// ---- Translations guard ----
if (typeof translations === 'undefined') {
    console.error('[Makani] translations.js not loaded!');
}

document.addEventListener('DOMContentLoaded', () => {

    let currentLang = 'ar';

    // ===========================================================
    // 1. LANGUAGE TOGGLE
    // ===========================================================
    const langBtn = document.getElementById('langToggle');
    const htmlTag = document.documentElement;

    function applyTranslations(lang) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = translations[lang]?.[key];
            if (text) el.textContent = text;
        });
    }

    function updateLanguage() {
        currentLang = currentLang === 'ar' ? 'en' : 'ar';
        htmlTag.setAttribute('lang', currentLang);
        htmlTag.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
        applyTranslations(currentLang);
        // Re-render dynamic content with new lang
        renderPrograms();
        renderCoaches();
        renderSchedule();
        renderFormPrograms();
        if (typeof ScrollTrigger !== 'undefined') {
            setTimeout(() => ScrollTrigger.refresh(), 300);
        }
    }

    langBtn?.addEventListener('click', updateLanguage);

    // ===========================================================
    // 2. LOADER
    // ===========================================================
    const loader = document.getElementById('loader');

    function hideLoader() {
        loader?.classList.add('hidden');
        // Hero animations — run after loader hides
        if (typeof gsap !== 'undefined') {
            gsap.from('.glitch-title', { y: 50, opacity: 0, duration: 1, ease: 'power4.out', clearProps: 'all' });
            gsap.from('.hero-subtitle', { y: 30, opacity: 0, duration: 0.9, delay: 0.2, ease: 'power4.out', clearProps: 'all' });
            // Hero buttons: animate BUT ensure opacity ends at 1
            gsap.fromTo(
                '.hero-buttons .btn',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, delay: 0.4, ease: 'power3.out', clearProps: 'all' }
            );
        }
    }

    // Hide loader after 650ms (fast)
    const loaderTimer = setTimeout(hideLoader, 650);

    // Fallback: hide loader immediately if already loaded
    if (document.readyState === 'complete') {
        clearTimeout(loaderTimer);
        hideLoader();
    }

    // ===========================================================
    // 3. NAVBAR — Scroll state + Mobile menu
    // ===========================================================
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    // Throttled scroll listener
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                navbar?.classList.toggle('scrolled', window.scrollY > 60);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinks?.classList.toggle('active');
    });

    // Close mobile menu on link click
    navLinks?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('open');
            navLinks.classList.remove('active');
        });
    });

    // ===========================================================
    // 4. GSAP SCROLL ANIMATIONS
    // ===========================================================
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Parallax: skew on scroll (subtle)
        gsap.to('.hero-video-fallback', {
            yPercent: 15,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            }
        });

        // Section titles
        gsap.utils.toArray('.section-title').forEach(el => {
            gsap.from(el, {
                y: 40, opacity: 0, duration: 0.9,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            });
        });

        // Stats counter
        document.querySelectorAll('.stat-num').forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            ScrollTrigger.create({
                trigger: stat,
                start: 'top 90%',
                once: true,
                onEnter: () => {
                    const obj = { val: 0 };
                    gsap.to(obj, {
                        val: target,
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: () => { stat.textContent = Math.round(obj.val); }
                    });
                }
            });
        });

        // Horizontal scroll — Experience section (desktop only)
        const mm = gsap.matchMedia();
        mm.add('(min-width: 769px)', () => {
            const expWrapper = document.querySelector('.exp-wrapper');
            const expScroll = document.getElementById('exp-scroll');
            if (!expWrapper || !expScroll) return;

            const scrollWidth = expScroll.scrollWidth - window.innerWidth;
            gsap.to(expScroll, {
                x: htmlTag.getAttribute('dir') === 'rtl' ? scrollWidth : -scrollWidth,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.experience',
                    start: 'top top',
                    end: () => `+=${scrollWidth}`,
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onRefresh: self => {
                        const dir = document.documentElement.getAttribute('dir');
                        const w = expScroll.scrollWidth - window.innerWidth;
                        gsap.set(expScroll, { x: 0 });
                        self.animation.vars.x = dir === 'rtl' ? w : -w;
                        self.animation.invalidate();
                    }
                }
            });
        });

        // Program cards stagger
        ScrollTrigger.create({
            trigger: '#programs-grid',
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.from('.program-card', {
                    y: 40, opacity: 0, duration: 0.6,
                    stagger: 0.1, ease: 'power3.out'
                });
            }
        });
    }

    // ===========================================================
    // 5. INTERSECTION OBSERVER — Reveal animations
    // ===========================================================
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up').forEach(el => {
        revealObserver.observe(el);
    });

    // ===========================================================
    // 6. DYNAMIC CONTENT — Programs
    // ===========================================================
    function getPrograms() {
        try {
            const raw = localStorage.getItem('makani_programs');
            if (!raw) return DEFAULT_PROGRAMS;
            const stored = JSON.parse(raw);
            return (Array.isArray(stored) && stored.length > 0) ? stored : DEFAULT_PROGRAMS;
        } catch (e) { 
            console.error('[Makani] Error loading programs:', e);
            return DEFAULT_PROGRAMS; 
        }
    }

    function renderPrograms() {
        const grid = document.getElementById('programs-grid');
        if (!grid) return;
        const programs = getPrograms();
        const lang = currentLang;

        grid.innerHTML = programs.map(p => {
            const name = (lang === 'en' && p.nameEn) ? p.nameEn : p.name;
            const desc = (lang === 'en' && p.descEn) ? p.descEn : p.desc;
            const bgColor = p.color || '#141414';
            const emoji = p.emoji || '🥊';
            let priceHtml = '';
            if (p.price_session) priceHtml += `<span class="card-price-tag">${lang === 'en' ? 'Session: ' : 'حصة: '}${p.price_session}</span> `;
            if (p.price_month) priceHtml += `<span class="card-price-tag" style="background:var(--accent)">${lang === 'en' ? 'Month: ' : 'شهر: '}${p.price_month}</span>`;

            return `
            <div class="program-card">
                <div class="program-card-bg" style="background: radial-gradient(ellipse at center, ${bgColor}44 0%, #0a0a0a 75%);">
                    <span style="position:relative;z-index:1;text-shadow:0 0 30px ${bgColor}">${emoji}</span>
                </div>
                <div class="card-overlay"></div>
                <div class="card-content">
                    <h3>${name}</h3>
                    <p>${desc}</p>
                    ${priceHtml}
                </div>
                <div class="card-slash"></div>
            </div>`;
        }).join('');
    }

    renderPrograms();

    // ===========================================================
    // 7. DYNAMIC CONTENT — Coaches
    // ===========================================================
    function getCoaches() {
        try {
            const raw = localStorage.getItem('makani_coaches');
            if (!raw) return DEFAULT_COACHES;
            const stored = JSON.parse(raw);
            return (Array.isArray(stored) && stored.length > 0) ? stored : DEFAULT_COACHES;
        } catch (e) { 
            console.error('[Makani] Error loading coaches:', e);
            return DEFAULT_COACHES; 
        }
    }

    function renderCoaches() {
        const grid = document.getElementById('coaches-grid');
        if (!grid) return;
        const coaches = getCoaches();
        const lang = currentLang;

        grid.innerHTML = coaches.map(c => {
            const spec = (lang === 'en' && c.specialtyEn) ? c.specialtyEn : c.specialty;
            const bio = c.bio ? `<p class="coach-bio">${c.bio}</p>` : '';
            const avatarContent = c.photo
                ? `<img src="${c.photo}" alt="${c.name}" loading="lazy">`
                : `<span>${c.emoji || '🥊'}</span>`;

            return `
            <div class="coach-card">
                <div class="coach-avatar">${avatarContent}</div>
                <div class="coach-info">
                    <h3>${c.name}</h3>
                    <p class="specialty">${spec}</p>
                    ${bio}
                </div>
            </div>`;
        }).join('');
    }

    renderCoaches();

    // ===========================================================
    // 8. DYNAMIC CONTENT — Schedule
    // ===========================================================
    const DAY_NAMES = {
        ar: { mon: 'الاثنين', tue: 'الثلاثاء', wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة', sat: 'السبت', sun: 'الأحد' },
        en: { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' },
    };

    function renderSchedule() {
        const grid = document.getElementById('schedule-grid');
        const empty = document.getElementById('schedule-empty');
        const filterBar = document.getElementById('schedule-filter');
        if (!grid) return;

        const programs = getPrograms();
        const programsWithSchedule = programs.filter(p => p.schedule && (p.schedule.time || (p.schedule.days && p.schedule.days.length)));

        if (!programsWithSchedule.length) {
            empty?.style.removeProperty('display');
            return;
        }
        empty && (empty.style.display = 'none');

        const lang = currentLang;
        let activeFilter = 'all';

        // Build filter buttons
        filterBar.innerHTML = `<button class="sched-filter-btn active" data-filter="all">${lang === 'en' ? 'All' : 'الكل'}</button>`;
        programsWithSchedule.forEach(p => {
            const name = (lang === 'en' && p.nameEn) ? p.nameEn : p.name;
            filterBar.innerHTML += `<button class="sched-filter-btn" data-filter="${p.id}">${name}</button>`;
        });

        filterBar.querySelectorAll('.sched-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filterBar.querySelectorAll('.sched-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilter = btn.dataset.filter;
                drawCards();
            });
        });

        function drawCards() {
            const filtered = activeFilter === 'all'
                ? programsWithSchedule
                : programsWithSchedule.filter(p => String(p.id) === String(activeFilter));

            grid.innerHTML = filtered.map(p => {
                const name = (lang === 'en' && p.nameEn) ? p.nameEn : p.name;
                const s = p.schedule || {};
                const days = (s.days || []).map(d => `<span class="sched-day">${DAY_NAMES[lang][d] || d}</span>`).join('');
                const ages = (s.ageGroups || []).map(a => `<span class="sched-age">${a}</span>`).join('');
                const time = s.time || '';

                return `
                <div class="schedule-card">
                    <div class="sched-program-name">${name}</div>
                    ${time ? `<div class="sched-time">${time}</div>` : ''}
                    <div class="sched-days">${days || `<span style="color:var(--text-muted);font-size:0.85rem">${lang === 'en' ? 'Days TBD' : 'الأيام غير محددة'}</span>`}</div>
                    ${ages ? `<div class="sched-ages">${ages}</div>` : ''}
                </div>`;
            }).join('') || `<div class="schedule-empty"><p>${lang === 'en' ? 'No programs for this filter' : 'لا توجد برامج لهذا الفلتر'}</p></div>`;
        }

        drawCards();
    }

    renderSchedule();

    // ===========================================================
    // 9. FORM — Populate program select & Handle submit
    // ===========================================================
    function renderFormPrograms() {
        const select = document.getElementById('program');
        if (!select) return;
        const programs = getPrograms();
        const lang = currentLang;
        const label = translations[lang]?.['form-select-program'] || 'اختر البرنامج';

        select.innerHTML = `<option value="" disabled selected>${label}</option>`;
        programs.forEach(p => {
            const name = (lang === 'en' && p.nameEn) ? p.nameEn : p.name;
            const opt = document.createElement('option');
            opt.value = p.id || p.name;
            opt.textContent = name;
            select.appendChild(opt);
        });
    }

    renderFormPrograms();

    const signupForm = document.getElementById('signup-form');
    const formResponse = document.getElementById('form-response');
    const submitBtn = document.getElementById('submit-btn');

    signupForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(signupForm);

        const nameVal = formData.get('name')?.trim();
        const phoneVal = formData.get('phone')?.trim();
        const programVal = formData.get('program')?.trim();

        if (!nameVal || !phoneVal || !programVal) {
            formResponse.textContent = translations[currentLang]?.['form-error'] || 'يرجى ملء جميع الحقول المطلوبة';
            formResponse.className = 'form-response error';
            return;
        }

        const data = {
            id: Date.now(),
            name: nameVal,
            phone: phoneVal,
            program: programVal,
            age: formData.get('age') || '',
            message: formData.get('message') || '',
            date: new Date().toLocaleString(),
            status: 'pending'
        };

        try {
            const submissions = JSON.parse(localStorage.getItem('makani_submissions') || '[]');
            submissions.push(data);
            localStorage.setItem('makani_submissions', JSON.stringify(submissions));
        } catch (err) {
            console.error('LocalStorage error:', err);
        }

        // Success feedback
        submitBtn.disabled = true;
        formResponse.textContent = translations[currentLang]?.['form-success'] || 'تم إرسال طلبك بنجاح!';
        formResponse.className = 'form-response success';
        signupForm.reset();

        setTimeout(() => {
            formResponse.textContent = '';
            formResponse.className = 'form-response';
            submitBtn.disabled = false;
        }, 5000);
    });

    // ===========================================================
    // 10. LIVE SYNC WITH ADMIN PANEL
    // ===========================================================
    window.addEventListener('storage', (e) => {
        if (e.key === 'makani_programs' || e.key === 'makani_coaches') {
            console.log(`[Makani] Syncing ${e.key} update...`);
            renderPrograms();
            renderCoaches();
            renderSchedule();
            renderFormPrograms();
        }
    });

});
