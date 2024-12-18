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
        // Directly send the guest credentials without using form inputs
        fetch('/api/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: 'Guest', password: 'Guest!' })
        })
        .then(response => {
            if (!response.ok) {
                // If the server responds with a non-200 status, parse the JSON for the message
                return response.json().then(data => Promise.reject(new Error(data.message || 'Failed to sign in as guest')));
            }
            return response.json(); // Assuming the server responds with JSON including an access token
        })
        .then(data => {
            localStorage.setItem('token', data.accessToken); // Save the provided token
            window.location.href = '/Panels.html'; // Redirect on successful sign-in
        })
        .catch(error => {
            console.error('Error during guest sign-in:', error);
            alert('Guest sign-in failed: ' + error.message); // Display a more informative error message
        });
    });
});



