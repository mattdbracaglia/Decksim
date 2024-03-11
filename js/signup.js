// Get the form element
const signupForm = document.querySelector('form');

// Add event listener to the form submission
signupForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the form values
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Perform validation
    if (username === '' || email === '' || password === '' || confirmPassword === '') {
        alert('Please fill in all fields.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    // Check if user already exists in local storage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = users.some(user => user.username === username || user.email === email);

    if (userExists) {
        alert('User already exists');
        return;
    }

    // Create a new user object
    const newUser = {
        username: username,
        email: email,
        password: password // Note: Storing passwords in local storage like this is not secure
    };

    // Save the new user to local storage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert('Sign up successful!');
    // Redirect to a success page or perform any other desired action
});