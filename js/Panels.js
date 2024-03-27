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
        const presentationArea = document.getElementById('presentationArea');
        let currentSlideIndex = 0;
    
        tutorialButton.addEventListener('click', function() {
            presentationArea.style.display = 'flex'; // Show the presentation area
            showSlide(currentSlideIndex);
        });
    
        presentationArea.addEventListener('click', function() {
            currentSlideIndex++;
            if (currentSlideIndex < 47) {  // Use < 47 since index starts from 0
                showSlide(currentSlideIndex);
            } else {
                endPresentation();
                window.location.href = 'Panels.html'; // Redirect after the last slide
            }
        });
    
        function showSlide(index) {
            const slideImage = document.createElement('img');
            slideImage.src = `tutorial/Slide${index + 1}.JPG`; // Adjust the path as needed
            slideImage.style.maxWidth = '100%'; // Ensure image fits in the container
            slideImage.style.maxHeight = '100%';
    
            presentationArea.innerHTML = ''; // Clear previous slide
            presentationArea.appendChild(slideImage);
        }
    
        function endPresentation() {
            presentationArea.innerHTML = ''; // Clear the presentation area
            presentationArea.style.display = 'none'; // Hide the presentation area
            currentSlideIndex = 0; // Reset the slide index
        }
    });

