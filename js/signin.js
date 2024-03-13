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
            throw new Error('Sign-in failed');
        }
        return response.text();
    })
    .then(() => {
        alert('Sign in successful!');
        window.location.href = '/main.html';
    })
    .catch((error) => {
        console.error(error);
        alert('Sign in failed. Invalid username or password.');
    });
});
