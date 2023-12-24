import { SquealModel } from "../models/squealModel"
import { User, UserModel } from "../models/userModel"
import { userReadSchema, userRead_t, userWriteSchema, userWrite_t } from "../validators/userValidators"



function userBackToFront(user: User ) : userRead_t {
  let userFront = {
    username: user.username,
    propic: user.propic,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    type: user.type,
    SMM: user.SMM,
    verified: user.verified,
    quota: {
      actualD: user.quote?.day ?? 0,
      actualW: user.quote?.week ?? 0,
      actualM: user.quote?.month ?? 0,
      maxD: user.quote_modifier * +(process.env.CHAR_PER_DAY as string), // TODO è evitabile questo casting?
      maxW: user.quote_modifier * +(process.env.CHAR_PER_WEEK as string),
      maxM: user.quote_modifier * +(process.env.CHAR_PER_MONTH as string),
    },
    subscriptions: user.subscriptions,
    blocked: user.blocked,
  };

  return userReadSchema.parse(userFront);
}

function userFrontToBack(userTmp: userWrite_t) : User {
  const user = userWriteSchema.parse(userTmp)
  const userBack = {
    username: user.username,
    propic: user.propic,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    password: user.password,
    type: user.type,
    SMM: null,
    verified: false,
    quote_modifier: 1,
    quote: {
      day: 0,
      week: 0,
      month: 0
    }
  }

  return new UserModel(userBack)

}

const getPopularity = async (username: string) => {
  // si calcola prendendo il numero di post popolari (Reazioni positive > Critical Mass) che l'utente ha fatto
  const squeals = await SquealModel.find({author: username}).exec();
  let popularity = 0;
  for (const squeal of squeals) {
    //TODO: abstract the critical mass away from this function
    const CM = squeal.impressions.length * 0.25
    if (squeal.positive_reaction.length > CM) {
      popularity++;
    }
  }
  return popularity;
}

export {userBackToFront, userFrontToBack, getPopularity}

