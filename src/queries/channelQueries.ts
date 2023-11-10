import { ChannelModel } from '../models/channelModel'
import { User, UserModel } from '../models/userModel'
import {UserQuery} from './userQueries'

class ChannelQuery {

	readonly query = ChannelModel.find()

	async exec() {
		return await this.query.exec()
	}


	async subscribed(auth : any) : Promise<ChannelQuery> {
		
		if (!auth.isAuth) {
			new Error("you must be authed!")
		}

		let subscribedChannels = 
			( await UserModel.findOne({ username : auth.username }) as User).subscriptions

      	this.query.find({ name : {$in: subscribedChannels }})
	  	return this
	}

	official() : ChannelQuery {
        this.query.find({
          name: {
            $regex: /^§[A-Z]+.*$/
          }
        })
		return this
	}

	unofficial() : ChannelQuery {
        this.query.find({
          name: {
            $regex: /^§[a-z]+.*$/
          }
        })
		return this
	}

	async privateOnly(auth : any) : Promise<ChannelQuery> {
		(await this.subscribed(auth)).query.find({type: "private"})
		return this
	}
}

export { ChannelQuery }
