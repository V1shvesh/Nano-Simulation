const request = require('request');
const express = require('express');
const bodyparser = require('body-parser');

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
  extended: false,
}));


const networkNodesList = [
  3001,
  3002,
  3003,
  3004
];
const port = Number(process.argv[2]);
const networkIndex = networkNodesList.indexOf(port);
console.log(networkIndex);

const nanoNode = require('./index.js');
const node = new nanoNode(networkIndex, 100000);

app.get('/blockchain', (req, res) => {
  res.send(node);
});

app.post('/send', (req, res) => {
  const dest = req.body.destination;
  const transferAmt = req.body.transferAmt;
  if(dest !== networkIndex && networkNodesList[dest] && transferAmt && transferAmt > 0) {
    const hash = node.send(transferAmt, dest);
    res.send('Send block successfully created');
  
    // Post data to receiver's node
    console.log(`http://localhost:${networkNodesList[dest]}/receive`);
    request({
      url: `http://localhost:${networkNodesList[dest]}/receive`,
      method: 'POST',
      json: true,
      body: {
        transferAmt,
        source: hash,
      }
    });
  } else {
    res.send("Invalid Operation");
  }

});

app.post('/receive', (req, res) => {
  node.receive(req.body.transferAmt, req.body.source);
  res.send('Receive block successfully created');
  console.log('Receive block successfully created');
});

app.listen(port, ()=> {
  console.log("Running App on port " + port);
});
