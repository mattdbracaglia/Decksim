// Get the form element
const signInForm = document.querySelector('form');

// Add event listener to the form submission
signInForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
    console.log('Form submission intercepted');

    // Get the form values
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log(`Entered username: ${username}`);
    console.log(`Entered password: [hidden for security reasons]`);

    // Perform validation
    if (username === '' || password === '') {
        console.log('Validation failed: Username or password is empty');
        alert('Please fill in all fields.');
        return;
    }

    // Check credentials against local storage
    console.log('Attempting to retrieve users from localStorage');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log(`Total users found in localStorage: ${users.length}`);

    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        console.log('Sign in successful');
        alert('Sign in successful!');
        // Redirect to a dashboard or desired page after successful sign-in
        window.location.href = '/main.html';
    } else {
        console.log('Sign in failed: Invalid username or password');
        alert('Sign in failed. Invalid username or password.');
    }
});
