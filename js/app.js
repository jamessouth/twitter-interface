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

async function callAPI(endpoint, config){
  try{
    let pkg = await Tweet.get(endpoint, config);
    return package(pkg);
  } catch(e){
    e.message = e.message || 'Data error - please try again.';
    return Promise.reject(e);
  }
}

function twitterTime(timeString){
  let time = moment(timeString, 'ddd MMM DD HH:mm:ss ZZ YYYY');
  if(time.diff(moment()) < -518400000){//6 days
    return time.format('DD MMM');
  } else {
    return time.fromNow(true).replace(/(\d{1,2}) (\w+)/i, abbrev);
  }
}

app.use((req, res, next) => {
  const id = Tweet.config.access_token.split('-')[0];
  callAPI('users/show', {user_id: id}).then(r => {
    app.locals.user = [r.data.screen_name, r.data.profile_image_url_https, r.data.profile_banner_url];
    next();
  }, err => {
    next(err);
  });
});

app.use((req, res, next) => {
  callAPI('statuses/user_timeline', {count: 5}).then(r => {
    app.locals.timeline = r.data.map(x => [x.text, `@${x.user.screen_name}`, x.user.name, x.user.profile_image_url_https, x.retweet_count, x.favorite_count, twitterTime(x.created_at)]);
    next();
  }, err =>  next(err));
});

app.use((req, res, next) => {
  callAPI('friends/list', {count: 5}).then(r => {
    app.locals.following = r.data.users.map(x => [x.name, `@${x.screen_name}`, x.profile_image_url_https]);
    app.locals.numFollowed = r.data.users.length;
    next();
  }, err => next(err));
});

app.use((req, res, next) => {
  callAPI('direct_messages/events/list', {count: 6}).then(r =>
    Promise.all(r.data.events.reverse().map(async x => {
      try{
        let sender = await callAPI('users/show', {user_id: x.message_create.sender_id});
        let recipient = await callAPI('users/show', {user_id: x.message_create.target.recipient_id});
        return [recipient.data.name, recipient.data.screen_name, recipient.data.profile_image_url_https, sender.data.name, sender.data.screen_name, sender.data.profile_image_url_https, x.message_create.message_data.text, moment(x.created_timestamp, 'x').fromNow()];
      } catch(e){
        e.message = e.message || 'Data error - please try again.';
        return Promise.reject(e);
      }
    })).then(n => app.locals.dms = n, err => next(err)).then(() => next()), err => next(err));
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
  const data = app.locals;
  const timeline = data.timeline;
  const following = data.following;
  const numFollowed = data.numFollowed;
  const user = data.user || ['', '', ''];
  const dms = data.dms;
  res.render('index', {timeline, following, numFollowed, user, dms});
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
