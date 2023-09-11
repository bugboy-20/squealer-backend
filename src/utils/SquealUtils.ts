import { SquealSMM , Squeal} from '../models/squealModel'
function squeal4NormalUser(squealSMM : SquealSMM) : Squeal {
  return {
    receivers: squealSMM.receivers,
    author: squealSMM.author,
    body: squealSMM.body,
    datetime: squealSMM.datetime,
    impressions: squealSMM.impressions.length,
    positive_reaction: squealSMM.positive_reaction.length,
    negative_reaction: squealSMM.negative_reaction.length,
    category: squealSMM.category,
  }
}



export { squeal4NormalUser }
