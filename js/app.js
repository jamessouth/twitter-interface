const express = require('express');
const app = express();

app.use(express.static('css'));

app.set('view engine', 'pug');







app.get('/', (req, res) => {
  // res.send('hello world');
  res.render('layout');
});

app.listen(3000);
