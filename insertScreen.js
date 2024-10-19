document.getElementById('textArea').addEventListener('paste', function (event) {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = function (event) {
                const imgElement = document.createElement('img');
                imgElement.src = event.target.result;
                document.getElementById('imageContainer').appendChild(imgElement);
            };
            reader.readAsDataURL(blob);
        }
    }
});