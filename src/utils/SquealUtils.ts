import { ChannelModel } from '../models/channelModel';
import { Squeal, SquealSMM } from '../models/squealModel';
import { UserModel } from '../models/userModel';

async function squeal4NormalUser(
  squealSMM: SquealSMM,
  filter?: {
    isAuth: boolean;
    authUsername: string;
  }
): Promise<Squeal> {
  const newReceivers = filter
    ? await filterReceivers(
        filter.isAuth,
        filter.authUsername,
        squealSMM.author,
        squealSMM.receivers,
        squealSMM.category
      )
    : squealSMM.receivers;

  const parsedSqueal = squealSMM.toObject();
  parsedSqueal.receivers = newReceivers;
  return parsedSqueal;
}

function stringifyGeoBody(squeal: Squeal): Squeal {
  if (squeal.body.type === 'geo') {
    squeal.body.content = JSON.stringify(squeal.body.content);
  }
  return squeal;
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
  receivers: string[],
  category: string[]
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

  const officialRegex = /^§[A-Z]+$/;

  if (!isAuth) {
    // canale è ufficiale se inizia con § ed è tutto maiuscolo
    return receivers.filter((r) => officialRegex.test(r));
  }

  if (author === authUsername) return receivers;

  // create a map of channels and their type

  const channelsMap = (await Promise.all(
    receivers
      .filter((r) => r.startsWith('§'))
      .map((r) => ChannelModel.findOne({ name: r }))
  )).reduce((acc: Record<string, string>, c) => {
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
      officialRegex.test(r) ||
      channelsMap[r] === 'public' ||
      (userSubscriptions.includes(r) && channelsMap[r] === 'private') ||
      r.startsWith('#')
  );
}

export { squeal4NormalUser, stringifyGeoBody, mutateReactions };
