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

const resetDayUsage : [string, () => void] = ['0 0 0 * * *', async () => {
  try {
    await UserModel.updateMany({}, {$set: {'quote.day' : 0}, })
    console.log('consumo giornaliero azzerato')
  } catch(e) {
    console.error('Errore nel reset giornaliero:')
    console.error(e)
  }
}]

const resetWeekUsage : [string, () => void] = ['0 0 0 * * 1', async () => {
  try {
    await UserModel.updateMany({}, {$set: {'quote.week' : 0}, })
    console.log('consumo settimanale azzerato')
  } catch(e) {
    console.error('Errore nel reset settimanale:')
    console.error(e)
  }
}]

const resetMonthUsage : [string, () => void] = ['0 0 0 1 * *', async () => {
  try {
    await UserModel.updateMany({}, {$set: {'quote.month' : 0}, })
    console.log('consumo mensile azzerato')
  } catch(e) {
    console.error('Errore nel reset mensile:')
    console.error(e)
  }
}]





export const userQuotaReset = [resetDayUsage,resetWeekUsage,resetMonthUsage]
