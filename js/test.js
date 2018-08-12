const express = require('express');
// const moment = require('moment');
// const bodyParser = require('body-parser');
// const Tweet = require('../config');
const app = express();
// const urleParser = bodyParser.urlencoded({extended: false});

app.get('/', (req, res) => {
  res.send('hello m');
});

app.listen(3000, () => {
  console.log('running on port 3000');
});
