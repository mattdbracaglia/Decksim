// Ensure this JavaScript is placed in Panels.js or inside a <script> tag after the logout button in your HTML
document.getElementById('logoutButton').addEventListener('click', function() {
    logOut();
});

function logOut() {
    const token = localStorage.getItem('token');

    if (token) {
        fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                console.log('Logged out successfully');
            } else {
                console.error('Failed to log out on the server');
            }
        })
        .catch(error => {
            console.error('Error logging out:', error);
        })
        .finally(() => {
            // Clear the token and redirect, regardless of whether the logout request succeeded
            localStorage.removeItem('token');
            window.location.href = '/index.html';
        });
    } else {
        // If there's no token, just redirect to the login page
        window.location.href = '/index.html';
    }
}
