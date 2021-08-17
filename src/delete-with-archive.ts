import 'dotenv/config'
import chalk from 'chalk'
import dayjs from 'dayjs'
import fs from 'fs/promises'
import path from 'path'

import { MAXIMUM_DATE } from './config'
import { removeTweet, Tweet } from './twitter'

async function execute() {
  try {
    console.log('Loading tweets from archive')
    const archivePath = path.resolve(__dirname, '..', 'data', 'tweets.json')
    const archiveContent = await fs.readFile(archivePath)
    let tweets: Tweet[] = JSON.parse(archiveContent.toString()).map(({ tweet }) => tweet)

    const formattedDate = dayjs(MAXIMUM_DATE).format('MM/DD/YYYY')
    console.log(`Filtering tweets by maximum date ${chalk.blue(formattedDate)}`)
    tweets = tweets.filter(tweet => dayjs(tweet.created_at).isBefore(MAXIMUM_DATE))
    console.log(`Found ${chalk.blue(tweets.length)} tweets to delete`)

    const promises = tweets.map(tweet => removeTweet('tweet', tweet))
    await Promise.all(promises)
  } catch (error) {
    console.error(error)
  }
}

execute()
