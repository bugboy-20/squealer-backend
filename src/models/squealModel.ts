import mongoose, { Schema, Document } from 'mongoose'; //l'ha fatto ChatGPT 

interface Squeal extends Document {
  //id: number, TODO accertarsi dell'inutilità
  receivers: string[],
  author: string,
  body: string// | img | video | geolocazione,
  datetime: Date,
  impressions: number,
  positive_reaction: number,
  negative_reaction: number,
  category: object,
  automatic_receiver: /*[§CONTROVERSIAL, ..]: */string[]
}

const squealSchema: Schema<Squeal> = new Schema<Squeal>({
  /*id: {
    type: Number,
    unique: true,
    required: true
  },*/
  receivers: [{
    type: String,
    required: true
  }],
  author: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  datetime: { 
    type: Date,
    required: true
  },
  impressions: {
    type: Number,
    required: true
  },
  positive_reaction: {
    type: Number,
    required: true
  },
  negative_reaction: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  automatic_receiver: [{
    type: String
  }]
});

const SquealModel = mongoose.model<Squeal>('Squeal', squealSchema);

export {Squeal,SquealModel}
