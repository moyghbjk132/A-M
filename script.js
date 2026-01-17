document.addEventListener('DOMContentLoaded', () => {
    const gradeButtons = document.querySelectorAll('.grade-button');
    const subjectContainer = document.getElementById('subjectContainer');
    const subjectsList = document.getElementById('subjectsList');
    const selectAllSubjects = document.getElementById('selectAllSubjects');
    const addToTableButton = document.getElementById('addToTable');
    const invoiceTableBody = document.getElementById('invoiceTableBody');

    let selectedGrade = '';
    const bookPrices = {
        "الصف الأول": { "عربي": 100, "لغة إنجليزية": 90, "رياضيات": 90 },
        "الصف الثاني": { "عربي": 100, "لغة إنجليزية": 90, "رياضيات": 90 },
        "الصف الثالث": { "عربي": 100, "لغة إنجليزية": 95, "رياضيات": 90 },
        "الصف الرابع": { "عربي": 110, "لغة إنجليزية": 100, "رياضيات": 90, "علوم": 90, "دراسات": 90 },
        "الصف الخامس": { "عربي": 110, "لغة إنجليزية": 110, "رياضيات": 90, "علوم": 90, "دراسات": 90 },
        "الصف السادس": { "عربي": 115, "لغة إنجليزية": 110, "رياضيات": 90, "علوم": 90, "دراسات": 95 },
        "الصف الأول الإعدادي": { "عربي": 80, "لغة إنجليزية": 0, "رياضيات": 85, "علوم": 80, "دراسات": 85 },
        "الصف الثاني الإعدادي": { "عربي": 0, "لغة إنجليزية": 0, "رياضيات": 0, "علوم": 0, "دراسات": 0 },
        "الصف الثالث الإعدادي": { "عربي": 0, "لغة إنجليزية": 0, "رياضيات": 0, "علوم": 0, "دراسات": 0 }
    };

    let invoiceItems = JSON.parse(localStorage.getItem('invoiceItems')) || [];
    const totalPriceDisplay = document.getElementById('totalPriceDisplay');
    const totalPriceDisplayTop = document.getElementById('totalPriceDisplayTop');

    function renderInvoice() {
        invoiceTableBody.innerHTML = '';
        invoiceItems.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.subject}</td>
                <td>${item.grade}</td>
                <td>${item.price} جنيه</td>
                <td><button class="delete-btn" data-index="${index}">حذف</button></td>
            `;
            invoiceTableBody.appendChild(row);
        });
        updateTotal();
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                deleteItem(e.target.getAttribute('data-index'));
            });
        });
    }

    function updateTotal() {
        let total = 0;
        invoiceItems.forEach(item => total += parseFloat(item.price));
        if (totalPriceDisplay) totalPriceDisplay.textContent = total;
        if (totalPriceDisplayTop) totalPriceDisplayTop.textContent = total;
    }

    function deleteItem(index) {
        invoiceItems.splice(index, 1);
        saveInvoice();
        renderInvoice();
    }

    function saveInvoice() {
        localStorage.setItem('invoiceItems', JSON.stringify(invoiceItems));
    }

    renderInvoice();

    gradeButtons.forEach(button => {
        button.addEventListener('click', () => {
            gradeButtons.forEach(btn => btn.style.background = 'var(--white)');
            button.style.background = 'var(--gold)';
            button.style.color = 'white';

            selectedGrade = button.getAttribute('data-grade');
            renderSubjects(selectedGrade);
            subjectContainer.style.display = 'block';
        });
    });

    function renderSubjects(grade) {
        subjectsList.innerHTML = '';
        const subjects = bookPrices[grade] || {};

        Object.keys(subjects).forEach(subject => {
            const label = document.createElement('label');
            label.className = 'subject-item';
            label.innerHTML = `
                <input type="checkbox" class="subject-checkbox" value="${subject}" checked style="transform: scale(1.3); margin-left: 10px;">
                ${subject} (${subjects[subject]} ج)
            `;
            subjectsList.appendChild(label);
        });
        if (selectAllSubjects) selectAllSubjects.checked = true;
    }

    if (selectAllSubjects) {
        selectAllSubjects.addEventListener('change', (e) => {
            const subjectCheckboxes = document.querySelectorAll('.subject-checkbox');
            subjectCheckboxes.forEach(checkbox => checkbox.checked = e.target.checked);
        });
    }

    addToTableButton.addEventListener('click', () => {
        const subjectCheckboxes = document.querySelectorAll('.subject-checkbox');
        const selectedSubjects = Array.from(subjectCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        if (!selectedGrade) {
            alert('يرجى اختيار الصف');
            return;
        }
        if (selectedSubjects.length === 0) {
            alert('يرجى اختيار مادة واحدة على الأقل');
            return;
        }

        const now = new Date();
        const dateString = now.toLocaleDateString('ar-EG') + ' ' + now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        selectedSubjects.forEach(subject => {
            const newItem = {
                grade: selectedGrade,
                subject: subject,
                price: bookPrices[selectedGrade][subject],
                date: dateString
            };
            invoiceItems.unshift(newItem);
            let allRecords = JSON.parse(localStorage.getItem('allSalesRecords')) || [];
            allRecords.unshift(newItem);
            localStorage.setItem('allSalesRecords', JSON.stringify(allRecords));
        });

        saveInvoice();
        renderInvoice();
        subjectContainer.style.display = 'none';
        selectedGrade = '';
        gradeButtons.forEach(btn => {
            btn.style.background = 'var(--white)';
            btn.style.color = 'var(--text-dark)';
        });
    });

    function handlePrint() {
        const dateSpan = document.getElementById('currentDate');
        if (dateSpan) {
            const now = new Date();
            dateSpan.textContent = now.toLocaleDateString('ar-EG');
        }
        window.print();
    }

    const printButtonTop = document.getElementById('printButtonTop');
    if (printButtonTop) printButtonTop.addEventListener('click', handlePrint);

    const clearTableButton = document.getElementById('clearTableButton');
    if (clearTableButton) {
        clearTableButton.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من مسح جميع بيانات الجدول؟')) {
                invoiceItems = [];
                saveInvoice();
                renderInvoice();
            }
        });
    }
});