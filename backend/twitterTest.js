require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

async function sendTestTweet() {
  try {
    const tweet = await twitterClient.v2.tweet('🚀 This is a test Tweet from MurphDunks! #MurphDunks');
    console.log('✅ Test Tweet posted!', tweet);
  } catch (error) {
    console.error('❌ Error posting test Tweet:', error);
  }
}

sendTestTweet();