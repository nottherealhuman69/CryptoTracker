// server.js
const mongoose = require('mongoose');
const Crypto = require('./models/Crypto'); // Import Crypto model
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User'); // Assuming models directory
const flash = require('connect-flash');
require('./cronJob'); // Import the cron job
require('dotenv').config();

const app = express();

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET, // Replace with a strong secret
    resave: false,
    saveUninitialized: true
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash Middleware
app.use(flash());

app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    next();
});

// Set EJS as the templating engine
app.set('view engine', 'ejs');

app.use(express.static('public'));


passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return done(null, false, { message: 'No user found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Incorrect password' });
        }
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

app.get('/home', ensureAuthenticated, (req, res) => res.render('index'));

// MongoDB connection
mongoose.connect('mongodb+srv://suryan_pinnoju:Human69420@info.u9bxg.mongodb.net/cryptoTrackerDB?retryWrites=true&w=majority&appName=Info', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Could not connect to MongoDB", err));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Replace with your email
        pass: process.env.EMAIL_PASS // Use app-specific password from Google
    }
});

app.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});

app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            req.flash('error', 'No account with that email exists');
            return res.redirect('/forgot-password');
        }

        // Generate reset token using crypto
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Save token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email
        const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}`;
        const mailOptions = {
            to: user.email,
            from: 'suryanpinnoju@gmail.com',
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) requested a password reset.
                  Please click on the following link to complete the process:
                  ${resetUrl}
                  If you did not request this, please ignore this email.`
        };

        await transporter.sendMail(mailOptions);
        req.flash('success', 'Reset email sent');
        res.redirect('/login');
    } catch (error) {
        console.error('Error:', error);
        req.flash('error', 'An error occurred');
        res.redirect('/forgot-password');
    }
});

app.get('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired');
            return res.redirect('/forgot-password');
        }

        res.render('reset-password', { token: req.params.token });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/forgot-password');
    }
});

app.post('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired');
            return res.redirect('/forgot-password');
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        req.flash('success', 'Password has been reset');
        res.redirect('/login');
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/forgot-password');
    }
});


app.get('/home', ensureAuthenticated, (req, res) => res.render('index'));
// Show registration page
app.get('/register', (req, res) => res.render('register'));

// Show login page
app.get('/login', (req, res) => res.render('login'));

app.get('/', (req, res) => res.redirect('/login'));

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    let errors = [];
    
    // Basic validation
    if (!username || !email || !password) errors.push({ msg: 'Please fill in all fields' });
    if (password.length < 6) errors.push({ msg: 'Password must be at least 6 characters' });
  
    if (errors.length > 0) {
        return res.render('register', { errors }); // Pass errors directly to the EJS template
    } 

    User.findOne({ email }).then(user => {
        if (user) {
            errors.push({ msg: 'Email is already registered' });
            return res.render('register', { errors }); // Pass errors if the email is already registered
        } 

        const newUser = new User({ username, email, password });
        bcrypt.genSalt(10, (err, salt) => {
            if (err) throw err;
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser.save()
                    .then(user => res.redirect('/login'))
                    .catch(err => console.error(err));
            });
        });
    });
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/login', // Change this to '/login'
        failureFlash: true
    })(req, res, next);
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});

// Route to display cryptocurrency data
app.get('/cryptos', async (req, res) => {
    try {
        // Fetch the latest cryptocurrency data from the database
        const cryptos = await Crypto.find({}).sort({ createdAt: -1 }).limit(10);

        // Render the cryptos page with the fetched data
        return res.render('cryptos', { cryptos: cryptos });
    } catch (err) {
        console.error(err);
        return res.status(500).send('An error occurred while fetching cryptocurrencies');
    }
});

// Update the /stats route
app.get('/stats', async (req, res) => {
    const coin = req.query.coin;
    let cryptoData = null;

    if (coin) {
        try {
            // Find the latest record for the specified cryptocurrency
            cryptoData = await Crypto.findOne({ coin }).sort({ createdAt: -1 });

            if (!cryptoData) {
                return res.status(404).json({ error: 'Cryptocurrency not found' });
            }
        } catch (err) {
            return res.status(500).json({ error: 'An error occurred while fetching data' });
        }
    }

    return res.render('stats', {
        error: null,
        coin: coin,
        price: cryptoData ? cryptoData.price_usd : null,
        marketCap: cryptoData ? cryptoData.market_cap_usd : null,
        change_24h: cryptoData ? cryptoData.change_24h : null
    });
});

function std(values) {
    const n = values.length;
    if (n === 0) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    return Math.sqrt(variance);
}

// Update the /deviation route
app.get('/deviation', async (req, res) => {
    const coin = req.query.coin;
    let deviationData = null;

    if (coin) {
        try {
            const records = await Crypto.find({ coin }).sort({ createdAt: -1 }).limit(100);
            const prices = records.map(record => record.price_usd);
            const deviation = std(prices);

            deviationData = {
                coin: coin,
                deviation: deviation
            };
        } catch (err) {
            console.error(err);
            return res.status(500).send('An error occurred while fetching deviation data');
        }
    }

    return res.render('deviation', { deviationData: deviationData });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
