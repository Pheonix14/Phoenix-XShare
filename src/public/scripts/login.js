        const loginForm = document.getElementById('loginForm');
const errorElement = document.getElementById('Error');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get form data
    const formData = new FormData(loginForm);

    // Make a POST request to your server
    try {
        const response = await fetch('/login', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            // Form submission was successful, redirect the user to another page
            window.location.href = '/';
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

const passwordInput = document.getElementById('password');
        const passwordToggle = document.getElementById('passwordToggle');

        passwordToggle.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
       passwordToggle.textContent = 'Hide Password';
            } else {
                passwordInput.type = 'password';
                passwordToggle.textContent = 'Show Password';
            }
        });

if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/scripts/serviceWorkers.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        }