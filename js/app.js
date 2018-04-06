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
	const id = Tweet.config.access_token.split('-')[0];
	Tweet.get('users/show', {user_id: id}).then(pkg => {
		console.log('line 33', pkg.data);
		if(pkg.data.errors){
			const err = new Error('Data error - please try again. - users.show3535353535');
			next(err);
		} else {
			res.masterObject.user = [pkg.data.screen_name, pkg.data.profile_image_url_https, pkg.data.profile_banner_url];
		}
	}, err => {
		console.log('line 42, ');
		err.message = 'Data error - please try again. - users.show4242';
		next(err);
	})
	.then(() => {
		console.log('line 45');
		next();
	});
});



// app.use((req, res, next) => {
//
//   Tweet.get('statuses/user_timeline', {count: 1}, (err, data, resp) => {
//     Promise.all(data.map(x => {
// 			return [x.text, `@${x.user.screen_name}`, x.user.name, x.user.profile_image_url_https, x.retweet_count, x.favorite_count, twitterTime(x.created_at)];
// 		})).then(pkg => res.masterObject.timeline = pkg).then(() => next());
//   });
// });

// app.use((req, res, next) => {
//   Tweet.get('friends/list', {count: 1}, (err, data, resp) => {
// 		if(err){next(err);return;}
//     Promise.all(data.users.map(x => {
// 			return [x.name, `@${x.screen_name}`, x.profile_image_url_https];
// 		})).then(pkg => {
// 			res.masterObject.following = pkg;
// 			res.masterObject.numFollowed = data.users.length;
// 		}).then(() => next());
//   });
// });

// app.use((req, res, next) => {
//
// 	Promise.resolve(getDataFromID(user_id)).then(pkg => {
// 		if(pkg.data.errors){
// 			Promise.reject(new Error('Data error - please try again.')).then(() => {}, err => next(err));
// 		}
// 		res.masterObject.user = [pkg.data.screen_name, pkg.data.profile_image_url_https, pkg.data.profile_banner_url];
// 	}, err => {
// 		err.message = 'Data error - please try again.';
// 		next(err);
// 	}).then(() => next());
// });

// app.use((req, res, next) => {
//   Tweet.get('direct_messages/events/list', (err, data, resp) => {
// 		if(err){next(err);return;}
//     Promise.all(data.events.reverse().map(async x => {
// 			try{
// 				let sender = await getDataFromID(x.message_create.sender_id);
// 				let recipient = await getDataFromID(x.message_create.target.recipient_id);
//
// 				return [recipient.data.name, recipient.data.screen_name, recipient.data.profile_image_url_https, sender.data.name, sender.data.screen_name, sender.data.profile_image_url_https, x.message_create.message_data.text, moment(x.created_timestamp, 'x').fromNow()];
// 			} catch(e){console.log('here error');}
// 		})).then(pkg => res.masterObject.dms = pkg, err => {
// 			// console.log(err);
// 			err.message = 'Data error - please try againeeee.';
// 			next(err);
// 		}).then(() => next());
// 	});
// });




app.get('/', (req, res) => {
	console.log('line 109, ' + res.masterObject.user);
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
	err.status = 404;
	next(err);
});

// potential TODO - on error code 88 (rate limit exceeded) implement info display or countdown as to how long until the reset????
app.use((err, req, res, next) => {
	console.log('line 127');
	res.status(err.status || 500);
	const user = res.masterObject.user || ['', '', ''];
	res.render('error', {message: err.message, user});
});

app.listen(3000);
