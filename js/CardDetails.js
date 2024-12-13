document.addEventListener('DOMContentLoaded', function() {
    var backToGameButton = document.getElementById('BacktoGame');
    var editDeckButton = document.getElementById('EditDeck'); // Get the EditDeck button
    var cardSearchButton = document.getElementById('CardSearch'); // Get the Card Search button
    let tempCardNames = [];
    let currentCardIndex = 0; // Tracks the current card index
    let currentCards = []; // Global variable to store cards data
    var btn = document.getElementById("importDeck");
    var popup = document.getElementById("deckPopup"); // Ensure this is accessible
    resetManaCounters();
    let highlightedCards = [];
    let originalSearchResults = [];
    var currentCard; // This will hold the currently selected card's data
    let currentDeckName = ""; // Initially empty or you could set a default value
    const deckNameInput = document.getElementById('deckNameInput2');
    var getSimilar = document.getElementById('getSimilar');
    let wordsToInclude = [];
    let wordsToExclude = [];
    let activeFilters = {
        minPercentage: null,
        maxPercentage: null,
        wordsToInclude: [],
        wordsToExclude: []
    };
    let globalFilters = {
        includeWords: new Set(),
        excludeWords: new Set()
    };
    let filters = {
        minPercentage: null,
        maxPercentage: null,
        words: new Set()
    };

    const simulatedDeckFeatures = {
        quantity: "Whichever card is being shown above the Quantity number will be added to the deck when you increase the number greater then 0.",
        oneTurn: "Use these to switch between searching for cards and editing your deck.",
        similarcards: "Press the Set Similar Cards button to set the card displayed to the right if you want to sort the cards in the search section by whichever cards are the most similar to the selected card. It will sort by most percentage of words in common with the selected card.",
        wordfilter: "When you select a card with the Set Similar Cards button, all the key words in the card description will be populated here. Each word will have a plus or minus sign on each side. The plus sign will populate the search sections with cards that have that same word in the descripter, and pressing the minus sign will exclude any cards that have that word.",
        autoPlaySwitch: "The cards that fit your search parameters will be populated in this section. They will be sorted by converted mana cost, lowest to highest, unless using other sorting features.",
        sections: "This search area will tell you how many cards fit your search parameters, including cards that are similar to the card selected with the Set Similar Cards button, and what words should be included or excluded from the search section.",
    };
    // Function to show feature descriptions with overlay
    function displayFeatureDescriptions() {
        const container = document.getElementById('featureDescriptionsContainer');
        container.innerHTML = ''; // Clear previous content

        // Set z-index to 3000
        container.style.zIndex = '3000';

        // Update all labels to match the desired style
        const labels = document.querySelectorAll('.label');
        labels.forEach(label => {
            label.style.color = 'rgb(255, 255, 255)';
            label.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.4)';
            label.style.fontWeight = 'bold';
            label.style.zIndex = '2001'; // Ensure it is above other elements
        });

        // Update #manaCounter font styles
        const manaCounter = document.getElementById('manaCounter');
        if (manaCounter) {
            manaCounter.style.color = 'rgb(255, 255, 255)';
            manaCounter.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.4)';
            manaCounter.style.fontWeight = 'bold';
        }

        // Update .scrollbox label font styles
        const scrollboxLabels = document.querySelectorAll('.scrollbox label');
        scrollboxLabels.forEach(label => {
            label.style.color = 'rgb(255, 255, 255)';
            label.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.4)';
            label.style.fontWeight = 'bold';
        });

        // Update #navigation span font styles
        const navigationSpans = document.querySelectorAll('#navigation span');
        navigationSpans.forEach(span => {
            span.style.color = 'rgb(255, 255, 255)';
            span.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.4)';
        });

        // Create a semi-transparent overlay if it doesn't exist
        let overlay = document.getElementById('featureOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'featureOverlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            overlay.style.zIndex = '2000';
            overlay.style.pointerEvents = 'none'; // Make overlay non-interactive
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'block'; // Show the overlay

        // Dynamically populate feature descriptions
        Object.keys(simulatedDeckFeatures).forEach((featureId) => {
            // Create description div
            const description = document.createElement('div');
            description.className = `${featureId}-description feature-description`;
            description.textContent = simulatedDeckFeatures[featureId];

            // Style the description
            description.style.position = 'absolute';
            description.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            description.style.padding = '10px';
            description.style.borderRadius = '5px';
            description.style.zIndex = '3002';
            description.style.pointerEvents = 'auto'; // Make descriptions interactive

            // Position descriptions dynamically (if needed, set fixed positions instead)
            const descriptionPosition = document.querySelector(`.${featureId}-description`)?.getBoundingClientRect();
            if (descriptionPosition) {
                description.style.top = `${descriptionPosition.top}px`;
                description.style.left = `${descriptionPosition.left}px`;
            }

            // Append description
            container.appendChild(description);

            // Create line element
            const line = document.createElement('div');
            line.className = `${featureId}-line feature-line`;
            line.style.zIndex = '3001';

            // Position lines dynamically
            const linePosition = document.querySelector(`.${featureId}-line`)?.getBoundingClientRect();
            if (linePosition) {
                line.style.top = `${linePosition.top}px`;
                line.style.left = `${linePosition.left}px`;
            }

            container.appendChild(line); // Append the line to the container
        });

        container.style.display = 'block'; // Show the container
    }

    // Function to hide feature descriptions and overlay
    function hideFeatureDescriptions() {
        const container = document.getElementById('featureDescriptionsContainer');
        container.style.display = 'none'; // Hide the container and its contents

        // Reset z-index to 1000
        container.style.zIndex = '1000';

        // Reset all labels to their original styles
        const labels = document.querySelectorAll('.label');
        labels.forEach(label => {
            label.style.color = ''; // Reset to default
            label.style.textShadow = ''; // Reset to default
            label.style.fontWeight = ''; // Reset to default
            label.style.zIndex = ''; // Reset to default
        });

        // Reset #manaCounter font styles
        const manaCounter = document.getElementById('manaCounter');
        if (manaCounter) {
            manaCounter.style.color = ''; // Reset to default color
            manaCounter.style.textShadow = ''; // Reset to default text shadow
            manaCounter.style.fontWeight = ''; // Reset to default weight
        }

        // Reset .scrollbox label font styles
        const scrollboxLabels = document.querySelectorAll('.scrollbox label');
        scrollboxLabels.forEach(label => {
            label.style.color = ''; // Reset to default
            label.style.textShadow = ''; // Reset to default
            label.style.fontWeight = ''; // Reset to default
        });

        // Reset #navigation span font styles
        const navigationSpans = document.querySelectorAll('#navigation span');
        navigationSpans.forEach(span => {
            span.style.color = ''; // Reset to default
            span.style.textShadow = ''; // Reset to default
        });

        const overlay = document.getElementById('featureOverlay');
        if (overlay) {
            overlay.style.display = 'none'; // Hide the overlay
        }
    }

    // Function to toggle feature descriptions and overlay
    function toggleFeatureDescriptions() {
        const container = document.getElementById('featureDescriptionsContainer');
        const isVisible = container.style.display === 'block';

        if (isVisible) {
            hideFeatureDescriptions(); // Hide descriptions and overlay
        } else {
            displayFeatureDescriptions(); // Show descriptions and overlay

            // Ensure all feature-description elements are visible
            const descriptions = container.querySelectorAll('.feature-description');
            descriptions.forEach((desc) => {
                desc.style.display = 'block'; // Explicitly unhide each description
            });
        }
    }

    // Attach the toggle function to the button click event
    document.getElementById('showFeaturesButton').addEventListener('click', toggleFeatureDescriptions);

    const simulatedEditDeckFeatures = {
        quantity: "You can sort the cards in your deck by card type by clicking the corrisponding tab. You can also set the current card being shown as the commander by clicking the Commander button. You can set the number of the selected card in your deck with the number box to the right.",
        oneTurn: "Use these to switch between searching for cards and editing your deck.",
        similarcards: "This is where you can set the card data. It is mostly used for cards that either produce mana or search for other cards. First check is for if the card returns a land to you hand, the second is if the card enters tapped and can't produce mana the first turn, the third is for if the card searches for something, the fourth is if the card produces all the mana that is put in the quantites below, and the last check is if the card only produces 1 mana. There may be certain cards that don't work perfectly with this, so you may need to watch for those cases.",
        wordfilter: "This will be populated with all the cards in your deck, and you can select any card as a card that is able to be searched by the selected card to the right.",
        autoPlaySwitch: "The cards in your deck will be populated here.",
        loaddeck: "Use these buttons to load in your deck, or open up a deck you have saved. You can also remove the card, save the details of all the cards, and clear the selected cards details and clear all the deck details.",
        sections: "This is where you can set what mana the selected card can produce. This refers to the max type of mana it can produce, not the total mana. If a card can produce 1 red OR 1 green, you would put 1 for both red or green.",
    };
    
    // Updated function to show deck feature descriptions with overlay
    // Function to show deck feature descriptions with overlay
