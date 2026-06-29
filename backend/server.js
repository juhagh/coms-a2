
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const Logger = require('./patterns/singleton/Logger');

const logger = Logger.getInstance();

dotenv.config();


const app = express();

app.use(cors());
// app.use(express.json());
app.use(express.json({ limit: '5mb' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Export the app object for testing
//if (require.main === module) {
//    connectDB();
//    // If the file is run directly, start the server
//    const PORT = process.env.PORT || 5001;
//    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//  }

if (require.main === module || process.env.NODE_ENV === 'test') {
    connectDB();
    if (require.main === module) {
        const PORT = process.env.PORT || 5001;
        app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
    }
}

module.exports = app
