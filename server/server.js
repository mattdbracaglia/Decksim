const express = require('express');
const path = require('path');
const fs = require('fs').promises; // This line is crucial for using the promise-based APIs
const app = express();
const bcrypt = require('bcryptjs');
const PORT = process.env.PORT || 3000;
require('dotenv').config();


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
    // Ensure connection is established
    const db = await connectToMongoDB();
    const { username, email, password } = req.body;

    if (!db) {
        return res.status(500).json({ message: 'Database connection error' });
    }

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        // Access the "users" collection
        const usersCollection = db.collection("users");

        // Check if the user already exists
        const existingUser = await usersCollection.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Hash the password before saving the new user
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

        // Insert the new user with the hashed password
        const result = await usersCollection.insertOne({
            username,
            email,
            password: hashedPassword // Store the hashed password
        });

        res.status(201).json({ message: 'User created successfully', userId: result.insertedId });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: 'Failed to create user' });
    }
});

// Sign-in route
app.post('/api/signup', async (req, res) => {
    const db = await connectToMongoDB();
    const { username, email, password } = req.body;

    if (!db) {
        return res.status(500).json({ message: 'Database connection error' });
    }

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const usersCollection = db.collection("users");

        // Check if the user already exists
        const existingUser = await usersCollection.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Hash the password before saving the new user
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user with the hashed password
        const result = await usersCollection.insertOne({
            username,
            email,
            password: hashedPassword
        });

        // Retrieve the newly created user using the insertedId
        const newUser = await usersCollection.findOne({ _id: result.insertedId });

        console.log('New user created:', newUser); // This will log the newly created user data

        res.status(201).json({ message: 'User created successfully', userId: result.insertedId });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: 'Failed to create user' });
    }
});

app.post('/api/signin', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        await client.connect();
        const db = client.db("YOUR_DATABASE_NAME"); // Make sure to replace "YOUR_DATABASE_NAME" with your actual database name.
        const usersCollection = db.collection("users");
        
        const user = await usersCollection.findOne({ username: username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // If you reach here, the username and password are correct.
        res.json({ message: 'Sign in successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while trying to sign in' });
    } finally {
        await client.close();
    }
});

const { MongoClient, ServerApiVersion } = require('mongodb');

// Ensure your password is correctly encoded if it contains special characters
const uri = "mongodb+srv://mattbracaglia:sPRCeycmWzlSi4W4@decksim.8wd39qs.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1
});

// Global variable to hold the DB connection
let db;

async function connectToMongoDB() {
    if (!db) {
        try {
            await client.connect();
            console.log("Connected successfully to MongoDB");
            db = client.db("Decksim"); // use your database name
        } catch (e) {
            console.error("Could not connect to MongoDB", e);
        }
    }
    return db;
}

connectToMongoDB().catch(console.error);

// Define a test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Connection successful' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