function displayDeckFeatureDescriptions() {
    const container = document.getElementById('deckFeatureDescriptionsContainer');
    container.innerHTML = ''; // Clear previous content

    // Set z-index to make it visible
    container.style.zIndex = '3000';

    // Create and display the overlay
    let overlay = document.getElementById('deckFeatureOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'deckFeatureOverlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.zIndex = '2000';
        overlay.style.pointerEvents = 'none';
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'block';

    // Populate the descriptions and lines
    Object.keys(simulatedEditDeckFeatures).forEach((featureId) => {
        // Create description div
        const description = document.createElement('div');
        description.className = `deck-${featureId}-description deck-feature-description`;
        description.textContent = simulatedEditDeckFeatures[featureId];

        // Style the description
        description.style.position = 'absolute';
        description.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        description.style.padding = '10px';
        description.style.borderRadius = '5px';
        description.style.zIndex = '3002';
        description.style.pointerEvents = 'auto';

        // Position descriptions dynamically
        const descriptionPosition = document.querySelector(`.deck-${featureId}-description`)?.getBoundingClientRect();
        if (descriptionPosition) {
            description.style.top = `${descriptionPosition.top}px`;
            description.style.left = `${descriptionPosition.left}px`;
        }

        container.appendChild(description);

        // Create line element
        const line = document.createElement('div');
        line.className = `deck-${featureId}-line deck-feature-line`;

        // Style the line
        line.style.position = 'absolute';
        line.style.backgroundColor = 'green';
        line.style.width = '2px';
        line.style.zIndex = '3001';
        line.style.pointerEvents = 'none';

        // Position lines dynamically
        const linePosition = document.querySelector(`.deck-${featureId}-line`)?.getBoundingClientRect();
        if (linePosition) {
            line.style.top = `${linePosition.top}px`;
            line.style.left = `${linePosition.left}px`;
        }

        container.appendChild(line); // Append the line to the container
    });

    container.style.display = 'block';
}

// Function to hide deck feature descriptions
function hideDeckFeatureDescriptions() {
    const container = document.getElementById('deckFeatureDescriptionsContainer');
    container.style.display = 'none'; // Hide the descriptions

    const overlay = document.getElementById('deckFeatureOverlay');
    if (overlay) {
        overlay.style.display = 'none'; // Hide the overlay
    }
}

// Function to toggle deck feature descriptions
function toggleDeckFeatureDescriptions() {
    const container = document.getElementById('deckFeatureDescriptionsContainer');
    const isVisible = container.style.display === 'block';

    if (isVisible) {
        hideDeckFeatureDescriptions();
    } else {
        displayDeckFeatureDescriptions();
    }
}

// Attach event listener to the button
document.getElementById('showDeckFeaturesButton').addEventListener('click', toggleDeckFeatureDescriptions);

    
    

    if (searchButton) {
        searchButton.addEventListener('click', function() {
            console.log('Search button clicked outside DOMContentLoaded');
            handleSearch();
        });
    } else {
        console.log('Search button not found outside DOMContentLoaded');
    }
   
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

    // Add event listener for EditDeck button
    if (editDeckButton) {
        editDeckButton.addEventListener('click', function() {
            console.log('EditDeck button clicked'); // This will log when the EditDeck button is clicked
            makeElementsVisible();
        });
    } else {
        console.error('EditDeck button not found');
    }
    

    if (cardSearchButton) {
        cardSearchButton.addEventListener('click', function() {
            hideElements();
        });
    } else {
        console.error('Card Search button not found');
    }

    if (getSimilar) {
        getSimilar.addEventListener('click', function() {
            setsearchimage();
        });
    } else {
        console.log('Get Similar button not found');
    }

    document.getElementById('clearFilters').addEventListener('click', function() {
        // Reset filter settings
        activeFilters = {
            minPercentage: null,
            maxPercentage: null,
            wordsToInclude: [],
            wordsToExclude: []
        };
        applyFilters(); // Reapply filters which effectively resets to show all original results
        console.log('All filters cleared and original search results displayed.');
    });


    function setsearchimage() {
        console.log('Setting search image...');
        const searchImageContainer = document.getElementById('searchImageContainer');
        const similarCardImageContainer = document.getElementById('similarCardImageContainer');
        const wordFilterContainer = document.getElementById('wordFilterContainer');
    
        similarCardImageContainer.innerHTML = ''; // Clear the container
        wordFilterContainer.innerHTML = ''; // Clear the word filters
    
        console.log('Checking if searchImageContainer has child nodes...');
        if (searchImageContainer.hasChildNodes()) {
            const image = searchImageContainer.querySelector('img');
            if (image && image.dataset.cardData) {
                const cardData = JSON.parse(image.dataset.cardData);
                console.log('Card data for similar:', cardData);
    
                // Clone the image node
                const clonedImage = image.cloneNode(true);
                similarCardImageContainer.appendChild(clonedImage);
                console.log('Cloned image added to similarCardImageContainer');
    
                // Remove text in parentheses from oracle text before processing
                const oracleTextWithoutParentheses = cardData.oracle_text.replace(/\(.*?\)/g, '');
                console.log('Processed oracle text:', oracleTextWithoutParentheses);
    
                // Split oracle text into words and create buttons
                const oracleWords = new Set(oracleTextWithoutParentheses.split(/\s+/)); // Use Set to avoid duplicate words
                console.log('Unique words extracted:', [...oracleWords]);
                oracleWords.forEach(word => {
                    console.log(`Processing word: ${word}`);
                    const wordFilter = document.createElement('div');
                    wordFilter.className = 'word-filter';
    
                    const plusButton = document.createElement('button');
                    plusButton.textContent = '+';
                    plusButton.className = 'plus-button'; // Assign specific class for styling
    
                    const minusButton = document.createElement('button');
                    minusButton.textContent = '-';
                    minusButton.className = 'minus-button'; // Assign specific class for styling
    
                    // Plus button click event
                    plusButton.addEventListener('click', () => {
                        console.log(`Plus clicked for word: ${word}`);
                        if (minusButton.classList.contains('selected')) {
                            minusButton.classList.remove('selected');
                        }
                        plusButton.classList.toggle('selected');
                        addWordFilter(word, true);
                    });
    
                    // Minus button click event
                    minusButton.addEventListener('click', () => {
                        console.log(`Minus clicked for word: ${word}`);
                        if (plusButton.classList.contains('selected')) {
                            plusButton.classList.remove('selected');
                        }
                        minusButton.classList.toggle('selected');
                        addWordFilter(word, false);
                    });
    
                    wordFilter.appendChild(plusButton); // Add plus button before the word
                    wordFilter.appendChild(document.createTextNode(word)); // Add the word text
                    wordFilter.appendChild(minusButton); // Add minus button after the word
    
                    wordFilterContainer.appendChild(wordFilter);
                    console.log('Word filter added to wordFilterContainer');
                });
    
            } else {
                console.log('No card data found in search image container');
            }
        } else {
            console.log('Search image container is empty');
        }
    }

    
    
    
    function addWordFilter(word, isInclude) {
        console.log(`Adjusting word filter. Word: ${word}, Include: ${isInclude}`);
    
        if (isInclude) {
            if (globalFilters.includeWords.has(word)) {
                globalFilters.includeWords.delete(word);
                console.log(`Word "${word}" removed from include filters.`);
            } else {
                globalFilters.includeWords.add(word);
                globalFilters.excludeWords.delete(word);
                console.log(`Word "${word}" added to include filters.`);
            }
        } else {
            if (globalFilters.excludeWords.has(word)) {
                globalFilters.excludeWords.delete(word);
                console.log(`Word "${word}" removed from exclude filters.`);
            } else {
                globalFilters.excludeWords.add(word);
                globalFilters.includeWords.delete(word);
                console.log(`Word "${word}" added to exclude filters.`);
            }
        }
    
        console.log(`Current include filters:`, Array.from(globalFilters.includeWords));
        console.log(`Current exclude filters:`, Array.from(globalFilters.excludeWords));
        
        applyAllFilters();  // Reapply all filters with the updated state
    }

    function updateFilterByPercentage(minPercentage, maxPercentage) {
        console.log(`Updating filters for percentage range. Min: ${minPercentage}, Max: ${maxPercentage}`);
        
        // Setting the active filter ranges for minimum and maximum percentages
        activeFilters.minPercentage = minPercentage;
        activeFilters.maxPercentage = maxPercentage;
    
        console.log(`Filters set to active:`, activeFilters);
    
        // Applying the filters to the current dataset
        console.log('Applying filters based on updated percentage criteria...');
        applyFilters();
    }
    
    
    function updateFilterByWord(includeWords, excludeWords) {
        activeFilters.wordsToInclude = includeWords;
        activeFilters.wordsToExclude = excludeWords;
        applyFilters();
    }

   
    
    function filterCardsByWord() {
        const similarCardImageContainer = document.getElementById('similarCardImageContainer');
        const similarImage = similarCardImageContainer.querySelector('img');
    
        if (!similarImage || !similarImage.dataset.cardData) {
            console.log('No similar card data available for filtering.');
            return;
        }
    
        const similarCardData = JSON.parse(similarImage.dataset.cardData);
        const words = similarCardData.oracle_text.replace(/\(.*?\)/g, '').toLowerCase().split(/\s+/);
    
        // Assuming words to exclude are stored somewhere or you provide them
        const wordsToExclude = []; // Modify as needed
    
        updateFilterByWord(words, wordsToExclude);
    }
    

    createTabs();
    createDeckFilterTabs();

    createPercentageTabs();

    function createPercentageTabs() {
        const percentageTabsContainer = document.getElementById('percentageTabsContainer');
        percentageTabsContainer.innerHTML = ''; // Clear existing tabs
    
        // Add 'All' tab
        const allTab = document.createElement('button');
        allTab.className = 'tab';
        allTab.textContent = 'All';
        percentageTabsContainer.appendChild(allTab);
        allTab.addEventListener('click', function() {
            filters.minPercentage = 0; // Set minimum percentage to 0
            filters.maxPercentage = 100; // Set maximum percentage to 100
            populateSearchSection(originalSearchResults); // Repopulate with original results
        });
    
        for (let i = 100; i >= 10; i -= 10) {
            const tab = document.createElement('button');
            tab.className = 'tab';
            tab.textContent = `${i}-${i - 9}%`;
            tab.dataset.rangeMin = i - 9;
            tab.dataset.rangeMax = i;
            percentageTabsContainer.appendChild(tab);
    
            tab.addEventListener('click', function() {
                filters.minPercentage = parseInt(this.dataset.rangeMin);
                filters.maxPercentage = parseInt(this.dataset.rangeMax);
                filterCardsByPercentage(filters.minPercentage, filters.maxPercentage);
            });
        }
    }
    


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
        var deckNameInput2 = document.getElementById('deckNameInput2'); // Get the deck name input
    
        if (cardInputContainer.style.display === 'none') {
            // If the card input container is currently hidden, show it
            cardInputContainer.style.display = 'block';
    
            // And ensure the card image container and add card container are hidden
            cardImageContainer.style.display = 'none';
            addCardContainer.style.display = 'none';
            addCardsButtonContainer.style.display = 'none';
    
            // Make the deck name input visible
            deckNameInput2.style.display = 'block'; // Show the deck name input
        } else {
            // If the card input container is currently shown, hide it
            cardInputContainer.style.display = 'none';
    
            // And unhide the card image container
            cardImageContainer.style.display = 'block';
    
            // Hide the deck name input
            deckNameInput2.style.display = 'none'; // Hide the deck name input
        }
    
        // Call askForDeckName to show the deck name input alongside
        askForDeckName(); // This ensures the deck name input is shown when Import Cards is clicked
    });
    

    document.getElementById('saveDetails').addEventListener('click', function() {
        const cards = currentCards;  // Assuming this variable holds your card data.
    
        if (!currentDeckName) {
            console.log('No deck name specified.');
            document.getElementById('deckNameModal').style.display = 'block'; // Show the modal if no deck name is set
            return;
        }
    
        saveDeck(currentDeckName, cards);
    });
    
    document.getElementById('saveDeckNameButton').addEventListener('click', function() {
        const deckName = document.getElementById('deckNameInput').value; // Get the deck name from the modal input
    
        if (!deckName) {
            console.error('No deck name entered in the modal.');
            alert('Please enter a deck name.');
            return;
        }
    
        console.log(`Deck name entered: ${deckName}, proceeding to save.`);
        saveDeck(deckName, currentCards);
    
        document.getElementById('deckNameModal').style.display = 'none'; // Hide the modal once saved
    });
    
        
    function askForDeckName() {
        console.log('Asking for deck name...');
        var deckNameInput = document.getElementById('deckNameInput');
        if (deckNameInput) deckNameInput.style.display = 'block'; // Make the input visible
    }

    document.addEventListener('dblclick', function() {
        console.log('Current cards:', currentCards);
        console.log('Current deck name:', currentDeckName);
    
        const similarCardImageContainer = document.getElementById('similarCardImageContainer');
        if (similarCardImageContainer) {
            const image = similarCardImageContainer.querySelector('img');
            if (image && image.dataset.cardData) {
                const cardData = JSON.parse(image.dataset.cardData);
                console.log('Similar card data:', cardData);
                console.log('Similar card name:', cardData.name);
            } else {
                console.log('No image or card data found in similar card image container');
            }
        }
    
        // Logging active filter settings
        console.log('Active Percentage Range Filters:', {
            'Minimum Percentage': activeFilters.minPercentage,
            'Maximum Percentage': activeFilters.maxPercentage
        });
        console.log('Active Word Include/Exclude Filters:', {
            'Words to Include': [...activeFilters.wordsToInclude],
            'Words to Exclude': [...activeFilters.wordsToExclude]
        });
        console.log('Global Filters:', {
            'Included Words': [...globalFilters.includeWords],
            'Excluded Words': [...globalFilters.excludeWords]
        });
        console.log('Single Filters Object:', {
            'Min Percentage': filters.minPercentage,
            'Max Percentage': filters.maxPercentage,
            'Words': [...filters.words]
        });
    });
    
    
    

   document.getElementById('loadingCards').addEventListener('click', function() {
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
    
        const deckName = document.getElementById('deckNameInput2').value.trim();
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

    document.getElementById('searchQuantity').addEventListener('change', function() {
        const searchImageContainer = document.getElementById('searchImageContainer');
        const img = searchImageContainer.querySelector('img');
        if (!img) {
            console.error('No image found in search image container.');
            return;
        }
    
        const cardData = JSON.parse(img.dataset.cardData);
        const newQuantity = parseInt(this.value, 10);
    
        if (newQuantity > 0) {
            const existingCard = currentCards.find(c => c.name === cardData.name);
            if (!existingCard) {
                // If card not in currentCards, add it with new quantity and save the deck
                currentCards.push({ ...cardData, quantity: newQuantity });
            } else {
                // If card is already in currentCards, update its quantity and save the deck
                existingCard.quantity = newQuantity;
            }
            populateDeckSection(currentCards);
        } else {
            // If new quantity is 0, remove the card from currentCards and save the deck
            const cardIndex = currentCards.findIndex(c => c.name === cardData.name);
            if (cardIndex !== -1) {
                currentCards.splice(cardIndex, 1);
                populateDeckSection(currentCards);
            }
        }
    
        saveDeck();  // Save the deck after updating the quantities
    });

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
    
        const addCardContainer = document.getElementById('addCardContainer');
        const addCardsButtonContainer = document.getElementById('addCardsButtonContainer');
    
        if (!addCardContainer || !addCardsButtonContainer) {
            console.error('UI containers for adding cards are not found');
            return;
        }
    
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, user must be logged in to add cards');
            return;
        }
    
        const lines = document.getElementById('addCardTextInput').value.split('\n');
        console.log('Text input split into lines:', lines);
    
        const cardNamesWithQuantity = lines.map(line => {
            const match = line.trim().match(/^(\d+)x?\s+(.*)$/);
            console.log('Processing line:', line);
            if (match) {
                const quantity = parseInt(match[1], 10);
                const name = match[2];
                console.log(`Parsed card name and quantity: ${name}, ${quantity}`);
                return { name, quantity };
            }
            return null;
        }).filter(card => card && card.name);
    
        console.log('Card names and quantities to add:', cardNamesWithQuantity);
    
        fetch('/import-cards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cardNames: cardNamesWithQuantity, deckName: currentDeckName }),
        })
        .then(response => {
            console.log('Received response from /import-cards:', response);
            if (!response.ok) {
                throw new Error('Network response was not ok on import cards');
            }
            return response.json();
        })
        .then(data => {
            console.log('Card details fetched successfully:', data);
    
            const enhancedCards = enhanceCardDataWithUIState(data.cards);
            console.log('Enhanced cards with UI state:', enhancedCards);
    
            currentCards = [...currentCards, ...enhancedCards];
            console.log('Updated current cards:', currentCards);
    
            populateCardList(currentCards);
            console.log('Card list populated');
    
            populateDeckSection(currentCards);
            console.log('Deck section populated');
    
            return fetch('/save-deck', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ deckName: currentDeckName, cards: currentCards }), // Save the whole updated deck
            });
        })
        .then(response => {
            if (response) {
                console.log('Response received from the server');
                if (!response.ok) {
                    throw new Error(`Network response was not ok, status: ${response.status}`);
                }
                return response.json();
            }
        })
        .then(data => {
            if (data) {
                console.log('Deck saved successfully:', data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
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
    
    function populateSearchSection(cards) {
        console.log('Populating search section with cards:', cards);
        const searchSection = document.getElementById('searchSection');
        searchSection.innerHTML = '';  // Clear the search section before adding new cards
    
        // Iterate through each card in the provided array
        cards.forEach(card => {
            const img = document.createElement('img');  // Create an image element for each card
            img.src = card.large_image_url;  // Set the source of the image to the card's large image URL
            img.alt = card.name;  // Use the card's name as the alt text for accessibility
            img.dataset.cardData = JSON.stringify(card);  // Store the card data as a JSON string in a data attribute for later use
    
            // Add an event listener for clicks on the image
            img.addEventListener('click', () => {
                console.log('Image clicked:', card.name);
                displayInSearchImageContainer(card.large_image_url, card);  // Display the card in the search image container when clicked
            });
    
            searchSection.appendChild(img);  // Append the image element to the search section
        });
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
    
        // Change the Set Commander button text and color based on the Commander status
        const commanderButton = document.getElementById('commanderButton');
        if (cardData.uiState && cardData.uiState.Commander) {
            commanderButton.textContent = 'Commander: Yes';
            commanderButton.style.backgroundColor = '#dc3545'; // Red color for commander
        } else {
            commanderButton.textContent = 'Commander: No';
            commanderButton.style.backgroundColor = '#007bff'; // Blue color for non-commander
        }
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
            const manaInputId = manaCounterMappings[key];
            const manaInput = document.getElementById(manaInputId);
            if (manaInput) manaInput.value = value;
        });
    
        // Update quantity
        const quantityInput = document.getElementById('cardQuantity');
        if (quantityInput) {
            quantityInput.value = cardData.quantity || 0; // Use card's quantity, defaulting to 0 if undefined
        }
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

    document.getElementById('cardQuantity').addEventListener('input', function() {
        const newQuantity = parseInt(this.value, 10) || 0; // Ensure the value is a number and default to 0 if not
    
        if (currentCard) {
            if (newQuantity > 0) {
                currentCard.quantity = newQuantity;
                console.log(`Updated quantity for ${currentCard.name}: ${newQuantity}`);
            } else {
                // Find the index of the current card in the currentCards array
                const currentCardIndex = currentCards.findIndex(card => card.name === currentCard.name);
                
                if (currentCardIndex !== -1) {
                    // Remove the current card from the currentCards array
                    currentCards.splice(currentCardIndex, 1);
                    console.log(`${currentCard.name} removed from the deck as its quantity is set to 0`);
    
                    // Update the UI to reflect the changes
                    if (currentCards.length > 0) {
                        currentCard = currentCards[0];
                        displayInMainImageContainer(currentCard.settings.normal_image_url, currentCard);
                        updateUIForCard(currentCard);
                    } else {
                        currentCard = null;
                        clearMainImageContainer();
                    }
    
                    populateCardList(currentCards); // Update the card list display
                    populateDeckSection(currentCards); // Update the deck section with card images
                }
            }
        }
        saveDeck();
    });

    // Saving changes to the server
    // Saving changes to the server
    
    

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
            // Toggle the Commander property of the current card
            currentCard.uiState.Commander = !currentCard.uiState.Commander;
            console.log(`${currentCard.name} is now set as a Commander: ${currentCard.uiState.Commander}`);
    
            // Change the button text and color based on the Commander status
            if (currentCard.uiState.Commander) {
                this.textContent = 'Commander: Yes';
                this.style.backgroundColor = '#fb2323';  // Red color for Commander
            } else {
                this.textContent = 'Commander: No';
                this.style.backgroundColor = '#007bff';  // Blue color when not Commander
            }
        } else {
            console.log('No card selected.');
            this.textContent = 'Commander: No';
            this.style.backgroundColor = '#007bff';  // Default color when no card is selected
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
    
    
            // Save the updated deck
            saveDeck(currentDeckName, currentCards);
        }
    });
    
    function saveDeck(deckName, cards) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, user must be logged in to save decks');
            return;
        }
    
        fetch('/save-deck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ deckName: deckName, cards: cards })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to save the deck: ${deckName}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`Deck ${deckName} saved successfully.`);
        })
        .catch(error => {
            console.error('Error saving deck:', error);
        });
    }


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

    function makeElementsVisible() {
        console.log('makeElementsVisible function called');
        
        // Setting elements to be visible
        document.getElementById('LoadCards').style.display = 'block';
        document.querySelector('.deck-Image-Container').style.display = 'block';
        document.getElementById('deckTabsContainer').style.display = 'block';
        document.getElementById('LanddataContainer').style.display = 'block';
        document.getElementById('manaCounter').style.display = 'flex';
        document.querySelector('.mana-container').style.display = 'flex';
        document.getElementById('quantityContainer').style.display = 'block';
        document.getElementById('searchContainer').style.display = 'block';
        document.getElementById('commanderButton').style.display = 'block';
        document.getElementById('selectedCardImageContainer').style.display = 'block';
        document.getElementById('searchCardImageContainer').style.display = 'block';
        document.getElementById('cardImageContainer').style.display = 'block';
        
        document.getElementById('showFeaturesButton').style.display = 'none';
        document.getElementById('showDeckFeaturesButton').style.display = 'block';
        // Update quantity display based on the current card
        if (currentCard) {
            document.getElementById('cardQuantity').value = currentCard.quantity || 0;
        }
        
        // Hiding the search section and search quantity specifically
        document.querySelector('.search-section').style.display = 'none';
        document.getElementById('searchQuantityContainer').style.display = 'none';
        document.getElementById('cardInfo').style.display = 'none';
        document.getElementById('percentageTabsContainer').style.display = 'none';
        document.getElementById('wordFilterContainer').style.display = 'none';
        document.getElementById('getSimilar').style.display = 'none';
        document.getElementById('searchImageContainer').style.display = 'none';
        document.getElementById('clearFilters').style.display = 'none';
        document.getElementById('searchInfoDisplay').style.display = 'none';
        document.getElementById('similarCardImageContainer').style.display = 'none';
    
        console.log('All elements should now be visible, except the search section and search quantity');
        populateDeckSection(currentCards);
    }
    
    function hideElements() {
        console.log('Hiding elements');
        
        // Hiding these elements
        document.getElementById('LoadCards').style.display = 'none';
        document.querySelector('.deck-Image-Container').style.display = 'none';
        document.getElementById('deckTabsContainer').style.display = 'none';
        document.getElementById('LanddataContainer').style.display = 'none';
        document.getElementById('manaCounter').style.display = 'none';
        document.querySelector('.mana-container').style.display = 'none';
        document.getElementById('quantityContainer').style.display = 'none';
        document.getElementById('commanderButton').style.display = 'none';
        document.getElementById('selectedCardImageContainer').style.display = 'none';
        document.getElementById('searchContainer').style.display = 'none';
        document.getElementById('searchCardImageContainer').style.display = 'none';
        document.getElementById('cardImageContainer').style.display = 'none';
        document.getElementById('searchInfoDisplay').style.display = 'none'; // Added here


        document.getElementById('showFeaturesButton').style.display = 'inline-block';
        document.getElementById('showDeckFeaturesButton').style.display = 'none';

        // Making the search section visible
        document.querySelector('.search-section').style.display = 'block';
        document.getElementById('searchQuantityContainer').style.display = 'block';
        document.getElementById('cardInfo').style.display = 'block';
        document.getElementById('percentageTabsContainer').style.display = 'flex';
        document.getElementById('wordFilterContainer').style.display = 'flex';
        document.getElementById('getSimilar').style.display = 'block';
        document.getElementById('searchImageContainer').style.display = 'flex';
        document.getElementById('similarCardImageContainer').style.display = 'block';
        document.getElementById('searchInfoDisplay').style.display = 'block'; // Added here
    
        // Update the search quantity to match the card in the search image container, if present
        const searchImageContainer = document.getElementById('searchImageContainer');
        const img = searchImageContainer.querySelector('img');
        if (img) {
            const cardData = JSON.parse(img.dataset.cardData);
            const currentCard = currentCards.find(c => c.name === cardData.name);
            document.getElementById('searchQuantity').value = currentCard ? currentCard.quantity : 0;
        }
    
        console.log('All elements are hidden except the search section');
        populateDeckSection(currentCards);
    }
    
    

    function handleSearch() {
        console.log('Handling search...');
        fetch('card-details.json')
            .then(response => {
                console.log('Received response from card-details.json');
                return response.json();
            })
            .then(cards => {
                console.log('Card data loaded:', cards);
                const nameInput = document.getElementById('name').value.toLowerCase();
                const oracleTextInput = document.getElementById('oracleText').value.toLowerCase().split(/\s+/);
                const manaCost = document.getElementById('manaCost').value;
                const power = document.getElementById('power').value;
                const toughness = document.getElementById('toughness').value;
                const typeLine = Array.from(document.getElementById('type_line').selectedOptions).map(o => o.value);
                const colors = Array.from(document.getElementById('colors').selectedOptions).map(o => o.value);
                const colorIdentity = Array.from(document.getElementById('colorIdentity').selectedOptions).map(o => o.value);
    
                console.log('Search parameters:', { nameInput, oracleTextInput, manaCost, power, toughness, typeLine, colors, colorIdentity });
    
                const filteredCards = cards.filter(card => {
                    const nameMatches = !nameInput || card.name.toLowerCase().includes(nameInput);
                    const oracleTextMatches = !oracleTextInput.length || oracleTextInput.every(word => card.oracle_text && card.oracle_text.toLowerCase().includes(word));
    
                    return nameMatches &&
                           oracleTextMatches &&
                           (manaCost === 'None' || card.cmc === parseFloat(manaCost)) &&
                           (power === 'None' || card.power === power) &&
                           (toughness === 'None' || card.toughness === toughness) &&
                           (typeLine.length === 0 || typeLine.includes(card.type_line) || typeLine.some(tl => card.type_line.includes(tl))) &&
                           (colors.length === 0 || colors.some(c => card.colors.includes(c))) &&
                           (colorIdentity.length === 0 || colorIdentity.some(c => card.color_identity.includes(c)));
                });
    
                console.log('Filtered cards:', filteredCards);
                originalSearchResults = filteredCards; // Store the filtered results
                populateSearchSection(filteredCards);
    
                // Assuming we want to display the first card of the filtered results in the search image container
                if (filteredCards.length > 0) {
                    displayInSearchImageContainer(filteredCards[0].large_image_url, filteredCards[0]);
                }
            });
    }
    
    
    // Helper function to check if an element is within the viewport plus a buffer
    function isVisible(elem, buffer) {
        const rect = elem.getBoundingClientRect();
        const viewHeight = window.innerHeight || document.documentElement.clientHeight;
        return !(rect.bottom < -buffer || rect.top - viewHeight > buffer);
    }

    
    

    // Function to load images lazily
    function lazyLoadImages() {
        const images = document.querySelectorAll('.lazy-load');
        console.log(`Checking ${images.length} images for visibility...`);

        images.forEach(img => {
            if (isVisible(img, 2000)) { // Adjust buffer as needed
                if (!img.src && img.dataset.src) { // Check if the src has not been set yet
                    console.log(`Loading image for ${img.alt}`);
                    img.src = img.dataset.src;
                }
            }
        });
    }

    // Enhanced function to populate the search section with filtered cards
    // Enhanced function to populate the search section with filtered cards
    function populateSearchSection(cards) {
        console.log('Populating search section with cards:', cards);
        const searchSection = document.getElementById('searchSection');
        const searchInfoDisplay = document.getElementById('searchInfoDisplay');  // Get the label/div element for displaying information

        searchSection.innerHTML = '';  // Clear the search section before adding new cards

        // Prepare filter information for display using globalFilters
        let filterInfo = `
            <strong>${cards.length} cards</strong><br>
            ${filters.minPercentage || '0'}% - ${filters.maxPercentage || '100'}% similarity<br>
            Cards that include: ${Array.from(globalFilters.includeWords).join(', ') || 'None'}<br>
            Cards that exclude: ${Array.from(globalFilters.excludeWords).join(', ') || 'None'}
        `;

        // Update the display label with the number of cards and filter information
        searchInfoDisplay.innerHTML = filterInfo;  // Update the label with detailed filter information and number of cards

        // Iterate through each card in the provided array
        cards.forEach((card, index) => {
            const img = document.createElement('img');  // Create an image element for each card
            img.alt = card.name;
            img.dataset.cardData = JSON.stringify(card); // Store card data
            img.dataset.src = card.large_image_url; // Temporarily hold the image URL
            img.className = 'lazy-load'; // Mark for lazy loading

            // Add an event listener for clicks on the image
            img.addEventListener('click', () => {
                console.log(`Image clicked: ${card.name}`);
                displayInSearchImageContainer(card.large_image_url, card);
                refreshSurroundingImages(index, cards, 20); // Refresh images around the clicked one
            });

            searchSection.appendChild(img);
        });

        // Call lazy load initially and also set up on scroll
        lazyLoadImages();
        window.addEventListener('scroll', debounce(lazyLoadImages, 100)); // Adjust debounce timing if needed
    }
    

    function refreshSurroundingImages(clickedIndex, cards, range) {
        const startIndex = Math.max(0, clickedIndex - range);
        const endIndex = Math.min(cards.length - 1, clickedIndex + range);
        const images = document.querySelectorAll('.lazy-load');
    
        for (let i = startIndex; i <= endIndex; i++) {
            const img = images[i];
            if (img && !img.src && img.dataset.src) {
                img.src = img.dataset.src; // Load the image if it hasn't been loaded yet
            }
        }
    }

    // Debouncing function to optimize performance during scroll
    function debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    
    function displayInSearchImageContainer(imageUrl, card) {
        console.log('Displaying image in search image container:', imageUrl, 'for card:', card.name);
        const searchImageContainer = document.getElementById('searchImageContainer');
        const searchQuantityInput = document.getElementById('searchQuantity');
    
        searchImageContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = card.name;
        img.dataset.cardData = JSON.stringify(card);
        searchImageContainer.appendChild(img);
    
        // Find the card in currentCards for the most up-to-date quantity
        const currentCard = currentCards.find(c => c.name === card.name);
        const quantityToDisplay = currentCard ? currentCard.quantity : card.quantity || 0;
        console.log(`Found card: ${card.name} with quantity ${quantityToDisplay}`);
        searchQuantityInput.value = quantityToDisplay;
    }
    
    function updateSearchQuantity(quantity) {
        const searchQuantityInput = document.getElementById('searchQuantity');
        console.log(`Updating search quantity to ${quantity}`);
        searchQuantityInput.value = quantity;
    }

    
    
    
    
    

    function filterCardsByPercentage(minPercentage, maxPercentage) {
        console.log(`Updating filter range to from ${minPercentage}% to ${maxPercentage}%`);
    
        // Update global filter settings
        filters.minPercentage = minPercentage;
        filters.maxPercentage = maxPercentage;
    
        // Apply all active filters to the card data
        applyAllFilters();
    }
    
    function applyAllFilters() {
        const similarCardImageContainer = document.getElementById('similarCardImageContainer');
        const similarImage = similarCardImageContainer.querySelector('img');
    
        if (!similarImage || !similarImage.dataset.cardData) {
            console.log('No base card data available for filtering.');
            return;
        }
    
        const baseCardData = JSON.parse(similarImage.dataset.cardData);
    
        // Filter cards based on all criteria in 'filters'
        let filteredCards = originalSearchResults.filter(card => {
            // First, calculate the closeness using a percentage match method
            const closeness = calculateMatchPercentage(baseCardData.oracle_text, card.oracle_text);
            const matchesPercentage = closeness >= filters.minPercentage && closeness <= filters.maxPercentage;
    
            // Combine name and oracle text for comprehensive text search
            const textToSearch = (card.name + " " + card.oracle_text).toLowerCase();
    
            // Check for matches against include words if any
            const includeMatch = globalFilters.includeWords.size === 0 || Array.from(globalFilters.includeWords).every(word => 
                textToSearch.includes(word.toLowerCase())
            );
    
            // Check for matches against exclude words if any
            const excludeMatch = Array.from(globalFilters.excludeWords).some(word => 
                textToSearch.includes(word.toLowerCase())
            );
    
            // Log card processing for debug purposes
            console.log(`Card: ${card.name}, Closeness: ${closeness}, Include Match: ${includeMatch}, Exclude Match: ${excludeMatch}`);
    
            // Combine all filter checks: percentage, include, and exclude
            return matchesPercentage && includeMatch && !excludeMatch;
        });
    
        console.log(`Filtered ${filteredCards.length} cards within the specified filters.`);
        populateSearchSection(filteredCards);
    }
    
    function calculateMatchPercentage(text1, text2) {
        const words1 = text1.toLowerCase().replace(/\(.*?\)/g, '').split(/\s+/);
        const words2 = text2.toLowerCase().replace(/\(.*?\)/g, '').split(/\s+/);
        const totalWords = words1.length || 1;  // Avoid division by zero
        const matchingWords = words1.filter(word => words2.includes(word)).length;
        return (matchingWords / totalWords) * 100;
    }
    
    function oracleTextCloseness(oracleText, similarWords) {
        console.log(`Calculating text closeness between oracle text and similar words.`);
        const words = oracleText.toLowerCase().replace(/\(.*?\)/g, '').split(/\s+/);
        const totalWords = similarWords.length; // Total number of words to consider in percentage calculation
    
        const closeness = similarWords.reduce((sum, word) => {
            const isWordPresent = words.includes(word);
            console.log(`Word "${word}" ${isWordPresent ? "found" : "not found"} in oracle text.`);
            return sum + (isWordPresent ? 1 : 0);
        }, 0);
    
        const closenessPercentage = (closeness / totalWords) * 100;
        console.log(`Closeness percentage: ${closenessPercentage}% based on ${closeness}/${totalWords} matches.`);
        return closenessPercentage;
    }

    function addCardsToDeck(cardNamesWithQuantity) {
        console.log('Adding cards to deck:', cardNamesWithQuantity);
        
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, user must be logged in to add cards');
            return;
        }
    
        fetch('/import-cards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cardNames: cardNamesWithQuantity, deckName: currentDeckName }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok on import cards');
            }
            return response.json();
        })
        .then(data => {
            const enhancedCards = enhanceCardDataWithUIState(data.cards);
            currentCards = [...currentCards, ...enhancedCards];
            populateCardList(currentCards);
            populateDeckSection(currentCards);
        })
        .catch(error => {
            console.error('Error adding cards to deck:', error);
        });
    }
    
    
    

    function checkPercentageFilter(card) {
        if (activeFilters.minPercentage === null || activeFilters.maxPercentage === null) {
            return true; // No percentage filter to apply
        }
        const matchPercentage = calculateMatchPercentage(/* parameters */); // Ensure this function is defined and usable
        return matchPercentage >= activeFilters.minPercentage && matchPercentage <= activeFilters.maxPercentage;
    }
    
    function checkWordFilter(card) {
        const includeMatch = activeFilters.wordsToInclude.every(word => card.oracle_text.toLowerCase().includes(word));
        const excludeMatch = activeFilters.wordsToExclude.some(word => card.oracle_text.toLowerCase().includes(word));
        return includeMatch && !excludeMatch;
    }
   
});


