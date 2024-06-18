    const form = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const loading = document.getElementById('loading');
    const dragDropArea = document.getElementById('dragDropArea');
    const container = document.getElementById('container');
    form.addEventListener('submit', (event) => {
      event.preventDefault();

loading.textContent = "File uploading is under progress.... Please don't close or refresh the tab";
      
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);

      fetch('/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => response.text())
      .then(data => {
        container.innerHTML = data;
        form.reset();
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });

    dragDropArea.addEventListener('dragover', (event) => {
      event.preventDefault();
      dragDropArea.classList.add('dragging');
    });

    dragDropArea.addEventListener('dragleave', () => {
      dragDropArea.classList.remove('dragging');
    });

    dragDropArea.addEventListener('drop', (event) => {
      event.preventDefault();
      dragDropArea.classList.remove('dragging');
      fileInput.files = event.dataTransfer.files;
    });

function shareButton(button) {
    const downloadLink = button.getAttribute('data-download-link');

const shareBtn = document.getElementById('shareButton');

shareBtn.onclick = async (filesArray) => {
    if (navigator.canShare) {
        navigator.share({
            url: downloadLink,
            title: 'Phoenix XShare',
        })
    } else {
          const textArea = document.createElement('textarea');
    textArea.value = downloadLink;

    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

      shareBtn.textContent = "Link Copied!";
    setTimeout(() => {
          shareBtn.textContent = "Download Link";
    }, 3000); // Reset to "Copy Link" after 3 seconds
    }
}

}

function cdnButton(button) {
    const downloadLink = button.getAttribute('data-cdn-link');

const shareBtn = document.getElementById('cdnButton');

shareBtn.onclick = async (filesArray) => {
    if (navigator.canShare) {
        navigator.share({
            url: downloadLink, 
        })
    } else {
          const textArea = document.createElement('textarea');
    textArea.value = downloadLink;

    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

      shareBtn.textContent = "Link Copied!";
    setTimeout(() => {
          shareBtn.textContent = "CDN Link";
    }, 3000); // Reset to "Copy Link" after 3 seconds
    }
}

}
