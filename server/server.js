const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, '..', '/')));

// Middleware for parsing JSON bodies. This replaces bodyParser.json()
app.use(express.json());

// Middleware to allow cross-origin requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// Serve the main.html as the root page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Route to list names of .json files in the Decks directory
app.get('/get-deck-names', (req, res) => {
    const decksPath = path.join(__dirname, '..', 'Decks');
    console.log(`Looking for decks in: ${decksPath}`);
    fs.readdir(decksPath, (err, files) => {
        if (err) {
            console.error("Failed to list decks:", err);
            res.status(500).send('Error listing deck files');
            return;
        }
        const deckNamesWithoutExtension = files
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));
        res.json(deckNamesWithoutExtension);
    });
});

// Route to process card names and filter data from Card-Details.json
app.post('/import-cards', (req, res) => {
    console.log('Received request on /import-cards with body:', req.body);

    const cardRequests = req.body.cardNames; // Expecting an array of objects with name and quantity
    if (!cardRequests || cardRequests.length === 0) {
        console.error('No card names provided in the request body.');
        return res.status(400).send('No card names provided.');
    }

    const cardDetailsPath = path.join(__dirname, '..', 'public_html', 'card-details.json');
    console.log('Attempting to read Card-Details.json from path:', cardDetailsPath);

    fs.readFile(cardDetailsPath, (err, data) => {
        if (err) {
            console.error('Error reading Card-Details.json:', err);
            return res.status(500).send('Error reading card details');
        }

        console.log('Successfully read Card-Details.json');

        let cards;
        try {
            cards = JSON.parse(data);
            console.log('Successfully parsed Card-Details.json');
        } catch (parseError) {
            console.error('Error parsing Card-Details.json:', parseError);
            return res.status(500).send('Error parsing card details');
        }

        // Filter and map the cards based on the provided names and quantities
        const filteredCards = cardRequests.filter(req => req.name).map(req => {
            const card = cards.find(c => c.name.toLowerCase().includes(req.name.toLowerCase()));
            return { ...card, quantity: req.quantity };
        }).filter(card => card); // Remove undefined entries in case a card wasn't found

        console.log(`Filtered ${filteredCards.length} cards from the provided names.`);

        const transformedData = {
            cards: filteredCards.map(card => ({
                name: card.name,
                quantity: card.quantity, // Include quantity in the response
                settings: {
                    mana_cost: card.mana_cost,
                    type_line: card.type_line,
                    power: card.power,
                    toughness: card.toughness,
                    cmc: card.cmc,
                    oracle_text: card.oracle_text,
                    colors: card.colors,
                    color_identity: card.color_identity,
                    keywords: card.keywords,
                    normal_image_url: card.large_image_url
                }
            }))
        };

        console.log('Sending transformed data back to the client.');
        res.json(transformedData);
    });
});

app.post('/save-deck', (req, res) => {
    console.log(req.body); // Log the request body to see what's being received
    const { deckName, cards } = req.body;
    if (!deckName || !cards) {
        return res.status(400).send('Deck name and cards are required.');
    }

    // The entire card array including uiState is directly saved
    const dataToSave = { cards }; // Preserving the entire card structure including uiState

    const filePath = path.join(__dirname, '..', 'public_html', 'decks', `${deckName}.json`);
    fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), err => {
        if (err) {
            console.error('Error saving the deck file:', err);
            return res.status(500).send('Error saving the deck');
        }
        res.json({ message: 'Deck saved successfully', deckName });
    });
});

// Route to load a specific deck by name
app.get('/load-deck-data', (req, res) => {
    const { name } = req.query;
    if (!name) {
        // Respond with an error in JSON format
        return res.status(400).json({ error: 'Deck name is required.' });
    }

    console.log(`Loading deck with name: ${req.query.name}`);
    const deckPath = path.join(__dirname, '..', 'public_html', 'Decks', `${req.query.name}.json`);
    console.log(`Deck path: ${deckPath}`);

    fs.readFile(deckPath, (err, data) => {
        if (err) {
            console.error(`Error reading deck file: ${err.message}`);
            return res.status(500).json({ error: "Failed to load deck data" });
        }

        try {
            const deckData = JSON.parse(data);
            res.json(deckData);
        } catch (parseError) {
            console.error(`Error parsing deck file for ${name}:`, parseError);
            res.status(500).json({ error: `Error parsing deck data for ${name}` });
        }
    });
});

app.post('/api/signup', (req, res) => {
    const { username, email, password } = req.body;

    // Perform validation
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if the user already exists (you can replace this with your own logic)
    const userExists = false; // Replace with your own check

    if (userExists) {
        return res.status(409).json({ success: false, message: 'User already exists' });
    }

    // Create a new user object
    const newUser = {
        username,
        email,
        password
    };

    // Save the user to a file or database (replace with your own storage logic)
    const usersPath = path.join(__dirname, '..', 'user.json');

    // Read existing users from the file
    fs.readFile(usersPath, (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading users file:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        let users = [];
        if (!err) {
            try {
                users = JSON.parse(data);
            } catch (parseError) {
                console.error('Error parsing users file:', parseError);
                return res.status(500).json({ success: false, message: 'Internal server error' });
            }
        }

        // Add the new user to the array
        users.push(newUser);

        // Write the updated users array back to the file
        fs.writeFile(usersPath, JSON.stringify(users, null, 2), (writeError) => {
            if (writeError) {
                console.error('Error writing users file:', writeError);
                return res.status(500).json({ success: false, message: 'Internal server error' });
            }

            res.status(201).json({ success: true, message: 'User created successfully' });
        });
    });
});

app.post('/api/signin', (req, res) => {
    const { username, password } = req.body;

    // Perform validation
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    // Read existing users from the file
    const usersPath = path.join(__dirname, '..', 'public_html', 'users.json');
    fs.readFile(usersPath, (err, data) => {
        if (err) {
            console.error('Error reading users file:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        let users = [];
        try {
            users = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing users file:', parseError);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Find the user with the provided username
        const user = users.find(user => user.username === username);

        if (!user || user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        res.status(200).json({ success: true, message: 'Sign in successful' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
