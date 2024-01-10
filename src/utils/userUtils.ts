import { SquealModel } from "../models/squealModel"
import { User, UserModel } from "../models/userModel"
import { userReadSchema, userRead_t, userWriteSchema, userWrite_t } from "../validators/userValidators"
import {userPopularity} from "./popularityUtils";


function maxQuotas(quotaModifier: number) {
  return {
      maxD: quotaModifier * +(process.env.CHAR_PER_DAY as string),
      maxW: quotaModifier * +(process.env.CHAR_PER_WEEK as string),
      maxM: quotaModifier * +(process.env.CHAR_PER_MONTH as string),
  }
}


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
      ...maxQuotas(user.quote_modifier)
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

const getPopularity = userPopularity

export {userBackToFront, userFrontToBack, getPopularity, maxQuotas}

