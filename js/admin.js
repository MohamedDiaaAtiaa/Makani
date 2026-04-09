'use strict';

const adminApp = {
    init() {
        this.bindNav();
        // Setup initial default data if local storage is empty
        if (!localStorage.getItem('makani_programs')) {
            localStorage.setItem('makani_programs', JSON.stringify([
                { id: 1, name: 'كيك بوكسينغ', nameEn: 'Kick Boxing', desc: 'ضربات متفجرة ولياقة بدنية.', descEn: 'Explosive striking and conditioning.', color: '#C1121F', emoji: '🥊', price_session: '100 EGP', price_month: '800 EGP', schedule: { time: '8:00 PM', days: ['sun', 'tue', 'thu'], ageGroups: ['Adults'] } },
                { id: 2, name: 'أيكيدو', nameEn: 'Aikido', desc: 'التحكم، إعادة التوجيه، الانضباط.', descEn: 'Control, redirection, discipline.', color: '#1a237e', emoji: '🥋', price_session: '120 EGP', price_month: '1000 EGP', schedule: { time: '6:00 PM', days: ['mon', 'wed'], ageGroups: ['Kids 5-10', 'Adults'] } },
                { id: 3, name: 'ووشو ساندا', nameEn: 'Wushu Sanda', desc: 'السرعة، الرميات، استراتيجية القتال.', descEn: 'Speed, throws, combat strategy.', color: '#b71c1c', emoji: '⚡', price_session: null, price_month: null },
                { id: 4, name: 'ملاكمة', nameEn: 'Boxing', desc: 'الدقة، حركة القدمين، التحمل.', descEn: 'Precision, footwork, endurance.', color: '#e65100', emoji: '🎯', price_session: null, price_month: null },
                { id: 5, name: 'جيو جيتسو', nameEn: 'Jiu Jitsu', desc: 'المصارعة، الاستسلام، السيطرة الأرضية.', descEn: 'Grappling, submissions, ground dominance.', color: '#1b5e20', emoji: '🤼', price_session: null, price_month: null }
            ]));
        }
        if (!localStorage.getItem('makani_coaches')) {
            localStorage.setItem('makani_coaches', JSON.stringify([
                { id: 1, name: 'أحمد محمود', specialty: 'كبير مدربي الملاكمة', specialtyEn: 'Head Boxing Coach', bio: '', emoji: '🥊' },
                { id: 2, name: 'عمر حسن', specialty: 'حزام أسود جيو جيتسو', specialtyEn: 'BJJ Black Belt', bio: '', emoji: '🥋' },
                { id: 3, name: 'طارق زيدان', specialty: 'مواي تاي / كيك بوكسينغ', specialtyEn: 'Muay Thai / Kickboxing', bio: '', emoji: '⚡' }
            ]));
        }

        // Render dashboard as default
        adminDashboard.render();
    },

    bindNav() {
        const items = document.querySelectorAll('.nav-item');
        const panels = document.querySelectorAll('.panel');
        const title = document.getElementById('topbar-title');

        items.forEach(item => {
            item.addEventListener('click', () => {
                items.forEach(i => i.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                item.classList.add('active');
                const target = item.dataset.target;
                document.getElementById('panel-' + target).classList.add('active');
                
                title.innerHTML = item.innerHTML; // get the icon & text

                // Auto render based on tab selected
                if (target === 'dashboard') adminDashboard.render();
                if (target === 'programs') adminPrograms.render();
                if (target === 'coaches') adminCoaches.render();
                if (target === 'members') adminMembers.render();
                if (target === 'attendance') adminAttendance.render();
            });
        });
    }
};

const adminDashboard = {
    render() {
        const members = JSON.parse(localStorage.getItem('makani_submissions') || '[]');
        const programs = JSON.parse(localStorage.getItem('makani_programs') || '[]');
        const coaches = JSON.parse(localStorage.getItem('makani_coaches') || '[]');

        document.getElementById('stat-members').textContent = members.length;
        document.getElementById('stat-programs').textContent = programs.length;
        document.getElementById('stat-coaches').textContent = coaches.length;

        const tbody = document.querySelector('#recent-members-table tbody');
        const recent = [...members].reverse().slice(0, 5);
        tbody.innerHTML = recent.map(m => `
            <tr>
                <td>${m.date || '-'}</td>
                <td>${m.name}</td>
                <td>${m.program}</td>
                <td><span class="badge ${m.status}">${m.status}</span></td>
            </tr>
        `).join('') || '<tr><td colspan="4" style="text-align:center">No recent sign-ups</td></tr>';
    }
};

const adminPrograms = {
    programs: [],
    modal: document.getElementById('program-modal'),

    render() {
        this.programs = JSON.parse(localStorage.getItem('makani_programs') || '[]');
        const tbody = document.querySelector('#programs-table tbody');
        
        tbody.innerHTML = this.programs.map(p => `
            <tr>
                <td style="font-size:32px;">${p.emoji || '🥊'}</td>
                <td><strong>${p.nameEn || p.name}</strong><br><small style="color:var(--text-muted)">${p.name}</small></td>
                <td>${p.price_session ? p.price_session : '-'} / ${p.price_month ? p.price_month : '-'}</td>
                <td>
                    ${p.schedule?.time ? p.schedule.time : '-'}<br>
                    <small style="color:var(--secondary)">${(p.schedule?.days || []).join(', ')}</small>
                </td>
                <td>
                    <button class="btn btn-outline" onclick="adminPrograms.edit(${p.id})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-danger" onclick="adminPrograms.delete(${p.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center">No programs found</td></tr>';
    },

    openModal() {
        document.getElementById('program-form').reset();
        document.getElementById('prog-id').value = '';
        document.getElementById('program-modal-title').textContent = 'Add Program';
        this.modal.classList.add('active');
    },

    closeModal() {
        this.modal.classList.remove('active');
    },

    edit(id) {
        const p = this.programs.find(x => x.id === id);
        if (!p) return;
        
        document.getElementById('prog-id').value = p.id;
        document.getElementById('prog-name').value = p.name;
        document.getElementById('prog-nameEn').value = p.nameEn || '';
        document.getElementById('prog-desc').value = p.desc || '';
        document.getElementById('prog-descEn').value = p.descEn || '';
        document.getElementById('prog-price-session').value = p.price_session || '';
        document.getElementById('prog-price-month').value = p.price_month || '';
        document.getElementById('prog-color').value = p.color || '#C1121F';
        document.getElementById('prog-emoji').value = p.emoji || '🥊';
        
        document.getElementById('prog-time').value = p.schedule?.time || '';
        document.getElementById('prog-ages').value = (p.schedule?.ageGroups || []).join(', ');
        
        const days = p.schedule?.days || [];
        document.querySelectorAll('.day-checkbox').forEach(cb => {
            cb.checked = days.includes(cb.value);
        });

        document.getElementById('program-modal-title').textContent = 'Edit Program';
        this.modal.classList.add('active');
    },

    save(e) {
        e.preventDefault();
        const id = document.getElementById('prog-id').value;
        const days = Array.from(document.querySelectorAll('.day-checkbox:checked')).map(cb => cb.value);
        const ages = document.getElementById('prog-ages').value.split(',').map(s => s.trim()).filter(Boolean);

        const data = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('prog-name').value.trim(),
            nameEn: document.getElementById('prog-nameEn').value.trim(),
            desc: document.getElementById('prog-desc').value.trim(),
            descEn: document.getElementById('prog-descEn').value.trim(),
            price_session: document.getElementById('prog-price-session').value.trim(),
            price_month: document.getElementById('prog-price-month').value.trim(),
            color: document.getElementById('prog-color').value,
            emoji: document.getElementById('prog-emoji').value.trim(),
            schedule: {
                time: document.getElementById('prog-time').value.trim(),
                days: days,
                ageGroups: ages
            }
        };

        if (id) {
            const idx = this.programs.findIndex(x => String(x.id) === String(id));
            if (idx !== -1) {
                this.programs[idx] = { ...this.programs[idx], ...data };
            }
        } else {
            this.programs.push(data);
        }

        localStorage.setItem('makani_programs', JSON.stringify(this.programs));
        this.closeModal();
        this.render();
    },

    delete(id) {
        if(confirm('Are you sure you want to delete this program?')) {
            this.programs = this.programs.filter(x => x.id !== id);
            localStorage.setItem('makani_programs', JSON.stringify(this.programs));
            this.render();
        }
    }
};

const adminCoaches = {
    coaches: [],
    modal: document.getElementById('coach-modal'),

    render() {
        this.coaches = JSON.parse(localStorage.getItem('makani_coaches') || '[]');
        const tbody = document.querySelector('#coaches-table tbody');
        
        tbody.innerHTML = this.coaches.map(c => `
            <tr>
                <td><strong style="font-size:20px;">${c.emoji || '🥊'} ${c.name}</strong></td>
                <td>${c.specialtyEn || c.specialty}</td>
                <td>${c.bio || '-'}</td>
                <td>
                    <button class="btn btn-outline" onclick="adminCoaches.edit(${c.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger" onclick="adminCoaches.delete(${c.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="4" style="text-align:center">No coaches found</td></tr>';
    },

    openModal() {
        document.getElementById('coach-form').reset();
        document.getElementById('coach-id').value = '';
        document.getElementById('coach-modal-title').textContent = 'Add Coach';
        this.modal.classList.add('active');
    },

    closeModal() {
        this.modal.classList.remove('active');
    },

    edit(id) {
        const c = this.coaches.find(x => x.id === id);
        if (!c) return;
        
        document.getElementById('coach-id').value = c.id;
        document.getElementById('coach-name').value = c.name;
        document.getElementById('coach-specialty').value = c.specialty;
        document.getElementById('coach-specialtyEn').value = c.specialtyEn || '';
        document.getElementById('coach-bio').value = c.bio || '';
        document.getElementById('coach-emoji').value = c.emoji || '🥊';
        
        document.getElementById('coach-modal-title').textContent = 'Edit Coach';
        this.modal.classList.add('active');
    },

    save(e) {
        e.preventDefault();
        const id = document.getElementById('coach-id').value;

        const data = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('coach-name').value.trim(),
            specialty: document.getElementById('coach-specialty').value.trim(),
            specialtyEn: document.getElementById('coach-specialtyEn').value.trim(),
            bio: document.getElementById('coach-bio').value.trim(),
            emoji: document.getElementById('coach-emoji').value.trim()
        };

        if (id) {
            const idx = this.coaches.findIndex(x => String(x.id) === String(id));
            if (idx !== -1) {
                // Preserve existing fields like photo if they aren't in the form
                this.coaches[idx] = { ...this.coaches[idx], ...data };
            }
        } else {
            this.coaches.push(data);
        }

        localStorage.setItem('makani_coaches', JSON.stringify(this.coaches));
        this.closeModal();
        this.render();
    },

    delete(id) {
        if(confirm('Delete this coach?')) {
            this.coaches = this.coaches.filter(x => String(x.id) !== String(id));
            localStorage.setItem('makani_coaches', JSON.stringify(this.coaches));
            this.render();
        }
    }
};

const adminMembers = {
    members: [],

    render() {
        this.members = JSON.parse(localStorage.getItem('makani_submissions') || '[]');
        const tbody = document.querySelector('#members-table tbody');
        
        tbody.innerHTML = [...this.members].reverse().map(m => `
            <tr>
                <td>${m.date || '-'}</td>
                <td><strong>${m.name}</strong></td>
                <td>${m.phone}</td>
                <td>${m.age || '-'}</td>
                <td>${m.program}</td>
                <td>${m.message || '-'}</td>
                <td>
                    <select class="form-control" style="width: auto; padding: 5px;" onchange="adminMembers.updateStatus('${m.id}', this.value)">
                        <option value="pending" ${m.status === 'pending'?'selected':''}>Pending</option>
                        <option value="active" ${m.status === 'active'?'selected':''}>Active</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-danger" onclick="adminMembers.delete('${m.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="8" style="text-align:center">No members found</td></tr>';
    },

    updateStatus(id, newStatus) {
        const idx = this.members.findIndex(x => String(x.id) === String(id));
        if (idx !== -1) {
            this.members[idx].status = newStatus;
            localStorage.setItem('makani_submissions', JSON.stringify(this.members));
        }
    },

    delete(id) {
        if(confirm('Delete member?')) {
            this.members = this.members.filter(x => String(x.id) !== String(id));
            localStorage.setItem('makani_submissions', JSON.stringify(this.members));
            this.render();
        }
    }
};

const adminAttendance = {
    render() {
        const programs = JSON.parse(localStorage.getItem('makani_programs') || '[]');
        const select = document.getElementById('att-program-select');
        
        select.innerHTML = '<option value="">-- Select Program --</option>' + programs.map(p => `
            <option value="${p.id}">${p.nameEn || p.name}</option>
        `).join('');

        if (!document.getElementById('att-date').value) {
            document.getElementById('att-date').valueAsDate = new Date();
        }
        
        this.onProgramChange();
    },

    onProgramChange() {
        const progId = document.getElementById('att-program-select').value;
        const selectRecent = document.getElementById('att-recent-sessions');
        
        if (selectRecent) {
            selectRecent.innerHTML = '<option value="">-- Past month sessions --</option>';
            if (progId) {
                const attendanceLog = JSON.parse(localStorage.getItem('makani_attendance') || '[]');
                const today = new Date();
                const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

                const progSessions = attendanceLog
                    .filter(r => String(r.progId) === String(progId))
                    .filter(r => new Date(r.date) >= thirtyDaysAgo)
                    .map(r => r.date)
                    .sort((a,b) => new Date(b) - new Date(a));

                progSessions.forEach(date => {
                    selectRecent.innerHTML += `<option value="${date}">${date}</option>`;
                });
            }
        }
        
        this.loadMembers();
    },

    loadMembers() {
        const progId = document.getElementById('att-program-select').value;
        const date = document.getElementById('att-date').value;
        const tbody = document.querySelector('#attendance-table tbody');

        if (!progId || !date) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">Please select a program and date</td></tr>';
            return;
        }

        const members = JSON.parse(localStorage.getItem('makani_submissions') || '[]');
        const programs = JSON.parse(localStorage.getItem('makani_programs') || '[]');
        const prog = programs.find(p => String(p.id) === progId);
        
        // Match either the direct programmed ID, or the name fallback
        const progMembers = members.filter(m => String(m.program) === String(progId) || m.program === prog?.name || m.program === prog?.nameEn);
        
        if (progMembers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">No members found in this program</td></tr>';
            return;
        }

        const attendanceLog = JSON.parse(localStorage.getItem('makani_attendance') || '[]');
        const recordId = `${progId}_${date}`;
        const currentRecord = attendanceLog.find(r => r.id === recordId) || { records: {} };

        tbody.innerHTML = progMembers.map(m => {
            const status = currentRecord.records[m.id] || 'pending';
            return `
            <tr>
                <td><strong style="font-size: 20px;">${m.name}</strong></td>
                <td><span class="badge ${status}">${status.toUpperCase()}</span></td>
                <td>
                    <button class="btn btn-success" onclick="adminAttendance.mark('${m.id}', 'present')"><i class="fas fa-check"></i> Present</button>
                    <button class="btn btn-danger" onclick="adminAttendance.mark('${m.id}', 'absent')"><i class="fas fa-times"></i> Absent</button>
                    <button class="btn btn-outline" onclick="adminAttendance.mark('${m.id}', 'pending')"><i class="fas fa-undo"></i> Reset</button>
                </td>
            </tr>
        `}).join('');
    },

    mark(memberId, status) {
        const progId = document.getElementById('att-program-select').value;
        const date = document.getElementById('att-date').value;
        if (!progId || !date) return;

        let attendanceLog = JSON.parse(localStorage.getItem('makani_attendance') || '[]');
        const recordId = `${progId}_${date}`;
        
        let recordIdx = attendanceLog.findIndex(r => r.id === recordId);
        if (recordIdx === -1) {
            attendanceLog.push({ id: recordId, progId, date, records: {} });
            recordIdx = attendanceLog.length - 1;
        }
        
        attendanceLog[recordIdx].records[memberId] = status;
        localStorage.setItem('makani_attendance', JSON.stringify(attendanceLog));
        
        // Update recent sessions dropdown in case this was a new date
        const selectRecent = document.getElementById('att-recent-sessions');
        if (selectRecent && !Array.from(selectRecent.options).some(opt => opt.value === date)) {
            const opt = document.createElement('option');
            opt.value = date;
            opt.textContent = date;
            selectRecent.insertBefore(opt, selectRecent.options[1]);
        }
        
        // visually update status row 
        this.loadMembers();
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => adminApp.init());
