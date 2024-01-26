import {Squeal, ContentEnum} from '../models/squealModel'
import {UserModel} from '../models/userModel';
import {getCommentsForASqueal} from '../utils/commentUtils'
import {looseSquealRead_t, squealReadSchema, squealWrite_t } from '../validators/squealValidators';
import {userRead_t} from '../validators/userValidators';
import {userBackToFront} from './userUtils';
import {ChannelModel } from '../models/channelModel';

import { commentWrite_t } from '../validators/commentValidators';
import {
  isSquealControversial,
  isSquealPopular,
  isSquealUnpopular,
} from './popularityUtils';
import { officialChannelRegex } from '../validators/utils/regex';

const isPublic = async (receivers: string[]) => {
  const channelsName = receivers.filter((r) => r.startsWith('§'));
  const channels = await Promise.all(
    channelsName.map((c) => ChannelModel.findOne({ name: c }))
  );
  return channels.some((c) => c?.type === 'public');
}

async function squeal4NormalUser(
  squeal: Squeal,
  filter?: {
    isAuth: boolean;
    authUsername: string;
  }
): Promise<looseSquealRead_t | null> {
  const newReceivers = filter
    ? await filterReceivers(
        filter.isAuth,
        filter.authUsername,
        squeal.author,
        squeal.receivers
      )
    : squeal.receivers;

  const visibility = await isPublic(newReceivers)
  const newCategory = visibility ? ['public'] : ['private'];
  if (await isSquealControversial(squeal.id))
    newCategory.push('controversial');
  else if (await isSquealPopular(squeal.id)) newCategory.push('popular');
  else if (await isSquealUnpopular(squeal.id)) newCategory.push('unpopular');

  const ret = {
    id: squeal._id.toString(),
    receivers: newReceivers,
    author: squeal.author,
    body: {
      type: squeal.body.type,
      content:
        squeal.body.type === ContentEnum.Geo
          ? JSON.parse(squeal.body.content)
          : squeal.body.content,
    },

    datetime: squeal.datetime,
    impressions: squeal.impressions.length,
    positive_reaction: squeal.positive_reaction.length,
    negative_reaction: squeal.negative_reaction.length,
    reacted: !!(filter?.isAuth && (squeal.positive_reaction.includes(filter.authUsername) || squeal.negative_reaction.includes(filter.authUsername))),
    category: newCategory,
    comments: await getCommentsForASqueal(squeal._id.toString()),
  };
  const result = squealReadSchema.safeParse(ret);
  if (!result.success) { console.log(result.error, `Lo squeal problematico è: ${ret.id}`); return null };
  return result.data;
}

function stringifyGeoBody(
  input: Pick<squealWrite_t, 'body'> | Pick<commentWrite_t, 'body'>
): unknown {
  if (input.body.type === 'geo') {
    return {
      ...input,
      body: {
        ...input.body,
        content: JSON.stringify(input.body.content),
      },
    };
  }
  return input;
}

function mutateReactions(
  reactions: string[],
  targetLength: number,
  modUsername: string
): string[] {
  // reactions is an array of usernames, so i need to check if i have to increment or decrement
  // increment: add the fake usernames to the array, with the moderator username -> `${mod_username}_${timestamp}_${i}`
  // decrement: remove the fake usernames from the array, if they don't exist, delete random usernames
  if (modUsername.startsWith('@')) modUsername = modUsername.slice(1);

  if (reactions.length < targetLength) {
    for (let i = reactions.length; i < targetLength; i++) {
      reactions.push(`${modUsername}_fake_${Date.now()}_${i}`);
    }
  } else if (reactions.length > targetLength) {
    const excess = reactions.length - targetLength;
    let fakeCount = 0;

    // Remove fake usernames up to the excess amount
    reactions = reactions.filter((username) => {
      if (
        (!username.startsWith('@') || /^\w+_fake_\d+_\d+$/.test(username)) &&
        fakeCount < excess
      ) {
        fakeCount++;
        return false;
      }
      return true;
    });

    // If still too many, remove excess
    if (reactions.length > targetLength) {
      reactions.splice(targetLength, reactions.length - targetLength);
    }
  }
  return reactions;
}

async function filterReceivers(
  isAuth: boolean,
  authUsername: string,
  author: string,
  receivers: string[]
) {
  /*
  se l'utente non è autenticato, può vedere solo i messaggi ufficiali
  se l'utente è autenticato, può vedere i messaggi ufficiali e "destinati" a lui
    - suo username
    - canali pubblici
    - canali privati a cui appartiene
    - keyword (iniziano con #)
  se l'utente è autore del messaggio, può vedere tutti i destinatari
*/


  if (!isAuth) {
    // canale è ufficiale se inizia con § ed è tutto maiuscolo
    return receivers.filter((r) => officialChannelRegex.test(r));
  }

  if (author === authUsername) return receivers;

  // create a map of channels and their type

  const channelsMap = (
    await Promise.all(
      receivers
        .filter((r) => r.startsWith('§'))
        .map((r) => ChannelModel.findOne({ name: r }))
    )
  ).reduce((acc: Record<string, string>, c) => {
    if (c) {
      acc[c.name] = c.type;
    }
    return acc;
  }, {});

  const userSubscriptions =
    (
      await UserModel.findOne(
        { username: authUsername },
        'subscriptions'
      ).exec()
    )?.subscriptions ?? [];

  return receivers.filter(
    (r) =>
      r === authUsername ||
      officialChannelRegex.test(r) ||
      channelsMap[r] === 'public' ||
      (userSubscriptions.includes(r) && channelsMap[r] === 'private') ||
      r.startsWith('#')
  );
}

async function consumeQuota(body : Squeal["body"], isPublic : boolean, author : Squeal["author"]) {
  let quotaUsed = 0;
  if (!isPublic)
    return

  if (body.type == 'text')
    quotaUsed = body.content.length
  else
    quotaUsed = 125

  let user : userRead_t = await UserModel.findOne({username: author}).exec().then(u => {if(!u) throw Error('?? consumeQuota'); else return userBackToFront(u)}) //, { $inc: { "quote.day" : quotaUsed, "quote.month" : quotaUsed, "quote.week" : quotaUsed }}) 
  if (
    user.quota.actualD + quotaUsed > user.quota.maxD ||
    user.quota.actualW + quotaUsed > user.quota.maxW ||
    user.quota.actualM + quotaUsed > user.quota.maxM
  ) throw Error('quota exceeded')

  await UserModel.updateOne({username: author}, { $inc: { "quote.day" : quotaUsed, "quote.month" : quotaUsed, "quote.week" : quotaUsed }}) 

}

export { squeal4NormalUser, stringifyGeoBody, mutateReactions, consumeQuota, isPublic };
