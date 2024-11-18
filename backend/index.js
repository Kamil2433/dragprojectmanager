const connectmongo = require("./db.js");
const express = require("express");
const app = express();
require('dotenv').config(); // Load environment variables from .env file
const cors = require("cors");

app.use(cors());

app.use(express.json());
connectmongo();

app.use('/api/auth',require('./routes/auth'))
app.use('/api/project',require('./routes/projectcontroller'))
app.use('/api/task',require('./routes/taskcontroller'))


//index

const port = process.env.PORT || 3200;




app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
