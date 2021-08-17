import chalk from 'chalk'
import Twitter from 'twitter'

import { USERNAME, BATCH_SIZE } from './config'

export const twitter = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

export interface Tweet {
  id: number
  id_str: string
  text: string
  user: {
    id: number
    screen_name: string
  }
  created_at: string
}

export type Resource = 'tweet' | 'like'

export async function loadTweets(resource: Resource): Promise<Tweet[]> {
  const endpoint = resource === 'tweet' ? 'statuses/user_timeline' : 'favorites/list'
  const tweets: Tweet[] = []
  let maximumId: number

  while (true) {
    console.log(`Loading tweets with maximum ID ${chalk.yellow(maximumId)}`)
    const response = await twitter.get(endpoint, {
      max_id: maximumId,
      screen_name: USERNAME,
      count: 200,
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

export async function removeTweet(resource: Resource, tweet: Tweet) {
  const endpoint = resource === 'tweet' ? 'statuses/destroy' : 'favorites/destroy'
  await twitter.post(endpoint, { id: tweet.id_str })
}
