const mongoose = require('mongoose')
require('dotenv').config(); // Load environment variables from .env file
const mongoURI = process.env.MONGO_URI;


// 'mongodb://127.0.0.1:27017/CloudNote1?directConnection=true'
// mongodb://localhost:27017/
// mongodb://127.0.0.1:27017/?directConnection=true
console.log(mongoURI)

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

const connectmongo = async () => {
    mongoose.connect(mongoURI, connectionParams)
        .then(() => {
            console.log('Connected to database')
        })
        .catch((err) => {
            console.error(`Error connecting to the database. \n${err}`);
        })
}

module.exports = connectmongo;