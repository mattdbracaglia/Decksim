const express = require('express');
const path = require('path');
const fs = require('fs').promises; // This line is crucial for using the promise-based APIs
const app = express();
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { MongoClient, ServerApiVersion } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);
// Ensure your password is correctly encoded if it contains special characters
const jwt = require('jsonwebtoken');
const PORT = process.env.PORT || 3000;
require('dotenv').config();
const MongoStore = require('connect-mongo');
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ client: client, dbName: 'Decksim' }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        domain: 'decksim.in'
    }
}));

app.use((req, res, next) => {
    console.log('Session middleware triggered:', req.sessionID);
    next();
});

function ensureLoggedIn(req, res, next) {
    console.log('ensureLoggedIn middleware triggered for session:', req.sessionID);
    if (req.session.user) {
        console.log('User is logged in:', req.session.user.username);
        next();
    } else {
        console.log('User not logged in. Blocking access.');
        res.status(401).json({ message: 'Unauthorized' });
    }
}


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        console.log('Authenticated user:', user); // This will show the entire user object
        next();
    });
}

app.use((req, res, next) => {
    console.log(`Incoming request for ${req.path} with session ID: ${req.sessionID}`);
    next();
});

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

app.get('/api/check-login', authenticateToken, (req, res) => {
    // If the token is valid, the `authenticateToken` middleware will allow this code to run
    res.json({ loggedIn: true });
});

// Updated route to fetch deck names from MongoDB
app.get('/get-deck-names', authenticateToken, async (req, res) => {
    console.log('Received token:', req.headers.authorization);
    console.log('GET /get-deck-names called');
    try {
        const db = await connectToMongoDB();
        console.log('Connected to MongoDB');
        const decksCollection = db.collection("decks");
        const deckNames = await decksCollection.distinct("deckName", { userId: req.user.id });

        console.log('Deck names fetched from MongoDB:', deckNames);
        res.json(deckNames);
    } catch (err) {
        console.error("Failed to list decks from MongoDB:", err);
        res.status(500).json({ error: 'Error listing deck names from database' });
    }
});

// Route to process card names and filter data from Card-Details.json
app.post('/import-cards', authenticateToken, async (req, res) => {
    console.log('Received request on /import-cards with body:', req.body);

    const { cardNames, deckName } = req.body;
    if (!cardNames || cardNames.length === 0 || !deckName) {
        console.error('Deck name and card names are required.');
        return res.status(400).json({ error: 'Deck name and card names are required.' });
    }

    const userId = req.user.id;
    console.log('User ID in /import-cards:', userId);

    const cardDetailsPath = path.join(__dirname, '..', 'card-details.json');
    console.log('Attempting to read Card-Details.json from path:', cardDetailsPath);

    try {
        const data = await fs.readFile(cardDetailsPath, 'utf8');
        const cardsData = JSON.parse(data);

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
            Commander: false
        };

        const filteredCards = cardNames.map(cardRequest => {
            const card = cardsData.find(c => c.name.toLowerCase() === cardRequest.name.toLowerCase());
            if (card) {
                const enhancedCard = {
                    ...card,
                    quantity: cardRequest.quantity,
                    uiState: { ...defaultUIState, ...(card.uiState || {}) }
                };
                return enhancedCard;
            }
            return null;
        }).filter(card => card);

        console.log(`Filtered ${filteredCards.length} cards from the provided names.`);

        const transformedData = {
            userId: userId,
            deckName: deckName,
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
                },
                uiState: card.uiState
            }))
        };

        const db = await connectToMongoDB();
        const decksCollection = db.collection("decks");

        await decksCollection.updateOne(
            { userId: userId, deckName: deckName },
            { $set: transformedData },
            { upsert: true }
        );

        console.log('Cards imported and saved for user with default UI state');
        res.json({ message: 'Cards imported successfully', deckName, cards: transformedData.cards });
    } catch (err) {
        console.error('Error processing import-cards request:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.post('/save-deck', authenticateToken, async (req, res) => {
    const { deckName, cards } = req.body;
    const userId = req.user.id;

    console.log('Saving deck:', deckName, 'for user:', userId);

    if (!deckName || !cards) {
        console.log('Deck name and cards are missing');
        return res.status(400).send('Deck name and cards are required.');
    }

    try {
        const db = await connectToMongoDB();
        const decksCollection = db.collection("decks");

        console.log('Updating/inserting the deck in the database');
        await decksCollection.updateOne(
            { userId: userId, deckName: deckName },
            { $set: { userId: userId, deckName: deckName, cards: cards } },
            { upsert: true }
        );

        console.log('Deck saved successfully');
        res.json({ message: 'Deck saved successfully', deckName });
    } catch (err) {
        console.error('Error saving the deck:', err);
        res.status(500).send('Error saving the deck');
    }
});

// Route to load a specific deck by name
app.get('/load-deck-data', authenticateToken, async (req, res) => {
    const userId = req.user.id; // Use the authenticated user's ID
    const deckName = req.query.deckName; // Get deckName from query parameters

    if (!deckName) {
        return res.status(400).json({ error: 'Deck name is required.' });
    }

    console.log(`Loading deck with name: ${deckName} for user ID: ${userId}`);
    const db = await connectToMongoDB();
    const decksCollection = db.collection("decks");

    try {
        const deckData = await decksCollection.findOne({ userId: userId, deckName: deckName });
        if (deckData) {
            console.log(`Deck data loaded for ${deckName}`);
            res.json(deckData.cards); // Send only the cards array to the client
        } else {
            res.status(404).json({ error: 'Deck not found' });
        }
    } catch (err) {
        console.error(`Failed to load deck from MongoDB: ${err}`);
        res.status(500).json({ error: 'Error loading deck data' });
    }
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
        console.log('New user created with ID:', result.insertedId.toString());

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
        if (isMatch) {
            console.log(`Password match for user: ${username}. Generating JWT...`);
            // Use user._id.toString() to ensure the ID is in string format
            const tokenPayload = { id: user._id.toString(), username: user.username };
            const accessToken = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
            console.log('Token payload:', tokenPayload);

            console.log(`Sign-in successful for user: ${username}`);
            return res.json({ accessToken }); // Send the token to the client
        } else {
            console.log(`Password verification failed for user: ${username}`);
            return res.status(401).json({ error: 'Invalid username or password' });
        }
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
