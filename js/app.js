const express = require('express');
const moment = require('moment');
const Tweet = require('../config');
const app = express();

moment.updateLocale('en', {relativeTime: {d: '1 day', h: '1 hour', m: '1 minute'}});

app.use(express.static('css'));
app.use(express.static('images'));

app.set('view engine', 'pug');

function abbrev(match, p1, p2){
	return `${p1}${p2[0]}`;
}

function getDataFromID(id){
  return Tweet.get('users/show', {user_id: id}, (err, data, res) => data);
}

function twitterTime(timeString){
	let time = moment(timeString, 'ddd MMM DD HH:mm:ss ZZ YYYY');
	if(time.diff(moment()) < -518400000){
		return time.format('DD MMM');
	} else {
		return time.fromNow(true).replace(/(\d{1,2}) (\w+)/i, abbrev);
	}
}

app.use((req, res, next) => {
	res.masterObject = {};
  Tweet.get('statuses/user_timeline', {count: 5}, (err, data, resp) => {
    Promise.all(data.map(x => {
			return [x.text, `@${x.user.screen_name}`, x.user.name, x.user.profile_image_url_https, x.retweet_count, x.favorite_count, twitterTime(x.created_at)];
		})).then(pkg => res.masterObject.timeline = pkg).then(() => next());
  });
});

app.use((req, res, next) => {
  Tweet.get('friends/list', (err, data, resp) => {
    Promise.all(data.users.map(x => {
			return [x.name, `@${x.screen_name}`, x.profile_image_url_https];
		})).then(pkg => {
			res.masterObject.following = pkg;
			res.masterObject.numFollowed = data.users.length;
		}).then(() => next());
  });
});



app.use((req, res, next) => {
  Tweet.get('direct_messages/events/list', (err, data, resp) => {
    Promise.all(data.events.reverse().map(async x => {
			let sender = await getDataFromID(x.message_create.sender_id);
			let recipient = await getDataFromID(x.message_create.target.recipient_id);
			return [recipient.data.name, recipient.data.profile_image_url_https, sender.data.name, sender.data.profile_image_url_https, x.message_create.message_data.text, moment(x.created_timestamp, 'x').fromNow()];
		})).then(pkg => res.masterObject.dms = pkg).then(() => next());
	});
});


app.get('/', (req, res) => {
	// console.log(res.masterObject);
	const data = res.masterObject;
  res.render('index', {data});
});

app.listen(3000);
