import { UserModel } from '../models/userModel'

class UserQuery {
	readonly query = UserModel.find()

	async exec() {
		return await this.query.exec()
	}
	
	/*username(username : string) : UserQuery { NON  CONVIENE PERCHE tsc fa confusione
		this.query.findOne({ username })
		return this
	}*/
}

export { UserQuery }
