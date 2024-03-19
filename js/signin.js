// Get the form element
const signInForm = document.querySelector('form');
console.log('Sign-in form selected:', signInForm);

// Add event listener to the form submission
signInForm.addEventListener('submit', function(event) {
    console.log('Form submission event detected');
    event.preventDefault(); // Prevent the default form submission

    // Get the form values
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log('Retrieved username and password from form:', username, password);

    // Perform validation
    if (username === '' || password === '') {
        console.log('Validation failed: Username or password is empty');
        alert('Please fill in all fields.');
        return;
    }

    console.log('Validation passed. Checking credentials...');

    // Check credentials against local storage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('Retrieved users from local storage:', users);

    const user = users.find(user => user.username === username && user.password === password);
    console.log('Matching user from local storage:', user);

    if (user) {
        console.log('Sign in successful for user:', username);
        alert('Sign in successful!');
        // Redirect to a dashboard or desired page after successful sign-in
        window.location.href = '/Panels.html';
    } else {
        console.log('Sign in failed: Invalid username or password for user:', username);
        alert('Sign in failed. Invalid username or password.');
    }
});
