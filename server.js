const express = require('express');
const app = express();
const port = process.env.PORT || 500
app.listen(port, () => console.log(`listening at ${port}`));
app.use(express.static('ihifix')); 
require('dotenv').config();