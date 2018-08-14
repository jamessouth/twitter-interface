const express = require('express');
const bodyParser = require('body-parser');
const Tweet = require('../config');

const app = express();
const urleParser = bodyParser.urlencoded({ extended: false });
const {
  processUser, processTimeline, processFollowing, preProcessDMs,
} = require('./utils');

app.use(express.static('css'));
app.use(express.static('images'));
app.set('view engine', 'pug');

function hitEndpoint(method, endpoint, config, cb) {
  console.log(`requesting: ${method, endpoint}`, Date.now());
  if (method === 'get') {
    cb(Tweet.get(endpoint, config));
  } else {
    cb(Tweet.post(endpoint, config));
  }

}

function initiateHitEndpoint(method, endpoint, config) {
  return new Promise((resolve) => {
    hitEndpoint(method, endpoint, config, resolve);
  });
}

// the default request for an icon sometimes calls the
// middleware again and double-requests the twitter data,
// so this shuts that off so there's only one request
app.use((req, res, next) => {
  if (req.originalUrl && req.originalUrl.includes('favicon')) {
    return res.sendStatus(204);
  }
  return next();
});

app.use(async (req, res, next) => {
  const userID = Tweet.config.access_token.split('-')[0];

  const APICallArray = [
    initiateHitEndpoint('get', 'users/show', { user_id: userID }),
    initiateHitEndpoint('get', 'statuses/user_timeline', { count: 5 }),
    initiateHitEndpoint('get', 'friends/list', { count: 5 }),
    initiateHitEndpoint('get', 'direct_messages/events/list', { count: 6 }),
  ];

  function firstDataFn(results) {
    app.locals.user = processUser(results[0]);
    app.locals.timeline = processTimeline(results[1]);
    app.locals.following = processFollowing(results[2]);
    app.locals.numFollowed = app.locals.following.length;
    app.locals.dms = preProcessDMs(results[3]);
    const { to, from } = app.locals.dms[0];
    return Promise.all([
      initiateHitEndpoint('get', 'users/show', { user_id: from }),
      initiateHitEndpoint('get', 'users/show', { user_id: to }),
    ]);
  }

  function secondDataFn(results) {
    const pkg = results.map((user) => {
      const temp = {
        id: user.data.id_str,
        name: user.data.name,
        scrName: user.data.screen_name,
        img: user.data.profile_image_url_https,
      };
      const classToApply = userID === temp.id ? 'app--message--me' : 'app--message';
      return { ...temp, classToApply };
    });
    app.locals.dmConvoWith = userID !== pkg[0].id ? pkg[0].scrName : pkg[1].scrName;
    const [firstParty, secondParty] = pkg;
    app.locals.dms = app.locals.dms.map((dm) => {
      if (dm.to === firstParty.id) {
        return { ...dm, sender: { ...secondParty }, recipient: { ...firstParty } };
      }
      return { ...dm, sender: { ...firstParty }, recipient: { ...secondParty } };
    });
  }

  initiateHitEndpoint('get', 'application/rate_limit_status').then((r) => {
    console.log(r.data.resources.users['/users/show/:id'], r.data.resources.friends['/friends/list'], r.data.resources.statuses['/statuses/user_timeline'], r.data.resources.direct_messages['/direct_messages/events/list'], r.data.resources.application['/application/rate_limit_status']);
  });
  try {
    const resultsOne = await Promise.all(APICallArray);
    const resultsTwo = await firstDataFn(resultsOne);
    secondDataFn(resultsTwo);
    next();
  } catch (err) {
    next(err);
  }
});

app.post('/', urleParser, async (req, res, next) => {
  await initiateHitEndpoint('post', 'statuses/update', { status: req.body.tweet });

  // initiateHitEndpoint('get', 'statuses/user_timeline', { count: 5 }),

  
    // .then(r => {
    //   app.locals.timeline = r.data.map(x => [x.text, `@${x.user.screen_name}`, x.user.name, x.user.profile_image_url_https, x.retweet_count, x.favorite_count, twitterTime(x.created_at)])
  res.redirect('/');
    // }, err => next(err));
});

// no apparent need to pass in locals, they seem to be available by default,
// but I can't find this documented anywhere so I'm passing them into the render method
app.get('/', (req, res) => {
  res.render('index', app.locals);
});

app.use((req, res, next) => {
  const err = new Error('Page Not Found...');
  next(err);
});
// eslint-disable-next-line
app.use((err, req, res, next) => {
  const user = app.locals.user || ['', '', ''];
  res.render('error', { message: err.message, user });
});

app.listen(3000);
