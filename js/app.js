const express = require('express');
const moment = require('moment');
const bodyParser = require('body-parser');
const Tweet = require('../config');
const app = express();
const urleParser = bodyParser.urlencoded({extended: false});

moment.updateLocale('en', {relativeTime: {d: '1 day', h: '1 hour', m: '1 minute'}});

app.use(express.static('css'));
app.use(express.static('images'));
app.set('view engine', 'pug');

function abbrev(match, p1, p2){
  return `${p1}${p2[0]}`;
}

function package(p){
  if(p.data.errors){
    const err = new Error();
    err.message = p.data.errors[0].message || 'Data error - please try again.';
    return Promise.reject(err);
  } else {
    return p;
  }
}

function callAPI(endpoint, config, cb){
  console.log('requesting: ' + endpoint, Date.now());
  cb(Tweet.get(endpoint, config));


    // e.message = e.message || 'Data error - please try again.';
    // return Promise.reject(e);

}

function getData(endpoint, config){
  return new Promise((resolve, reject) => {
    callAPI(endpoint, config, resolve);
  });
}



function twitterTime(timeString){
  let time = moment(timeString, 'ddd MMM DD HH:mm:ss ZZ YYYY');
  if(time.diff(moment()) < -518400000){ // 6 days
    return time.format('DD MMM');
  } else {
    return time.fromNow(true).replace(/(\d{1,2}) (\w+)/i, abbrev);
  }
}



// app.use((req, res, next) => {
//
//   callAPI().then(r => {
//     // console.log(r);
//     console.log('dms', Date.now());
//     Promise.all(r.data.events.reverse().map(async x => {
//       try{
//         let sender = await callAPI('users/show', {user_id: x.message_create.sender_id});
//         let recipient = await callAPI('users/show', {user_id: x.message_create.target.recipient_id});
//         return [recipient.data.name, recipient.data.screen_name, recipient.data.profile_image_url_https, sender.data.name, sender.data.screen_name, sender.data.profile_image_url_https, x.message_create.message_data.text, moment(x.created_timestamp, 'x').fromNow()];
//       } catch(e){
//         e.message = e.message || 'Data error - please try again.';
//         return Promise.reject(e);
//       }
//     })).then(n => app.locals.dms = n, err => next(err)).then(() => next()), err => next(err)});
// });



// app.use((req, res, next) => {
//   callAPI().then(r => {
//     console.log('rate limit', Date.now());
//     console.log(r.data.resources.users['/users/show/:id'], r.data.resources.friends['/friends/list'], r.data.resources.statuses['/statuses/user_timeline'], r.data.resources.direct_messages['/direct_messages/events/list'], r.data.resources.application['/application/rate_limit_status']);
//     next();
//   }, err => next(err));
// });




app.use(async (req, res, next) => {
  const id = Tweet.config.access_token.split('-')[0];



// getData('application/rate_limit_status'),




  // const [user, tweet, friend, dm] =
  await Promise.all([
    getData('users/show', {user_id: id}),
    getData('statuses/user_timeline', {count: 5}),
    getData('friends/list', {count: 5}),
    getData('direct_messages/events/list', {count: 6}),
  ]).then(results => {
    app.locals.user = [results[0].data.screen_name, results[0].data.profile_image_url_https, results[0].data.profile_banner_url];

    app.locals.timeline = results[1].data.map(twt => [twt.text, `@${twt.user.screen_name}`, twt.user.name, twt.user.profile_image_url_https, twt.retweet_count, twt.favorite_count, twitterTime(twt.created_at)]);

    app.locals.following = results[2].data.users.map(fr => [fr.name, `@${fr.screen_name}`, fr.profile_image_url_https]);

    app.locals.dms = results[3].data.events.reverse();

    const dmSenderID = results[3].data.events[0].message_create.sender_id;
    const dmRecipientID = results[3].data.events[0].message_create.target.recipient_id;
    return Promise.all([
      getData('users/show', {user_id: dmSenderID}),
      getData('users/show', {user_id: dmRecipientID}),
    ]);
  }).then(pkg => {
    console.log(pkg);
  });


  //
  // console.log(app.locals.user, Date.now(), 'user');
  // console.log(app.locals.timeline, Date.now(), 'tweet');
  // console.log(app.locals.following, Date.now(), 'friend');
  // console.log(app.locals.dms, Date.now(), 'dm');
  // console.log(app.data.resources.users, Date.now(), 'app');

  next();
});




app.post('/', urleParser, (req, res, next) => {
  Tweet.post('statuses/update', {status: req.body.tweet}).
    then(pkg => package(pkg), err => next(err)).
    then(() => callAPI('statuses/user_timeline', {count: 5}), err => {
      next(err);
      return Promise.reject(err);
    }).
    then(r => {
      app.locals.timeline = r.data.map(x => [x.text, `@${x.user.screen_name}`, x.user.name, x.user.profile_image_url_https, x.retweet_count, x.favorite_count, twitterTime(x.created_at)])
      res.redirect('/');
    }, err => next(err));
});

app.get('/', (req, res) => {
  console.log('here');
  res.send('snot');
  // console.log('get', Date.now());
  // const data = app.locals;
  // const timeline = data.timeline;
  // const following = data.following;
  // const numFollowed = data.numFollowed;
  // const user = data.user || ['', '', ''];
  // const dms = data.dms;
  // res.render('index', {timeline, following, numFollowed, user, dms});
});

app.use((req, res, next) => {
  const err = new Error('Page Not Found...');
  next(err);
});

app.use((err, req, res, next) => {
  const user = app.locals.user || ['', '', ''];
  res.render('error', {message: err.message, user});
});

app.listen(3000);

// potential TODO - on error code 88 (rate limit exceeded) implement info display or countdown as to how long until the reset????
// potential TODO - implement socket.io????
