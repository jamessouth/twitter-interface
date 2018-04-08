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

function package(p){
	// console.log('18', p);
	if(p.data.errors){
		const err = new Error('Data error - please try againtoptop.');
		// next(err);
		return Promise.reject(err);
	} else {
		console.log('24');
		return p;
	}
}

async function callAPI(endpoint, config){
	try{
		let pkg = await Tweet.get(endpoint, config);
		return package(pkg);
		// throw new Error();
	} catch(e){
		e.message = 'Data error - please try again.';
		return Promise.reject(e);
	}
}

function twitterTime(timeString){
	let time = moment(timeString, 'ddd MMM DD HH:mm:ss ZZ YYYY');
	if(time.diff(moment()) < -518400000){
		return time.format('DD MMM');
	} else {
		return time.fromNow(true).replace(/(\d{1,2}) (\w+)/i, abbrev);
	}
}


// app.use((req, res, next) => {
// 	res.masterObject = {};
// 	const id = Tweet.config.access_token.split('-')[0];
// 	callAPI('users/show', {user_id: id}).then(r => {
// 		// console.log('line 45');
// 		res.masterObject.user = ['@' + r.data.screen_name, r.data.profile_image_url_https, r.data.profile_banner_url];
// 		next();
// 	}, err => {
// 		// console.log('62');
// 		next(err);
// 	});
// });


// app.use((req, res, next) => {
//   callAPI('statuses/user_timeline', {count: 1}).then(r => {
// 		res.masterObject.timeline = r.data.map(x => [x.text, `@${x.user.screen_name}`, x.user.name, x.user.profile_image_url_https, x.retweet_count, x.favorite_count, twitterTime(x.created_at)]);
// 		next();
// 	}, err =>	next(err));
// });

app.use((req, res, next) => {
	res.masterObject = {};
  callAPI('friends/list', {count: 2}).then(r => {

		res.masterObject.following = r.data.users.map(x => [x.name, `@${x.screen_name}`, x.profile_image_url_https]);
		res.masterObject.numFollowed = r.data.users.length;
		console.log('77 ', res.masterObject.following, res.masterObject.numFollowed);
		next();

	}, err => next(err));

});



app.use((req, res, next) => {
  callAPI('direct_messages/events/list').then(pkg => {

		return Promise.all(pkg.data.events.reverse().map(x => {

			let sender = await getDataFromID(x.message_create.sender_id);
			let recipient = await getDataFromID(x.message_create.target.recipient_id);

			return [recipient.data.name, recipient.data.screen_name, recipient.data.profile_image_url_https, sender.data.name, sender.data.screen_name, sender.data.profile_image_url_https, x.message_create.message_data.text, moment(x.created_timestamp, 'x').fromNow()];

		}))

	}, err => {

	});
});

    // .then(pkg => res.masterObject.dms = pkg, err => {
		// 	// console.log(err);
		// 	err.message = 'Data error - please try againeeee.';
		// 	next(err);
		// }).then(() => next());






app.get('/', (req, res) => {
	// console.log(res.masterObject.user);
	// console.log();
	// console.log(res.masterObject.timeline);
	// const data = res.masterObject;
	// const timeline = data.timeline;
	// const following = data.following;
	// const numFollowed = data.numFollowed;
	// const user = data.user || ['', '', ''];
	// const dms = data.dms;
  res.render('index', {timeline, following, numFollowed, user, dms});
});

app.use((req, res, next) => {
	console.log('line 120');
	const err = new Error('Page Not Found...');
	// err.status = 404;
	next(err);
});

// potential TODO - on error code 88 (rate limit exceeded) implement info display or countdown as to how long until the reset????
app.use((err, req, res, next) => {
	// console.log('line 127');
	// res.status(err.status || 500);
	const user = res.masterObject.user || ['', '', ''];
	res.render('error', {message: err.message, user});
});

app.listen(3000);
