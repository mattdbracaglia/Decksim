// Get the form element
const signupForm = document.querySelector('form');

// Add event listener to the form submission
signupForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
    console.log('Form submission intercepted.');

    // Get the form values
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    console.log(`Form values - Username: ${username}, Email: ${email}, Password: [hidden], Confirm Password: [hidden]`);

    // Perform validation
    if (username === '' || email === '' || password === '' || confirmPassword === '') {
        console.log('Validation failed: One or more fields are empty.');
        alert('Please fill in all fields.');
        return;
    }

    if (password !== confirmPassword) {
        console.log('Validation failed: Passwords do not match.');
        alert('Passwords do not match.');
        return;
    }

    // Check if user already exists in local storage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log(`Loaded ${users.length} users from local storage.`);

    const userExists = users.some(user => user.username === username || user.email === email);
    console.log(`User exists check: ${userExists ? 'User found in local storage.' : 'No matching user in local storage.'}`);

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
    console.log('New user object created:', newUser);

    // Save the new user to local storage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    console.log('New user added to local storage.');

    alert('Sign up successful!');
    console.log('Sign up successful! Redirecting or taking another action...');
    // Redirect to a success page or perform any other desired action
});
