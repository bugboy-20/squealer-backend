import { User, UserModel } from "../models/userModel"
import { userReadSchema, userRead_t, userWriteSchema, userWrite_t } from "../validators/userValidators"



function userBackToFront(user: User ) : userRead_t {
  let userFront = {
    username: user.username,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    type: user.type,
    SMM: user.SMM,
    verified: user.verified,
    quota: {
      actualD: user.quote?.day,
      actualW: user.quote?.week,
      actualM: user.quote?.month,
      maxD: (user.quote_modifier * (+(process.env.CHAR_PER_DAY as string))), // TODO è evitabile questo casting?
      maxW: (user.quote_modifier * (+(process.env.CHAR_PER_WEEK as string) )),
      maxM: (user.quote_modifier * (+(process.env.CHAR_PER_MONTH as string) ))
  }

    

  }
  return userReadSchema.parse(userFront)
}

function userFrontToBack(userTmp: userWrite_t) : User {
  const user = userWriteSchema.parse(userTmp)
  // TODO aggiungere il parsing?
  const userBack = {
    username: user.username,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    password: user.password,
    type: user.type,
    SMM: null,
    verified: false,
    quote_modifier: 1,
    quote: {
      day: +(process.env.CHAR_PER_DAY as string),
      week: +(process.env.CHAR_PER_WEEK as string),
      month: +(process.env.CHAR_PER_MONTH as string)
    }
  }

  return new UserModel(userBack)

}


export {userBackToFront, userFrontToBack}

