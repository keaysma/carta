const express = require('express');
const app = express();

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

app.get("/test", (req, res) => {
    functions.logger.info("Doing some heckin math", {structuredData: true});

    let {a , b} = Object.assign({
        a: 0, 
        b: 0
    }, req.query);

    try{
        let answer = Number(a) + Number(b);
        res.send({result: answer});
     }catch{
        res.send({error: 'bad inputs'})
     }
});

app.get('/status', async (req, res) => {
    let ref = admin.firestore().collection('status').doc('accumulate');
    let document = await ref.get();
    if(!document.exists)
        return {error : "does not exist"}
    res.json(document.data());
})

app.get("/math", (req, res) => {
    let {a , b} = Object.assign({
        a: 0, 
        b: 0
    }, req.query);

    var answer = Number(a) + Number(b);

    const writeResult = admin.firestore().collection('history').add({
        a, b, answer
    });

    res.json({
        id: writeResult.id,
        result: answer
    });
});

// Listens for new messages added to /history/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
exports.accumulateValue = functions.firestore.document('/history/{documentId}')
    .onCreate((snap, context) => {
      // Grab the current value of what was written to Firestore.
      const document = snap.data();

      // Access the parameter `{documentId}` with `context.params`
      functions.logger.log('Accumulating', context.params.documentId, document.answer);
      
      const accumulator = admin.firestore().collection('status').doc('accumulate');
      return accumulator.set({
          sum : admin.firestore.FieldValue.increment(document.answer)
      }, { merge: true })

      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to Firestore.
      // Setting an 'uppercase' field in Firestore document returns a Promise.
      // return snap.ref.set({uppercase}, {merge: true});
    });

exports.api = functions.https.onRequest(app);
