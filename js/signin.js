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
            // Throw an error for non-2xx status codes to be caught by the catch block
            throw new Error('Network response was not ok');
        }
        return response.text(); // or response.json() if server responds with JSON
    })
    .then(data => {
        console.log(data); // Process your data here
        alert('Sign in successful!');
        window.location.href = '/main.html';
    })
    .catch(error => {
        console.error('Error during sign-in:', error);
        alert('Sign in failed. Please try again.');
    });
});
