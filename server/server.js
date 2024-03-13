const express = require('express');
const path = require('path');
const fs = require('fs').promises; // This line is crucial for using the promise-based APIs
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
app.get('/get-deck-names', async (req, res) => {
    const decksPath = path.join(__dirname, '..', 'Decks');
    try {
        const files = await fs.readdir(decksPath);
        const deckNamesWithoutExtension = files
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));
        res.json(deckNamesWithoutExtension);
    } catch (err) {
        console.error("Failed to list decks:", err);
        return res.status(500).json({ error: 'Error listing deck files' });
    }
});

// Route to process card names and filter data from Card-Details.json
app.post('/import-cards', async (req, res) => {
    console.log('Received request on /import-cards with body:', req.body);

    const cardRequests = req.body.cardNames;
    if (!cardRequests || cardRequests.length === 0) {
        console.error('No card names provided in the request body.');
        return res.status(400).json({ error: 'No card names provided.' });
    }

    const cardDetailsPath = path.join(__dirname, '..', 'card-details.json');
    console.log('Attempting to read Card-Details.json from path:', cardDetailsPath);

    try {
        const data = await fs.readFile(cardDetailsPath, 'utf8');
        console.log('Successfully read Card-Details.json');

        const cards = JSON.parse(data);
        console.log('Successfully parsed Card-Details.json');

        const filteredCards = cardRequests.filter(req => req.name).map(req => {
            const card = cards.find(c => c.name.toLowerCase().includes(req.name.toLowerCase()));
            return { ...card, quantity: req.quantity };
        }).filter(card => card);

        console.log(`Filtered ${filteredCards.length} cards from the provided names.`);

        const transformedData = {
            cards: filteredCards.map(card => ({
                name: card.name,
                quantity: card.quantity,
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
    } catch (err) {
        console.error('Error processing import-cards request:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/save-deck', async (req, res) => {
    const { deckName, cards } = req.body;
    if (!deckName || !cards) {
        return res.status(400).send('Deck name and cards are required.');
    }

    const filePath = path.join(__dirname, '..', 'Decks', `${deckName}.json`);
    try {
        await fs.writeFile(filePath, JSON.stringify({ cards }, null, 2));
        res.json({ message: 'Deck saved successfully', deckName });
    } catch (err) {
        console.error('Error saving the deck file:', err);
        res.status(500).send('Error saving the deck');
    }
});

// Route to load a specific deck by name
app.get('/load-deck-data', (req, res) => {
    const { name } = req.query;
    if (!name) {
        // Respond with an error in JSON format
        return res.status(400).json({ error: 'Deck name is required.' });
    }

    console.log(`Loading deck with name: ${req.query.name}`);
    const deckPath = path.join(__dirname, '..', 'Decks', `${req.query.name}.json`);
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

app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Perform validation
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const usersPath = path.join(__dirname, 'users.json');

    try {
        let users;
        try {
            const data = await fs.readFile(usersPath, 'utf-8');
            users = JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('users.json not found, creating new file.');
                users = [];
            } else {
                throw error;
            }
        }

        // Check if the user already exists
        const userExists = users.some(user => user.username === username || user.email === email);
        if (userExists) {
            return res.status(409).json({ message: 'User already exists' });
        }

        users.push({ username, email, password }); // Storing plain passwords is not secure, consider hashing
        await fs.writeFile(usersPath, JSON.stringify(users, null, 2));

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create user' });
    }
});

// Sign-in route
app.post('/api/signin', async (req, res) => {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        const usersPath = path.join(__dirname, 'users.json');
        const data = await fs.readFile(usersPath, 'utf-8');
        const users = JSON.parse(data);

        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            // User found
            res.status(200).send('Sign in successful');
        } else {
            // User not found
            res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while trying to sign in');
    }
});

// Define a test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Connection successful' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
