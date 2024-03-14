// Get the form element
const signupForm = document.querySelector('form');

// Add event listener to the form submission
signupForm.addEventListener('submit', async function(event) {
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

    // Create a new user object
    const newUser = { username, email, password };

    // Send POST request to server for signup
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser),
        });

        if (!response.ok) {
            const errorText = await response.text(); // or response.json() if you expect JSON
            throw new Error(`Signup failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        alert(data.message);
        // Redirect or perform any other desired action
    } catch (error) {
        console.error('Error during signup:', error);
        alert('Signup failed. Please try again.');
    }
});
