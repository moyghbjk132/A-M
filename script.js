document.addEventListener('DOMContentLoaded', () => {
    // bookPriceInput removed
    const gradeButtons = document.querySelectorAll('.grade-button');
    const subjectContainer = document.getElementById('subjectContainer');
    const subjectCheckboxes = document.querySelectorAll('.subject-checkbox');
    const addToTableButton = document.getElementById('addToTable');
    const invoiceTableBody = document.getElementById('invoiceTableBody');

    let selectedGrade = '';
    // --- منطقة تسجيل أسعار الكتب ---
    // --- منطقة تسجيل أسعار الكتب ---
    // تم تحديث الأسعار لتكون خاصة بكل صف دراسي
    const bookPrices = {
        "الصف الأول": { "عربي": 100, "لغة إنجليزية": 90, "رياضيات": 90 },
        "الصف الثاني": { "عربي": 100, "لغة إنجليزية": 90, "رياضيات": 90 },
        "الصف الثالث": { "عربي": 100, "لغة إنجليزية": 95, "رياضيات": 90 },
        "الصف الرابع": { "عربي": 110, "لغة إنجليزية": 100, "رياضيات": 90, "علوم": 90, "دراسات": 90 },
        "الصف الخامس": { "عربي": 110, "لغة إنجليزية": 110, "رياضيات": 90, "علوم": 90, "دراسات": 90 },
        "الصف السادس": { "عربي": 115, "لغة إنجليزية": 110, "رياضيات": 90, "علوم": 90, "دراسات": 95 },

        // المرحلة الإعدادية
        "الصف الأول الإعدادي": { "عربي": 80, "لغة إنجليزية": 0, "رياضيات": 85, "علوم": 80, "دراسات": 85 },
        "الصف الثاني الإعدادي": { "عربي": 0, "لغة إنجليزية": 0, "رياضيات": 0, "علوم": 0, "دراسات": 0 },
        "الصف الثالث الإعدادي": { "عربي": 0, "لغة إنجليزية": 0, "رياضيات": 0, "علوم": 0, "دراسات": 0 }
    };
    // -----------------------------
    // No bookList needed




    // Auto-fill price when book name is typed


    let invoiceItems = JSON.parse(localStorage.getItem('invoiceItems')) || [];
    const totalPriceDisplay = document.getElementById('totalPriceDisplay');
    const totalPriceDisplayTop = document.getElementById('totalPriceDisplayTop');

    // Function to render the table
    function renderInvoice() {
        invoiceTableBody.innerHTML = '';

        invoiceItems.forEach((item, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${item.subject}</td>
                <td>${item.grade}</td>
                <td>${item.price}</td>
                <td><button class="delete-btn" data-index="${index}" style="background-color: #dc3545; padding: 5px 10px;">حذف</button></td>
            `;
            invoiceTableBody.appendChild(row);
        });

        updateTotal();

        // Attach delete handlers
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                deleteItem(index);
            });
        });
    }

    function updateTotal() {
        let total = 0;
        invoiceItems.forEach(item => {
            total += parseFloat(item.price);
        });

        if (totalPriceDisplay) {
            totalPriceDisplay.textContent = total;
        }
        if (totalPriceDisplayTop) {
            totalPriceDisplayTop.textContent = total;
        }
    }

    function deleteItem(index) {
        invoiceItems.splice(index, 1);
        saveInvoice();
        renderInvoice();
    }

    function saveInvoice() {
        localStorage.setItem('invoiceItems', JSON.stringify(invoiceItems));
    }

    // Initial Render
    renderInvoice();

    // Handle grade button clicks
    gradeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            gradeButtons.forEach(btn => btn.style.backgroundColor = '#007bff');

            // Highlight selected button
            button.style.backgroundColor = '#0056b3';

            selectedGrade = button.getAttribute('data-grade');

            // Show the subject container
            subjectContainer.style.display = 'block';

            // Auto-select all subjects by default when a grade is picked
            subjectCheckboxes.forEach(checkbox => checkbox.checked = true);
            if (selectAllSubjects) selectAllSubjects.checked = true;
        });
    });

    // Select All Subjects Logic
    const selectAllSubjects = document.getElementById('selectAllSubjects');
    if (selectAllSubjects) {
        selectAllSubjects.addEventListener('change', (e) => {
            subjectCheckboxes.forEach(checkbox => checkbox.checked = e.target.checked);
        });
    }

    // Add book, grade, subjects, and price to the table
    addToTableButton.addEventListener('click', () => {
        // No book name input anymore

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

        // Add rows to the table for each selected subject
        const now = new Date();
        const dateString = now.toLocaleDateString('ar-EG') + ' ' + now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        selectedSubjects.reverse().forEach(subject => {
            let subjectPrice = 0;
            if (bookPrices[selectedGrade] && bookPrices[selectedGrade][subject] !== undefined) {
                subjectPrice = bookPrices[selectedGrade][subject];
            } else {
                alert(`عذراً، المادة "${subject}" غير مسجلة للصف "${selectedGrade}".`);
                return;
            }

            if (subjectPrice === 0) {
                alert(`تنبيه: سعر المادة "${subject}" في "${selectedGrade}" مسجل بـ 0.`);
            }

            const newItem = {
                grade: selectedGrade,
                subject: subject,
                price: subjectPrice,
                date: dateString
            };

            // Add to Active Data Array
            invoiceItems.unshift(newItem);

            // Add to Permanent History Array
            let allRecords = JSON.parse(localStorage.getItem('allSalesRecords')) || [];
            allRecords.unshift(newItem);
            localStorage.setItem('allSalesRecords', JSON.stringify(allRecords));
        });

        // Save and Render Active Invoice
        saveInvoice();
        renderInvoice();

        // Clear inputs
        subjectCheckboxes.forEach(checkbox => (checkbox.checked = false));
        subjectContainer.style.display = 'none';
        selectedGrade = '';

        // Reset button styles
        gradeButtons.forEach(btn => btn.style.backgroundColor = '#007bff');
    });
    // Print Button Logic
    const printButton = document.getElementById('printButton');
    const dateSpan = document.getElementById('currentDate');

    // Print Button Logic
    function handlePrint() {
        if (dateSpan) {
            const now = new Date();
            dateSpan.textContent = now.toLocaleDateString('ar-EG');
        }
        window.print();
    }

    if (printButton) {
        printButton.addEventListener('click', handlePrint);
    }

    const printButtonTop = document.getElementById('printButtonTop');
    if (printButtonTop) {
        printButtonTop.addEventListener('click', handlePrint);
    }

    // Clear Table Logic
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