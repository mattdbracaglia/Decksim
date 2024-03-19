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
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text); // Throw an error with the text response to catch it later
            });
        }
        return response.text(); // or response.json() if server responds with JSON
    })
    .then(data => {
        console.log(data); // Process your data here
        alert('Sign in successful!');
        window.location.href = '/Panels.html'; // Redirect on successful sign-in
    })
    .catch(error => {
        console.error('Error during sign-in:', error.message);
        alert(`Sign in failed: ${error.message}`);
    });
});
