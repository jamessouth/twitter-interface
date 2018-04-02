const express = require('express');
const Tweet = require('../config');
const app = express();

app.use(express.static('css'));
app.use(express.static('images'));

app.set('view engine', 'pug');


app.use((req, res, next) => {
  Tweet.get('statuses/user_timeline', {count: 5}, (err, data, res) => {
    data.forEach(x => console.log(x.text, x.user.screen_name));
  });
  next();
});




app.get('/', (req, res) => {
  // res.send('hello world');
  res.render('index');
});

app.listen(3000);
