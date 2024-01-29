import { Squeal, SquealModel } from '../models/squealModel'

async function isSquealPopular(squeal : string | Squeal) : Promise<boolean> {
  if ( typeof squeal === 'string')
    return isSquealPopularByID(squeal)
  else
    return isSquealPopularByObject(squeal)
}

async function isSquealPopularByID(id :string) : Promise<boolean> {
  let squeal = await SquealModel.findOne({_id: id}).exec()
  
  if(!squeal)
    return false

  return isSquealPopularByObject(squeal)

}

function isSquealPopularByObject(squeal : Squeal) : boolean {
    const CM = squeal.impressions.length * 0.25
    return (squeal.positive_reaction.length > CM) 
}

async function isSquealUnpopular(squeal : string | Squeal) : Promise<boolean> {
  if ( typeof squeal === 'string')
    return isSquealUnpopularByID(squeal)
  else
    return isSquealUnpopularByObject(squeal)
}

async function isSquealUnpopularByID(id :string) : Promise<boolean> {
  let squeal = await SquealModel.findOne({_id: id}).exec()
  
  if(!squeal)
    return false

  return isSquealUnpopularByObject(squeal)
}

function isSquealUnpopularByObject(squeal : Squeal) : boolean {
    const CM = squeal.impressions.length * 0.25
    return (squeal.negative_reaction.length > CM) 
}

async function isSquealControversial(squeal: string | Squeal): Promise<boolean> {
  return (await isSquealPopular(squeal) && await isSquealUnpopular(squeal))
}

// userPopularity is defined by an integer positive, higher the better 
const userPopularity = async (username: string) => {
  // si calcola prendendo il numero di post popolari (Reazioni positive > Critical Mass) che l'utente ha fatto

  const squeals : Squeal[]  = await SquealModel.find({author: username}).exec()
  
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
