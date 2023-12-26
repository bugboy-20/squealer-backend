import { SquealSMM , SquealUser, ContentEnum} from '../models/squealModel'
import { getCommentsForASqueal} from '../utils/commentUtils'
import {squealReadSchema} from '../validators/squealValidators'

async function squeal4NormalUser(squealSMM : SquealSMM) : Promise<SquealUser> {
  let ret : SquealUser = {
    id: squealSMM._id.toString(),
    receivers: squealSMM.receivers,
    author: squealSMM.author,
    body: {
      type: squealSMM.body.type,
      content: squealSMM.body.type === ContentEnum.Geo ? JSON.parse(squealSMM.body.content) : squealSMM.body.content
    },
    datetime : squealSMM.datetime,
    impressions : squealSMM.impressions.length,
    positive_reaction : squealSMM.positive_reaction.length,
    negative_reaction : squealSMM.negative_reaction.length,
    category : squealSMM.category,
    comments: []
  }
  console.log(`pre parse \n${ret}`)
  let retZod = squealReadSchema.parse(ret); //TODO sistemare schema zod
  console.log(`post parse \n${ret}`)
  ret.comments = await getCommentsForASqueal(ret.id)
  return ret
}

function stringifyGeoBody(squeal: SquealUser): SquealUser {
  if (squeal.body.type === 'geo') {
    squeal.body.content = JSON.stringify(squeal.body.content);
  }
  return squeal;
}

export { squeal4NormalUser, stringifyGeoBody };
