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
          shareBtn.textContent = "Share Download Link";
    }, 3000); // Reset to "Copy Link" after 3 seconds
    }
}

}

if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/scripts/serviceWorkers.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
}