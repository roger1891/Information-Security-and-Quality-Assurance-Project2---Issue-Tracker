/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

var createDate = function(){
    var options = { timeZone: 'Asia/Shanghai', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false};  
    var origDate = new Date();
    var completeDate = origDate.toLocaleDateString('en-PH', options);
    return completeDate;
};

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      
    
      //connect to db
      MongoClient.connect(CONNECTION_STRING, (err, db) => {
          if(err) {
            console.log('Database error getting: ' + err);
          } 
          else {
            console.log("Successful database connection getting");
            //find
            db.collection(project).find(
              {}).toArray(
              (err, doc) => {
                if(err) {
                   res.json({error: err});
                } else {
                  res.json(doc);
                   
                }
                db.close()
              }
            );  
          }
          
      });
    })
    
    .post(function (req, res){
      var project = req.params.project;
      
      if(req.body.issue_title == "" || req.body.issue_text == "" || req.body.created_by == ""){
        res.json('missing required field');
      }
      else {   
        //connect to db
        MongoClient.connect(CONNECTION_STRING, (err, db) => {
            if(err) {
              console.log('Database error inserting: ' + err);
            } 
            else {
              console.log("Successful database connection inserting");

              //insert details
             let inserIssueDetails = {
                issue_title: req.body.issue_title,
                issue_text: req.body.issue_text,
                created_by: req.body.created_by,
                assigned_to: req.body.assigned_to,
                status_text: req.body.status_text,
                created_on: createDate(),
                updated_on: createDate(),
                open: true
              };
              //insert data
              db.collection(project).insertOne(
                inserIssueDetails,
                (err, doc) => {
                  if(err) {
                     res.json({error: err});
                  } else {
                      res.json(doc.ops[0]);

                  }
                  db.close()
                }
              );             
            }
        });    
      }
    })
    
    .put(function (req, res){
      var project = req.params.project;
      var id =  req.body._id;
      var open = req.body.open;
      //convert status from string to boolean
      var openStatus = function(openParam)
      {
        return (openParam == "true")?true: false;
      }
    
      var findBy = {
        _id: ObjectId(id)
      }
      
      var update = {
        updated_on: createDate(),
        open : openStatus(open)
      }
      
      var setUpdate = {
        $set: update
      };
  
      if (Object.keys(update).length == 0) {
        res.json('no updated field sent');
      } 
      else {
        //connect to db
        MongoClient.connect(CONNECTION_STRING, (err, db) => {
            if(err) {
              console.log('Database error updating: ' + err);
            } 
            else {
              console.log("Successful database connection updating");
              //update
              db.collection(project).updateOne(
                findBy, setUpdate, (err, doc) => {
                  if(err) {
                     res.json({error: err});
                  }
                  else if(doc.result.n == 0){
                    res.json('could not update ' + id);                
                  } else {
                     res.json('successfully updated ' + id);

                  }
                  db.close();
                }
              );
            }     
        }); 
      }
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      var id =  req.body._id;
 
      var findBy = {
        _id: ObjectId(id)
      };
    
      //connect to db
      MongoClient.connect(CONNECTION_STRING, (err, db) => {
          if(err) {
            console.log('Database error deleting: ' + err);
          } 
          else {
            console.log("Successful database connection deleting");
            //update
            db.collection(project).deleteOne(
              findBy, (err, doc) => {
                if(err) {
                   res.json("_id error");
                }else if (doc.deletedCount == 0) {
                   res.json("could not delete "+ id);
                }else {
                   res.json("deleted " + id);                 
                }
                db.close();
              }
            );
          }     
      });      
    });
    
};
