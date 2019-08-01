# twitter-interface

A node/express Twitter interface with moment.js and pug and eslint so it all looks real nice.  Refactored school project that was originally completed in April 2018 and is now, IMO, much cleaner and more maintainable.  Hits Twitter API endpoints to get last 25 tweets, last 25 follows and last 25 DMs, unless you enter different numbers in the command line when you start the server, and allows the posting of new Tweets and the unfollowing of followed accounts.  Styles were provided by Treehouse and have not been modified by me.

Twitter cursors results for pagination and this sometimes results in fewer DMs being returned than were requested.  

Download the ZIP, run ```npm install``` then ```npm start``` and the server will be running on your localhost port 3000.

Using ```npm start``` will call the API with default values of 25 for all counts, but if you use ```node js/app.js``` to start the server, you can add command line arguments afterwards to get different amounts, subject to Twitter's maximums.  So for instance ```node js/app.js 20 13 12``` will request 20 tweets, 13 follows and 12 DMs.

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

That should do it!  Presently you CAN tweet and unfollow through this app but the other functions (like, retweet, reply, DM, sign out, etc) aren't set up.
