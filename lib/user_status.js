import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

Accounts.onLogin(function(data){
   Meteor.users.update({
       _id:data.user._id
   }, {
       $push:{
           sessions:{
               _id:data.connection.id,
               status:"online"
           }
       }
   })
});