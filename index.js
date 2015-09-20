var request = require('request');
var _ = require('underscore');
_.mixin( require('underscore.deferred') );
var Twit = require('twit');
var T = new Twit(require('./config.js'));
var wordfilter = require('wordfilter');
var ent = require('ent');
var wordnikKey = require('./permissions.js').key;
var unWords = require('./un-words.js');
var myTweet = "";

// making this URL call easier:

var getVbsURL =  'http://api.wordnik.com/v4/words.json/randomWords?' +
                  'hasDictionaryDef=true&includePartOfSpeech=verb&limit=20&' + 
                  'minCorpusCount=100&api_key=' + wordnikKey;

// these are some nice functions Darius wrote to make picking randomly from an array easier

Array.prototype.pick = function() {
  return this[Math.floor(Math.random()*this.length)];
};

Array.prototype.pickRemove = function() {
  var index = Math.floor(Math.random()*this.length);
  return this.splice(index,1)[0];
};

console.log("here's " + myTweet);

function tweetInfix() {
  var verb;
  //let's get some verbs!
  request(getVbsURL, 
    function(error, response, data) {
// let's make sure we're dealing with JSON
      var verbSet = JSON.parse(data);
      if (!error) {
        // if we got back some data from the API and it didn't error
        var ingWord = new RegExp('^.*ing$', i);
        // regex to check for words tha end in -ing
        for (var i = 0; i < verbSet.length; i++) {
         // okay, for every word returned, let's check each word to see if it ends in -ing
         if ((verbSet[i].word).match(ingWord))  {
          //found an -ing verb
          verb = (verbSet[i].word).toLowerCase();
          //let's lowercase it
          var unSep = new RegExp('^un');
          //regex to find the 'un' part
          var outfix = unWords.pick();
          // let's pick an un- word to infix
          myTweet = outfix.replace(unSep, 'un'+verb);
          //let's infix that -ing verb into the un-word
          // myTweet = infix;
          i = verbSet.length;
              console.log("here's " + myTweet);
          if (!wordfilter.blacklisted(myTweet)) {
            console.log(myTweet);
            
            T.post('statuses/update', { status: myTweet }, function(err, reply) {
              if (err) {
                console.log('error:', err);
              }
              else {
                console.log('tweet:', reply);
              }
            });
            
          }

          //let's end the for loop, success!

         }
        }
      }


    });
    
    // console.log("here's " + myTweet);
    // if (!wordfilter.blacklisted(myTweet)) {
    //   console.log(myTweet);
      
    //   T.post('statuses/update', { status: myTweet }, function(err, reply) {
    //     if (err) {
    //       console.log('error:', err);
    //     }
    //     else {
    //       console.log('tweet:', reply);
    //     }
    //   });
      
    // }
 }   

// Tweet every 60 minutes
setInterval(function () {
  try {
    tweetInfix();
  }
  catch (e) {
    console.log(e);
  }
}, 1000 * 60 * 60);

// Tweet once on initialization
tweetInfix();
