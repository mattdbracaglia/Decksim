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

    document.addEventListener('DOMContentLoaded', function() {
        const tutorialButton = document.getElementById('tutorialButton');
        let currentSlideIndex = 1;  // Start with the first slide
    
        tutorialButton.addEventListener('click', function() {
            showSlide(currentSlideIndex);
        });
    
        function showSlide(index) {
            const presentationArea = document.getElementById('presentationArea');
            presentationArea.innerHTML = ''; // Clear previous content
    
            const slideImage = document.createElement('img');
            slideImage.src = `tutorial/Slide${index}.JPG`;
            slideImage.style.width = '100%';
            slideImage.style.height = 'auto';
            presentationArea.appendChild(slideImage);
    
            presentationArea.onclick = function() {
                currentSlideIndex++;
                if (currentSlideIndex <= 47) {
                    showSlide(currentSlideIndex);
                } else {
                    window.location.href = 'Panels.html'; // Redirect after the last slide
                }
            };
        }
    });
