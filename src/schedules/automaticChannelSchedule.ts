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
      if (await isSquealControversial(squeal)) {
        squeal.receivers.push('§CONTROVERSIAL');
        squeal.save({ disableMiddleware: true });
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

    // remove the old trending squeals
    for (const squeal of trendingSqueals) {
      const index = squeal.receivers.indexOf('§TRENDING');
      if (index > -1) {
        squeal.receivers.splice(index, 1);
      }
      squeal.save({ disableMiddleware: true });
    }

    // get 20 squeals with the most positive reactions
    const newTrendingSqueals = await SquealModel.aggregate([
      {
        $addFields: {
          positive_reaction_count: { $size: '$positive_reaction' },
        },
      },
      { $sort: { positive_reaction_count: -1 } },
      { $limit: 20 },
    ]);

    // add the new trending squeals
    for (const squeal of newTrendingSqueals) {
      await SquealModel.updateOne(
        { _id: squeal._id },
        { $push: { receivers: '§TRENDING' } }
      );
    }
  },
];


export const automaticChannelSchedule = [addToControversial, addToTrending];
