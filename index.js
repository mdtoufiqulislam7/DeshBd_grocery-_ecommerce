const express = require('express')
const app = express()
const cors = require('cors')
const bodyparser = require('body-parser');
const db = require('./config/db');
require('dotenv').config()
const cookieParser = require("cookie-parser");
app.use(cookieParser());
// const fileuploader = require('express-fileupload');

// app.use(fileuploader({
//     useTempFiles: true,
//     tempFileDir: '/tmp/'
// }));
const port = process.env.PORT
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5000'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
const upload = require('./middleware/multer')
// Handle preflight requests
app.options('*', cors());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

const userRoute = require('./router/userRoute')
const userAddress = require('../Backend/router/address.router')
const category = require('../Backend/router/category.route')
app.use('/api/user/',userRoute)
app.use('/api',userAddress)
app.use('/api',category)


app.use((req, res, next) => {
    res.status(400).json({
        message: 'Bad request || URL not found'
    });
});

const server = () => {
    db()
    app.listen(port, () => {
        console.log(`app is running at https://localhost:${port}`);
    });
};
server();