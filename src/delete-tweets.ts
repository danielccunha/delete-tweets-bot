import 'dotenv/config'
import chalk from 'chalk'
import dayjs from 'dayjs'

import { BATCH_SIZE, MAXIMUM_DATE, USERNAME } from './config'
import { twitter, Tweet } from './twitter'

async function loadTweets(): Promise<Tweet[]> {
  const tweets: Tweet[] = []
  let maximumId: number

  while (true) {
    console.log(`Loading tweets with maximum ID ${chalk.yellow(maximumId)}`)
    const response = await twitter.get('statuses/user_timeline', {
      max_id: maximumId,
      screen_name: USERNAME,
      count: 20,
      include_rts: 1
    })

    // Ignore first value if tweets is not empty because it returns the tweet with maximum ID
    if (tweets.length) {
      tweets.shift()
    }

    tweets.push(...(response as any))
    const lastId = response.length ? response[response.length - 1].id : undefined
    if (!lastId || lastId === maximumId || tweets.length >= BATCH_SIZE) {
      break
    }

    maximumId = lastId
  }

  return tweets
}

async function deleteTweet(tweet: Tweet) {
  await twitter.post(`statuses/destroy`, { id: tweet.id_str })
}

async function execute() {
  try {
    // Load tweets from configured username
    console.log(`Loading tweets from username ${chalk.blue(USERNAME)}`)
    let tweets = await loadTweets()

    // Filter tweets by maximum date
    const formattedDate = dayjs(MAXIMUM_DATE).format('MM/DD/YYYY')
    console.log(`Filtering tweets by maximum date ${chalk.blue(formattedDate)}`)
    tweets = tweets.filter(tweet => dayjs(tweet.created_at).isBefore(MAXIMUM_DATE))
    console.log(`Found ${chalk.blue(tweets.length)} tweets to delete`)

    // Delete each of the found tweets
    console.log(`Deleting tweets`)
    const promises = tweets.map(deleteTweet)
    await Promise.all(promises)
  } catch (error) {
    console.error(error)
  }
}

execute()
