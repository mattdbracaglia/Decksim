document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById("chooseDecks");
    var popup = document.getElementById("deckPopup");
    var close = document.getElementById("closePopup");
    let currentPlayerId = 'Player1';  // Default to Player1
    const oneTurnButton = document.getElementById('oneTurn');
    let autoTurnIntervalId = null;
    let oneTurnStep = 0; // Tracks the current step of the "1 Turn" action
    let selectedImageData = null; // New variable to store the selected image data
    let turnPlayer = null; // Initialize the turnPlayer variable
    let isSwitchOn = false; // Initialize isSwitchOn to false by default
    // Attempt to get the 'leftArrow' button by its ID
    const leftArrowButton = document.getElementById('leftArrow');
    // Attempt to get the 'rightArrow' button by its ID
    const rightArrowButton = document.getElementById('rightArrow');
    const sections = ["library", "hand", "battlefield", "land", "commander", "exile", "graveyard", "tappedLands", "moved", "history"];
    let currentIndex = 0; // Start with the first section displayed
    const moveSection = document.getElementById('move');
    const shuffleButton = document.getElementById('shuffle');
    // Variable to track whether the shift key is currently pressed
    let shiftKeyPressed = false;
    let movedCardNames = []; // This will hold the names of moved cards
    // Variable to track whether an image has already been moved during the current shift click event
    let imageMoved = false;
    // Parse the JSON string to get the card data object
    var editDecksButton = document.getElementById('editDecksButton');
    let choiceCards = [];
    let lastHoveredCardData = null;
    let choicesTurn = false;
    let currentChoicesTurnStep = 0;  // Global variable to track the current step in the choices turn process
    let choiceMade = false; // Flag to indicate if a choice has been made
    let nonlandchoiceMade = false; // Flag to indicate if a choice has been made
    let cardPlayed = false;  // Variable to track if a card has been played
    let tappedLands = [];
    createDeckFilterTabs();

    const simulatedDeckFeatures = {
        chooseDecks: "Provides a popup for selecting a deck from a list of available decks.",
        restart: "Restarts the game, putting all cards back into library.",
        oneTurn: "Use these buttons to play. 1 Turn simulates a single turn. A turn will draw a card, play a land, then try to play a card. Auto simulates multiple turns, press again to pause the simulation. Auto Choices will automate turns until there is more then one card you can play, then it pauses until you choose a card to play.",
        manaCounter: "Tracks and updates the mana pool for the player. For each color, the number represents the max number of mana of that type you can produce. The TM is the total mana you are able to produce.",
        startGame: "The first button starts the game, shuffling the deck and dealing the starting hand to the player. You can also mulligan the hand, redrawing the same number of cards.",
        cycleButtons: "Use these 4 buttons to cycle through your hand. The first two buttons can shuffle and draw the same number of cards or shuffle and draw 7 cards. The last two can discard and draw the same number or discard and draw 7 cards. You can also shuffle the library.",
        modeSwitch: "This allows you to set if there is a minimum or exact number of lands in the starting hand. This way you don't need to redraw your starting hand until you get a playable hand.",
        autoPlaySwitch: "If the switch is on choose lands, the autochoices will ask you to choose what lands to play if there is more then 1 in hand. If it is set to Auto Lands, it will look for the card with the lowest mana cost, and will prioritize playing lands that produce the colors of those you can't currently produce.",
        sections: "Each section is labeled with their button above, Except these three. The section above the Exile section is the Move section. You can press the shift button while the mouse is over an image to move that image to the move section, if they are temperarily exiled or you want to move multiple cards to sections at the same time. If you press the zone buttons while cards are in the move section, they will all be moved to that section. Your whole library will be listed in the vertical section, in alphabetical order. The last horizontal section is where you can click on the cards you are able to play while doing the Auto Choices feature. ",
        sectionbuttons: "Clicking the section buttons will move all cards in the move section to the target section. If you press the number-key for each section while your mouse is on a card, it will move that card to the corrisponding section."
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


            
    

    const playersData = {
        Player1: {
            choiceImages: {images: [], scrollOffset: 0},
            deckImages: {images: [], scrollOffset: 0},
            libraryImages: {images: [], scrollOffset: 0},
            handImages: {images: [], scrollOffset: 0},
            battlefieldImages: {images: [], scrollOffset: 0},
            landImages: {images: [], scrollOffset: 0},
            commanderImages: {images: [], scrollOffset: 0},
            exileImages: {images: [], scrollOffset: 0},
            graveyardImages: {images: [], scrollOffset: 0},
            tappedLandsImages: {images: [], scrollOffset: 0},
            moveImages: {images: [], scrollOffset: 0},
            historyImages: {images: [], scrollOffset: 0},
            infoImages: {images: [], scrollOffset: 0},
            gameStats: {},
            manaCounter: {W: 0, B: 0, U: 0, R: 0, G: 0, C: 0},
            totalMana: 0,
            totalManaOr: 0,
            selectedImageData: null,
            markedCards: {},
        },
        Player2: {
            libraryImages: {images: [], scrollOffset: 0},
            handImages: {images: [], scrollOffset: 0},
            battlefieldImages: {images: [], scrollOffset: 0},
            landImages: {images: [], scrollOffset: 0},
            commanderImages: {images: [], scrollOffset: 0},
            exileImages: {images: [], scrollOffset: 0},
            graveyardImages: {images: [], scrollOffset: 0},
            tappedLandsImages: {images: [], scrollOffset: 0},
            moveImages: {images: [], scrollOffset: 0},
            historyImages: {images: [], scrollOffset: 0},
            infoImages: {images: [], scrollOffset: 0},
            gameStats: {},
            manaCounter: {W: 0, B: 0, U: 0, R: 0, G: 0, C: 0},
            totalMana: 0,
            totalManaOr: 0,
            selectedImageData: null,
            markedCards: {},
        },
        Player3: {
            libraryImages: {images: [], scrollOffset: 0},
            handImages: {images: [], scrollOffset: 0},
            battlefieldImages: {images: [], scrollOffset: 0},
            landImages: {images: [], scrollOffset: 0},
            commanderImages: {images: [], scrollOffset: 0},
            exileImages: {images: [], scrollOffset: 0},
            graveyardImages: {images: [], scrollOffset: 0},
            tappedLandsImages: {images: [], scrollOffset: 0},
            moveImages: {images: [], scrollOffset: 0},
            historyImages: {images: [], scrollOffset: 0},
            infoImages: {images: [], scrollOffset: 0},
            gameStats: {},
            manaCounter: {W: 0, B: 0, U: 0, R: 0, G: 0, C: 0},
            totalMana: 0,
            totalManaOr: 0,
            selectedImageData: null,
            markedCards: {},
        },
        Player4: {
            libraryImages: {images: [], scrollOffset: 0},
            handImages: {images: [], scrollOffset: 0},
            battlefieldImages: {images: [], scrollOffset: 0},
            landImages: {images: [], scrollOffset: 0},
            commanderImages: {images: [], scrollOffset: 0},
            exileImages: {images: [], scrollOffset: 0},
            graveyardImages: {images: [], scrollOffset: 0},
            tappedLandsImages: {images: [], scrollOffset: 0},
            moveImages: {images: [], scrollOffset: 0},
            historyImages: {images: [], scrollOffset: 0},
            infoImages: {images: [], scrollOffset: 0},
            gameStats: {},
            manaCounter: {W: 0, B: 0, U: 0, R: 0, G: 0, C: 0},
            totalMana: 0,
            totalManaOr: 0,
            selectedImageData: null,
            markedCards: {},
        },
    };
    let player1StarterLands = 0;
    let player2StarterLands = 0;
    let player3StarterLands = 0;
    let player4StarterLands = 0;
    let player1Deck = null;
    let player2Deck = null;
    let player3Deck = null;
    let player4Deck = null;
    let checkedOrder = []; // Array to store the order of checked checkboxes

   // Function to fetch and display deck names
   // Function to fetch and display deck names
   // Function to fetch and display deck names
   function fetchAndDisplayDeckNames() {
        const token = localStorage.getItem('token');  // Assuming the token is stored here after login
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
                addLoadDeckButton(popupContent); // Call this function to add the Load Deck button
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

    document.addEventListener('dblclick', () => {
        console.log('Current playersData:', playersData);
        console.log('Tapped lands:', tappedLands);
    });
    
    // Function to update deck assignments based on the checked state of checkboxes
    // Function to update deck assignments based on the checked state of checkboxes
    function updateDeckAssignments() {
        const selectedCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"][name="decks"]:checked'));
        const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"][name="decks"]'));
    
        // Clear existing deck assignments
        window.player1Deck = null;
    
        // Clear player label names if the element exists
        const player1DeckElement = document.getElementById('player1Deck');
        if (player1DeckElement) {
            player1DeckElement.textContent = '';
        }
    
        // Update the checkedOrder array based on the current state of checkboxes
        checkedOrder = selectedCheckboxes.map(checkbox => checkbox.value);
    
        // Assign decks to players based on the order of checked checkboxes
        checkedOrder.forEach((deckName, index) => {
            if (index === 0) {
                window.player1Deck = deckName;
                if (player1DeckElement) {
                    player1DeckElement.textContent = deckName;
                }
                console.log(`Deck "${deckName}" assigned to Player 1`);
            }
        });
    
        console.log('Updated deck assignments:');
        console.log('Player 1 Deck:', window.player1Deck);
    }




    // Function to switch decks between players when arrow buttons are clicked
    // Function to switch decks between players when arrow buttons are clicked
    // Function to switch decks between players when arrow buttons are clicked
    function switchDecks(player1, player2) {
        // Disable checkboxes and "Load Decks" button
        const checkboxes = document.querySelectorAll('input[type="checkbox"][name="decks"]');
        const loadDecksButton = document.getElementById('loadDecksButton');
        checkboxes.forEach(checkbox => {
            checkbox.disabled = true;
        });
        loadDecksButton.disabled = true;
    
        const deck1 = window[`player${player1}Deck`];
        const deck2 = window[`player${player2}Deck`];
    
        window[`player${player1}Deck`] = deck2;
        window[`player${player2}Deck`] = deck1;
    
        document.getElementById(`player${player1}Deck`).textContent = deck2 || '';
        document.getElementById(`player${player2}Deck`).textContent = deck1 || '';
    
        // Update the checkedOrder array to reflect the switched decks
        const index1 = checkedOrder.indexOf(deck1);
        const index2 = checkedOrder.indexOf(deck2);
        if (index1 !== -1 && index2 !== -1) {
            checkedOrder[index1] = deck2;
            checkedOrder[index2] = deck1;
        }
    
        // Update the checked state of the checkboxes
        checkboxes.forEach(checkbox => {
            checkbox.checked = checkedOrder.includes(checkbox.value);
        });
    
        console.log(`Deck "${deck1}" switched from Player ${player1} to Player ${player2}`);
        console.log(`Deck "${deck2}" switched from Player ${player2} to Player ${player1}`);
    
        // Enable checkboxes and "Load Decks" button after switching decks
        checkboxes.forEach(checkbox => {
            checkbox.disabled = false;
        });
        loadDecksButton.disabled = false;
    }
 
    function getSelectedDeckNames() {
        return checkedOrder;
    }
    
    
    
    
  
    
    // Function to add Load Decks button
    function addLoadDeckButton(popupContent) {
        let loadDeckButton = document.getElementById('loadDeckButton');
    
        if (!loadDeckButton) {
            loadDeckButton = document.createElement('button');
            loadDeckButton.textContent = 'Load Deck';
            loadDeckButton.id = 'loadDeckButton';
            loadDeckButton.addEventListener('click', handleLoadDeckClick);
            popupContent.appendChild(loadDeckButton);
        }
    
        loadDeckButton.style.display = 'block'; // Ensure the button is visible
    }

    function handleLoadDeckClick() {
        const selectedCheckbox = document.querySelector('input[type="checkbox"][name="decks"]:checked');
        if (!selectedCheckbox) {
            console.error('No deck selected');
            return;
        }
    
        const deckName = selectedCheckbox.value;
        console.log(`Selected deck for loading: ${deckName}`);
    
        fetch(`/load-deck-data?deckName=${encodeURIComponent(deckName)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(deckData => {
            console.log(`Received deck data for ${deckName}:`, deckData);
            assignDeckDataToPlayer(deckData, 'Player1'); // Adapt this function as needed to fit your application's logic
        })
        .catch(error => console.error(`Error loading deck ${deckName}:`, error));
    }
    

    function assignDeckDataToPlayer(deckData, playerKey) {
        console.log(`Assigning deck data to ${playerKey}`);
    
        // Separate commander cards from library cards
        const commanderCards = [];
        const libraryCards = [];
    
        deckData.cards.forEach(card => {
            const cardData = {
                ...card,
                imageUrl: card.settings.normal_image_url,
                name: card.name,
                typeLine: card.type_line || card.settings.type_line,
                manaCost: card.mana_cost || card.settings.mana_cost,
                cmc: card.cmc,
                oracleText: card.oracle_text || card.settings.oracle_text,
            };
            // Handle multiple quantities of the same card
            for (let i = 0; i < card.quantity; i++) {
                const cardInstance = {
                    cardData: { // Wrap the card data
                        ...cardData,
                        id: `${cardData.name}-${i}`
                    },
                    imageUrl: cardData.imageUrl
                };
        
                if (card.uiState && card.uiState.Commander) {
                    commanderCards.push(cardInstance);
                } else {
                    libraryCards.push(cardInstance);
                }
            }
        });
    
        // Assign commander cards to commanderImages
        playersData[playerKey].commanderImages.images = commanderCards;
    
        // Assign library cards to libraryImages
        playersData[playerKey].libraryImages.images = libraryCards;
    
        console.log(`Updated commander for ${playerKey}:`, playersData[playerKey].commanderImages.images);
        console.log(`Updated library for ${playerKey}:`, playersData[playerKey].libraryImages.images);
    
        // Update the checkedOrder array based on the fetched deck data
        const deckName = deckData.name; // Assuming the deck name is available in the fetched data
        const playerIndex = parseInt(playerKey.slice(-1)) - 1;
        checkedOrder[playerIndex] = deckName;
    
        // Update the checked state of the checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"][name="decks"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checkedOrder.includes(checkbox.value);
        });
        playersData[playerKey].deckImages.images = deckData.cards; // Or process as needed

        populateDeckSection(playersData[playerKey].deckImages.images);
    
        updatePlayerDisplay(playerKey);

    }
    


    function updatePlayerDisplay(playerKey) {
        // First, process movedCardNames to update the data model accordingly
        let processedCards = new Set(); // To track cards that have already been processed
        
        movedCardNames.forEach(move => {
            if (!processedCards.has(move.name)) {
                // Find the last occurrence of the card in movedCardNames to determine its final target section
                const lastMove = [...movedCardNames].reverse().find(m => m.name === move.name);
                if (lastMove) {
                    // Move the card data within playersData
                    moveCardDataToTargetSection(playerKey, lastMove.name, lastMove.targetSection);
                    processedCards.add(move.name); // Mark as processed
                }
            }
        });
        
        // Clear movedCardNames after processing
        movedCardNames = [];
    
        // Then, update the display as before
        const playerData = playersData[playerKey];
        const sectionsToUpdate = ['library', 'hand', 'land', 'battlefield', 'graveyard', 'exile', 'commander', 'move', 'choice'];
    
        sectionsToUpdate.forEach(sectionId => {
            const sectionElement = document.getElementById(sectionId);
            if (!sectionElement) {
                console.error(`Section element not found for ${sectionId}`);
                return;
            }
            
            sectionElement.innerHTML = ''; // Clear existing content for the section
    
            const items = playerData[`${sectionId}Images`]?.images || [];
            items.forEach(item => {
                const img = document.createElement('img');
                img.src = item.imageUrl;
                img.setAttribute('data-card', JSON.stringify(item.cardData));
    
                // Check if the card is marked and apply the appropriate CSS class and styling
                if (playerData.markedCards[item.cardData.name]) {
                    img.classList.add('marked');
                    img.style.border = '2px solid red';
                }
    
                sectionElement.appendChild(img);
            });
        });
        updateManaCounter();
    }
    


    
    function moveCardDataToTargetSection(playerKey, cardName, targetSectionId) {
        let found = false;
        
        // Ensure target section exists and has an initialized images array
        const targetSection = playersData[playerKey][`${targetSectionId}Images`];
        if (!targetSection) {
            console.error(`Target section "${targetSectionId}" not found for player ${playerKey}.`);
            return;
        }
        
        Object.keys(playersData[playerKey]).forEach(sectionKey => {
            const section = playersData[playerKey][sectionKey];
            if (section && section.images && !found) {
                const index = section.images.findIndex(card => card.name === cardName);
                if (index !== -1) {
                    // Found the card, move it to targetSection
                    const [cardToMove] = section.images.splice(index, 1);
                    targetSection.images.push(cardToMove);
                    found = true;
                }
            }
        });
        
        if (!found) {
            console.error(`Card "${cardName}" not found in any section for playerId: ${playerKey}.`);
        }
    }
    
  
    

 
  
   
 
    // Add event listener for the section buttons container
    // Add event listener for the section buttons container
    const sectionButtons = document.getElementById('sectionButtons');
    sectionButtons.addEventListener('click', (event) => {
        console.log('Button clicked event triggered.');
        const target = event.target;

        if (target.tagName === 'BUTTON') {
            const sectionId = target.id.replace('Btn', '');
            const targetSection = document.getElementById(sectionId);

            console.log(`Button clicked: ${target.id}, Target section: ${sectionId}`);

            // Get the moveImages for the current player
            const moveImages = playersData[currentPlayerId].moveImages.images;

            // Move all cards from moveImages to the target section
            while (moveImages.length > 0) {
                const movedCard = moveImages.shift();
                playersData[currentPlayerId][`${targetSection.id}Images`].images.push(movedCard);
            }

            console.log(`Cards moved from moveImages to ${targetSection.id}Images in player data`);

            // Update the player display after moving the cards
            updatePlayerDisplay(currentPlayerId);
        }
    });

    
    

    



   

    // Attach event listeners to player buttons if needed

    

   

    const startGameButton = document.getElementById('startGame');
    if (startGameButton) {
        startGameButton.addEventListener('click', startGame);
    } else {
        console.error('"Start Game" button not found');
    }

        // Adjust setCurrentPlayer to call updatePlayerDisplay directly
    function setCurrentPlayer(playerId) {
        currentPlayerId = playerId;
        console.log(`Current player set to: ${currentPlayerId}`);
        updatePlayerDisplay(currentPlayerId); // Refresh UI with the current player's images for all sections
    }

    window.onload = function() {
        // Set the scrollboxes to 0 when the page loads
        document.querySelectorAll('.scrollbox-input').forEach(scrollbox => {
            scrollbox.value = 0;
        });
    
        // Trigger the handleScrollboxChange function for each scrollbox
        document.querySelectorAll('.scrollbox-input').forEach(scrollbox => {
            handleScrollboxChange({ target: scrollbox });
        });
    };

    
    document.querySelectorAll('.scrollbox-input').forEach(scrollbox => {
        scrollbox.addEventListener('input', handleScrollboxChange);
    });
    
    function handleScrollboxChange(event) {
        const scrollboxId = event.target.id;
        const scrollboxValue = parseInt(event.target.value);
        console.log(`Scrollbox ${scrollboxId} value changed to: ${scrollboxValue}`);
        
        // Update the corresponding player's starter lands variable
        switch (scrollboxId) {
            case 'player1':
                player1StarterLands = scrollboxValue;
                console.log(`Player 1 starter lands updated to: ${player1StarterLands}`);
                break;
            case 'player2':
                player2StarterLands = scrollboxValue;
                console.log(`Player 2 starter lands updated to: ${player2StarterLands}`);
                break;
            case 'player3':
                player3StarterLands = scrollboxValue;
                console.log(`Player 3 starter lands updated to: ${player3StarterLands}`);
                break;
            case 'player4':
                player4StarterLands = scrollboxValue;
                console.log(`Player 4 starter lands updated to: ${player4StarterLands}`);
                break;
        }
    }

    document.getElementById('modeSwitch').checked = false;

    modeSwitch.addEventListener('change', function() {
        isSwitchOn = this.checked;
        console.log('Switch is ' + (isSwitchOn ? 'on' : 'off'));
        
        if (isSwitchOn) {
            // Code to execute when the switch is on
            console.log('Performing actions for switch on state');
        } else {
            // Code to execute when the switch is off
            console.log('Performing actions for switch off state');
        }
    });

    // Access the autoPlaySwitch element
    const autoPlaySwitch = document.getElementById('autoPlaySwitch');

    // Optionally set the initial checked state
    autoPlaySwitch.checked = false; // or true, depending on your needs

    // Add an event listener for when the switch's state changes
    autoPlaySwitch.addEventListener('change', function() {
        const isAutoPlayOn = this.checked;
        console.log('Auto Play Switch is ' + (isAutoPlayOn ? 'on' : 'off'));

        if (isAutoPlayOn) {
            // Code to execute when the autoPlay switch is on
            console.log('Auto play actions will be executed');
            // Add the code or function calls you need to execute when the auto-play is enabled
        } else {
            // Code to execute when the autoPlay switch is off
            console.log('Auto play actions will be stopped');
            // Add the code or function calls you need to execute when the auto-play is disabled
        }
    });
        
    function startGame() {
        if (turnPlayer !== null) {
            console.log("Game has already started. Cannot start again.");
            return;
        }
    
        turnPlayer = 'Player1'; // Set the turnPlayer to 'Player1'
        console.log(`Turn 1 player set to: ${turnPlayer}`);
    
        // Set the current player to Player1 and update the UI accordingly
        setCurrentPlayer('Player1');
        console.log(`Game started. The current player is set to: ${currentPlayerId}`);
    
        Object.keys(playersData).forEach(playerKey => {
            console.log(`Processing player: ${playerKey}`);
    
            console.log(`Shuffling library for ${playerKey}...`);
            // Shuffle each player's library
            shuffleArray(playersData[playerKey].libraryImages.images);
            console.log(`Library shuffled for ${playerKey}.`);
    
            // Get the starter lands value from the corresponding player's variable
            let scrollboxValue = 0;
            switch (playerKey) {
                case 'Player1':
                    scrollboxValue = player1StarterLands;
                    break;
                case 'Player2':
                    scrollboxValue = player2StarterLands;
                    break;
                case 'Player3':
                    scrollboxValue = player3StarterLands;
                    break;
                case 'Player4':
                    scrollboxValue = player4StarterLands;
                    break;
            }
            console.log(`Scrollbox value for ${playerKey}: ${scrollboxValue}`);
    
            // Function to draw 7 cards and check for the required number of lands
            const drawSevenCards = () => {
                console.log(`Drawing 7 cards for ${playerKey}...`);
                const drawnCards = [];
                for (let i = 0; i < 7; i++) {
                    if (playersData[playerKey].libraryImages.images.length > 0) {
                        const card = playersData[playerKey].libraryImages.images.shift(); // Remove the first card from the library
                        drawnCards.push(card); // Add the removed card to the drawn cards array
                        console.log(`Moved card to hand: ${card.cardData ? card.cardData.name : "Card data not found"}`);
                    }
                }
                console.log(`Finished drawing 7 cards for ${playerKey}.`);
                return drawnCards;
            };
    
            // Function to count the number of lands in the drawn cards
            const countLands = (cards) => {
                console.log(`Counting lands in drawn cards for ${playerKey}...`);
                const landCount = cards.reduce((count, card) => {
                    if (card.cardData && card.cardData.typeLine.includes("Land")) {
                        console.log(`Found land card: ${card.cardData.name}`);
                        return count + 1;
                    }
                    return count;
                }, 0);
                console.log(`Land count for ${playerKey}: ${landCount}`);
                return landCount;
            };
    
            let drawnCards = drawSevenCards();
            let landCount = countLands(drawnCards);
    
            // Keep redrawing until the required number of lands is met or scrollbox value is 0
            // Keep redrawing until the required number of lands is met or scrollbox value is 0
            while (scrollboxValue > 0 && ((isSwitchOn && landCount !== scrollboxValue) || (!isSwitchOn && landCount < scrollboxValue))) {
                console.log(`Insufficient lands for ${playerKey}. Redrawing...`);
                // Return the drawn cards back to the library
                playersData[playerKey].libraryImages.images.push(...drawnCards);
                shuffleArray(playersData[playerKey].libraryImages.images); // Reshuffle the library
                console.log(`Reshuffled library for ${playerKey}.`);
                drawnCards = drawSevenCards(); // Redraw 7 cards
                landCount = countLands(drawnCards); // Count the number of lands in the new draw
            }
    
            // Move the final drawn cards to the player's hand
            playersData[playerKey].handImages.images.push(...drawnCards);
            console.log(`Moved final drawn cards to ${playerKey}'s hand.`);
            console.log(`First 7 cards moved for ${playerKey}.`);
        });
    
        // After initializing all players, update the UI for the current player
        console.log(`Updating display for ${currentPlayerId}...`);
        updatePlayerDisplay('Player1');
        console.log(`Display updated for ${currentPlayerId}.`);
    
        // Set the currentIndex to the index of the "hand" section
        currentIndex = sections.indexOf("hand");
        updateDisplay();
   
        console.log(`Current section set to: ${sections[currentIndex]}`);
    
        // Disable the start game button
        document.getElementById('startGame').disabled = true;
        console.log(`Start game button disabled.`);
    }
    

    
    function shuffleArray(array) {
        console.log("Starting shuffle...");
        // Pre-shuffle check for data integrity
        array.forEach((item, index) => {
            if (!item || !item.cardData || !item.imageUrl) {
                console.error(`Pre-shuffle data integrity issue at index ${index}:`, item);
            }
        });
    
        console.log("Pre-shuffle array:", JSON.parse(JSON.stringify(array))); // Deep copy for logging
    
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            // Swap both imageUrl and cardData properties
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    
        console.log("Post-shuffle array:", JSON.parse(JSON.stringify(array))); // Deep copy for logging
    
        // Post-shuffle check for data integrity
        array.forEach((item, index) => {
            if (!item || !item.cardData || !item.imageUrl) {
                console.error(`Post-shuffle data integrity issue at index ${index}:`, item);
            }
        });
    }
    

    if (shuffleButton) {
        shuffleButton.addEventListener('click', function() {
            // Shuffle the current player's library images
            const currentPlayerLibraryImages = playersData[currentPlayerId].libraryImages.images;
            shuffleArray(currentPlayerLibraryImages);
            
            // Re-render the shuffled images in the library section
            updatePlayerDisplay(currentPlayerId);
     
        });
    } else {
        console.error('"shuffle" button not found in the DOM');
    }
    
  
    function mulligan(playerKey) {
        console.log(`Performing mulligan for ${playerKey}...`);
    
        // Move hand cards back to the library
        playersData[playerKey].libraryImages.images.push(...playersData[playerKey].handImages.images);
        playersData[playerKey].handImages.images = [];
    
        console.log(`Moved hand cards back to the library for ${playerKey}.`);
    
        // Shuffle the library
        shuffleArray(playersData[playerKey].libraryImages.images);
        console.log(`Library shuffled for ${playerKey}.`);
    
        // Get the starter lands value from the corresponding player's scrollbox
        let scrollboxValue = 0;
        switch (playerKey) {
            case 'Player1':
                scrollboxValue = player1StarterLands;
                break;
            case 'Player2':
                scrollboxValue = player2StarterLands;
                break;
            case 'Player3':
                scrollboxValue = player3StarterLands;
                break;
            case 'Player4':
                scrollboxValue = player4StarterLands;
                break;
        }
        console.log(`Scrollbox value for ${playerKey}: ${scrollboxValue}`);
    
        // Function to draw 7 cards and check for the required number of lands
        const drawSevenCards = () => {
            console.log(`Drawing 7 cards for ${playerKey}...`);
            const drawnCards = [];
            for (let i = 0; i < 7; i++) {
                if (playersData[playerKey].libraryImages.images.length > 0) {
                    const card = playersData[playerKey].libraryImages.images.shift(); // Remove the first card from the library
                    drawnCards.push(card); // Add the removed card to the drawn cards array
                    console.log(`Moved card to hand: ${card.cardData ? card.cardData.name : "Card data not found"}`);
                }
            }
            console.log(`Finished drawing 7 cards for ${playerKey}.`);
            return drawnCards;
        };
    
        // Function to count the number of lands in the drawn cards
        const countLands = (cards) => {
            console.log(`Counting lands in drawn cards for ${playerKey}...`);
            const landCount = cards.reduce((count, card) => {
                if (card.cardData && card.cardData.typeLine.includes("Land")) {
                    console.log(`Found land card: ${card.cardData.name}`);
                    return count + 1;
                }
                return count;
            }, 0);
            console.log(`Land count for ${playerKey}: ${landCount}`);
            return landCount;
        };
    
        let drawnCards = drawSevenCards();
        let landCount = countLands(drawnCards);
    
        // Keep redrawing until the required number of lands is met or scrollbox value is 0
        while (scrollboxValue > 0 && ((isSwitchOn && landCount !== scrollboxValue) || (!isSwitchOn && landCount < scrollboxValue))) {
            console.log(`Insufficient lands for ${playerKey}. Redrawing...`);
            // Return the drawn cards back to the library
            playersData[playerKey].libraryImages.images.push(...drawnCards);
            shuffleArray(playersData[playerKey].libraryImages.images); // Reshuffle the library
            console.log(`Reshuffled library for ${playerKey}.`);
            drawnCards = drawSevenCards(); // Redraw 7 cards
            landCount = countLands(drawnCards); // Count the number of lands in the new draw
        }
    
        // Move the final drawn cards to the player's hand
        playersData[playerKey].handImages.images.push(...drawnCards);
        console.log(`Moved final drawn cards to ${playerKey}'s hand.`);
    
        // Update the player display
        updatePlayerDisplay(playerKey);

        console.log(`Player display updated for ${playerKey}.`);
    }

    document.getElementById('player1Mulligan').addEventListener('click', function() {
        mulligan('Player1');
    });
    


    document.getElementById('shuffleDrawEqual').addEventListener('click', function() {
        shuffleDrawEqual();
    });

    document.getElementById('shuffleDrawSeven').addEventListener('click', function() {
        shuffleDrawSeven();
    });

    document.getElementById('discardDrawEqual').addEventListener('click', function() {
        discardDrawEqual();
    });

    document.getElementById('discardDrawSeven').addEventListener('click', function() {
        discardDrawSeven();
    });


    function shuffleDrawEqual() {
        const playerKey = currentPlayerId;
        const handCards = playersData[playerKey].handImages.images;
        const libraryCards = playersData[playerKey].libraryImages.images;
    
        // Move hand cards to the library
        libraryCards.push(...handCards);
        playersData[playerKey].handImages.images = [];
    
        // Shuffle the library
        shuffleArray(libraryCards);
    
        // Move the same number of cards from the top of the library to the hand
        const drawCount = handCards.length;
        for (let i = 0; i < drawCount; i++) {
            if (libraryCards.length > 0) {
                const card = libraryCards.shift();
                playersData[playerKey].handImages.images.push(card);
            }
        }
    
        updatePlayerDisplay(playerKey);
    
    }

    function shuffleDrawSeven() {
        const playerKey = currentPlayerId;
        const handCards = playersData[playerKey].handImages.images;
        const libraryCards = playersData[playerKey].libraryImages.images;
    
        // Move hand cards to the library
        libraryCards.push(...handCards);
        playersData[playerKey].handImages.images = [];
    
        // Shuffle the library
        shuffleArray(libraryCards);
    
        // Move seven cards from the top of the library to the hand
        for (let i = 0; i < 7; i++) {
            if (libraryCards.length > 0) {
                const card = libraryCards.shift();
                playersData[playerKey].handImages.images.push(card);
            }
        }
    
        updatePlayerDisplay(playerKey);
    
    }

    function discardDrawEqual() {
        const playerKey = currentPlayerId;
        const handCards = playersData[playerKey].handImages.images;
        const libraryCards = playersData[playerKey].libraryImages.images;
        const graveyardCards = playersData[playerKey].graveyardImages.images;
    
        // Move hand cards to the graveyard
        graveyardCards.push(...handCards);
        playersData[playerKey].handImages.images = [];
    
        // Move the same number of cards from the top of the library to the hand
        const drawCount = handCards.length;
        for (let i = 0; i < drawCount; i++) {
            if (libraryCards.length > 0) {
                const card = libraryCards.shift();
                playersData[playerKey].handImages.images.push(card);
            }
        }
    
        updatePlayerDisplay(playerKey);
    }

    function discardDrawSeven() {
        const playerKey = currentPlayerId;
        const handCards = playersData[playerKey].handImages.images;
        const libraryCards = playersData[playerKey].libraryImages.images;
        const graveyardCards = playersData[playerKey].graveyardImages.images;
    
        // Move hand cards to the graveyard
        graveyardCards.push(...handCards);
        playersData[playerKey].handImages.images = [];
    
        // Move seven cards from the top of the library to the hand
        for (let i = 0; i < 7; i++) {
            if (libraryCards.length > 0) {
                const card = libraryCards.shift();
                playersData[playerKey].handImages.images.push(card);
            }
        }
    
        updatePlayerDisplay(playerKey);
    }

    

    document.addEventListener('mousemove', function(event) {
        // Get the element under the mouse cursor
        const element = document.elementFromPoint(event.clientX, event.clientY);
        
        // Check if the element is an image
        if (element.tagName === 'IMG') {
            // Get the card data from the image's data-card attribute
            const cardDataJSON = element.getAttribute('data-card');
            
            if (cardDataJSON) {
                // Parse the card data JSON
                const cardData = JSON.parse(cardDataJSON);
                
                // Store the last hovered card data
                lastHoveredCardData = cardData;
                
                // Log the card data to the console
                console.log('Mouse is hovering over a card:');
                console.log('Name:', cardData.name);
                console.log('Type:', cardData.typeLine);
                console.log('ID:', cardData.id);
                console.log('Mana Cost:', cardData.manaCost);
                console.log('Oracle Text:', cardData.oracleText);
                console.log('-------------------------');
            }
        }
    });

    document.addEventListener('keydown', function(event) {
        console.log('Key pressed:', event.key); // Log which key is pressed
    
        if (event.key === 'Shift' && lastHoveredCardData) {
            console.log('Shift key pressed with card hovered:', lastHoveredCardData);
    
            const playerData = playersData[currentPlayerId];
            console.log(`Current player data:`, playerData);
    
            const sections = ['libraryImages', 'handImages', 'landImages', 'battlefieldImages', 'graveyardImages', 'exileImages', 'commanderImages', 'deckImages'];
            let cardFound = false;
    
            for (const section of sections) {
                console.log(`Searching in section: ${section}`);
                const index = playerData[section].images.findIndex(card => card.cardData.id === lastHoveredCardData.id);
    
                if (index !== -1) {
                    console.log(`Card found in section: ${section}, at index: ${index}`);
                    const [card] = playerData[section].images.splice(index, 1);
    
                    playerData.moveImages.images.push(card);
                    cardFound = true;
    
                    console.log(`Card moved to the "moveImages" section:`, card);
                    break;
                }
            }
    
            if (cardFound) {
                updatePlayerDisplay(currentPlayerId);
                console.log('Card successfully moved.');
            } else {
                console.log('Card not found in any section.');
            }
    
            lastHoveredCardData = null;
        }
    });

    document.addEventListener('keydown', function(event) {
        console.log('Key pressed:', event.key); // Log which key is pressed
    
        if (!lastHoveredCardData) {
            console.log('No card hovered.');
            return;
        }
    
        const playerData = playersData[currentPlayerId];
        console.log(`Current player data:`, playerData);
    
        const sectionsMap = {
            '1': 'libraryImages',
            '2': 'handImages',
            '3': 'landImages',
            '4': 'battlefieldImages',
            '5': 'exileImages',
            '6': 'graveyardImages',
            '7': 'commanderImages'
        };
    
        const targetSection = sectionsMap[event.key];
        if (targetSection) {
            console.log(`Key pressed for moving card to: ${targetSection}`);
            
            // Find and remove the card from its current section
            const sections = Object.values(sectionsMap);
            for (const section of sections) {
                const index = playerData[section].images.findIndex(card => card.cardData.id === lastHoveredCardData.id);
                if (index !== -1) {
                    console.log(`Card found in section: ${section}, at index: ${index}`);
                    const [card] = playerData[section].images.splice(index, 1);
                    
                    // Add the card to the target section
                    playerData[targetSection].images.push(card);
                    console.log(`Card moved to "${targetSection}" section:`, card);
    
                    updatePlayerDisplay(currentPlayerId);
                    console.log('Card successfully moved.');
                    // Do not nullify lastHoveredCardData here
                    break; // Stop the loop after moving the card
                }
            }
        } 
    });
             
        
    

    // Check if the button exists to avoid errors
    if (oneTurnButton) {
        // Add an event listener to the button for the "click" event
        oneTurnButton.addEventListener('click', simulate1Turn);
    } else {
        // Log an error if the button wasn't found
        console.error('1 Turn button not found');
    }

    // Check if the button exists to avoid errors


    function handleHandImageClick(event) {
        const clickedImage = event.target;
        const cardData = getCardDataFromImage(clickedImage);
    
        if (cardData) {
            const cardName = cardData.name;
            const playerKey = getCurrentPlayerKey();
    
            if (clickedImage.classList.contains('marked')) {
                // Remove the red marker and remove the card from markedCards
                clickedImage.classList.remove('marked');
                clickedImage.style.border = '';
                delete playersData[playerKey].markedCards[cardName];
            } else {
                // Add the red marker and add the card to markedCards
                clickedImage.classList.add('marked');
                clickedImage.style.border = '2px solid red';
                playersData[playerKey].markedCards[cardName] = true;
            }
    
            console.log(`Marked cards for ${playerKey}:`, playersData[playerKey].markedCards);
        }
    }
    
    // Add event listener to the hand section
    const handSection = document.getElementById('hand');
    handSection.addEventListener('click', handleHandImageClick);
    
    // Function to get the current player key
    function getCurrentPlayerKey() {
        // Implement your logic to determine the current player key
        // For example, you can use the `currentPlayerId` variable
        return currentPlayerId;
    }
    





    function simulate1Turn() {
        console.log('Simulating 1 turn');
    
        // Assuming currentPlayerId is the ID of the single player
        console.log(`Current player is Player 1`);
    
        // Log the current state of the player's hand before any action

    
        // Determine the action based on the current step
        switch (oneTurnStep) {
            case 0:
                console.log("Case 0: Drawing a card from the library to the hand.");
                tappedLands = [];
                drawCardFromLibraryToHand(currentPlayerId);
                console.log(`After drawing a card, hand:`, playersData[currentPlayerId].handImages.images.map(card => ({
                    name: card.cardData.name,
                    typeLine: card.cardData.type_line
                })));
                oneTurnStep++; // Move to the next step
                break;
            case 1:
                console.log("Case 1: Moving the first land from hand to land.");
                moveFirstLandFromHandToLand(currentPlayerId);
                console.log(`After moving first land, hand:`, playersData[currentPlayerId].handImages.images.map(card => ({
                    name: card.cardData.name,
                    typeLine: card.cardData.type_line
                })));
                console.log(`Lands section after moving a land:`, playersData[currentPlayerId].landImages.images.map(card => ({
                    name: card.cardData.name,
                    typeLine: card.cardData.type_line
                })));
                oneTurnStep++; // Move to the next step
                break;
            case 2:
                console.log("Case 2: Attempting to play a card from hand to the battlefield.");
                cardPlayed = false;
                playCardFromHandToBattlefield(currentPlayerId);
                oneTurnStep = 0; // Reset to the first step for the next turn
                break;
            default:
                console.log("Unknown step");
                break;
        }
    }

    function toggleAutoTurns() {
        const autoButton = document.getElementById('autoTurns');
    
        if (autoTurnIntervalId === null) {
            autoTurnIntervalId = setInterval(simulate1Turn, 1000);
            autoButton.textContent = 'Stop';
        } else {
            clearInterval(autoTurnIntervalId);
            autoTurnIntervalId = null;
            autoButton.textContent = 'Auto';
        }
    }
    
    // Add event listener to the auto button
    const autoButton = document.getElementById('autoTurns');
    autoButton.addEventListener('click', toggleAutoTurns);

    let autoChoicesIntervalId = null;

    function toggleAutoChoices() {
        const autoChoicesButton = document.getElementById('choiceTurns');
    
        if (autoChoicesIntervalId === null) {
            autoChoicesIntervalId = setInterval(simulateChoicesTurn, 1000);
            autoChoicesButton.textContent = 'Stop Choices';
            choicesTurn = true;  // Ensure choicesTurn is set to true when auto choices are running
        } else {
            clearInterval(autoChoicesIntervalId);
            autoChoicesIntervalId = null;
            autoChoicesButton.textContent = 'Auto Choices';
            choicesTurn = false;  // Set choicesTurn to false when auto choices are stopped
        }
    }

    // Add event listener to the auto choices button
    const autoChoicesButton = document.getElementById('choiceTurns');
    autoChoicesButton.addEventListener('click', toggleAutoChoices);

    function simulateChoicesTurn() {
        console.log('Starting simulateChoicesTurn...');
        console.log(`Current step before action: ${currentChoicesTurnStep}`);
    
        switch (currentChoicesTurnStep) {
            case 0:
                console.log("Case 0: Drawing a card from the library to the hand.");
                tappedLands = [];
                drawCardFromLibraryToHand(currentPlayerId);
                if (!choiceMade) {
                    currentChoicesTurnStep++;
                    console.log("Moving to next step after drawing a card.");
                } else {
                    console.log("Choice required, pausing step increment.");
                }
                break;
            case 1:
                console.log("Case 1: Moving the first land from hand to land.");
                
                // Check the status of the auto-play switch to determine which function to run
                if (document.getElementById('autoPlaySwitch').checked) {
                    console.log("Auto Play Switch is on, running auto land move.");
                    moveFirstLandFromHandToLandAuto(currentPlayerId);
                } else {
                    console.log("Auto Play Switch is off, running manual land move.");
                    moveFirstLandFromHandToLandChoice(currentPlayerId);
                }
    
                if (!choiceMade) {
                    currentChoicesTurnStep++;
                    console.log("Moving to next step after moving land.");
                } else {
                    console.log("Choice required, pausing step increment.");
                }
                break;
            case 2:
                console.log("Case 2: Playing a card from hand to the battlefield.");
                cardPlayed = false;

                playCardFromHandToBattlefieldAuto(currentPlayerId);
                // Check if the action is completed, then move to the next step or reset
                if (choiceMade) {
                    console.log("Choice made, waiting for action to complete.");
                } else {
                    currentChoicesTurnStep = 0;  // Or advance to the next step as needed
                    console.log("Resetting to step 0 after playing a card.");
                }
                break;
            default:
                console.log("Unknown step encountered. Resetting to step 0.");
                currentChoicesTurnStep = 0;
                break;
        }
    
        console.log(`Current step after action: ${currentChoicesTurnStep}`);
        choiceMade = false; // Reset the choiceMade flag after processing the step
    }


    document.getElementById('choice').addEventListener('click', function(event) {
        const clickedElement = event.target;
        console.log('Clicked element in choice section:', clickedElement);
    
        if (clickedElement.tagName === 'IMG' && clickedElement.dataset.card) {
            const cardData = JSON.parse(clickedElement.dataset.card);
            console.log('Clicked card data:', cardData);
    
            if (cardData && cardData.name) {
                console.log(`Card name from clicked choice card: ${cardData.name}`);
                choiceCards.push(cardData.name); // Add the card name to the choiceCards array
    
                // Clear the choiceImages and update the display
                playersData[currentPlayerId].choiceImages.images = [];
                console.log('Cleared choice images and updating display');
                updatePlayerDisplay(currentPlayerId);
    
                // Resume the auto choices process
                console.log('Checking autoChoicesIntervalId:', autoChoicesIntervalId);
                if (!autoChoicesIntervalId) {
                    console.log('Toggling auto choices due to card selection');
                    toggleAutoChoices();
                }
            } else {
                console.error('Card name not found in clicked choice card');
            }
        } else {
            console.log('Clicked element is not an image or does not have card data');
        }
    });

    function drawCardFromLibraryToHand(playerId) {
        const libraryImages = playersData[playerId].libraryImages.images;
        const handImages = playersData[playerId].handImages.images;
    
        console.log('Before drawing a card, library:', libraryImages.slice(0, 1)); // Log the first card in the library
    
        if (libraryImages.length > 0) {
            const drawnCard = libraryImages.shift();
            console.log('Drawn card:', drawnCard); // Confirm the structure of the drawn card
    
            handImages.push(drawnCard);
            updatePlayerDisplay(playerId); // Update the entire UI for consistency
        } else {
            console.log('No cards left in the library to draw');
        }
    }
    
    function moveFirstLandFromHandToLand(playerId) {
        console.log(`Starting moveFirstLandFromHandToLand for ${playerId}`);
        const handImages = playersData[playerId].handImages.images;
        const landImages = playersData[playerId].landImages.images;
    
        const landCards = handImages.filter(card => isLandCard(card.cardData) && !playersData[playerId].markedCards[card.cardData.name]);
        console.log(`Found ${landCards.length} land cards in hand for ${playerId}`);
    
        if (landCards.length === 0) {
            console.log('No land cards found in hand for', playerId);
            return;
        }
    
        const searchableLandCards = landCards.filter(card => card.cardData.uiState && card.cardData.uiState.checkboxes.search);
        console.log(`Found ${searchableLandCards.length} searchable land cards for ${playerId}`);
    
        if (searchableLandCards.length > 0) {
            console.log('Processing searchable land cards...');
            const searchableLandCard = searchableLandCards[0];
            console.log(`Selected searchable land card: ${searchableLandCard.cardData.name} for ${playerId}`);
    
            const highlightedCardNames = searchableLandCard.cardData.uiState.highlightedCards;
            console.log(`Highlighted card names for search: ${highlightedCardNames.join(', ')} for ${playerId}`);
    
            const matchingLibraryCard = playersData[playerId].libraryImages.images.find(card => highlightedCardNames.includes(card.cardData.name));
            if (matchingLibraryCard) {
                console.log(`Found matching library card: ${matchingLibraryCard.cardData.name} for ${playerId}`);
    
                const libraryIndex = playersData[playerId].libraryImages.images.indexOf(matchingLibraryCard);
                const [landCard] = playersData[playerId].libraryImages.images.splice(libraryIndex, 1);
                playersData[playerId].landImages.images.push(landCard);
                console.log(`Moved ${landCard.cardData.name} from library to land for ${playerId}`);
    
                const handIndex = handImages.indexOf(searchableLandCard);
                const [discardedLandCard] = handImages.splice(handIndex, 1);
                playersData[playerId].graveyardImages.images.push(discardedLandCard);
                console.log(`Moved ${discardedLandCard.cardData.name} from hand to graveyard for ${playerId}`);
    
                updatePlayerDisplay(playerId);
                updateManaCounter();
                calculateBattlefieldMana();
                return;
            }
        }
    
        console.log(`No searchable land cards matched. Continuing for ${playerId}`);
        const unplayableCards = handImages.filter(card => !isLandCard(card.cardData) && !canPlayCard(card.cardData.mana_cost, playersData[playerId].manaCounter, card.cardData.cmc, card.cardData.name));
        console.log(`Found ${unplayableCards.length} unplayable cards for ${playerId}`);
    
        if (unplayableCards.length === 0) {
            console.log('All non-land cards are playable, playing first land card for', playerId);
            const [landCard] = landCards.splice(0, 1);
            handImages.splice(handImages.indexOf(landCard), 1);
            playersData[playerId].landImages.images.push(landCard);
            console.log(`Moved ${landCard.cardData.name} from hand to land for ${playerId}`);
    
            // Check if the land enters tapped
            if (landCard.cardData.uiState && landCard.cardData.uiState.checkboxes.entersTapped) {
                tappedLands.push(landCard.cardData.id);
                console.log(`${landCard.cardData.id} enters the battlefield tapped and added to tappedLands.`);
            }
    
            // Handle returnLand logic
            if (landCard.cardData.uiState && landCard.cardData.uiState.checkboxes.returnLand) {
                const returnableLand = landImages.find(l => !l.cardData.uiState.checkboxes.entersTapped && !l.cardData.uiState.checkboxes.returnLand && l.cardData.id !== landCard.cardData.id);
                if (returnableLand) {
                    landImages.splice(landImages.indexOf(returnableLand), 1);
                    handImages.push(returnableLand);
                    console.log(`Returned ${returnableLand.cardData.name} from land to hand for ${playerId}`);
                }
            }
        } else {
            console.log('Finding land card that matches the mana requirements for unplayable cards for', playerId);
            const lowestCMCCard = unplayableCards.reduce((prev, current) => prev.cardData.cmc < current.cardData.cmc ? prev : current);
            const requiredMana = getRequiredMana(lowestCMCCard.cardData.mana_cost, playersData[playerId].manaCounter);
            console.log(`Lowest CMC card: ${lowestCMCCard.cardData.name}, Required mana: ${requiredMana} for ${playerId}`);
    
            const prioritizedLandCard = landCards.find(card => canProduceMana(card.cardData, requiredMana));
            if (prioritizedLandCard) {
                console.log(`Playing prioritized land card: ${prioritizedLandCard.cardData.name} for ${playerId}`);
                const index = handImages.indexOf(prioritizedLandCard);
                const [landCard] = handImages.splice(index, 1);
                playersData[playerId].landImages.images.push(landCard);
                console.log(`Moved ${landCard.cardData.name} from hand to land for ${playerId}`);
    
                // Check if the land enters tapped
                if (landCard.cardData.uiState && landCard.cardData.uiState.checkboxes.entersTapped) {
                    tappedLands.push(landCard.cardData.id);
                    console.log(`${landCard.cardData.id} enters the battlefield tapped and added to tappedLands.`);
                }
    
                // Handle returnLand logic
                if (landCard.cardData.uiState && landCard.cardData.uiState.checkboxes.returnLand) {
                    const returnableLand = landImages.find(l => !l.cardData.uiState.checkboxes.entersTapped && !l.cardData.uiState.checkboxes.returnLand && l.cardData.id !== landCard.cardData.id);
                    if (returnableLand) {
                        landImages.splice(landImages.indexOf(returnableLand), 1);
                        handImages.push(returnableLand);
                        console.log(`Returned ${returnableLand.cardData.name} from land to hand for ${playerId}`);
                    }
                }
            } else {
                console.log('No prioritized land card found, playing first land card for', playerId);
                const [landCard] = landCards.splice(0, 1);
                handImages.splice(handImages.indexOf(landCard), 1);
                playersData[playerId].landImages.images.push(landCard);
                console.log(`Moved ${landCard.cardData.name} from hand to land for ${playerId}`);
    
                // Check if the land enters tapped
                if (landCard.cardData.uiState && landCard.cardData.uiState.checkboxes.entersTapped) {
                    tappedLands.push(landCard.cardData.id);
                    console.log(`${landCard.cardData.id} enters the battlefield tapped and added to tappedLands.`);
                }
    
                // Handle returnLand logic
                if (landCard.cardData.uiState && landCard.cardData.uiState.checkboxes.returnLand) {
                    const returnableLand = landImages.find(l => !l.cardData.uiState.checkboxes.entersTapped && !l.cardData.uiState.checkboxes.returnLand && l.cardData.id !== landCard.cardData.id);
                    if (returnableLand) {
                        landImages.splice(landImages.indexOf(returnableLand), 1);
                        handImages.push(returnableLand);
                        console.log(`Returned ${returnableLand.cardData.name} from land to hand for ${playerId}`);
                    }
                }
            }
        }
    
        updatePlayerDisplay(playerId);
        console.log(`Updated display for ${playerId}`);
        updateManaCounter();
        calculateBattlefieldMana();
    }
    
    

    function moveFirstLandFromHandToLandChoice(playerId) {
        console.log("Starting moveFirstLandFromHandToLandChoice for", playerId);
        const handImages = playersData[playerId].handImages.images;
    
        // Check for a chosen land card
        const choiceLand = handImages.find(card => choiceCards.includes(card.cardData.name) && isLandCard(card.cardData));
        if (choiceLand) {
            console.log(`Playing chosen land card: ${choiceLand.cardData.name}`);
            playersData[playerId].landImages.images.push(choiceLand);
            handImages.splice(handImages.indexOf(choiceLand), 1);
    
            // Check if the chosen land enters tapped and add to tappedLands if so
            if (choiceLand.cardData.uiState && choiceLand.cardData.uiState.checkboxes.entersTapped) {
                tappedLands.push(choiceLand.cardData.id);
                console.log(`${choiceLand.cardData.id} will enter tapped and has been added to tappedLands.`);
            }
    
            choiceCards = [];
            updatePlayerDisplay(playerId);
            updateManaCounter();
            calculateBattlefieldMana();
            choiceMade = false;
            return;
        }
    
        const landCards = handImages.filter(card => isLandCard(card.cardData) && !playersData[playerId].markedCards[card.cardData.name]);
        console.log(`Found ${landCards.length} land cards in hand for ${playerId}`);
    
        if (landCards.length === 0) {
            console.log('No land cards found in hand for', playerId);
            return;
        }
    
        if (choicesTurn && landCards.length > 1) {
            console.log('Multiple lands available for choice, presenting choices for', playerId);
            playersData[playerId].choiceImages.images = [...landCards];
            updatePlayerDisplay(playerId);
            toggleAutoChoices();
            choiceMade = true;
            return;
        }
    
        const searchableLandCards = landCards.filter(card => card.cardData.uiState && card.cardData.uiState.checkboxes.search);
        console.log(`Found ${searchableLandCards.length} searchable land cards for ${playerId}`);
    
        if (searchableLandCards.length > 0) {
            const searchableLandCard = searchableLandCards[0];
            const highlightedCardNames = searchableLandCard.cardData.uiState.highlightedCards;
            const matchingLibraryCard = playersData[playerId].libraryImages.images.find(card => highlightedCardNames.includes(card.cardData.name));
    
            if (matchingLibraryCard) {
                console.log(`Found matching library card: ${matchingLibraryCard.cardData.name} for ${playerId}`);
                const libraryIndex = playersData[playerId].libraryImages.images.indexOf(matchingLibraryCard);
                const [landCard] = playersData[playerId].libraryImages.images.splice(libraryIndex, 1);
                playersData[playerId].landImages.images.push(landCard);
    
                const handIndex = handImages.indexOf(searchableLandCard);
                const [discardedLandCard] = handImages.splice(handIndex, 1);
                playersData[playerId].graveyardImages.images.push(discardedLandCard);
    
                updatePlayerDisplay(playerId);
                updateManaCounter();
                calculateBattlefieldMana();
                return;
            }
        }
    
        const unplayableCards = handImages.filter(card => !isLandCard(card.cardData) && !canPlayCard(card.cardData.mana_cost, playersData[playerId].manaCounter, card.cardData.cmc, card.cardData.name));
        console.log(`Found ${unplayableCards.length} unplayable cards for ${playerId}`);
    
        if (unplayableCards.length === 0) {
            console.log('All non-land cards are playable, playing first land card for', playerId);
            const [landCard] = landCards.splice(0, 1);
            playersData[playerId].landImages.images.push(landCard);
    
            // Check if the land enters tapped and add to tappedLands if so
            if (landCard.cardData.uiState && landCard.cardData.uiState.checkboxes.entersTapped) {
                tappedLands.push(landCard.cardData.id);
                console.log(`${landCard.cardData.id} will enter tapped and has been added to tappedLands.`);
            }
        } else {
            console.log('Finding land card that matches the mana requirements for unplayable cards for', playerId);
            const lowestCMCCard = unplayableCards.reduce((prev, current) => prev.cardData.cmc < current.cardData.cmc ? prev : current);
            const requiredMana = getRequiredMana(lowestCMCCard.cardData.mana_cost, playersData[playerId].manaCounter);
            const prioritizedLandCard = landCards.find(card => canProduceMana(card.cardData, requiredMana));
    
            if (prioritizedLandCard) {
                console.log(`Playing prioritized land card: ${prioritizedLandCard.cardData.name} for ${playerId}`);
                const index = handImages.indexOf(prioritizedLandCard);
                const [landCard] = handImages.splice(index, 1);
                playersData[playerId].landImages.images.push(landCard);
    
                // Check if the land enters tapped and add to tappedLands if so
                if (landCard.cardData.uiState && landCard.cardData.uiState.checkboxes.entersTapped) {
                    tappedLands.push(landCard.cardData.id);
                    console.log(`${landCard.cardData.id} will enter tapped and has been added to tappedLands.`);
                }
            } else {
                console.log('No prioritized land card found, playing first land card for', playerId);
                const [landCard] = landCards.splice(0, 1);
                playersData[playerId].landImages.images.push(landCard);
    
                // Check if the land enters tapped and add to tappedLands if so
                if (landCard.cardData.uiState && landCard.cardData.uiState.checkboxes.entersTapped) {
                    tappedLands.push(landCard.cardData.id);
                    console.log(`${landCard.cardData.id} will enter tapped and has been added to tappedLands.`);
                }
            }
        }
    
        updatePlayerDisplay(playerId);
        updateManaCounter();
        calculateBattlefieldMana();
    }
    

    function moveFirstLandFromHandToLandAuto(playerId) {
        const handImages = playersData[playerId].handImages.images;
        const libraryImages = playersData[playerId].libraryImages.images;
        const landCards = handImages.filter(card => isLandCard(card.cardData));
    
        if (landCards.length === 0) {
            console.log('No land cards found in hand');
            return;
        }
    
        // Check for land cards with uiState.checkboxes.search set to true
        const searchableLandCards = landCards.filter(card => card.cardData.uiState && card.cardData.uiState.checkboxes.search);
    
        if (searchableLandCards.length > 0) {
            const searchableLandCard = searchableLandCards[0];
            const highlightedCardNames = searchableLandCard.cardData.uiState.highlightedCards;
    
            // Search the library for a card that matches one of the highlighted card names
            const matchingLibraryCard = libraryImages.find(card => highlightedCardNames.includes(card.cardData.name));
    
            if (matchingLibraryCard) {
                // Move the matching library card to the landImages
                const libraryIndex = libraryImages.indexOf(matchingLibraryCard);
                const [landCard] = libraryImages.splice(libraryIndex, 1);
                playersData[playerId].landImages.images.push(landCard);

                // Check if the land enters tapped
                if (landCard.cardData.uiState && landCard.cardData.uiState.checkboxes.entersTapped) {
                    tappedLands.push(landCard.cardData.id);
                    console.log(`${landCard.cardData.id} enters tapped and is added to tappedLands.`);
                }
        
                // Move the searchable land card from the hand to the graveyardImages
                const handIndex = handImages.indexOf(searchableLandCard);
                const [discardedLandCard] = handImages.splice(handIndex, 1);
                playersData[playerId].graveyardImages.images.push(discardedLandCard);
    
                updatePlayerDisplay(playerId);
                updateManaCounter();
                calculateBattlefieldMana();
                return;
            }
        }
    
        // If no searchable or matching library cards, proceed with the original logic
        const nonLandCards = handImages.filter(card => !isLandCard(card.cardData));
        const unplayableCards = nonLandCards.filter(card => !canPlayCard(card.cardData.mana_cost, playersData[playerId].manaCounter, card.cardData.cmc, card.cardData.name));
    
        if (unplayableCards.length === 0) {
            // If all non-land cards are playable, just play the first land card
            const [landCard] = landCards.splice(0, 1);
            playersData[playerId].landImages.images.push(landCard);

            if (landCard.cardData.uiState && landCard.cardData.uiState.checkboxes.entersTapped) {
                tappedLands.push(landCard.cardData.id);
                console.log(`${landCard.cardData.id} enters tapped and is added to tappedLands.`);
            }
        } else {
            // Find the unplayable card with the lowest CMC
            const lowestCMCCard = unplayableCards.reduce((prev, current) => prev.cardData.cmc < current.cardData.cmc ? prev : current);
    
            // Find a land card that produces the required mana for the lowest CMC card
            const requiredMana = getRequiredMana(lowestCMCCard.cardData.mana_cost, playersData[playerId].manaCounter);
            const prioritizedLandCard = landCards.find(card => canProduceMana(card.cardData, requiredMana));
    
            if (prioritizedLandCard) {
                // If a prioritized land card is found, play it
                const index = handImages.indexOf(prioritizedLandCard);
                const [landCard] = handImages.splice(index, 1);
                playersData[playerId].landImages.images.push(landCard);
                if (landCard.cardData.uiState && landCard.cardData.uiState.checkboxes.entersTapped) {
                    tappedLands.push(landCard.cardData.id);
                    console.log(`${landCard.cardData.id} enters tapped and is added to tappedLands.`);
                }
            } else {
                // If no prioritized land card is found, just play the first land card
                const [landCard] = landCards.splice(0, 1);
                playersData[playerId].landImages.images.push(landCard);
                if (landCard.cardData.uiState && landCard.cardData.uiState.checkboxes.entersTapped) {
                    tappedLands.push(landCard.cardData.id);
                    console.log(`${landCard.cardData.id} enters tapped and is added to tappedLands.`);
                }
            }
        }
    
        updatePlayerDisplay(playerId);
        updateManaCounter();
        calculateBattlefieldMana();
    }


    
    function canProduceMana(landCardData, requiredMana) {
        const landManaCounter = landCardData.uiState.manaCounter;
    
        for (const [color, requiredAmount] of Object.entries(requiredMana)) {
            if (color !== "generic" && (landManaCounter[color] || 0) < requiredAmount) {
                return false;
            }
        }
    
        // Check if the land can produce the required generic mana
        const totalMana = Object.values(landManaCounter).reduce((sum, amount) => sum + amount, 0);
        return totalMana >= requiredMana.generic;
    }
    
    function isLandCard(cardData) {
        if (!cardData) {
            console.error("Card data is undefined");
            return false;
        }
        return cardData.typeLine && cardData.typeLine.toLowerCase().includes("land");
    }

    function playCardFromHandToBattlefield(playerId) {
        const handCards = playersData[playerId].handImages.images;
        const commanderCards = playersData[playerId].commanderImages.images;
    
        // Use the totalMana from playersData
        let totalMana = playersData[playerId].totalMana;
        console.log(`Starting playCardFromHandToBattlefield with total mana: ${totalMana}`);
    
        // Combine hand and commander cards
        let combinedCards = handCards.concat(commanderCards);
    
        // Filter cards that can potentially be played (ignoring specific mana requirements for now)
        let potentialPlayableCards = combinedCards.filter(card => 
            card.cardData.settings.cmc <= totalMana &&
            !card.cardData.settings.type_line.includes("Land")
        );
    
        // Now filter based on specific mana requirements
        let playableCards = potentialPlayableCards.filter(card => 
            canPlayCard(card.cardData.settings.mana_cost, playersData[playerId].manaCounter, card.cardData.settings.cmc, card.cardData.name)
        );
    
        console.log(`Found ${playableCards.length} playable cards after filtering by CMC and specific mana`);
    
        // Sort playable cards by CMC in ascending order
        playableCards.sort((a, b) => a.cardData.settings.cmc - b.cardData.settings.cmc);
        console.log("Sorted playable cards by CMC");
    
        let manaUsed = 0;
        let cardsPlayed = [];
    
        for (const card of playableCards) {
            if (manaUsed + card.cardData.settings.cmc <= totalMana) {
                console.log(`Playing card: ${card.cardData.name}`);
                playersData[playerId].battlefieldImages.images.push(card);
                manaUsed += card.cardData.settings.cmc;
                cardsPlayed.push(card.cardData.name);
    
                // Remove the card from hand or commander section
                if (handCards.includes(card)) {
                    handCards.splice(handCards.indexOf(card), 1);
                } else if (commanderCards.includes(card)) {
                    commanderCards.splice(commanderCards.indexOf(card), 1);
                }
            }
    
            if (manaUsed >= totalMana) {
                console.log("Used all available mana");
                break;
            }
        }
    
        if (cardsPlayed.length > 0) {
            console.log(`Played cards onto battlefield: ${cardsPlayed.join(', ')}`);
        } else {
            console.log('No cards were played.');
        }
    
        updatePlayerDisplay(playerId);
    }
        
        




     function playCardFromHandToBattlefieldAuto(playerId) {
        const handCards = playersData[playerId].handImages.images;
        const commanderCards = playersData[playerId].commanderImages.images;  // Assuming this is how you access commander cards
    
        console.log("Starting playCardFromHandToBattlefield");
    
        updateManaCounter();
        const manaCounter = playersData[playerId].manaCounter;
        console.log("Updated mana counter:", manaCounter);

        const combinedCards = handCards.concat(commanderCards);
    
    
        // Process choiceCards first if any card has been selected
        if (choiceCards.length) {
            console.log("Checking choiceCards:", choiceCards);
            const cardToPlay = combinedCards.find(card => choiceCards.includes(card.cardData.name));
            if (cardToPlay) {
                console.log(`Playing chosen card ${cardToPlay.cardData.name} onto battlefield.`);
                // Determine where the card is from and remove it from the correct array
                if (handCards.includes(cardToPlay)) {
                    handCards.splice(handCards.indexOf(cardToPlay), 1);
                } else if (commanderCards.includes(cardToPlay)) {
                    commanderCards.splice(commanderCards.indexOf(cardToPlay), 1);
                }
                playersData[playerId].battlefieldImages.images.push(cardToPlay);
                updatePlayerDisplay(playerId);
                choiceCards = [];
                choiceMade = false;
                cardPlayed = true;
            }
        }
    
        if (!cardPlayed) {
            const playableCards = combinedCards.filter(card => 
                canPlayCard(card.cardData.settings.mana_cost, manaCounter, card.cardData.settings.cmc, card.cardData.name) && 
                !card.cardData.settings.type_line.includes("Land") &&
                !playersData[playerId].markedCards[card.cardData.name]);
    
            console.log(`Found ${playableCards.length} playable cards`);
    
            if (choicesTurn && playableCards.length > 1) {
                console.log('Multiple playable cards available, presenting choices');
                playersData[playerId].choiceImages.images = [...playableCards];
                updatePlayerDisplay(playerId);
                toggleAutoChoices();
                choiceMade = true;
                cardPlayed = true;
                return;
            } else if (playableCards.length === 1) {
                console.log("One playable card found, playing it");
                const cardToPlay = playableCards[0];
                // Determine where the card is from and remove it from the correct array
                if (handCards.includes(cardToPlay)) {
                    handCards.splice(handCards.indexOf(cardToPlay), 1);
                } else if (commanderCards.includes(cardToPlay)) {
                    commanderCards.splice(commanderCards.indexOf(cardToPlay), 1);
                }
                playersData[playerId].battlefieldImages.images.push(cardToPlay);
                console.log(`Played ${cardToPlay.cardData.name} onto battlefield.`);
                updatePlayerDisplay(playerId);
                choiceMade = true;
                cardPlayed = true;
            } else {
                console.log('No playable cards found.');
            }
        }
    

        if (cardPlayed) {
            choiceMade = false;  // Reset choiceMade only after successfully playing a card
            console.log(`Card played: ${cardPlayed}`);
        } else {
            console.log(`No card was played.`);
        }
    
        console.log(`Card played: ${cardPlayed}`);
        choiceMade = false; // Update choiceMade based on cardPlayed status
    }



    function canPlayCard(cardManaCost, manaCounter, cardCmc, cardName) {
        updateManaCounter();
    
        let finalTotalMana = playersData[currentPlayerId].totalMana;
        console.log("Final total mana available:", finalTotalMana, "for card:", cardName, "with CMC:", cardCmc);
    
        if (finalTotalMana < cardCmc) {
            console.log("Not enough total mana to play the card.");
            return false;
        }
    
        const manaCostArray = typeof cardManaCost === 'string' ? cardManaCost.match(/\{([^}]+)\}/g) : cardManaCost;
        if (!manaCostArray) {
            return finalTotalMana >= cardCmc;
        }
    
        let genericManaRequired = 0;
        const manaRequirements = manaCostArray.reduce((acc, cost) => {
            const color = cost.replace(/[{}]/g, '');
            if (!isNaN(color)) {
                genericManaRequired += parseInt(color);
            } else {
                acc[color] = (acc[color] || 0) + 1;
            }
            return acc;
        }, {});
    
        console.log("Mana requirements for the card:", manaRequirements, "Generic mana required:", genericManaRequired);
    
        // This check is redundant and can be removed as we have already checked if total mana is less than card CMC
        // if (finalTotalMana < cardCmc) {
        //     console.log("Not enough total mana to play the card.");
        //     return false;
        // }
    
        for (const [color, requiredAmount] of Object.entries(manaRequirements)) {
            if ((manaCounter[color] || 0) < requiredAmount) {
                console.log(`Not enough ${color} mana to play the card.`);
                return false;
            }
        }
    
        return finalTotalMana >= cardCmc;
    }
        
    
    function getCardDataFromImage(imgElement) {
        const cardDataJSON = imgElement.getAttribute('data-card');
        try {
            return JSON.parse(cardDataJSON);
        } catch (error) {
            console.error('Error parsing card data:', error);
            return null;
        }
    }
    
    
    // Function to update the display name in the navigation
    function updateDisplay() {
        const displayElement = document.getElementById('display');
        if (displayElement) {
            displayElement.textContent = sections[currentIndex];
        } else {
            console.error("'display' element not found");
        }
    }
    







    document.querySelectorAll('.current-player-section').forEach(section => {
        section.addEventListener('wheel', function(event) {
            // Prevent the default vertical scrolling
            event.preventDefault();
            
            // Scroll horizontally instead, adjusting the scroll speed if necessary
            // The 120 divisor is commonly used for mouse wheel delta normalization
            this.scrollLeft += event.deltaY / 120 * 25; // Adjust the multiplier as needed for speed
        }, { passive: false }); // The { passive: false } option is to allow preventDefault to work
    });


    




    function updateManaCounter() {
        // Initialize the mana counter object for the current player
        playersData[currentPlayerId].manaCounter = {
            W: 0,
            U: 0,
            B: 0,
            R: 0,
            G: 0,
            C: 0 // Assuming 'C' represents colorless mana
        };
        
        // Temporary variable to hold the total mana count
        let tempTotalMana = 0;
    
        // Access the land section for the current player
        const landCards = playersData[currentPlayerId].landImages.images;
    
        // Iterate over each land card and update the manaCounter object if not in tappedLands
        landCards.forEach(card => {
            if (!tappedLands.includes(card.cardData.id)) {
                const manaCounter = card.cardData.uiState.manaCounter;
                Object.keys(manaCounter).forEach(manaType => {
                    const manaAmount = manaCounter[manaType];
                    playersData[currentPlayerId].manaCounter[manaType] += manaAmount;
                    tempTotalMana += manaAmount; // Add to the total mana count
                });
            }
        });
    
        // Access the battlefield section for the current player
        const battlefieldCards = playersData[currentPlayerId].battlefieldImages.images;
    
        // Iterate over each battlefield card and update the manaCounter object
        battlefieldCards.forEach(card => {
            if (card.cardData.uiState && card.cardData.uiState.manaCounter) {
                const manaCounter = card.cardData.uiState.manaCounter;
                Object.keys(manaCounter).forEach(manaType => {
                    const manaAmount = manaCounter[manaType];
                    playersData[currentPlayerId].manaCounter[manaType] += manaAmount;
                    tempTotalMana += manaAmount; // Add to the total mana count
                });
            }
        });
    
        // Calculate the total mana produced by 'or' lands and battlefield cards and subtract from tempTotalMana
        let landOrMana = calculateLandOrMana();
        let battlefieldOrMana = calculateBattlefieldOrMana();
        let finalTotalMana = tempTotalMana - landOrMana - battlefieldOrMana;
    
        // Update the mana counter display
        document.getElementById("whiteMana").textContent = `W: ${playersData[currentPlayerId].manaCounter.W}`;
        document.getElementById("blueMana").textContent = `U: ${playersData[currentPlayerId].manaCounter.U}`;
        document.getElementById("blackMana").textContent = `B: ${playersData[currentPlayerId].manaCounter.B}`;
        document.getElementById("redMana").textContent = `R: ${playersData[currentPlayerId].manaCounter.R}`;
        document.getElementById("greenMana").textContent = `G: ${playersData[currentPlayerId].manaCounter.G}`;
        document.getElementById("colorlessMana").textContent = `C: ${playersData[currentPlayerId].manaCounter.C}`;
        // Assuming you have an element to display total mana
        playersData[currentPlayerId].totalMana = finalTotalMana; // Store total mana in playersData
        document.getElementById("totalMana").textContent = `T: ${finalTotalMana}`;
        // Log the total mana to the console
        //console.log(`FinalTotalMana: ${finalTotalMana}`);

    }

    function calculateLandOrMana() {
        let landOrMana = 0; // Initialize the counter for the total mana produced by "or" lands
        let orLandsCount = 0; // Initialize the counter for the number of lands with 'or' set to true
    
        // Access the land section for the current player
        const landCards = playersData[currentPlayerId].landImages.images;
    
        // Iterate over each land card
        landCards.forEach(card => {
            // Skip this land if it is in the tappedLands array
            if (tappedLands.includes(card.cardData.id)) {
                return;
            }
    
            if (card.cardData.uiState.checkboxes.or) {
                orLandsCount++; // Increment the count of 'or' lands only if not tapped
                // Accumulate the total mana produced by this land
                Object.values(card.cardData.uiState.manaCounter).forEach(manaAmount => {
                    landOrMana += manaAmount;
                });
            }
        });
    
        // Adjust the total mana for 'or' lands
        // Here, you might need to adjust the logic based on how you want to count 'or' lands
        landOrMana -= orLandsCount;
    
        return landOrMana; // Return this value for further use
    }
    

    function calculateBattlefieldMana() {
        // Initialize the mana counter object for the current player
        const battlefieldManaCounter = {
            W: 0,
            U: 0,
            B: 0,
            R: 0,
            G: 0,
            C: 0 // Assuming 'C' represents colorless mana
        };
        
        // Temporary variable to hold the total mana count
        let tempTotalMana = 0;
    
        // Access the battlefield section for the current player
        const battlefieldCards = playersData[currentPlayerId].battlefieldImages.images;
    
        // Iterate over each battlefield card and update the battlefieldManaCounter object
        battlefieldCards.forEach(card => {
            if (card.cardData.uiState && card.cardData.uiState.manaCounter) {
                // Check if the card enters tapped and if so, add to tappedLands array
                if (card.cardData.uiState.checkboxes.entersTapped && !tappedLands.includes(card.cardData.id)) {
                    tappedLands.push(card.cardData.id);
                }
    
                // Only count the mana for untapped cards
                if (!tappedLands.includes(card.cardData.id)) {
                    const manaCounter = card.cardData.uiState.manaCounter;
                    Object.keys(manaCounter).forEach(manaType => {
                        const manaAmount = manaCounter[manaType];
                        battlefieldManaCounter[manaType] += manaAmount;
                        tempTotalMana += manaAmount; // Add to the total mana count
                    });
                }
            }
        });
    
        // Calculate the total mana produced by 'or' battlefield cards and subtract from tempTotalMana
        let battlefieldOrMana = calculateBattlefieldOrMana();
        let finalTotalMana = tempTotalMana - battlefieldOrMana;
    
        // Log the battlefield mana counter and total mana
        console.log("Battlefield Mana Counter:", battlefieldManaCounter);
        console.log(`Total Battlefield Mana: ${finalTotalMana}`);
    }
    

    function getRequiredMana(manaCost, manaCounter) {
        const requiredMana = {
            W: 0,
            U: 0,
            B: 0,
            R: 0,
            G: 0,
            C: 0,
            generic: 0
        };
    
        // Check if manaCost is undefined or an empty string
        if (!manaCost || manaCost.trim() === '') {
            return requiredMana; // Return an object with all mana requirements set to 0
        }
    
        // Parse the manaCost string to determine the required mana
        const manaSymbols = manaCost.match(/\{([^}]+)\}/g);
        if (manaSymbols) {
            manaSymbols.forEach(symbol => {
                const color = symbol.replace(/[{}]/g, '');
                if (isNaN(color)) {
                    requiredMana[color]++;
                } else {
                    requiredMana.generic += parseInt(color);
                }
            });
        }
    
        // Check if the required mana can be satisfied by the current mana counter
        for (const [color, requiredAmount] of Object.entries(requiredMana)) {
            if (color !== "generic" && (manaCounter[color] || 0) < requiredAmount) {
                return requiredMana;
            }
        }
    
        // If all specific mana requirements are met, return the generic mana requirement
        return { generic: requiredMana.generic };
    }
    
    function calculateBattlefieldOrMana() {
        let battlefieldOrMana = 0; // Initialize the counter for the total mana produced by "or" battlefield cards
        let orCardsCount = 0; // Initialize the counter for the number of battlefield cards with 'or' set to true
    
        // Access the battlefield section for the current player
        const battlefieldCards = playersData[currentPlayerId].battlefieldImages.images;
    
        // Iterate over each battlefield card
        battlefieldCards.forEach(card => {
            // Skip this card if it is in the tappedLands array (assuming battlefield cards can also be lands or have a tapped state)
            if (tappedLands.includes(card.cardData.id)) {
                return;
            }
    
            if (card.cardData.uiState && card.cardData.uiState.checkboxes && card.cardData.uiState.checkboxes.or) {
                orCardsCount++; // Increment the count of 'or' battlefield cards only if not tapped
                // Accumulate the total mana produced by this card
                Object.values(card.cardData.uiState.manaCounter).forEach(manaAmount => {
                    battlefieldOrMana += manaAmount;
                });
            }
        });
    
        // Subtract the number of 'or' battlefield cards from the total mana produced by 'or' cards
        battlefieldOrMana -= orCardsCount;
    
        return battlefieldOrMana; // Return this value for further use
    }

    document.getElementById('restart').addEventListener('click', function() {
        let player = playersData.Player1;
    
        const allImages = [].concat(
            player.handImages.images,
            player.battlefieldImages.images,
            player.landImages.images,
            player.commanderImages.images,
            player.exileImages.images,
            player.graveyardImages.images,
            player.tappedLandsImages.images,
            player.moveImages.images,
            player.historyImages.images,
            player.infoImages.images,
            player.libraryImages.images
        );
    
        player.libraryImages.images = allImages;
        shuffleArray(player.libraryImages.images); // Shuffle the library after combining all cards into it
    
        // Reset other sections
        player.handImages.images = [];
        player.battlefieldImages.images = [];
        player.landImages.images = [];
        player.commanderImages.images = [];
        player.exileImages.images = [];
        player.graveyardImages.images = [];
        player.tappedLandsImages.images = [];
        player.moveImages.images = [];
        player.historyImages.images = [];
        player.infoImages.images = [];
    
        // Reset game control variables
        turnPlayer = null; // Reset turn player to allow a new game to start
        currentPlayerId = 'Player1'; // Assuming Player1 will always be the initial current player
    
        // Re-enable the "Start Game" button
        document.getElementById('startGame').disabled = false;
    
        console.log('Game restarted and library shuffled, all cards moved to library.');
        updatePlayerDisplay('Player1');
    });

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
        let firstVisibleImageIndex = -1;
        
        images.forEach((img, index) => {
            const cardType = img.dataset.cardType.toLowerCase();
            if (type === "All" || cardType.includes(type.toLowerCase())) {
                img.style.display = '';
                if (firstVisibleImageIndex === -1) firstVisibleImageIndex = index;
            } else {
                img.style.display = 'none';
            }
        });
        
        if (firstVisibleImageIndex !== -1) {
            const playerKey = getCurrentPlayerKey();
            displayCardDetails(firstVisibleImageIndex, playerKey);
        } else {
            console.log('No matching cards found for the selected type.');
        }
    }

    function displayCardDetails(cardIndex, playerKey) {
        const card = playersData[playerKey].deckImages.images[cardIndex];
        if (card) {
            console.log(`Displaying card: ${card.name} at index ${cardIndex}`);
            // Assuming you have a function to display the card details
            displayInMainImageContainer(card.settings.normal_image_url, card);
        } else {
            console.error('Card data is undefined.');
        }
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

    function populateDeckSection(cards) {
        const deckSection = document.getElementById('deckSection');
        deckSection.innerHTML = '';
    
        cards.forEach((card, index) => {
            const img = document.createElement('img');
            img.src = card.settings.normal_image_url;
            img.alt = card.name;
            img.dataset.cardIndex = index;  // Store the index of the card in the array
            img.dataset.cardType = card.settings.type_line; // Set the card type as a data attribute
            img.setAttribute('data-card', JSON.stringify(card)); // Set the card data as a JSON string
    
            img.addEventListener('mouseover', function() {
                // Retrieve the card data from the 'data-card' attribute and parse it
                const cardData = JSON.parse(this.getAttribute('data-card'));
    
                // Use the retrieved card data for display or other purposes
                displayInMainImageContainer(cardData.settings.normal_image_url, cardData);
    
                // Additional actions can be performed here using cardData
            });
    
            deckSection.appendChild(img);
        });
    
        // Automatically select the first card to display its details if needed
        if (cards.length > 0) {
            currentCard = cards[0];
            displayInMainImageContainer(currentCard.settings.normal_image_url, currentCard);
            updateUIForCard(currentCard);
        }
    }

    function displayInMainImageContainer(imageSrc, cardData) {
        const cardImageContainer = document.getElementById('cardImageContainer');
        cardImageContainer.innerHTML = ''; // Clear existing content

        const img = document.createElement('img');
        img.src = imageSrc;
        img.dataset.cardData = JSON.stringify(cardData); // Store card data in dataset for access in event listeners
        cardImageContainer.appendChild(img);

        updatePlayerDisplay('Player1');


    }

    console.log(document.body.scrollHeight - window.innerHeight);

    // Ensure the "Load Decks" button event listener is correctly attached after the button is created
    // Attach event listener to "Load Decks" button dynamically after it's created
    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'loadDecksButton') {
            handleLoadDeckClick();
        }
    });

    if (btn) {
        btn.addEventListener('click', fetchAndDisplayDeckNames);
    }

    if (close) {
        close.addEventListener('click', function() {
            popup.style.display = "none";
        });
    }

    document.getElementById('BacktoGame').addEventListener('click', function() {
        window.location.href = 'Panels.html';
    });





    // Event listener for the "Choose Decks" button
    if (btn) {
        btn.addEventListener('click', function() {
            fetchAndDisplayDeckNames(); // Call the function to fetch and display deck names
        });
    } else {
        console.log("Choose Decks button not found");
    }

    // Event listener for the close button of the popup
    if (close) {
        close.addEventListener('click', function() {
            popup.style.display = "none"; // Hide the popup
        });
    } else {
        console.log("Close button not found");
    }


    if (btn) {
        btn.onclick = function() {
            console.log("Choose Decks clicked");
            popup.style.display = "block";
        };
    } else {
        console.log("Choose Decks button not found");
    }

    if (close) {
        close.onclick = function() {
            popup.style.display = "none";
        };
    } else {
        console.log("Close button not found");
    }
    btn.addEventListener('click', fetchAndDisplayDeckNames);
    close.addEventListener('click', function() { popup.style.display = "none"; });


    function handleDeckImageClick(event) {
        const clickedImage = event.target;
        const cardIndex = parseInt(clickedImage.dataset.cardIndex, 10);
        const playerKey = getCurrentPlayerKey();
    
        if (cardIndex >= 0 && cardIndex < playersData[playerKey].deckImages.images.length) {
            const card = playersData[playerKey].deckImages.images[cardIndex]; // Directly access the card object
    
            if (card) {
                console.log(`Clicked on card: ${card.name} at index ${cardIndex}`);
    
                const cardName = card.name;
    
                if (clickedImage.classList.contains('marked')) {
                    console.log(`Removing mark from card: ${cardName}`);
                    clickedImage.classList.remove('marked');
                    clickedImage.style.border = '';
                    delete playersData[playerKey].markedCards[cardName];
                } else {
                    console.log(`Marking card: ${cardName}`);
                    clickedImage.classList.add('marked');
                    clickedImage.style.border = '2px solid red';
                    playersData[playerKey].markedCards[cardName] = true;
                }
    
                console.log(`Marked cards for ${playerKey}:`, playersData[playerKey].markedCards);
            } else {
                console.error('Card data is undefined for the clicked image.');
            }
        } else {
            console.error('Invalid card index.');
        }
    
        updatePlayerDisplay(playerKey);
    }
    
    const deckSection = document.getElementById('deckSection');
    deckSection.addEventListener('click', event => {
        if (event.target.tagName === 'IMG') {
            handleDeckImageClick(event);
        }
    });
    
    

    


   
    

});
