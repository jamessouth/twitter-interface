const moment = require('moment');

moment.updateLocale('en', { relativeTime: { d: '1 day', h: '1 hour', m: '1 minute' } });

Object.assign(exports, {
  processUser(dataPkg) {
    return {
      scrName: dataPkg.data.screen_name,
      img: dataPkg.data.profile_image_url_https,
      banner: dataPkg.data.profile_banner_url,
    };
  },

  processTimeline(dataPkg) {
    function abbrev(match, p1, p2) {
      return `${p1}${p2[0]}`;
    }

    function twitterTime(timeString) {
      const time = moment(timeString, 'ddd MMM DD HH:mm:ss ZZ YYYY');
      if (time.diff(moment()) < -518400000) { // 6 days
        return time.format('DD MMM');
      }
      return time.fromNow(true).replace(/(\d{1,2}) (\w+)/i, abbrev);
    }

    return dataPkg.data.map(twt => ({
      text: twt.text,
      scrName: `@${twt.user.screen_name}`,
      userName: twt.user.name,
      img: twt.user.profile_image_url_https,
      retweets: twt.retweet_count,
      likes: twt.favorite_count,
      time: twitterTime(twt.created_at),
    }));
  },

  processFollowing(dataPkg) {
    return dataPkg.data.users.map(fr => ({
      name: fr.name,
      scrName: `@${fr.screen_name}`,
      img: fr.profile_image_url_https,
    }));
  },

  preProcessDMs(dataPkg) {
    return dataPkg.data.events.reverse().map(msg => ({
      created: moment(msg.created_timestamp, 'x').fromNow(),
      to: msg.message_create.target.recipient_id,
      from: msg.message_create.sender_id,
      text: msg.message_create.message_data.text,
    }));
  },
});
