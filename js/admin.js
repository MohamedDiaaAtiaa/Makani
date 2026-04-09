'use strict';

const adminApp = {
    init() {
        this.bindNav();
        // Setup initial default data if local storage is missing (null)
        const storedProgs = localStorage.getItem('makani_programs');
        if (storedProgs === null) {
            localStorage.setItem('makani_programs', JSON.stringify([
                { id: 1, ccode: 'KB-01', name: 'كيك بوكسينغ', nameEn: 'Kick Boxing', desc: 'ضربات متفجرة ولياقة بدنية.', descEn: 'Explosive striking and conditioning.', color: '#C1121F', emoji: '🥊', price_session: '100 EGP', price_month: '800 EGP', schedule: { time: '8:00 PM', days: ['sun', 'tue', 'thu'], ageGroups: [] } },
                { id: 2, ccode: 'AK-01', name: 'أيكيدو', nameEn: 'Aikido', desc: 'التحكم، إعادة التوجيه، الانضباط.', descEn: 'Control, redirection, discipline.', color: '#1a237e', emoji: '🥋', price_session: '120 EGP', price_month: '1000 EGP', schedule: { time: '6:00 PM', days: ['mon', 'wed'], ageGroups: [] } },
                { id: 3, ccode: 'WS-01', name: 'ووشو ساندا', nameEn: 'Wushu Sanda', desc: 'السرعة، الرميات، استراتيجية القتال.', descEn: 'Speed, throws, combat strategy.', color: '#b71c1c', emoji: '⚡', price_session: null, price_month: null },
                { id: 4, ccode: 'BX-01', name: 'ملاكمة', nameEn: 'Boxing', desc: 'الدقة، حركة القدمين، التحمل.', descEn: 'Precision, footwork, endurance.', color: '#e65100', emoji: '🎯', price_session: null, price_month: null },
                { id: 5, ccode: 'JJ-01', name: 'جيو جيتسو', nameEn: 'Jiu Jitsu', desc: 'المصارعة، الاستسلام، السيطرة الأرضية.', descEn: 'Grappling, submissions, ground dominance.', color: '#1b5e20', emoji: '🤼', price_session: null, price_month: null }
            ]));
        }

        const storedCoaches = localStorage.getItem('makani_coaches');
        if (storedCoaches === null) {
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
                if (target === 'applications') adminApplications.render();
                if (target === 'members') adminMembers.render();
                if (target === 'attendance') adminAttendance.render();
            });
        });
    }
};

const adminDashboard = {
    render() {
        const applications = JSON.parse(localStorage.getItem('makani_submissions') || '[]');
        const members = JSON.parse(localStorage.getItem('makani_members') || '[]');
        const programs = JSON.parse(localStorage.getItem('makani_programs') || '[]');
        const coaches = JSON.parse(localStorage.getItem('makani_coaches') || '[]');

        document.getElementById('stat-members').textContent = members.length;
        document.getElementById('stat-programs').textContent = programs.length;
        document.getElementById('stat-coaches').textContent = coaches.length;

        const tbody = document.querySelector('#recent-members-table tbody');
        const recent = [...applications].reverse().slice(0, 5);
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
                <td><code style="background:var(--surface-hover); padding:2px 6px; border-radius:4px; color:var(--secondary)">${p.ccode || '-'}</code></td>
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
        `).join('') || '<tr><td colspan="6" style="text-align:center">No programs found</td></tr>';
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
        document.getElementById('prog-ccode').value = p.ccode || '';
        
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
            ccode: document.getElementById('prog-ccode').value.trim(),
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

const adminApplications = {
    apps: [],

    render() {
        this.apps = JSON.parse(localStorage.getItem('makani_submissions') || '[]');
        const tbody = document.querySelector('#applications-table tbody');
        
        tbody.innerHTML = [...this.apps].reverse().map(m => `
            <tr>
                <td>${m.date || '-'}</td>
                <td><strong>${m.name}</strong></td>
                <td>${m.phone}</td>
                <td>${m.age || '-'}</td>
                <td>${m.program}</td>
                <td>${m.message || '-'}</td>
                <td>
                    <button class="btn btn-danger" onclick="adminApplications.delete('${m.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="7" style="text-align:center">No applications found</td></tr>';
    },

    delete(id) {
        if(confirm('Delete application?')) {
            this.apps = this.apps.filter(x => String(x.id) !== String(id));
            localStorage.setItem('makani_submissions', JSON.stringify(this.apps));
            this.render();
        }
    }
};

