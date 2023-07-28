import {RequestHandler} from "express";
import {Squeal, SquealModel} from "../models/squealModel";

const listAllSqueals : RequestHandler = async (req, res) => {
  try {
    const squeals : Squeal[] = await SquealModel.find().exec();
     res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    let json = JSON.stringify(squeals);
    res.end(json);
    //res.status(200).json(logs);
    //res.json(logs);
  } catch (error) {
    // Handle any potential errors during the query
    console.error('listAllUsers error: ' + error)
    //await fetch(...) TODO
    throw error;
  }
}

/*
const findUser : RequestHandler = async (req, res) => {
  try {
    const username = req.params.username;
    const user: User = await UserModel.findOne({username}).exec();
     res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    let json = JSON.stringify(user);
    res.end(json);
    //res.status(200).json(logs);
    //res.json(logs);
  } catch (error) {
    // Handle any potential errors during the query
    console.error('findUser error: ' + error)
    //await fetch(...) TODO
    throw error;
  }
}
*/

const postSqueal : RequestHandler = async (req, res) => {

  try {
    const squeal = new SquealModel(req.body);
    /*const existingUser = await UserModel.findOne({ username: user.username }).exec();

    if (existingUser) {
      res.statusCode = 409
      return res.json({ message: 'Username already taken' });
    }*/

    //res.sendStatus(202)
    const savedSqueal = await squeal.save();
    res
      .writeHead(201, {'Content-Type': 'application/json'})
      .end(JSON.stringify(savedSqueal));
  } catch(e) {
    console.error('addUser error: ' + e)
  }

}


export {postSqueal, listAllSqueals};
