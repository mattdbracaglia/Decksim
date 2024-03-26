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
    
        tutorialButton.addEventListener('click', function() {
            // Assuming tutorial.pptx is in the same directory as your HTML file
            window.location.href = 'tutorial.pptx';
        });
    });

    function showSlide(index) {
        const slideImage = document.createElement('img');
        slideImage.src = slides[index];
        slideImage.style.width = '100%'; // Set width as needed
        slideImage.style.height = 'auto'; // Set height as needed
        slideImage.id = 'currentSlide';
    
        const presentationArea = document.getElementById('presentationArea');
        presentationArea.innerHTML = ''; // Clear previous slide
        presentationArea.appendChild(slideImage);
    
        slideImage.addEventListener('click', function() {
            currentSlideIndex++;
            if (currentSlideIndex < slides.length) {
                showSlide(currentSlideIndex);
            } else {
                endPresentation();
            }
        });
    }
    
    function endPresentation() {
        const presentationArea = document.getElementById('presentationArea');
        presentationArea.innerHTML = ''; // Clear the presentation area
        currentSlideIndex = 0; // Reset the slide index
    }

