# JS-Project-7

A node/express Twitter interface with moment.js and pug.  Hits Twitter API endpoints to get last 5 tweets, last 5 follows and last 5 DMs, and allows the posting of new Tweets.  Styles were provided by Treehouse and haven't been modified to be properly responsive so this may not look good on mobile right now.

Download the ZIP, run ```npm install``` then ```npm start``` and the server will be running on your localhost port 3000.

To run you need to create an app on Twitter at https://apps.twitter.com/.  This will create the tokens and secrets you need to access your account through this project.  Then use them in a file called config.js that is formatted like this:

```
const Twit = require('twit');

const T = new Twit({
  consumer_key: '',
  consumer_secret: '',
  access_token: '',
  access_token_secret: '',
  timeout_ms: 60000
});

module.exports = T;

```

That should do it!  Presently you CAN tweet through this app but the other functions (like, retweet, reply, (un)follow, DM, sign out, etc) aren't set up. 

