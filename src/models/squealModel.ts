import mongoose, { Schema, Document } from 'mongoose'; //l'ha fatto ChatGPT 

interface Squeal extends Document {
  receivers: string[],
  author: string,
  body: string// | img | video | geolocazione,
  datetime: Date,
  impressions: number,
  positive_reaction: number,
  negative_reaction: number,
  category: string, //TODO a cosa serve category?
}

interface Squeal {
  receivers: string[],
  author: string,
  body: string// | img | video | geolocazione,
  category: string,
}


const squealSchema: Schema<Squeal> = new Schema<Squeal>({
  author: {
    type: String,
    required: true
  },
  receivers: [{
    type: String,
    required: true
  }],
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
});

const SquealModel = mongoose.model<Squeal>('Squeal', squealSchema);

export {Squeal,SquealModel}
