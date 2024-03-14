
const signInForm = document.querySelector('form');

signInForm.addEventListener('submit', function(event) {
    event.preventDefault();
    console.log('Form submission intercepted');

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === '' || password === '') {
        alert('Please fill in all fields.');
        return;
    }

    fetch('/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json()) // Parse JSON response
    .then(data => {
        if (data.error) {
            throw new Error(data.error); // Use error message from the server
        }
        console.log(data.message); // Sign in successful
        alert(data.message);
        window.location.href = '/main.html'; // Redirect on success
    })
    .catch(error => {
        console.error('Error during sign-in:', error);
        alert(`Sign in failed: ${error.message}`);
    });
});
