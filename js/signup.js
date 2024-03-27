// Get the form element
const signupForm = document.querySelector('form');

// Add event listener to the form submission
signupForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission
    console.log('Form submission intercepted');

    // Get the form values
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    console.log('Form values:', { username, email, password, confirmPassword });

    // Perform validation
    if (username === '' || email === '' || password === '' || confirmPassword === '') {
        console.log('Validation failed: Please fill in all fields');
        alert('Please fill in all fields.');
        return;
    }

    if (username.length < 5) {
        console.log('Validation failed: Username must have at least 5 characters');
        alert('Username must have at least 5 characters.');
        return;
    }

    if (password.length < 6) {
        console.log('Validation failed: Password must have at least 6 characters');
        alert('Password must have at least 6 characters.');
        return;
    }

    if (password !== confirmPassword) {
        console.log('Validation failed: Passwords do not match');
        alert('Passwords do not match.');
        return;
    }

    // Create a new user object
    const newUser = { username, email, password };
    console.log('New user object:', newUser);

    // Send POST request to server for signup
    try {
        console.log('Sending signup request to server');
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser),
        });

        console.log('Response received', response);

        if (!response.ok) {
            const errorText = await response.text(); // or response.json() if you expect JSON
            console.log('Signup failed:', response.status, errorText);
            throw new Error(`Signup failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('Signup successful:', data.message);
        alert(data.message);
        
        // Redirect to signin.html after successful signup
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error during signup:', error);
        alert('Signup failed. Please try again.');
    }
});
