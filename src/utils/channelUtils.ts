import {Channel, ChannelModel} from "../models/channelModel";
import { UserModel, User } from "../models/userModel";

function addSubInfo(ch : Channel, subs : string[]) : Channel {
  const newCh = {
    name: ch.name,
    description: ch.description,
    type: ch.type,
  }

  if(subs.includes(ch.name))
    newCh.subscribed = true
  else
    newCh.subscribed = false


  return new ChannelModel(newCh)
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
