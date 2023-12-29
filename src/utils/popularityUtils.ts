import { SquealModel, SquealUser } from '../models/squealModel'
import {squeal4NormalUser} from './SquealUtils';
/*
function isUserPopular(username : string) : boolean {

  return false
}*/

async function isSquealPopular(squeal : string | SquealUser) : Promise<boolean> {
  if ( typeof squeal === 'string')
    return isSquealPopularByID(squeal)
  else
    return isSquealPopularByObject(squeal)
}

async function isSquealPopularByID(id :string) : Promise<boolean> {
  let squeal = await SquealModel.findOne({id: id}).exec()
  
  if(!squeal)
    return false

  return isSquealPopularByObject(await squeal4NormalUser(squeal))

}

async function isSquealPopularByObject(squeal : SquealUser) : Promise<boolean> {
    //TODO: abstract the critical mass away from this function
    const CM = squeal.impressions * 0.25
    return (squeal.positive_reaction > CM) 
}

async function isSquealUnpopular(squeal : string | SquealUser) : Promise<boolean> {
  if ( typeof squeal === 'string')
    return isSquealUnpopularByID(squeal)
  else
    return isSquealUnpopularByObject(squeal)
}

async function isSquealUnpopularByID(id :string) : Promise<boolean> {
  let squeal = await SquealModel.findOne({id: id}).exec()
  
  if(!squeal)
    return false

  return isSquealPopularByObject(await squeal4NormalUser(squeal))

}

async function isSquealUnpopularByObject(squeal : SquealUser) : Promise<boolean> {
    //TODO: abstract the critical mass away from this function
    const CM = squeal.impressions * 0.25
    return (squeal.negative_reaction > CM) 
}

async function isSquealControversial(squeal: string | SquealUser): Promise<boolean> {
  return (await isSquealPopular(squeal) && await isSquealUnpopular(squeal))
}

// userPopularity is defined by an integer positive, higher the better 
const userPopularity = async (username: string) => {
  // si calcola prendendo il numero di post popolari (Reazioni positive > Critical Mass) che l'utente ha fatto

  const squeals : SquealUser[] = await Promise.all(await SquealModel.find({author: username}).exec().then(ss => ss.map(s => squeal4NormalUser(s))))
  
  let popularity : number = 100

  let a = {pop: 0, unpop: 0}

  for (const s of squeals) {
    if(await isSquealControversial(s))
      continue
    
    if(await isSquealPopular(s))
      a.pop+=1

    if(await isSquealUnpopular(s))
      a.unpop+=1

  }

  popularity += Math.floor(a.pop/10)
  popularity -= Math.floor(a.unpop/3)
  return popularity;
}


export { userPopularity, isSquealPopular, isSquealUnpopular, isSquealControversial }
