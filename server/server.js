const express = require('express');
const path = require('path');
const fs = require('fs').promises; // This line is crucial for using the promise-based APIs
const app = express();
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { MongoClient, ServerApiVersion } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);
// Ensure your password is correctly encoded if it contains special characters
const PORT = process.env.PORT || 3000;
require('dotenv').config();
const MongoStore = require('connect-mongo');
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret', // Use SESSION_SECRET environment variable if available, or default to a fallback secret
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ client: client, dbName: 'Decksim' }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'Lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        domain: '.decksim.in'
    }
}));

function ensureLoggedIn(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}


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

app.get('/api/check-login', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ loggedIn: true });
    } else {
        res.json({ loggedIn: false });
    }
});

// Route to list names of .json files in the Decks directory
app.get('/get-deck-names', ensureLoggedIn, async (req, res) => {
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
app.post('/import-cards', ensureLoggedIn, async (req, res) => {
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

app.post('/save-deck', ensureLoggedIn, async (req, res) => {
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
app.get('/load-deck-data', ensureLoggedIn, (req, res) => {
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

app.post('/api/signup', ensureLoggedIn, async (req, res) => {
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



app.post('/api/signin', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Received sign-in request for username: ${username}`);

    if (!username || !password) {
        console.log('Username or password not provided');
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        console.log('Connecting to MongoDB for sign-in...');
        const db = await connectToMongoDB();
        if (!db) {
            console.log('Failed to connect to MongoDB');
            return res.status(500).json({ error: 'Database connection error' });
        }
        console.log('MongoDB connection established for sign-in');

        const usersCollection = db.collection("users");
        console.log(`Looking for user in DB: ${username}`);

        const user = await usersCollection.findOne({ username: username });
        if (!user) {
            console.log(`User not found in DB: ${username}`);
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        console.log(`User found in DB: ${username}, verifying password...`);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Password verification failed for user: ${username}`);
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Store user data in session after successful sign-in
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email // Store only necessary information, avoid sensitive data
        };
        console.log(`Sign in successful for user: ${username}`);
        res.json({ message: 'Sign in successful' });
    } catch (error) {
        console.error(`Error during sign-in for user: ${username}`, error);
        res.status(500).json({ error: 'An error occurred while trying to sign in' });
    }
});






// Global variable to hold the DB connection
let db;

async function connectToMongoDB() {
    if (db) {
        return db;
    }

    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
        db = client.db("Decksim"); // Replace "Decksim" with your actual database name
        return db;
    } catch (error) {
        console.error("Could not connect to MongoDB", error);
        throw new Error('Database connection failed');
    }
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
