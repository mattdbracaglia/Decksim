// Get the form element
const signInForm = document.querySelector('form');

// Add event listener to the form submission
signInForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the form values
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Perform validation
    if (username === '' || password === '') {
        alert('Please fill in all fields.');
        return;
    }

    // Check credentials against local storage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        alert('Sign in successful!');
        // Redirect to a dashboard or desired page after successful sign-in
        window.location.href = '/Panels.html';
    } else {
        alert('Sign in failed. Invalid username or password.');
    }
});