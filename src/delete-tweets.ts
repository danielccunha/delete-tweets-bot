import chalk from 'chalk'
import dayjs from 'dayjs'

import 'dotenv/config'
import { MAXIMUM_DATE, USERNAME } from './config'
import { loadTweets, removeTweet } from './twitter'

async function execute() {
  try {
    const resource = 'like'
    console.log(`Loading tweets to delete from username ${USERNAME}`)
    let tweets = await loadTweets(resource)

    const formattedDate = dayjs(MAXIMUM_DATE).format('MM/DD/YYYY')
    console.log(`Filtering tweets by maximum date ${chalk.blue(formattedDate)}`)
    tweets = tweets.filter(tweet => dayjs(tweet.created_at).isBefore(MAXIMUM_DATE))
    console.log(`Found ${chalk.blue(tweets.length)} tweets to delete`)

    const promises = tweets.map(tweet => removeTweet(resource, tweet))
    await Promise.all(promises)
  } catch (error) {
    console.error(error)
  }
}

execute()
