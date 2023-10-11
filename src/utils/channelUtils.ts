import {Channel} from "../models/channelModel";
import { UserModel, User } from "../models/userModel";

function addSubInfo(ch : Channel, subs : string[]) : Channel {

  subs.forEach(s => {
    if ( s == ch.name ) {
      ch.subscribed = true
      return
    }
  })

  if(!ch.subscribed)
    ch.subscribed = false

  return ch
}

async function addSubcribedInfo(ch : Channel | Channel[], username : string) : Promise<Channel | Channel[]> {
  

  let subs : string[] = await UserModel.findOne({username}).exec().then(u => u?.subscriptions).then(s => {
    if ( !s || s == undefined)
      return Promise.reject('user null')
    else {
      return (s as string[])
    }})

  console.log(subs)

  if(Array.isArray(ch)) {
    return ch.map((channel : Channel) => addSubInfo(channel, subs))
  }
  else
    return addSubInfo(ch, subs)

}



export {addSubcribedInfo}
