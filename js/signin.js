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
        body: JSON.stringify({ username, password }),
        credentials: 'include' // Include cookies in the request and save them upon receiving the response
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
        alert('Sign in successful!');
        window.location.href = '/Panels.html'; // Redirect on successful sign-in
    })
    .catch(error => {
        console.error('Error during sign-in:', error.message);
        alert(`Sign in failed: ${error.message}`);
    });

});
