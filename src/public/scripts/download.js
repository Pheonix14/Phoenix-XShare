  const downloadLink = document.getElementById('downloadLink');
const errorElement = document.getElementById('Error');

downloadLink.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent the default link behavior

    // Get the file name from the data-fileName attribute
    const fileName = downloadLink.getAttribute('data-fileName');

    // Make a GET request to download the file
    try {
        const response = await fetch(`/cdn/${fileName}`);
        if (response.ok) {
            // Form submission was successful, hide the error message
            errorElement.style.display = 'none';
        } else {
            // Form submission failed, display the error message from the response
            const errorData = await response.text();
            errorElement.textContent = errorData;
            errorElement.style.display = 'block';
        }
    } catch (error) {
        // Handle any network or other errors
        console.error(error);
        errorElement.textContent = 'An error occurred.';
        errorElement.style.display = 'block';
    }
});
