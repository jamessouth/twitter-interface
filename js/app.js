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

function hitEndpoint(method, endpoint, config, resolve, reject) {
  // eslint-disable-next-line
  console.log(`requesting: ${method, endpoint}`, Date.now());

  try {
    if (method === 'get') {
      resolve(Tweet.get(endpoint, config));
    } else {
      resolve(Tweet.post(endpoint, config));
    }
  } catch (err) {
    reject(err);
  }
}

function initiateHitEndpoint(method, endpoint, config) {
  return new Promise((resolve, reject) => {
    hitEndpoint(method, endpoint, config, resolve, reject);
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
  if (req.method !== 'GET') return next();

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
    app.locals.numFollowed = app.locals.following ? app.locals.following.length : 0;
    app.locals.dms = preProcessDMs(results[3]);
    if (!app.locals.dms || app.locals.dms.length === 0) {
      return null;
    }
    const { to, from } = app.locals.dms[0];
    return Promise.all([
      initiateHitEndpoint('get', 'users/show', { user_id: from }),
      initiateHitEndpoint('get', 'users/show', { user_id: to }),
    ]);
  }

  function secondDataFn(results) {
    if (!results) {
      return null;
    }
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

  try {
    // throw new Error('noooooooooo!');
    initiateHitEndpoint('get', 'application/rate_limit_status').then((r) => {
      console.log(r.data.resources.users['/users/show/:id'], r.data.resources.friends['/friends/list'], r.data.resources.statuses['/statuses/user_timeline'], r.data.resources.direct_messages['/direct_messages/events/list'], r.data.resources.application['/application/rate_limit_status']);
    }).catch(() => {});

    const resultsOne = await Promise.all(APICallArray);
    const resultsTwo = await firstDataFn(resultsOne);
    secondDataFn(resultsTwo);
    next();
  } catch (err) {
    next(err);
  }
});
// eslint-disable-next-line
app.post('/', urleParser, async (req, res, next) => {
  await initiateHitEndpoint('post', 'statuses/update', { status: req.body.tweet });
  res.redirect('/');
});

// no apparent need to pass in locals, they seem to be available by default,
// but I can't find this documented anywhere so I'm passing them into the render method
app.get('/', (req, res) => {
  res.render('index', app.locals);
});

// eslint-disable-next-line
app.use((err, req, res, next) => {
  console.log(err);
  res.render('error', { message: err.message });
});

app.listen(3000);
