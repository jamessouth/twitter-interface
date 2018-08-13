const express = require('express');
const moment = require('moment');
const bodyParser = require('body-parser');
const Tweet = require('../config');
const app = express();
const urleParser = bodyParser.urlencoded({extended: false});

// moment.updateLocale('en', {relativeTime: {d: '1 day', h: '1 hour', m: '1 minute'}});
//
// app.use(express.static('css'));
// app.use(express.static('images'));
// app.set('view engine', 'pug');
//
// function abbrev(match, p1, p2){
//   return `${p1}${p2[0]}`;
// }
//
// function package(p){
//   if(p.data.errors){
//     const err = new Error();
//     err.message = p.data.errors[0].message || 'Data error - please try again.';
//     return Promise.reject(err);
//   } else {
//     return p;
//   }
// }
//
// function callAPI(endpoint, config, cb){
//   console.log('requesting: ' + endpoint, Date.now());
//   cb(Tweet.get(endpoint, config));
//
//
//     // e.message = e.message || 'Data error - please try again.';
//     // return Promise.reject(e);
//
// }
//
// function getData(endpoint, config){
//   return new Promise((resolve, reject) => {
//     callAPI(endpoint, config, resolve);
//   });
// }
//
//
//
// function twitterTime(timeString){
//   let time = moment(timeString, 'ddd MMM DD HH:mm:ss ZZ YYYY');
//   if(time.diff(moment()) < -518400000){ // 6 days
//     return time.format('DD MMM');
//   } else {
//     return time.fromNow(true).replace(/(\d{1,2}) (\w+)/i, abbrev);
//   }
// }
//
// app.use((req, res, next) => {//the default request for an icon sometimes calls the middleware again and double-requests the twitter data, so this shuts that off so there's only one request
//   if(req.originalUrl && req.originalUrl.includes('favicon')){
//     return res.sendStatus(204);
//   }
//   next();
// });
//
//
//
//
// app.use((req, res, next) => {
//   const userID = Tweet.config.access_token.split('-')[0];
//
// getData('application/rate_limit_status').then(r => {
//   console.log(r.data.resources.users['/users/show/:id'], r.data.resources.friends['/friends/list'], r.data.resources.statuses['/statuses/user_timeline'], r.data.resources.direct_messages['/direct_messages/events/list'], r.data.resources.application['/application/rate_limit_status']);
// });
//
//   Promise.all([
//     getData('users/show', {user_id: userID}),
//     getData('statuses/user_timeline', {count: 5}),
//     getData('friends/list', {count: 5}),
//     getData('direct_messages/events/list', {count: 6}),
//   ]).then(results => {
//     console.log('start sync', Date.now());
//     app.locals.user = [results[0].data.screen_name, results[0].data.profile_image_url_https, results[0].data.profile_banner_url];
//     console.log(app.locals.user, Date.now());
//     app.locals.timeline = results[1].data.map(twt => {
//       return [twt.text, `@${twt.user.screen_name}`, twt.user.name, twt.user.profile_image_url_https, twt.retweet_count, twt.favorite_count, twitterTime(twt.created_at)];
//     });
//
//
//     app.locals.following = results[2].data.users.map(fr => [fr.name, `@${fr.screen_name}`, fr.profile_image_url_https]);
//
//     app.locals.numFollowed = app.locals.following.length;
//
//     app.locals.dms = results[3].data.events.reverse().map(msg => {
//       return {
//         created: moment(msg.created_timestamp, 'x').fromNow(),
//         to: msg.message_create.target.recipient_id,
//         from: msg.message_create.sender_id,
//         text: msg.message_create.message_data.text,
//       };
//     });
// console.log(app.locals.dms, Date.now());
//     const partyOne = app.locals.dms[0].from;
//     const partyTwo = app.locals.dms[0].to;
//
//     return Promise.all([
//       getData('users/show', {user_id: partyTwo}),
//       getData('users/show', {user_id: partyOne}),
//     ]);
//   }).then(package => {
//     const pkg = package.map(user => {
//       let temp = {
//         id: user.data.id_str,
//         name: user.data.name,
//         scrName: user.data.screen_name,
//         img: user.data.profile_image_url_https,
//       };
//       let classToApply = userID === temp.id ? "app--message--me" : "app--message";
//       return { ...temp, classToApply };
//     });
//
//     app.locals.dmConvoWith = userID !== pkg[0].id ? pkg[0].scrName : pkg[1].scrName;
//
//     const firstParty = pkg[0];
//     const secondParty = pkg[1];
//
//     app.locals.dms = app.locals.dms.map(dm => {
//       if(dm.to === firstParty.id){
//         return { ...dm, sender: { ...secondParty }, recipient: { ...firstParty }};
//       }
//       return { ...dm, sender: { ...firstParty }, recipient: { ...secondParty }};
//     });
//   });
//   next();
// });
//
// app.post('/', urleParser, (req, res, next) => {
//   Tweet.post('statuses/update', {status: req.body.tweet}).
//     then(pkg => package(pkg), err => next(err)).
//     then(() => callAPI('statuses/user_timeline', {count: 5}), err => {
//       next(err);
//       return Promise.reject(err);
//     }).
//     then(r => {
//       app.locals.timeline = r.data.map(x => [x.text, `@${x.user.screen_name}`, x.user.name, x.user.profile_image_url_https, x.retweet_count, x.favorite_count, twitterTime(x.created_at)])
//       res.redirect('/');
//     }, err => next(err));
// });
//
//
//
// app.get('/', (req, res) => {
//   const data = app.locals;
//   const timeline = data.timeline;
//   const following = data.following;
//   const numFollowed = data.numFollowed;
//   const dmConvoWith = data.dmConvoWith;
//   const user = data.user || ['', '', ''];
//   const dms = data.dms;
//   res.render('index', {timeline, following, numFollowed, dmConvoWith, user, dms});
// });





app.get('/', (req, res) => {
  res.send('hello mejliji');
});

app.listen(3000, () => {
  console.log('running on port 3000');
});









// 5
