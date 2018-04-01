const express = require('express');
const app = express();

app.use(express.static('css'));
app.use(express.static('images'));

app.set('view engine', 'pug');







app.get('/', (req, res) => {
  // res.send('hello world');
  res.render('index');
});

app.listen(3000);
