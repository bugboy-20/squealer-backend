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
  '0 0 6 * * *',
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

const addToTrending: Schedule = [
  '0 0 7 * * *',
  async () => {
    const trendingSqueals = await SquealModel.find({
      receivers: '§TRENDING',
    }).exec();

    // get 20 squeals with the most positive reactions
    const newTrendingSqueals = await SquealModel.find({})
      .sort({ positive_reactions: -1 })
      .limit(20)
      .exec();

    // remove the old trending squeals
    for (const squeal of trendingSqueals) {
      const index = squeal.receivers.indexOf('§TRENDING');
      if (index > -1) {
        squeal.receivers.splice(index, 1);
      }
      squeal.save();
    }

    // add the new trending squeals
    for (const squeal of newTrendingSqueals) {
      squeal.receivers.push('§TRENDING');
      squeal.save();
    }
  },
];


export const automaticChannelSchedule = [addToControversial, addToTrending];
