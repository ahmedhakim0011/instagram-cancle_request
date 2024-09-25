const express = require('express');
const followRequestRoutes = require('./routes/followRequestRoutes');

const app = express();
const port = 3000;

// Middleware to parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the follow request routes
app.use('/api', followRequestRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
