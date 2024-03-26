document.addEventListener('DOMContentLoaded', function() {
    var backToGameButton = document.getElementById('BacktoGame');
    let tempCardNames = [];
    let currentCardIndex = 0; // Tracks the current card index
    let currentCards = []; // Global variable to store cards data
    var btn = document.getElementById("importDeck");
    var popup = document.getElementById("deckPopup"); // Ensure this is accessible
    resetManaCounters();
    let highlightedCards = [];
    var currentCard; // This will hold the currently selected card's data
    let currentDeckName = ""; // Initially empty or you could set a default value
    const deckNameInput = document.getElementById('deckNameInput');
  
    if (deckNameInput) {
        currentDeckName = deckNameInput.value; // Update the currentDeckName when loading/changing the deck
    }
    if (backToGameButton) {
        backToGameButton.addEventListener('click', function() {
            // Navigate to main.html
            window.location.href = 'Panels.html';
        });
    } else {
        console.error('Back To Game button not found');
    }
    createTabs();
    createDeckFilterTabs();


    document.addEventListener('DOMContentLoaded', () => {
        // Assuming your card elements are within a container with the ID 'cardContainer'
        const cardContainer = document.getElementById('cardContainer');
    
        cardContainer.addEventListener('mouseover', event => {
            // Ensure that the mouseover event is triggered by a card element
            const cardElement = event.target.closest('.card'); // Assuming each card has a class 'card'
            if (cardElement) {
                // Assuming each card element has a data attribute 'cardId' that corresponds to its identifier
                const cardId = cardElement.getAttribute('data-cardId');
    
                // Retrieve the card data using the cardId
                // For demonstration, we'll log the cardId; replace this with actual data retrieval
                console.log('Hovered over card ID:', cardId);
    
                // Assuming a function getCardData(cardId) returns the data for a given card
                const cardData = getCardData(cardId);
                console.log('Card data:', cardData);
            }
        });
    
        // Dummy function for getting card data, replace with your actual data retrieval logic
        function getCardData(cardId) {
            // Retrieve and return the card data from your data source using the cardId
            return { id: cardId, name: 'Example Card', description: 'This is an example card.' };
        }
    });
    
    document.getElementById('importCards').addEventListener('click', function() {
        var cardInputContainer = document.getElementById('cardInputContainer');
        var cardImageContainer = document.getElementById('cardImageContainer');
        var addCardContainer = document.getElementById('addCardContainer');
        var addCardsButtonContainer = document.getElementById('addCardsButtonContainer');
    
        if (cardInputContainer.style.display === 'none') {
            // If the card input container is currently hidden, show it
            cardInputContainer.style.display = 'block';
            
            // And ensure the card image container and add card container are hidden
            cardImageContainer.style.display = 'none';
            addCardContainer.style.display = 'none';
            addCardsButtonContainer.style.display = 'none';
        } else {
            // If the card input container is currently shown, hide it
            cardInputContainer.style.display = 'none';
            
            // And unhide the card image container
            cardImageContainer.style.display = 'block';
        }
    
        // Call askForDeckName to show the deck name input alongside
        askForDeckName(); // This ensures the deck name input is shown when Import Cards is clicked
    });
        
    function askForDeckName() {
        console.log('Asking for deck name...');
        var deckNameInput = document.getElementById('deckNameInput');
        if (deckNameInput) deckNameInput.style.display = 'block'; // Make the input visible
    }

    document.addEventListener('dblclick', function() {
        console.log('Current cards:', currentCards);
        console.log('Current deck name:', currentDeckName);
    });
    

   document.getElementById('loadCards').addEventListener('click', function() {
        console.log('Load Cards button clicked.');
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, redirecting to login page');
            window.location.href = '/index.html';
            return;
        }
    
        const lines = document.getElementById('cardTextInput').value.split('\n');
        const cardNamesWithQuantity = lines.map(line => {
            const match = line.trim().match(/^(\d+)x?\s+(.*)$/);
            if (match) {
                return { name: match[2], quantity: parseInt(match[1], 10) };
            }
            return null;
        }).filter(card => card); // Ensure each entry has a name and quantity
    
        const deckName = document.getElementById('deckNameInput').value.trim();
        if (!deckName) {
            console.error('Deck name is required.');
            return;
        }
    
        fetch('/import-cards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Assuming you have the token
            },
            body: JSON.stringify({
                cardNames: cardNamesWithQuantity,
                deckName: deckName
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok on import cards');
            }
            return response.json();
        })
        .then(data => {
            console.log('Card details fetched successfully:', data);
        
            // Update currentCards with the new data
            currentCards = data.cards;
            console.log(currentCards);
            document.getElementById('cardInputContainer').style.display = 'none';
        
            var cardImageContainer = document.getElementById('cardImageContainer');
            cardImageContainer.style.display = 'block';
        
            if (currentCards && currentCards.length > 0) {
                console.log('Index:', 0); // Example index, assuming you want to show the first card
                console.log('Current Cards Length:', currentCards.length);
                updateCardImage(0, currentCards); // Pass currentCards to updateCardImage
                populateCardList(currentCards); // Populate the card list with names
                populateDeckSection(currentCards); // Populate the deck section with card details
            }
    
            // Save the deck with the fetched and enhanced cards
            return fetch('/save-deck', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Include the JWT token in the Authorization header for saving
                },
                body: JSON.stringify({ deckName: deckName, cards: currentCards })
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok on save deck');
            }
            return response.json();
        })
        .then(saveResponse => {
            console.log('Deck saved successfully:', saveResponse);
            // Set the currentDeckName to the name that the deck was saved as
            currentDeckName = deckName;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
    

    document.getElementById('AddCard').addEventListener('click', function() {
        const addCardContainer = document.getElementById('addCardContainer');
        const addCardsButtonContainer = document.getElementById('addCardsButtonContainer');
        const cardImageContainer = document.getElementById('cardImageContainer');
        const cardInputContainer = document.getElementById('cardInputContainer');
    
        // Toggle the visibility of the containers
        if (addCardContainer.style.display === 'none') {
            // If the add card container is currently hidden, show it
            addCardContainer.style.display = 'block';
            addCardsButtonContainer.style.display = 'block';
    
            // And ensure the card image container and card input container are hidden
            cardImageContainer.style.display = 'none';
            cardInputContainer.style.display = 'none';
        } else {
            // If the add card container is currently shown, hide it
            addCardContainer.style.display = 'none';
            addCardsButtonContainer.style.display = 'none';
    
            // And unhide the card image container
            cardImageContainer.style.display = 'block';
        }
    });
    
    document.getElementById('addCardsButton').addEventListener('click', function() {
        console.log('Add Cards button clicked');
    
        const lines = document.getElementById('addCardTextInput').value.split('\n');
        console.log('Text input split into lines:', lines);
    
        const cardNamesWithQuantity = lines.map(line => {
            const match = line.trim().match(/^(\d+)x?\s+(.*)$/);
            if (match) {
                const quantity = parseInt(match[1], 10);
                const name = match[2];
                return { name, quantity };
            }
            return null;
        }).filter(card => card);
    
        console.log('Card names and quantities to add:', cardNamesWithQuantity);
    
        // Assume enhanceCardDataWithUIState is a function that formats the card data correctly
        const enhancedCards = cardNamesWithQuantity.map(card => enhanceCardDataWithUIState(card));
        console.log('Enhanced cards:', enhancedCards);
    
        // Just add the new cards to the currentCards array without saving to the server
        currentCards = [...currentCards, ...enhancedCards];
        console.log('Current cards after addition:', currentCards);
    
        // Update the UI to reflect the added cards
        populateCardList(currentCards);
        populateDeckSection(currentCards);
    
        // Clear the input field
        document.getElementById('addCardTextInput').value = '';
        
        // Optionally hide the add card container
        document.getElementById('addCardContainer').style.display = 'none';
        document.getElementById('addCardsButtonContainer').style.display = 'none';
    
        // If you have a function to show the updated current cards in the UI, call it here
        // updateUIWithCurrentCards(currentCards);
    });


        


    function updateCardImage(index, currentCards) {
        console.log('Current index:', index);
        console.log('Current cards length:', currentCards ? currentCards.length : 'currentCards is undefined');
    
        if (!currentCards || index < 0 || index >= (currentCards ? currentCards.length : 0)) {
            console.error('Invalid index or currentCards not available');
            return;
        }
    
        const card = currentCards[index];
        if (!card || !card.settings || !card.settings.normal_image_url) {
            console.error('Card or image URL not found for index', index);
            return;
        }
    
        const imageUrl = card.settings.normal_image_url;
        const cardImageContainer = document.getElementById('cardImageContainer');
        let img = cardImageContainer.querySelector('img');
        if (!img) {
            img = document.createElement('img');
            cardImageContainer.appendChild(img);
        }
        img.src = imageUrl;
    }
        
        
    
   
    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'loadDeckButton') {
            handleLoadDeckClick();
        }
    });



    // Check if the 'btn' element exists before adding the event listener
    if (btn) {
        btn.addEventListener('click', function() {
            fetchAndDisplayDeckNames(); // Call your function that fetches and displays the deck names
            popup.style.display = "block"; // Make sure to display the popup here or inside the fetchAndDisplayDeckNames function
        });
    } else {
        console.error('Button for opening the popup not found');
    }
    
 
    // Function to fetch and display deck names
    // Function to fetch and display deck names
    function fetchAndDisplayDeckNames() {
        const token = localStorage.getItem('token');
        console.log('Fetching deck names with token:', token);
    
        fetch('/get-deck-names', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            console.log('Response received:', response);
            if (!response.ok) {
                throw new Error(`Network response was not ok, status: ${response.status}`);
            }
            return response.json();
        })
        .then(decks => {
            console.log('Deck names fetched:', decks);
            const popupContent = document.querySelector('.popup-content');
            popupContent.innerHTML = '<span id="closePopup" class="close-btn">&times;</span><p>Decks:</p>';
    
            const close = document.getElementById("closePopup");
            if (close) {
                close.addEventListener('click', function() {
                    console.log('Closing deck popup');
                    document.getElementById("deckPopup").style.display = "none";
                });
            }
    
            const list = document.createElement('ul');
            decks.forEach((deck, index) => {
                console.log(`Processing deck: ${deck}`);
                const item = document.createElement('li');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `deck-${index}`;
                checkbox.value = deck;
                checkbox.name = 'decks';
    
                const label = document.createElement('label');
                label.htmlFor = `deck-${index}`;
                label.textContent = deck;
    
                item.appendChild(checkbox);
                item.appendChild(label);
                list.appendChild(item);
            });
    
            popupContent.appendChild(list);
            console.log('Decks displayed in popup');
    
            limitCheckboxSelections();
        })
        .catch(error => {
            console.error('Error fetching deck names:', error);
        });
    }

    function limitCheckboxSelections() {
        const checkboxes = document.querySelectorAll('#deckList input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                checkboxes.forEach(box => {
                    if (box !== checkbox) {
                        box.checked = false;
                    }
                });
            });
        });
    }

    // Function to add Load Decks button
    function addLoadDeckButton(popupContent) {
        let loadDeckButton = document.getElementById('loadDeckButton');
    
        // Create the button if it doesn't exist
        if (!loadDeckButton) {
            loadDeckButton = document.createElement('button');
            loadDeckButton.textContent = 'Load Deck';
            loadDeckButton.id = 'loadDeckButton';
            popupContent.appendChild(loadDeckButton);
        }
    
        // Show the button
        loadDeckButton.style.display = 'block';
    
        // Attach or re-attach the click event listener
        loadDeckButton.removeEventListener('click', handleLoadDeckClick); // Remove any existing listener to avoid duplicates
        loadDeckButton.addEventListener('click', handleLoadDeckClick);
        
    }
    
    function handleLoadDeckClick() {
        console.log('Load deck button clicked');
        clearCurrentDeckState();
        console.log('Cleared current deck state');
    
        const selectedCheckbox = document.querySelector('input[type="checkbox"][name="decks"]:checked');
        if (!selectedCheckbox) {
            console.log('No deck selected');
            alert('Please select a deck to load.');
            return;
        }
    
        currentDeckName = selectedCheckbox.value;
        console.log(`Deck selected: ${currentDeckName}`);
    
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, user must be logged in to load decks');
            return;
        }
    
        console.log(`Loading deck data for: ${currentDeckName}`);
        fetch(`/load-deck-data?deckName=${encodeURIComponent(currentDeckName)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            console.log('Received response from server');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(deckData => {
            console.log(`Received deck data for ${currentDeckName}:`, deckData);
            
            currentCards = updateLoadedDeckDataWithUIState(deckData.cards || []);
            console.log(`Updated current cards with UI state:`, currentCards);
    
            if (currentCards && currentCards.length > 0) {
                currentCardIndex = 0;
                console.log(`Displaying first card in main image container:`, currentCards[0]);
    
                displayInMainImageContainer(currentCards[0].settings.normal_image_url, currentCards[0]);
                updateUIForCard(currentCards[0]);
                populateCardList(currentCards);
                populateDeckSection(currentCards);
            } else {
                console.log('No cards found in the loaded deck');
            }
    
            document.getElementById("deckPopup").style.display = "none";
            console.log('Deck popup hidden');
        })
        .catch(error => {
            console.error('Error loading deck:', error);
        });
    }



    function updateLoadedDeckDataWithUIState(cards) {
        return cards.map(card => {
            if (!card.uiState) {
                card.uiState = {};
            }
            const defaultUIState = {
                checkboxes: {
                    returnLand: false,
                    entersTapped: false,
                    search: false,
                    and: false,
                    or: false
                },
                manaCounter: {
                    W: 0, U: 0, B: 0, R: 0, G: 0, C: 0
                },
                highlightedCards: [],
                Commander: false // Ensure this new property is added
            };
            // Ensure all default UI state properties exist
            card.uiState = { ...defaultUIState, ...card.uiState };
            return card;
        });
    }

    function clearCurrentDeckState() {
        currentCards = []; // Reset the current cards array
        currentCardIndex = 0; // Reset the current card index
        // Add any additional state resets here, if necessary
        // For example, resetting UI elements:
        const cardImageContainer = document.getElementById('cardImageContainer');
        cardImageContainer.innerHTML = ''; // Clear the card image container
        const cardList = document.getElementById('cardList');
        cardList.innerHTML = ''; // Clear the card list
        // You might also need to clear or reset other UI elements or state variables
    }
    
    
    
    function displayCardImages(cards) {
        const imageContainer = document.getElementById('cardImageContainer'); // Ensure you have this container in your HTML
        imageContainer.innerHTML = ''; // Clear existing images
    
        cards.forEach(card => {
            if (card.settings && card.settings.normal_image_url) {
                const img = document.createElement('img');
                img.src = card.settings.normal_image_url;
                img.alt = card.name;
                img.style.width = '200px'; // Set the image size as desired
                img.style.height = 'auto';
                img.style.margin = '10px'; // Add some space between images
    
                imageContainer.appendChild(img); // Append the new image to the container
            }
        });
    }
    
    function populateDeckSection(cards) {
        const deckSection = document.getElementById('deckSection');
        deckSection.innerHTML = '';
    
        cards.forEach((card, index) => {
            const img = document.createElement('img');
            img.src = card.settings.normal_image_url;
            img.alt = card.name;
            img.dataset.cardIndex = index;
            img.dataset.cardType = card.settings.type_line;
    
            img.addEventListener('click', function() {
                console.log('Image clicked:', card);
                currentCard = card;
                if (!currentCard.uiState) {
                    currentCard.uiState = { checkboxes: {}, manaCounter: {} };
                }
                console.log('Current card set to:', currentCard);
                displayInMainImageContainer(currentCard.settings.normal_image_url, currentCard);
                updateUIForCard(currentCard);
                clearHighlightedCardsUI();
                populateCardList(cards);
            });
    
            deckSection.appendChild(img);
        });
        // Automatically select the first card to display its details
                if (cards.length > 0) {
                    currentCard = cards[0];
                    displayInMainImageContainer(currentCard.settings.normal_image_url, currentCard);
                    updateUIForCard(currentCard);
            }
    }

         


    function populateCardList(cards) {
        const cardList = document.getElementById('cardList');
        cardList.innerHTML = ''; // Clear existing content
    
        cards.forEach(card => {
            const li = document.createElement('li');
            li.textContent = card.name; // Display only card name
    
            // Store the full card data as a JSON string in a data attribute
            li.dataset.cardData = JSON.stringify(card);
    
            // Highlight the card if it's in the highlightedCards array
            if (currentCard && currentCard.uiState.highlightedCards && currentCard.uiState.highlightedCards.includes(card.name)) {
                li.classList.add('highlighted');
            }
    
            li.addEventListener('click', function() {
                this.classList.toggle('highlighted');
    
                // Ensure highlightedCards array is initialized in the currentCard's uiState
                if (!currentCard.uiState.highlightedCards) {
                    currentCard.uiState.highlightedCards = [];
                }
    
                const highlightedIndex = currentCard.uiState.highlightedCards.indexOf(card.name);
                if (highlightedIndex > -1) {
                    currentCard.uiState.highlightedCards.splice(highlightedIndex, 1); // Remove if already highlighted
                } else {
                    currentCard.uiState.highlightedCards.push(card.name); // Add if not highlighted
                }
            });
    
            li.addEventListener('mouseover', function() {
                console.log('Mouseover event for card:', card);
                updateUIForSelectedCard(card);
            });
    
            cardList.appendChild(li);
        });
    }
    
    function updateUIForSelectedCard(card) {
        if (!card.uiState) {
            card.uiState = { checkboxes: {}, manaCounter: {} };
        }
        console.log('Updating UI for selected card:', card);
        const imageContainer = document.getElementById('selectedCardImageContainer');
        imageContainer.innerHTML = ''; // Clear existing image
    
        console.log('Current cards:', currentCards);
    
        // Find the card in the currentCards array to get the complete data
        const selectedCard = currentCards.find(c => c.name === card.name);
        console.log('Selected card data:', selectedCard);
    
        if (selectedCard && selectedCard.settings && selectedCard.settings.normal_image_url) {
            const img = document.createElement('img');
            img.src = selectedCard.settings.normal_image_url;
            img.alt = selectedCard.name;
            imageContainer.appendChild(img);
        } else {
            console.log('No matching card found or missing image URL');
            imageContainer.textContent = 'Image not available';
        }
    }
    
    document.getElementById('cardList').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('#cardList li');
    
        cards.forEach(card => {
            const name = card.textContent.toLowerCase();
            card.style.display = name.includes(searchTerm) ? '' : 'none';
        });
    });

    function createTabs() {
        // Only include main types initially
        const types = ["All", "Land", "Creature", "Artifact", "Enchantment", "Sorcery", "Instant", "Planeswalker", "Legendary"];
        const tabsContainer = document.getElementById('tabsContainer');
        
        tabsContainer.innerHTML = ''; // Clear existing tabs to prevent duplicates
    
        types.forEach(type => {
            const tab = document.createElement('button');
            tab.textContent = type;
            tab.classList.add('tab');
            tab.dataset.type = type;
            tabsContainer.appendChild(tab);
    
            tab.addEventListener('click', function() {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                if (type === "Land") {
                    // Show specific land types only when the Land tab is selected
                    createLandTypeTabs();
                } else {
                    // Remove specific land type tabs if any other tab is selected
                    removeLandTypeTabs();
                }
                filterCardsByType(type);
            });
        });
    }
    
    function createLandTypeTabs() {
        let landTabsContainer = document.getElementById('landTabsContainer');
    
        // If the container doesn't exist, create it dynamically
        if (!landTabsContainer) {
            landTabsContainer = document.createElement('div');
            landTabsContainer.id = 'landTabsContainer';
            // Directly apply CSS styles to the container
            landTabsContainer.style.display = 'flex';
            landTabsContainer.style.justifyContent = 'center';
            landTabsContainer.style.flexWrap = 'wrap';
            landTabsContainer.style.marginTop = '10px';
            landTabsContainer.style.padding = '5px 0';
            landTabsContainer.style.backgroundColor = '#e8e8e8';
            landTabsContainer.style.borderRadius = '6px';
            landTabsContainer.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            document.getElementById('tabsContainer').after(landTabsContainer); // Place it right after the main tabs container
        } else {
            // Clear the container if it already exists to avoid duplicate tabs
            landTabsContainer.innerHTML = '';
            // Ensure it's visible
            landTabsContainer.style.display = 'flex';
        }
    
        const landTypes = ["Forest", "Island", "Plains", "Swamp", "Mountain", "Basic"];
        landTypes.forEach(type => {
            const tab = document.createElement('button');
            tab.textContent = type;
            tab.classList.add('tab', 'land-tab'); // Re-use 'tab' class for consistency, 'land-tab' for specific styling
            tab.dataset.type = type;
            // Directly apply CSS styles to land type tabs for differentiation
            tab.style.padding = '1px 4px';
            tab.style.fontSize = '14px';
            tab.style.margin = '2px';
            tab.style.backgroundColor = '#d9d9d9';
    
            tab.addEventListener('click', function() {
                document.querySelectorAll('.land-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                filterCardsByType(type);
            });
    
            landTabsContainer.appendChild(tab);
        });
    }
    
    function removeLandTypeTabs() {
        const landTabsContainer = document.getElementById('landTabsContainer');
        if (landTabsContainer) {
            landTabsContainer.style.display = 'none'; // Hide the container instead of removing it
        }
    }
    
    function filterCardsByType(type) {
        const cardListItems = document.querySelectorAll('#cardList li');
        cardListItems.forEach(li => {
            // Parse the data attribute back into an object
            const cardData = JSON.parse(li.dataset.cardData);
    
            let isVisible = false;
            if (type === "All") {
                isVisible = true;
            } else {
                // Determine if the card should be visible based on the filter type
                const cardTypeLine = cardData.settings?.type_line?.toLowerCase() || "";
                if (type === "Land" && cardTypeLine.includes("land")) {
                    isVisible = true; // Show all lands for the "Land" tab
                } else if (cardTypeLine.includes(type.toLowerCase())) {
                    // This will handle specific land types (e.g., "Forest", "Swamp")
                    isVisible = true;
                }
            }
    
            // Show or hide the list item based on the filter result
            li.style.display = isVisible ? "" : "none";
        });
    }



    

    function clearHighlightedCardsUI() {
        const cardListItems = document.querySelectorAll('#cardList li');
        cardListItems.forEach(li => {
            li.classList.remove('highlighted');
        });
    }

    function createDeckFilterTabs() {
        console.log('Creating deck filter tabs...'); // Diagnostic message
        const types = ["All", "Land", "Creature", "Artifact", "Enchantment", "Sorcery", "Instant", "Planeswalker", "Legendary"];
        const tabsContainer = document.getElementById('deckTabsContainer'); // Assuming you have a separate container for these tabs
    
        types.forEach(type => {
            const tab = document.createElement('button');
            tab.textContent = type;
            tab.classList.add('deck-tab'); // Using a different class name to avoid styling conflicts
            tab.dataset.type = type;
            tabsContainer.appendChild(tab);
    
            // Add click event to filter deck images by card type
            tab.addEventListener('click', function() {
                document.querySelectorAll('.deck-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                filterDeckImagesByType(type);
            });
        });
    }
    
    function filterDeckImagesByType(type) {
        console.log(`Filtering images by type: ${type}`);
        const images = document.querySelectorAll('#deckSection img');
        let firstVisibleImage = null;
    
        images.forEach(img => {
            // Assuming cardType is stored correctly on each img
            const cardType = img.dataset.cardType.toLowerCase();
            if (type === "All" || cardType.includes(type.toLowerCase())) {
                img.style.display = '';
                if (!firstVisibleImage) firstVisibleImage = img; // Capture the first visible image
            } else {
                img.style.display = 'none'; // Hide images of other types
            }
        });
    
        // If there's a visible image, simulate a click to set it as the current card
        if (firstVisibleImage) {
            firstVisibleImage.click(); // This assumes your click event listener on the images handles setting the current card and updating UI
        } else {
            // Handle case where no images are visible (e.g., if filtering leaves no matches)
            // This could be clearing the current card display or showing a placeholder
            console.log('No matching cards found for the selected type.');
        }
    }
    

    // Assume this function is called when a card is clicked to display its details
    function displayInMainImageContainer(imageSrc, cardData) {
        const cardImageContainer = document.getElementById('cardImageContainer');
        cardImageContainer.innerHTML = ''; // Clear existing content

        const img = document.createElement('img');
        img.src = imageSrc;
        img.dataset.cardData = JSON.stringify(cardData); // Store card data in dataset for access in event listeners
        cardImageContainer.appendChild(img);

        // Display the UI state for the selected card
        displaySelectedCardUI(cardData);
    }

    function updateUIForCard(cardData) {
        // Update checkboxes
        Object.keys(cardData.uiState.checkboxes).forEach(key => {
            const checkbox = document.querySelector(`input[name="options"][value="${key}"]`);
            if (checkbox) checkbox.checked = cardData.uiState.checkboxes[key];
        });
    
        // Update mana counters
        const manaCounterMappings = {
            W: 'whiteMana',
            U: 'blueMana',
            B: 'blackMana',
            R: 'redMana',
            G: 'greenMana',
            C: 'colorlessMana'
        };
        Object.entries(cardData.uiState.manaCounter).forEach(([key, value]) => {
            const manaInputId = manaCounterMappings[key]; // Map the key to the input's ID
            const manaInput = document.getElementById(manaInputId);
            if (manaInput) manaInput.value = value;
        });
    }
    

    function enhanceCardDataWithUIState(cardData) {
        return cardData.map(card => {
            // Check if `uiState` exists, if not, initialize it
            if (!card.uiState) {
                card.uiState = {
                    checkboxes: {
                        returnLand: false,
                        entersTapped: false,
                        search: false,
                        and: false,
                        or: false
                    },
                    manaCounter: {
                        W: 0, U: 0, B: 0, R: 0, G: 0, C: 0
                    },
                    highlightedCards: card.uiState?.highlightedCards || [],
                    Commander: false,
                };
            } else {
                // If `uiState` exists but doesn't have `highlightedCards`, initialize it
                card.uiState.highlightedCards = card.uiState.highlightedCards || [];
            }
            return card;
        });
    }

    function resetManaCounters() {
        const manaTypes = ['white', 'blue', 'black', 'red', 'green', 'colorless', 'total']; // Add or remove types as necessary
        manaTypes.forEach(type => {
            const inputElement = document.getElementById(`${type}Mana`);
            if (inputElement) {
                inputElement.value = 0;
            }
        });
    }

    // Function to display the selected card's UI state
    function displaySelectedCardUI(cardData) {
        // Check if uiState exists in cardData
        if (!cardData.uiState) {
            cardData.uiState = { checkboxes: {}, manaCounter: {} };
        }
        if (!cardData.uiState) {
            console.error('uiState is undefined in cardData');
            return; // Exit the function if uiState is not found
        }
    
        // Update checkboxes based on uiState
        Object.entries(cardData.uiState.checkboxes).forEach(([key, value]) => {
            const checkbox = document.querySelector(`input[name="options"][value="${key}"]`);
            if (checkbox) checkbox.checked = value;
        });
    
        // Update mana counters based on uiState
        const manaCounterMappings = {
            W: 'whiteMana',
            U: 'blueMana',
            B: 'blackMana',
            R: 'redMana',
            G: 'greenMana',
            C: 'colorlessMana'
        };
        
        Object.entries(cardData.uiState.manaCounter).forEach(([key, value]) => {
            const manaInputId = manaCounterMappings[key]; // Map the key to the input's ID
            const manaInput = document.getElementById(manaInputId);
            if (manaInput) manaInput.value = value;
        });
    }

    // Example event listener for checkboxes (you need to adapt this to your specific setup)
    // Adjusted event listener for checkboxes to correctly update the uiState
    document.querySelectorAll('input[name="options"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (currentCard) {
                currentCard.uiState.checkboxes[this.value] = this.checked;
            }
        });
    });
    
    const manaCounterInputs = {
        whiteMana: 'W',
        blueMana: 'U',
        blackMana: 'B',
        redMana: 'R',
        greenMana: 'G',
        colorlessMana: 'C'
    };
    
    Object.entries(manaCounterInputs).forEach(([inputId, shorthand]) => {
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            inputElement.addEventListener('input', function() {
                if (currentCard) {
                    // Ensure the uiState.manaCounter object exists
                    currentCard.uiState.manaCounter = currentCard.uiState.manaCounter || {};
                    
                    // Use the shorthand notation for the key
                    currentCard.uiState.manaCounter[shorthand] = parseInt(this.value) || 0;
                }
            });
        }
    });

    // Saving changes to the server
    // Saving changes to the server
    document.getElementById('saveDetails').addEventListener('click', function() {
        const token = localStorage.getItem('token');
        console.log('Save Details button clicked');
    
        if (!token) {
            console.error('No token found, user must be logged in to save decks');
            return;
        }
        
        console.log('Preparing to save the deck');
        // Enhance the card data with the current UI state before saving
        const enhancedCards = currentCards.map(card => {
            return { ...card, uiState: card.uiState };
        });
        
        console.log('Sending save request to the server');
        fetch('/save-deck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ deckName: currentDeckName, cards: enhancedCards }),
        })
        .then(response => {
            console.log('Response received from the server');
            if (!response.ok) {
                throw new Error(`Network response was not ok, status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Deck saved successfully:', data);
        })
        .catch(error => {
            console.error('Error saving deck:', error);
        });
    });

    // Function to update the UI for mana counters
    function updateManaCounterUI() {
        const manaTypes = ['white', 'blue', 'black', 'red', 'green', 'colorless']; // Corresponds to the IDs of your inputs

        manaTypes.forEach(manaType => {
            const inputElement = document.getElementById(`${manaType}Mana`);
            if (inputElement) {
                inputElement.addEventListener('input', function() {
                    if (currentCard) {
                        // Ensure uiState.manaCounter exists or initialize it
                        currentCard.uiState.manaCounter = currentCard.uiState.manaCounter || {};
                        // Update the mana counter for this type
                        currentCard.uiState.manaCounter[manaType] = parseInt(this.value) || 0;
                    }
                });
            }
        });
    }

    document.getElementById('clearCardDetails').addEventListener('click', function() {
        // Check if there is a current card selected
        if (!currentCard) {
            console.log('No card selected.');
            return;
        }
    
        // Reset checkboxes
        Object.keys(currentCard.uiState.checkboxes).forEach(key => {
            currentCard.uiState.checkboxes[key] = false;
        });
    
        // Reset mana counters
        Object.keys(currentCard.uiState.manaCounter).forEach(key => {
            currentCard.uiState.manaCounter[key] = 0;
        });
    
        // Reset highlighted cards
        currentCard.uiState.highlightedCards = [];
    
        // Update UI to reflect these changes
        updateUIForCard(currentCard);

        // Optionally, call the function that refreshes the card list UI if you have one
        populateCardList(currentCards);
    });

    document.getElementById('clearDeckDetails').addEventListener('click', function() {
        // Check if there are any cards in the deck
        if (!currentCards || currentCards.length === 0) {
            console.log('No cards in the deck.');
            return;
        }
    
        // Create a copy of the current cards array to avoid modifying the original
        const tempCards = currentCards.map(card => ({ ...card }));
    
        // Iterate over all cards in the temporary array
        tempCards.forEach(card => {
            // Reset checkboxes
            Object.keys(card.uiState.checkboxes).forEach(key => {
                card.uiState.checkboxes[key] = false;
            });
    
            // Reset mana counters
            Object.keys(card.uiState.manaCounter).forEach(key => {
                card.uiState.manaCounter[key] = 0;
            });
    
            // Reset highlighted cards
            card.uiState.highlightedCards = [];
        });
    
        // Update UI to reflect these changes for the current card
        if (currentCard) {
            const tempCurrentCard = tempCards.find(card => card.name === currentCard.name);
            updateUIForCard(tempCurrentCard);
        }
    
        // Refresh the card list UI with the temporary cards
        populateCardList(tempCards);
    
        // Refresh the deck section UI with the temporary cards
        populateDeckSection(tempCards);
    });

    document.getElementById('commanderButton').addEventListener('click', function() {
        if (currentCard) {
            // Set the Commander property of the current card to true
            currentCard.uiState.Commander = true;
            console.log(`${currentCard.name} is now set as a Commander.`);
    
            // Optional: Update the UI to reflect this change
            // This might involve highlighting the card, updating a text label, etc.
        } else {
            console.log('No card selected.');
            // Optionally, display a message to the user indicating no card is selected
        }
    });

    document.getElementById('RemoveCard').addEventListener('click', function() {
        // Check if there is a current card selected
        if (!currentCard) {
            console.log('No card selected.');
            return;
        }
    
        // Find the index of the current card in the currentCards array
        const currentCardIndex = currentCards.findIndex(card => card.name === currentCard.name);
    
        if (currentCardIndex !== -1) {
            // Remove the current card from the currentCards array
            currentCards.splice(currentCardIndex, 1);
    
            // Update the UI to reflect the changes
            updateCardImage(0); // Display the first card in the deck
            populateCardList(currentCards); // Update the card list display
            populateDeckSection(currentCards); // Update the deck section with card images
    
            // Reset the current card variable
            currentCard = null;
    
            // Clear the card details for the removed card
            clearCardDetails();
        }
    });

    document.getElementById('deleteDeckButton').addEventListener('click', function() {
        console.log('Delete button clicked');
    
        // Select the checked checkbox within the elements with name 'decks'
        const selectedCheckbox = document.querySelector('input[type="checkbox"][name="decks"]:checked');
        if (!selectedCheckbox) {
            console.log('No deck selected for deletion');
            alert('Please select a deck to delete.');
            return;
        }
    
        const deckName = selectedCheckbox.value;
        console.log('Deck name to delete:', deckName);
    
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, user must be logged in to delete decks');
            return;
        }
    
        console.log(`Attempting to delete deck: ${deckName}`);
        fetch(`/delete-deck?name=${encodeURIComponent(deckName)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete deck');
            }
            return response.json();
        })
        .then(data => {
            console.log('Deck deleted:', data);
            selectedCheckbox.parentElement.remove(); // Remove the deleted deck from the UI
        })
        .catch(error => console.error('Error deleting deck:', error));
    });
    
        
    // Ensure limitCheckboxSelections is called after checkboxes are rendered
    fetchAndDisplayDeckNames().then(() => {
        limitCheckboxSelections();
    });

});
