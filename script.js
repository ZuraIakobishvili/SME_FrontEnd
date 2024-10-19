const fileInput = document.getElementById('files');
const fileList = document.getElementById('fileList');
const announcementId = document.getElementById('announcementId');
const screenshot = document.getElementById("screenshot");
const filesArray = [];

fileInput.addEventListener('change', () => {
    // დაამატე არჩეული ფაილები სიაში
    for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i];
        filesArray.push(file);

        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        fileItem.innerHTML = `
            <span>${file.name}</span>
            <button type="button" class="remove-btn" data-index="${filesArray.length - 1}">Remove</button>
        `;
        fileList.appendChild(fileItem);
    }
});

fileList.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-btn')) {
        const index = parseInt(event.target.getAttribute('data-index'));
        filesArray.splice(index, 1);
        event.target.parentElement.remove(); // წაშალე ფაილი სიიდან

        // განაახლე დარჩენილი ღილაკების ინდექსები
        const removeButtons = fileList.querySelectorAll('.remove-btn');
        removeButtons.forEach((button, newIndex) => {
            button.setAttribute('data-index', newIndex);
        });
    }
});

document.getElementById('fileForm').addEventListener('submit', function (e) {
    e.preventDefault();

    var formData = new FormData();

    // SaveFilesRequest მონაცემები
    formData.append('AnnouncementId', announcementId.value);
    formData.append('Status', document.getElementById('status').value);

    // SendMailRequest მონაცემები
    formData.append('SendMailRequest.Comment', document.getElementById('comment').value);
    formData.append('SendMailRequest.RecipientEmail', document.getElementById('recipientEmail').value);

    // შევამოწმოთ, რომ ყველა საჭირო ველი შევსებულია
    if (filesArray.length === 0) {
        alert('გთხოვთ, აირჩიოთ ფაილი');
        return;
    }

    if (!formData.get('SendMailRequest.Comment')) {
        alert('გთხოვთ, შეიყვანოთ კომენტარი');
        return;
    }

    if (!formData.get('SendMailRequest.RecipientEmail')) {
        alert('გთხოვთ, აირჩიოთ მიმღები');
        return;
    }

    if (!formData.get('AnnouncementId')) {
        alert('გთხოვთ, შეიყვანოთ Announcement Id');
        return;
    }

    // დაამატეთ ფაილები formData-ში
    filesArray.forEach((file, index) => {
        formData.append('SendMailRequest.Files', file);
    });

    const screenshotImg = document.querySelector('#imageContainer img');
    if (screenshotImg) {
        fetch(screenshotImg.src)
            .then(res => res.blob())
            .then(blob => {
                formData.append('SendMailRequest.Screenshot', blob, 'screenshot.png');
                sendFormData(formData);
            });
    } else {
        sendFormData(formData);
    }
});

function sendFormData(formData) {
    fetch('https://localhost:7050/api/save-pdf', {
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || 'Network response was not ok');
                });
            }
            return response.text();
        })
        .then(data => {
            console.log('Success:', data);
            loadSmeAnnouncements();
        })
        .catch((error) => {
            console.error('Error:', error.message);
        });
}

function loadSmeAnnouncements() {
    fetch('https://localhost:7050/api/sme/get-sme-announcements')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.querySelector('#smeAnnouncementsTable tbody');
            tableBody.innerHTML = ''; // ცხრილის გასუფთავება

            data.forEach(announcement => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${announcement.announcementId}</td>
                    <td>${announcement.firstName}</td>
                    <td>${announcement.lastName}</td>
                    <td>${announcement.amount}</td>
                    <td>${announcement.status}</td>
                    <td>${new Date(announcement.created).toLocaleString()}</td>
                    <td>${announcement.comment}</td>
                    <td>${announcement.period}</td>
                    <td>${getFileIcon(announcement.fileName)}</td>
                `;
            });
        })
        .catch(error => {
            console.error('Error loading SME announcements:', error);
        });
}

function getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconMap = {
        'pdf': '📄',
        'doc': '📝',
        'docx': '📝',
        'xls': '📊',
        'xlsx': '📊',
        'jpg': '🖼️',
        'jpeg': '🖼️',
        'png': '🖼️',
        // დაამატეთ სხვა ფაილის ტიპები საჭიროებისამებრ
    };

    return iconMap[extension] || '📎'; // დეფოლტ აიქონი უცნობი ტიპებისთვის
}


// გვერდის ჩატვირთვისას გამოვიძახოთ ფუნქცია
document.addEventListener('DOMContentLoaded', loadSmeAnnouncements);