const adminMembers = {
    members: [],
    modal: document.getElementById('member-modal'),

    render() {
        this.members = JSON.parse(localStorage.getItem('makani_members') || '[]');
        const programs = JSON.parse(localStorage.getItem('makani_programs') || '[]');
        const tbody = document.querySelector('#members-table tbody');
        
        tbody.innerHTML = this.members.map(m => {
            const memberProgs = (m.programs || []).map(pid => {
                const p = programs.find(x => String(x.id) === String(pid));
                if (!p) return 'Unknown';
                return p.ccode ? `${p.ccode} (${p.nameEn || p.name})` : (p.nameEn || p.name);
            }).join(', ');

            return `
            <tr>
                <td><strong>${m.name}</strong></td>
                <td>${m.ageGroup || '-'}</td>
                <td>${memberProgs || '<span style="color:var(--primary)">No sessions assigned</span>'}</td>
                <td>
                    <button class="btn btn-outline" onclick="adminMembers.edit(${m.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger" onclick="adminMembers.delete(${m.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `}).join('') || '<tr><td colspan="4" style="text-align:center">No members found</td></tr>';
    },

    openModal() {
        document.getElementById('member-form').reset();
        document.getElementById('member-id').value = '';
        document.getElementById('member-modal-title').textContent = 'Add Member';
        this.renderProgramCheckboxes();
        this.modal.classList.add('active');
    },

    closeModal() {
        this.modal.classList.remove('active');
    },

    renderProgramCheckboxes(selectedIds = []) {
        const programs = JSON.parse(localStorage.getItem('makani_programs') || '[]');
        const container = document.getElementById('member-programs-list');
        
        container.innerHTML = programs.map(p => `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:5px;">
                <input type="checkbox" id="m-prog-${p.id}" class="member-prog-cb" value="${p.id}" ${selectedIds.includes(String(p.id)) ? 'checked' : ''}>
                <label for="m-prog-${p.id}">${p.emoji} <strong>${p.ccode ? p.ccode + ' - ' : ''}${p.nameEn || p.name}</strong> <small style="color:var(--text-muted)">(${p.schedule?.time || ''})</small></label>
            </div>
        `).join('') || '<div style="color:var(--text-muted)">No programs found. Please add programs first.</div>';
    },

    edit(id) {
        const m = this.members.find(x => x.id === id);
        if (!m) return;
        
        document.getElementById('member-id').value = m.id;
        document.getElementById('member-name').value = m.name;
        document.getElementById('member-ageGroup').value = m.ageGroup || '';
        
        this.renderProgramCheckboxes((m.programs || []).map(String));
        
        document.getElementById('member-modal-title').textContent = 'Edit Member';
        this.modal.classList.add('active');
    },

    save(e) {
        e.preventDefault();
        const id = document.getElementById('member-id').value;
        const selectedPrograms = Array.from(document.querySelectorAll('.member-prog-cb:checked')).map(cb => cb.value);

        const data = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('member-name').value.trim(),
            ageGroup: document.getElementById('member-ageGroup').value,
            programs: selectedPrograms
        };

        if (id) {
            const idx = this.members.findIndex(x => String(x.id) === String(id));
            if (idx !== -1) {
                this.members[idx] = data;
            }
        } else {
            this.members.push(data);
        }

        localStorage.setItem('makani_members', JSON.stringify(this.members));
        this.closeModal();
        this.render();
    },

    delete(id) {
        if(confirm('Delete member?')) {
            this.members = this.members.filter(x => String(x.id) !== String(id));
            localStorage.setItem('makani_members', JSON.stringify(this.members));
            this.render();
        }
    }
};

