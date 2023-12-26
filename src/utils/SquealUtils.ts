import { SquealSMM , Squeal} from '../models/squealModel'
function squeal4NormalUser(squealSMM : SquealSMM) : Squeal {
  return squealSMM.toObject();
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

export { squeal4NormalUser, stringifyGeoBody, mutateReactions };
