import { SquealSMM , Squeal} from '../models/squealModel'
function squeal4NormalUser(squealSMM : SquealSMM) : Squeal {
  return squealSMM.toObject();
}

function stringifyGeoBody(squeal: Squeal): Squeal {
  if (squeal.body.type === 'geo') {
    squeal.body.content = JSON.stringify(squeal.body.content);
  }
  return squeal;
}

export { squeal4NormalUser, stringifyGeoBody };
