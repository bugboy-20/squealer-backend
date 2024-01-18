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

import { SquealModel } from '../models/squealModel';
import { isSquealControversial } from '../utils/popularityUtils';
import { Schedule } from './types';

const addToControversial: Schedule = [
  '0 0 7 * * *',
  async () => {
    // get every squeal in db aside from the ones already in controversial
    const everySqueal = await SquealModel.find({
      receivers: { $nin: '§CONTROVERSIAL' },
    }).exec();

    for (const squeal of everySqueal) {
      if (await isSquealControversial(squeal.id)) {
        squeal.receivers.push('§CONTROVERSIAL');
        squeal.save();
      }
    }
  },
];

export const automaticChannelSchedule = [addToControversial];