const adminAttendance = {
    selectedDate: null,

    render() {
        const programs = JSON.parse(localStorage.getItem('makani_programs') || '[]');
        const select = document.getElementById('att-program-select');
        
        select.innerHTML = '<option value="">-- Select Program --</option>' + programs.map(p => `
            <option value="${p.id}">${p.ccode ? p.ccode + ' - ' : ''}${p.nameEn || p.name}</option>
        `).join('');

        if (!document.getElementById('att-month-select').value) {
            const now = new Date();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            document.getElementById('att-month-select').value = `${now.getFullYear()}-${month}`;
        }
        
        this.onProgramChange();
    },

    onProgramChange() {
        const progId = document.getElementById('att-program-select').value;
        const monthVal = document.getElementById('att-month-select').value;
        const daysArea = document.getElementById('scheduled-days-area');
        const daysList = document.getElementById('scheduled-days-list');
        const summaryArea = document.getElementById('attendance-summary-info');

        this.selectedDate = null; // Clear day selection on program/month change
        document.getElementById('att-date').value = '';

        if (!progId || !monthVal) {
            daysArea.style.display = 'none';
            summaryArea.style.display = 'none';
            this.loadMembers();
            return;
        }

        const programs = JSON.parse(localStorage.getItem('makani_programs') || '[]');
        const p = programs.find(x => String(x.id) === String(progId));
        if (!p) return;

        daysArea.style.display = 'block';
        
        // Calculate scheduled dates
        const [year, month] = monthVal.split('-').map(Number);
        const scheduledDates = this.getScheduledDates(p, year, month);
        const attendanceLog = JSON.parse(localStorage.getItem('makani_attendance') || '[]');

        daysList.innerHTML = scheduledDates.map(date => {
            const hasData = attendanceLog.some(r => r.id === `${progId}_${date}`);
            return `
                <button class="sched-day-btn ${hasData ? 'has-data' : ''}" onclick="adminAttendance.selectDay('${date}')">
                    ${new Date(date).getDate()}
                </button>
            `;
        }).join('');

        // Show Summary Area
        summaryArea.style.display = 'block';
        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
        document.getElementById('summary-month-name').textContent = monthName;
        document.getElementById('summary-stats').textContent = `Total Scheduled: ${scheduledDates.length} Sessions`;

        this.loadMembers();
    },

    getScheduledDates(program, year, month) {
        const dates = [];
        const daysOfWeek = program.schedule?.days || []; // e.g. ['sun', 'tue']
        const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
        const targetDays = daysOfWeek.map(d => dayMap[d.toLowerCase()]);

        const totalDays = new Date(year, month, 0).getDate();
        for (let i = 1; i <= totalDays; i++) {
            const d = new Date(year, month - 1, i);
            if (targetDays.includes(d.getDay())) {
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                dates.push(dateStr);
            }
        }
        return dates;
    },

    selectDay(date) {
        this.selectedDate = date;
        document.getElementById('att-date').value = date;
        
        // Update UI
        document.querySelectorAll('.sched-day-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.trim() === String(new Date(date).getDate()));
        });

        this.loadMembers();
    },

    resetToSummary() {
        this.selectedDate = null;
        document.getElementById('att-date').value = '';
        document.querySelectorAll('.sched-day-btn').forEach(btn => btn.classList.remove('active'));
        this.loadMembers();
    },

    loadMembers() {
        const progId = document.getElementById('att-program-select').value;
        const monthVal = document.getElementById('att-month-select').value;
        const date = this.selectedDate;
        const tbody = document.querySelector('#attendance-table tbody');
        const thead = document.getElementById('attendance-table-head');

        if (!progId || !monthVal) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">Please select a program and month</td></tr>';
            return;
        }

        const manualMembers = JSON.parse(localStorage.getItem('makani_members') || '[]');
        const progMembers = manualMembers.filter(m => (m.programs || []).includes(String(progId)));
        
        if (progMembers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">No members found in this program</td></tr>';
            return;
        }

        const attendanceLog = JSON.parse(localStorage.getItem('makani_attendance') || '[]');

        if (date) {
            // SINGLE DAY VIEW (Marking Attendance)
            thead.innerHTML = '<th>Name</th><th>Status</th><th>Actions</th>';
            const recordId = `${progId}_${date}`;
            const currentRecord = attendanceLog.find(r => r.id === recordId) || { records: {} };

            tbody.innerHTML = progMembers.map(m => {
                const status = currentRecord.records[m.id] || 'pending';
                return `
                <tr>
                    <td><strong style="font-size: 18px;">${m.name}</strong></td>
                    <td><span class="badge ${status}">${status.toUpperCase()}</span></td>
                    <td>
                        <button class="btn btn-success" style="padding:4px 8px;" onclick="adminAttendance.mark('${m.id}', 'present')"><i class="fas fa-check"></i></button>
                        <button class="btn btn-danger" style="padding:4px 8px;" onclick="adminAttendance.mark('${m.id}', 'absent')"><i class="fas fa-times"></i></button>
                        <button class="btn btn-outline" style="padding:4px 8px;" onclick="adminAttendance.mark('${m.id}', 'pending')"><i class="fas fa-undo"></i></button>
                    </td>
                </tr>
            `}).join('');
        } else {
            // MONTHLY SUMMARY VIEW
            thead.innerHTML = '<th>Name</th><th>Attendance Summary</th><th>Percentage</th>';
            const programs = JSON.parse(localStorage.getItem('makani_programs') || '[]');
            const p = programs.find(x => String(x.id) === String(progId));
            const [year, month] = monthVal.split('-').map(Number);
            const scheduledDates = this.getScheduledDates(p, year, month);
            
            tbody.innerHTML = progMembers.map(m => {
                let attendedCount = 0;
                let absentCount = 0;
                
                scheduledDates.forEach(d => {
                    const record = attendanceLog.find(r => r.id === `${progId}_${d}`);
                    if (record && record.records[m.id] === 'present') attendedCount++;
                    if (record && record.records[m.id] === 'absent') absentCount++;
                });

                const totalScheduled = scheduledDates.length;
                const pct = totalScheduled > 0 ? Math.round((attendedCount / totalScheduled) * 100) : 0;
                const statusColor = pct > 80 ? '#2ecc71' : (pct > 50 ? '#f1c40f' : '#e74c3c');

                return `
                <tr>
                    <td><strong>${m.name}</strong></td>
                    <td>
                        <span style="font-size:20px; color:var(--secondary)">${attendedCount} / ${totalScheduled}</span>
                        <small style="color:var(--text-muted); margin-left:10px;">(${absentCount} absent)</small>
                    </td>
                    <td>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="flex:1; height:8px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden;">
                                <div style="height:100%; width:${pct}%; background:${statusColor}"></div>
                            </div>
                            <span style="font-weight:bold; color:${statusColor}">${pct}%</span>
                        </div>
                    </td>
                </tr>
            `}).join('');
        }
    },

    mark(memberId, status) {
        const progId = document.getElementById('att-program-select').value;
        const date = this.selectedDate;
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
        
        // Update "has-data" class on calendar button
        const [y, m, d] = date.split('-').map(Number);
        document.querySelectorAll('.sched-day-btn').forEach(btn => {
            if (btn.textContent.trim() === String(d)) {
                btn.classList.add('has-data');
            }
        });
        
        this.loadMembers();
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => adminApp.init());
