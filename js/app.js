const express = require('express');
const moment = require('moment');
const Tweet = require('../config');
const app = express();

app.use(express.static('css'));
app.use(express.static('images'));

app.set('view engine', 'pug');

function abbrev(match){
	return match[1];
}
// customize fromNow func??

// app.use((req, res, next) => {
//   Tweet.get('statuses/user_timeline', {count: 1}, (err, data, res) => {
//     data.forEach(x => console.log(x.text, `@${x.user.screen_name}`, x.user.name, x.user.profile_image_url_https, x.retweet_count, x.favorite_count, moment(x.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').fromNow(true).replace(/ \w+/i, abbrev)));
//   });
//   next();
// });

// app.use((req, res, next) => {
//   Tweet.get('friends/list', (err, data, res) => {
//     data.users.forEach(x => console.log(x.name, `@${x.screen_name}`, x.profile_image_url_https));
//     console.log(data.users.length);
//   });
//   next();
// });

function getDataFromID(id){
  Tweet.get('users/show', {user_id: id}, (err, data, res) => {
    return [data.name, data.profile_image_url_https];

  });
}

app.use((req, res, next) => {
  Tweet.get('direct_messages/events/list', (err, data, res) => {
    data.events.reverse().forEach(x => console.log(x.message_create.target.recipient_id, getDataFromID(x.message_create.sender_id), x.message_create.message_data.text, moment(x.created_timestamp, 'x').fromNow()));

  });
  next();
});





app.get('/', (req, res) => {
  // res.send('hello world');
  res.render('index');
});

app.listen(3000);
