/*
 # ┌────────────── second (optional)
 # │ ┌──────────── minute
 # │ │ ┌────────── hour
 # │ │ │ ┌──────── day of month
 # │ │ │ │ ┌────── month
 # │ │ │ │ │ ┌──── day of week
 # │ │ │ │ │ │
 # │ │ │ │ │ │
 # * * * * * *
 */

import { UserModel } from '../models/userModel'
import { userPopularity } from '../utils/popularityUtils'

const resetDayUsage   : [string, () => void] = ['0 0 0 * * *', async () => resetUsage('day')]

const resetWeekUsage  : [string, () => void] = ['0 0 0 * * 1', async () => resetUsage('week')]

const resetMonthUsage : [string, () => void] = ['0 0 0 1 * *', async () => resetUsage('month')]

const resetUsage = async (span : 'day' | 'month' | 'week') => {
  try {
    let q = JSON.parse(`{quote.${span} : 0}`)
    await UserModel.updateMany({}, {$set: q, })
    console.log('consumo mensile azzerato')
  } catch(e) {
    console.error('Errore nel reset mensile:')
    console.error(e)
  }
}

const modifyMaxQuota : () => void = async () => {
  let users = await UserModel.find({}).exec()

  let update = users.map(async u => {
    UserModel.updateOne({username: u.username}, {quote_modifier: await userPopularity(u.username).then(q => q/100) })
  })

  await Promise.all(update)

}

export const userMaxQuotaUpdater : [string, () => void][] = [['0 0 0 * * *', async () => modifyMaxQuota]]
export const userQuotaReset = [resetDayUsage,resetWeekUsage,resetMonthUsage]

