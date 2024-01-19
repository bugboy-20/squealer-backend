import {Channel, ChannelModel} from "../models/channelModel";
import { UserModel } from "../models/userModel";
import { channel_t } from "../validators/channelValidator";

function addSubInfo(ch : Channel, subs : string[]) : Channel {
  const newCh : any = {
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

  if(Array.isArray(ch)) {
    return ch.map((channel : Channel) => addSubInfo(channel, subs))
  }
  else
    return addSubInfo(ch, subs)

}

async function findVisibleChannels(isAuth: boolean, username: string) {
  const officialRegex = /^§[A-Z]+.*$/;

  const subscribedChannels = ( await UserModel.findOne({ username }))?.subscriptions ?? []
  const publicChannels = await ChannelModel.find({ type : "public" }).then( channels => channels.map( channel => channel.name ) )
  const officialChannels = publicChannels.filter( channel =>  officialRegex.test(channel) )
  const visibleChannels = Array.from(new Set<string>(isAuth ? subscribedChannels.concat(publicChannels) : officialChannels));
  return {visibleChannels, subscribedChannels}
}

function userToChannel(username : string) : channel_t {
  return {
    // it's safe to cast here because we checked that username starts with @
    name: username.startsWith('@') ? username as `@${string}`: `@${username}`,
    description: `Canale diretto con ${username}`,
    type: "direct",
  }
}


export {addSubcribedInfo, findVisibleChannels, userToChannel}
