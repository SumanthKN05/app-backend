import mongoose,{Schema} from 'mongoose';
const subscriptionSchema = new Schema({
  subscriber:{
    type: mongoose.Schema.Types.ObjectId(),//one who is sbscribing
    ref:'User',
    required:true
  },
  channel:{
    type: mongoose.Schema.Types.ObjectId(),//channel to which subscription is made by subscriber
    ref:'User',
    required:true
  }
},{timestamps:true})










export const Subscription = mongoose.model('Subscription', subscriptionSchema);