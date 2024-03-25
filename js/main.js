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
    let HoldCards = [];
    let choiceCards = [];
    let choicesTurn = false;
    let currentChoicesTurnStep = 0;  // Global variable to track the current step in the choices turn process
    let choiceMade = false; // Flag to indicate if a choice has been made
    let nonlandchoiceMade = false; // Flag to indicate if a choice has been made
    let cardPlayed = false;  // Variable to track if a card has been played
    let lastHoveredCardData = null;


    const playersData = {
        Player1: {
            choiceImages: {images: [], scrollOffset: 0},
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
            choiceImages: {images: [], scrollOffset: 0},
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
            choiceImages: {images: [], scrollOffset: 0},
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
            choiceImages: {images: [], scrollOffset: 0},
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
                const popupContent = document.querySelector('.popup-content');
                const deckList = document.createElement('ul');

                decks.forEach((deck, index) => {
                    const item = document.createElement('li');

                    // Create a checkbox for each deck
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `deck-${index}`;
                    checkbox.value = deck;
                    checkbox.name = 'decks';

                    // Create a label for each checkbox
                    const label = document.createElement('label');
                    label.htmlFor = `deck-${index}`;
                    label.textContent = deck;

                    // Append checkbox and label to the list item
                    item.appendChild(checkbox);
                    item.appendChild(label);
                    deckList.appendChild(item);

                    // Add event listener to update deck assignments when checkbox state changes
                    checkbox.addEventListener('change', function() {
                        updateDeckAssignments();
                    });
                });

                // Remove any existing deck list
                const existingDeckList = popupContent.querySelector('ul');
                if (existingDeckList) {
                    existingDeckList.remove();
                }

                // Append the new deck list below the "Decks:" label
                const decksLabel = popupContent.querySelector('p');
                decksLabel.insertAdjacentElement('afterend', deckList);

                // Add Load Decks button if not already present
                addLoadDecksButton(popupContent);

                // Ensure the close button works after dynamically adding content
                document.getElementById('closePopup').onclick = function() {
                    popup.style.display = "none";
                };

                popup.style.display = "block";

                // Limit checkbox selections to 4
                limitCheckboxSelections();
            })
            .catch(error => console.error('Error fetching deck names:', error));
    }


    // Function to update deck assignments based on the checked state of checkboxes
    // Function to update deck assignments based on the checked state of checkboxes
    function updateDeckAssignments() {
        const selectedCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"][name="decks"]:checked'));
        const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"][name="decks"]'));
    
        // Clear existing deck assignments
        window.player1Deck = null;
        window.player2Deck = null;
        window.player3Deck = null;
        window.player4Deck = null;
    
        // Clear player label names
        document.getElementById('player1Deck').textContent = '';
        document.getElementById('player2Deck').textContent = '';
        document.getElementById('player3Deck').textContent = '';
        document.getElementById('player4Deck').textContent = '';
    
        // Update the checkedOrder array based on the current state of checkboxes
        checkedOrder = selectedCheckboxes.map(checkbox => checkbox.value);
    
        // Assign decks to players based on the order of checked checkboxes
        checkedOrder.forEach((deckName, index) => {
            // Preserve previously assigned decks
            if (window[`player${index + 1}Deck`] && !checkedOrder.includes(window[`player${index + 1}Deck`])) {
                return;
            }
    
            switch (index) {
                case 0:
                    window.player1Deck = deckName;
                    document.getElementById('player1Deck').textContent = deckName;
                    console.log(`Deck "${deckName}" assigned to Player 1`);
                    break;
                case 1:
                    window.player2Deck = deckName;
                    document.getElementById('player2Deck').textContent = deckName;
                    console.log(`Deck "${deckName}" assigned to Player 2`);
                    break;
                case 2:
                    window.player3Deck = deckName;
                    document.getElementById('player3Deck').textContent = deckName;
                    console.log(`Deck "${deckName}" assigned to Player 3`);
                    break;
                case 3:
                    window.player4Deck = deckName;
                    document.getElementById('player4Deck').textContent = deckName;
                    console.log(`Deck "${deckName}" assigned to Player 4`);
                    break;
            }
        });
    
        console.log('Updated deck assignments:');
        console.log('Player 1 Deck:', window.player1Deck);
        console.log('Player 2 Deck:', window.player2Deck);
        console.log('Player 3 Deck:', window.player3Deck);
        console.log('Player 4 Deck:', window.player4Deck);
    }


    function limitCheckboxSelections() {
        let checkboxes = document.querySelectorAll('input[type="checkbox"][name="decks"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                let checkedCheckboxes = document.querySelectorAll('input[type="checkbox"][name="decks"]:checked');
                if (checkedCheckboxes.length > 4) {
                    checkbox.checked = false;
                    console.log('Checkbox selection limited to 4 decks.');
                    alert('You can select up to 4 decks only.');
                }
            });
        });
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
    
    // Add event listeners to arrow buttons
    document.getElementById('arrowButton12').addEventListener('click', function() {
        switchDecks(1, 2);
    });
    
    document.getElementById('arrowButton23').addEventListener('click', function() {
        switchDecks(2, 3);
    });
    
    document.getElementById('arrowButton34').addEventListener('click', function() {
        switchDecks(3, 4);
    });

    function getSelectedDeckNames() {
        return checkedOrder;
    }
    
    
    
    
  
    
    // Function to add Load Decks button
    function addLoadDecksButton(popupContent) {
        let loadDecksButton = document.getElementById('loadDecksButton');
    
        // Create the button if it doesn't exist
        if (!loadDecksButton) {
            loadDecksButton = document.createElement('button');
            loadDecksButton.textContent = 'Load Decks';
            loadDecksButton.id = 'loadDecksButton';
            popupContent.appendChild(loadDecksButton);
        }
    
        // Show the button
        loadDecksButton.style.display = 'block';
    
        // Attach or re-attach the click event listener
        loadDecksButton.removeEventListener('click', handleLoadDecksClick); // Remove any existing listener to avoid duplicates
        loadDecksButton.addEventListener('click', handleLoadDecksClick);
        
    }

    function handleLoadDecksClick() {
        const selectedDeckNames = getSelectedDeckNames();
        console.log(`Selected decks for loading:`, selectedDeckNames);
    
        selectedDeckNames.forEach((deckName, index) => {
            const playerKey = `Player${index + 1}`;
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
                assignDeckDataToPlayer(deckData, playerKey);
            })
            .catch(error => console.error(`Error loading deck ${deckName}:`, error));
        });
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
    
        updatePlayerDisplay(playerKey);
        updateAllPlayersSectionDisplay();
    }
    


    function updatePlayerDisplay(playerKey) {
        let processedCards = new Set(); // To track cards that have already been processed
        
        movedCardNames.forEach(move => {
            if (!processedCards.has(move.name)) {
                const lastMove = [...movedCardNames].reverse().find(m => m.name === move.name);
                if (lastMove) {
                    moveCardDataToTargetSection(playerKey, lastMove.name, lastMove.targetSection);
                    processedCards.add(move.name);
                }
            }
        });
        
        movedCardNames = []; // Clear movedCardNames after processing
        
        const playerData = playersData[playerKey];
        const sectionsToUpdate = ['library', 'hand', 'land', 'battlefield', 'graveyard', 'exile', 'commander', 'move', 'info', 'choice'];
    
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
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100px';
    
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

    
     // Function to update the images for all player sections based on the current section
    function updateAllPlayersSectionDisplay() {
        const selectedSection = sections[currentIndex];
        const sectionKey = `${selectedSection}Images`; // e.g., "libraryImages"


        for (let i = 1; i <= 4; i++) {
            const playerSection = document.getElementById(`playerSection${i}`);

            playerSection.innerHTML = ''; // Clear previous content
            const cards = playersData[`Player${i}`][sectionKey].images; // This now refers to card objects, not just image URLs



            cards.forEach(cardObject => {
                const imgElement = document.createElement('img');
                imgElement.src = cardObject.imageUrl;
                // Convert the cardData object to a JSON string and attach it as a data attribute
                imgElement.setAttribute('data-card', JSON.stringify(cardObject.cardData));
                playerSection.appendChild(imgElement);
            });
        }
    }

    



   

    // Attach event listeners to player buttons if needed

    // Function to display an image in the info section
    function displayImageInInfo(src) {
        const infoSection = document.getElementById('info');
        infoSection.innerHTML = ''; // Clear current content
        const img = document.createElement('img');
        img.src = src;
        img.style.maxWidth = '100%'; // Ensure the image fits within the section
        img.style.maxHeight = '100%'; // Adjust based on the section's height
        infoSection.appendChild(img);
    }

    // Function to clear the info section and the selectedImageData variable
    function clearInfoSection() {
        const infoSection = document.getElementById('info');
        infoSection.innerHTML = ''; // Clear the content
        selectedImageData = null; // Clear the selectedImageData variable
    }

    document.addEventListener('dblclick', function(event) {
        if (event.target.tagName === 'IMG') {
            const cardData = getCardDataFromImage(event.target);
            console.log('Card data:', cardData); // Confirming card data is retrieved correctly
            console.log('Retrieved card data:', cardData); // Check the entire object structure
            console.log('Type line:', cardData.typeLine); // Directly log the typeLine to verify
    
            if (cardData) {
                displayImageInInfo(event.target.src);
                console.log(`Type line: ${cardData.typeLine}`); // Before the if statement
    
                // Directly checking the typeLine of the fetched card data
                if (cardData.typeLine && cardData.typeLine.toLowerCase().includes("land")) {
                    console.log('This fetched card is a land card.');
                } else {
                    console.log('This fetched card is not a land card.');
                }
    
                // Store the selected image data in the variable
                selectedImageData = {
                    image: event.target,
                    cardData: cardData,
                    location: findImageLocation(cardData.name)
                };
    
                console.log('Selected image data:', selectedImageData); // Log the contents of selectedImageData
    
            } else {
                console.log('No card data found for this image.');
                clearInfoSection();
            }
        } else {
            clearInfoSection();
        }
        console.log("All players' data:", playersData);
    });

    // Function to find the location of an image in the player data
    function findImageLocation(cardName) {
        for (const playerKey in playersData) {
            for (const sectionKey in playersData[playerKey]) {
                if (sectionKey.endsWith('Images')) {
                    const section = playersData[playerKey][sectionKey];
                    const cardIndex = section.images.findIndex(card => card.cardData.name === cardName);
                    if (cardIndex !== -1) {
                        return {
                            playerKey: playerKey,
                            sectionKey: sectionKey,
                            index: cardIndex
                        };
                    }
                }
            }
        }
        return null; // Return null if the image is not found in the player data
    }

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
        updateAllPlayersSectionDisplay();
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
            updateAllPlayersSectionDisplay();
        });
    } else {
        console.error('"shuffle" button not found in the DOM');
    }
    
    ['player1', 'player2', 'player3', 'player4'].forEach((playerId, index) => {
        const playerButton = document.getElementById(playerId);
        if (playerButton) {
            playerButton.addEventListener('click', function() {
                setCurrentPlayer(`Player${index + 1}`);
            });
        } else {
            console.error(`"${playerId}" button not found in the DOM`);
        }
    });
    
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
        updateAllPlayersSectionDisplay();
        console.log(`Player display updated for ${playerKey}.`);
    }

    document.getElementById('player1Mulligan').addEventListener('click', function() {
        mulligan('Player1');
    });
    
    document.getElementById('player2Mulligan').addEventListener('click', function() {
        mulligan('Player2');
    });
    
    document.getElementById('player3Mulligan').addEventListener('click', function() {
        mulligan('Player3');
    });
    
    document.getElementById('player4Mulligan').addEventListener('click', function() {
        mulligan('Player4');
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
        updateAllPlayersSectionDisplay();
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
        updateAllPlayersSectionDisplay();
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
        updateAllPlayersSectionDisplay();
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
        updateAllPlayersSectionDisplay();
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
    
            const sections = ['libraryImages', 'handImages', 'landImages', 'battlefieldImages', 'graveyardImages', 'exileImages', 'commanderImages'];
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
    
        // Check if the current player is not the turn player
        if (currentPlayerId !== turnPlayer) {
            console.log(`Current player (${currentPlayerId}) is not the turn player (${turnPlayer}). Updating current player.`);
            setCurrentPlayer(turnPlayer);
            updatePlayerDisplay(turnPlayer);
            return; // Exit the function after updating the current player
        }
    
        // Log the current state of the player's hand before any action
        const handBeforeAction = playersData[currentPlayerId].handImages.images.map(card => card.cardData);
        console.log(`Hand images before action:`, handBeforeAction.map(card => ({
            name: card.name,
            typeLine: card.type_line
        })));
    
        // Determine the action based on the current step
        switch (oneTurnStep) {
            case 0:
                console.log("Case 0: Drawing a card from the library to the hand.");
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
                playCardFromHandToBattlefield(currentPlayerId);
                oneTurnStep++; // Move to the next step
                break;
            case 3:
                console.log("Case 3: Updating turn player to the next player in the rotation.");
                const currentPlayerIndex = parseInt(currentPlayerId.slice(-1)) - 1;
                const nextPlayerIndex = (currentPlayerIndex + 1) % 4;
                turnPlayer = `Player${nextPlayerIndex + 1}`;
                console.log(`Turn player updated to: ${turnPlayer}`);
                setCurrentPlayer(turnPlayer);
                updatePlayerDisplay(turnPlayer);
                oneTurnStep = 0; // Reset to the first step for the next player's turn
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
            autoButton.textContent = 'Stop Auto';
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
            autoChoicesButton.textContent = 'Stop Auto Choices';
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
                playCardFromHandToBattlefieldAuto(currentPlayerId);
                if (choiceMade) {
                    console.log("Choice made, waiting for action to complete.");
                } else {
                    setTimeout(() => {
                        currentChoicesTurnStep = 0;  // Reset to step 0 for the next player
                        console.log("Resetting to step 0 after playing a card.");
                        updateTurnPlayer();
                    }, 2000);  // 2000 milliseconds delay (2 seconds)
                    return; // Return here to prevent immediate execution of the next lines
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

    function updateTurnPlayer() {
        const currentPlayerIndex = parseInt(currentPlayerId.slice(-1)) - 1;
        const nextPlayerIndex = (currentPlayerIndex + 1) % 4;  // Assuming 4 players
        turnPlayer = `Player${nextPlayerIndex + 1}`;
        console.log(`Turn player updated to: ${turnPlayer}`);
        setCurrentPlayer(turnPlayer);
        updatePlayerDisplay(turnPlayer);
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
            } else {
                // If no prioritized land card is found, just play the first land card
                const [landCard] = landCards.splice(0, 1);
                playersData[playerId].landImages.images.push(landCard);
            }
        }
    
        updatePlayerDisplay(playerId);
        updateManaCounter();
        calculateBattlefieldMana();
    }

    function moveFirstLandFromHandToLandChoice(playerId) {
        const handImages = playersData[playerId].handImages.images;
    
        console.log("Starting moveFirstLandFromHandToLandChoice");
    
        // Check for a chosen land card
        const choiceLand = handImages.find(card => choiceCards.includes(card.cardData.name) && isLandCard(card.cardData));
        if (choiceLand) {
            console.log(`Playing chosen land card: ${choiceLand.cardData.name}`);
            playersData[playerId].landImages.images.push(choiceLand);
            handImages.splice(handImages.indexOf(choiceLand), 1);
            choiceCards = [];
            updatePlayerDisplay(playerId);
            updateManaCounter();
            calculateBattlefieldMana();
            choiceMade = false;
            return;
        }
    
        const landCards = handImages.filter(card => isLandCard(card.cardData) && !playersData[playerId].markedCards[card.cardData.name]);
        console.log(`Found ${landCards.length} land cards in hand`);
    
        if (landCards.length === 0) {
            console.log('No land cards found in hand');
            return;
        }
    
        if (choicesTurn && landCards.length > 1) {
            console.log('Multiple lands available for choice, presenting choices');
            playersData[playerId].choiceImages.images = [...landCards];
            updatePlayerDisplay(playerId);
            toggleAutoChoices();
            choiceMade = true;
            return;
        }
    
        const searchableLandCards = landCards.filter(card => card.cardData.uiState && card.cardData.uiState.checkboxes.search);
        console.log(`Found ${searchableLandCards.length} searchable land cards`);
    
        if (searchableLandCards.length > 0) {
            const searchableLandCard = searchableLandCards[0];
            const highlightedCardNames = searchableLandCard.cardData.uiState.highlightedCards;
            const matchingLibraryCard = playersData[playerId].libraryImages.images.find(card => highlightedCardNames.includes(card.cardData.name));
    
            if (matchingLibraryCard) {
                console.log(`Found matching library card: ${matchingLibraryCard.cardData.name}`);
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
        console.log(`Found ${unplayableCards.length} unplayable cards`);
    
        if (unplayableCards.length === 0) {
            console.log('All non-land cards are playable, playing first land card');
            const [landCard] = landCards.splice(0, 1);
            playersData[playerId].landImages.images.push(landCard);
        } else {
            console.log('Finding land card that matches the mana requirements for unplayable cards');
            const lowestCMCCard = unplayableCards.reduce((prev, current) => prev.cardData.cmc < current.cardData.cmc ? prev : current);
            const requiredMana = getRequiredMana(lowestCMCCard.cardData.mana_cost, playersData[playerId].manaCounter);
            const prioritizedLandCard = landCards.find(card => canProduceMana(card.cardData, requiredMana));
    
            if (prioritizedLandCard) {
                console.log(`Playing prioritized land card: ${prioritizedLandCard.cardData.name}`);
                const index = handImages.indexOf(prioritizedLandCard);
                const [landCard] = handImages.splice(index, 1);
                playersData[playerId].landImages.images.push(landCard);
            } else {
                console.log('No prioritized land card found, playing first land card');
                const [landCard] = landCards.splice(0, 1);
                playersData[playerId].landImages.images.push(landCard);
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
            } else {
                // If no prioritized land card is found, just play the first land card
                const [landCard] = landCards.splice(0, 1);
                playersData[playerId].landImages.images.push(landCard);
            }
        }
    
        updatePlayerDisplay(playerId);
        updateManaCounter();
        calculateBattlefieldMana();
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

    function playCardFromHandToBattlefield() {
        const handCards = playersData[currentPlayerId].handImages.images;
    
        console.log("Hand cards:", handCards);
    
        // Update the mana counter before playing a card
        updateManaCounter();
    
        // Get the updated mana counter for the current player
        const manaCounter = playersData[currentPlayerId].manaCounter;
        console.log("Mana counter:", manaCounter);
    
        for (let i = 0; i < handCards.length; i++) {
            const card = handCards[i];
    
            // Skip this card if card or card.cardData is undefined, or if the card is a land card
            if (!card || !card.cardData || !card.cardData.settings || card.cardData.settings.type_line.includes("Land")) {
                console.error("Skipping undefined card, settings, or land card", card);
                continue; // Skip land cards and undefined settings
            }
    
            // Check if the card is marked and skip it if it is
            if (playersData[currentPlayerId].markedCards[card.cardData.name]) {
                console.log(`Skipping marked card: ${card.cardData.name}`);
                continue; // Skip marked cards
            }
    
            // Check if mana_cost exists in card.cardData.settings
            if (!card.cardData.settings.mana_cost) {
                console.error(`Skipping card with missing mana_cost: ${card.cardData.name}`);
                continue; // Skip cards with missing mana_cost
            }
    
            const cardManaCost = card.cardData.settings.mana_cost.match(/\{([^}]+)\}/g) || [];
            if (canPlayCard(cardManaCost, manaCounter, card.cardData.settings.cmc, card.cardData.name)) {
                // Move card from hand to battlefield
                const playedCard = handCards.splice(i, 1)[0];
                playersData[currentPlayerId].battlefieldImages.images.push(playedCard);
                console.log(`Played ${playedCard.cardData.name} onto battlefield.`);
                updatePlayerDisplay(currentPlayerId); // Update player display after playing card
    
                // Log all the cards in the battlefield section for the current player
                console.log(`Cards in the battlefield section for ${currentPlayerId}:`);
                playersData[currentPlayerId].battlefieldImages.images.forEach(card => {
                    console.log(card.cardData.name);
                });
    
                break; // Exit after playing the first playable card
            }
        }
    }

    function playCardFromHandToBattlefieldAuto(playerId) {
        let cardPlayed = false;  // Reset cardPlayed to false at the beginning of the function
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
            choiceMade = false;  // You may also want to reset choiceMade here if no card was played
        }
    
        console.log(`Card played: ${cardPlayed}`);
        choiceMade = false; // Update choiceMade based on cardPlayed status
    }

    function canPlayCard(cardManaCost, manaCounter, cardCmc, cardName) {
        // Call updateManaCounter to ensure the final total mana is up-to-date
        updateManaCounter();
        
        // Access the final total mana from playersData
        let finalTotalMana = playersData[currentPlayerId].totalMana;
        console.log("Final total mana available:", finalTotalMana);
        console.log("Card Name:", cardName); // Add card name to the logging
        console.log("Card CMC:", cardCmc);
        if (finalTotalMana < cardCmc) {
            console.log("Not enough total mana to play the card.");
            return false;
        }
    
        // Check if cardManaCost is undefined, an empty string, or an empty array
        if (!cardManaCost || (typeof cardManaCost === 'string' && cardManaCost.trim() === '') || (Array.isArray(cardManaCost) && cardManaCost.length === 0)) {
            // If cardManaCost is undefined, an empty string, or an empty array, the card can be played with generic mana
            return finalTotalMana >= cardCmc;
        }
    
        // Convert cardManaCost to an array if it's a string
        const manaCostArray = Array.isArray(cardManaCost) ? cardManaCost : cardManaCost.match(/\{([^}]+)\}/g);
    
        // Check if there's enough colored mana
        const manaRequirements = manaCostArray.reduce((acc, cur) => {
            const color = cur.replace(/\{|\}/g, ''); // Remove braces
            if (isNaN(color)) {
                // If the color is not a number, it's a specific mana type
                acc[color] = (acc[color] || 0) + 1;
            } else {
                // If the color is a number, it's a generic mana cost
                acc.generic = (acc.generic || 0) + parseInt(color);
            }
            return acc;
        }, {});
    
        console.log("Mana requirements for the card:", manaRequirements);
    
        // Check if there's enough generic mana
        if (manaRequirements.generic && finalTotalMana < manaRequirements.generic) {
            console.log("Not enough generic mana to play the card.");
            return false;
        }
    
        // Check if there's enough specific mana
        for (const [color, requiredAmount] of Object.entries(manaRequirements)) {
            if (color !== "generic") {
                console.log(`Checking ${color} mana requirement:`, requiredAmount);
                if ((manaCounter[color] || 0) < requiredAmount) {
                    console.log(`Not enough ${color} mana to play the card.`);
                    return false;
                }
            }
        }
    
        console.log("Card can be played.");
        return true;
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
    
    
    /// Check if the 'leftArrow' button exists in the DOM
    if (leftArrowButton) {
        // Attach the event listener to the "leftArrow" button
        leftArrowButton.addEventListener('click', function() {
            handleNavigationClick(false);
        });
    } else {
        // Log an error or handle the absence of the 'leftArrow' button appropriately
        console.error('"leftArrow" button not found in the DOM');
    }

    // Check if the 'rightArrow' button exists in the DOM
    if (rightArrowButton) {
        // Attach the event listener to the "rightArrow" button
        rightArrowButton.addEventListener('click', function() {
            handleNavigationClick(true);
        });
    } else {
        // Log an error or handle the absence of the 'rightArrow' button appropriately
        console.error('"rightArrow" button not found in the DOM');
    }

    // Corrected function to handle navigation arrow clicks and update both images and display name
    function handleNavigationClick(isRightArrow) {
        // Adjust currentIndex based on the arrow clicked
        if (isRightArrow) {
            currentIndex = (currentIndex + 1) % sections.length;
        } else {
            currentIndex = (currentIndex - 1 + sections.length) % sections.length;
        }

        // Update the display name to match the current section
        updateDisplay();

        // Update the images displayed for all player sections based on the current section
        updateAllPlayersSectionDisplay();
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
    
        // Iterate over each land card and update the manaCounter object
        landCards.forEach(card => {
            const manaCounter = card.cardData.uiState.manaCounter;
            Object.keys(manaCounter).forEach(manaType => {
                const manaAmount = manaCounter[manaType];
                playersData[currentPlayerId].manaCounter[manaType] += manaAmount;
                tempTotalMana += manaAmount; // Add to the total mana count
            });
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
        document.getElementById("totalMana").textContent = `Total: ${finalTotalMana}`;
    
        // Log the total mana to the console
        console.log(`FinalTotalMana: ${finalTotalMana}`);
    }
    
    function calculateLandOrMana() {
        let landOrMana = 0; // Initialize the counter for the total mana produced by "or" lands
        let orLandsCount = 0; // Initialize the counter for the number of lands with 'or' set to true
    
        // Access the land section for the current player
        const landCards = playersData[currentPlayerId].landImages.images;
    
        // Iterate over each land card
        landCards.forEach(card => {
            if (card.cardData.uiState.checkboxes.or) {
                orLandsCount++; // Increment the count of 'or' lands
                // Accumulate the total mana produced by this land
                Object.values(card.cardData.uiState.manaCounter).forEach(manaAmount => {
                    landOrMana += manaAmount;
                });
            }
        });
    
        // Subtract the number of 'or' lands from the total mana produced by 'or' lands
        landOrMana -= orLandsCount;
    
        console.log(`Total land_or_mana: ${landOrMana}`);
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
                const manaCounter = card.cardData.uiState.manaCounter;
                Object.keys(manaCounter).forEach(manaType => {
                    const manaAmount = manaCounter[manaType];
                    battlefieldManaCounter[manaType] += manaAmount;
                    tempTotalMana += manaAmount; // Add to the total mana count
                });
            }
        });
    
        // Calculate the total mana produced by 'or' battlefield cards and subtract from tempTotalMana
        let battlefieldOrMana = calculateBattlefieldOrMana();
        let finalTotalMana = tempTotalMana - battlefieldOrMana;
    
        // Log the battlefield mana counter and total mana
        console.log("Battlefield Mana Counter:", battlefieldManaCounter);
        console.log(`Total Battlefield Mana: ${finalTotalMana}`);
    }
    
    function calculateBattlefieldOrMana() {
        let battlefieldOrMana = 0; // Initialize the counter for the total mana produced by "or" battlefield cards
        let orCardsCount = 0; // Initialize the counter for the number of battlefield cards with 'or' set to true
    
        // Access the battlefield section for the current player
        const battlefieldCards = playersData[currentPlayerId].battlefieldImages.images;
    
        // Iterate over each battlefield card
        battlefieldCards.forEach(card => {
            if (card.cardData.uiState && card.cardData.uiState.checkboxes && card.cardData.uiState.checkboxes.or) {
                orCardsCount++; // Increment the count of 'or' battlefield cards
                // Accumulate the total mana produced by this card
                Object.values(card.cardData.uiState.manaCounter).forEach(manaAmount => {
                    battlefieldOrMana += manaAmount;
                });
            }
        });
    
        // Subtract the number of 'or' battlefield cards from the total mana produced by 'or' cards
        battlefieldOrMana -= orCardsCount;
    
        console.log(`Total battlefield_or_mana: ${battlefieldOrMana}`);
        return battlefieldOrMana; // Return this value for further use
    }
    
    // Add event listener to all images in the current player sections

      // Function to limit checkbox selections to 4




    // Ensure the "Load Decks" button event listener is correctly attached after the button is created
    // Attach event listener to "Load Decks" button dynamically after it's created
    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'loadDecksButton') {
            handleLoadDecksClick();
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



    if (editDecksButton) {
        editDecksButton.addEventListener('click', function() {
            // Change the current window location to open CardDetails.html
            window.location.href = 'CardDetails.html';
            console.log('Edit Decks button clicked');
        });
    } else {
        console.error('Edit Decks button not found');
    }





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

    document.getElementById('BacktoGame').addEventListener('click', function() {
        window.location.href = 'Panels.html';
    });

    document.getElementById('libraryBtn').addEventListener('dblclick', () => openSectionPopup('library'));
    document.getElementById('handBtn').addEventListener('dblclick', () => openSectionPopup('hand'));
    document.getElementById('battlefieldBtn').addEventListener('dblclick', () => openSectionPopup('battlefield'));
    document.getElementById('landBtn').addEventListener('dblclick', () => openSectionPopup('land'));
    document.getElementById('commanderBtn').addEventListener('dblclick', () => openSectionPopup('commander'));
    document.getElementById('exileBtn').addEventListener('dblclick', () => openSectionPopup('exile'));
    document.getElementById('graveyardBtn').addEventListener('dblclick', () => openSectionPopup('graveyard'));


    function openSectionPopup(sectionId) {
        const popup = document.getElementById('sectionPopup');
        if (!popup) {
            console.error('Section popup not found');
            return;
        }
    
        const popupContent = popup.querySelector('.popup-content');
        if (!popupContent) {
            console.error('Popup content not found');
            return;
        }
    
        // Clear previous content and set new title
        popupContent.innerHTML = `<span id="closeSectionPopup" class="close-btn">&times;</span><h2>${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}</h2>`;
    
        const sectionImages = document.querySelectorAll(`#${sectionId} img`);
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');
        
        sectionImages.forEach(img => {
            const imgClone = img.cloneNode(true);
            imgClone.style.width = '150px'; // Or set a class that defines the size
            imageContainer.appendChild(imgClone);
        });
        
        popupContent.appendChild(imageContainer);
        popup.style.display = 'block';
    
        // Close popup on clicking the close button
        document.getElementById('closeSectionPopup').addEventListener('click', function() {
            popup.style.display = 'none';
        });
    }

   
    

});
