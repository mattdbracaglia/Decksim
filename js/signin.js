// Client-side JavaScript for handling the sign-in form submission
const signInForm = document.querySelector('form');

signInForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
    console.log('Form submission intercepted');

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Perform validation
    if (username === '' || password === '') {
        alert('Please fill in all fields.');
        return;
    }

    // Send POST request to server for sign-in
    fetch('/api/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Error during sign-in');
            });
        }
        return response.json(); // Assuming the server responds with JSON
    })
    .then(data => {
        console.log('Sign-in successful:', data);
        // Store the token in localStorage or sessionStorage
        localStorage.setItem('token', data.accessToken); // Adjust depending on your storage preference

        alert('Sign in successful!');
        window.location.href = '/Panels.html'; // Redirect on successful sign-in
    })
    .catch(error => {
        console.error('Error during sign-in:', error.message);
        alert(`Sign in failed: ${error.message}`);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const guestSignInButton = document.getElementById('guestSignIn');
    guestSignInButton.addEventListener('click', function() {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        // Set values to "Guest" and "Guest!"
        usernameInput.value = 'Guest';
        passwordInput.value = 'Guest!';

        // Optionally, you could directly submit the form with these values
        // and handle the response to redirect, or you can do it manually as follows:
        fetch('/api/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: 'Guest', password: 'Guest!' })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to sign in as guest');
            }
            return response.json(); // Assuming the server responds with JSON including an access token
        })
        .then(data => {
            localStorage.setItem('token', data.accessToken); // Save the provided token, if applicable
            window.location.href = '/Panels.html'; // Redirect on successful sign-in
        })
        .catch(error => {
            console.error('Error during guest sign-in:', error);
            alert('Guest sign-in failed');
        });
    });
});


