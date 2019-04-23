const sha256 = require('sha256');

class Block {
  constructor(type, options) {
    this.blockData = {};
    this.type = '';
    switch (type) {
      case 'open': {
        const {
          account,
          source,
          representative,
        } = options;

        this.blockData = {
          account,
          source,
          representative,
        }


        this.blockData.hash = sha256(`${account}-${source}-${representative}`);
				console.log("TCL: Block -> constructor -> `${account}-${source}-${representative}`", `${account}-${source}-${representative}`)

        this.type = 'open';
        break;
      }

      case 'send': {
        const {
          previous,
          balance,
          destination,
        } = options;

        this.blockData = {
          previous,
          balance,
          destination,
        }

        this.blockData.hash = sha256(`${previous}-${balance}-${destination}`);

        this.type = 'send';
        break;
      }

      case 'receive': {
        const {
          previous,
          source,
        } = options;

        this.blockData = {
          previous,
          source,
        }

        this.blockData.hash = sha256(`${previous}-${source}`);

        this.type = 'receive';
        break;
      }
    }
  }
};

class nanoNode {
  constructor(account, balance) {
    this.chain = [];
    this.account = account;
    this.balance = balance;
    const genesis = new Block('open', {
      account: this.account,
      source: 0,
      representative: "xrb_vote_rep",
    });

    this.chain.push(genesis);
  }

  getPrevBlockHash() {
    return this.chain[this.chain.length - 1].hash;
  }

  /**
   * Send:
   * - Previous: Hash of previous block
   * - Balance: Cur. balance after spend
   * - Destination: Reciever's Account
   */

  send(transferAmt, destination) {
    if(this.balance < transferAmt) return;

    const newSendBlock = new Block('send', {
      previous: this.getPrevBlockHash(),
      balance: this.balance - transferAmt,
      destination
    });

    this.chain.push(newSendBlock);

    this.balance -= transferAmt;

    return newSendBlock.hash;
  }

  /**
   * Receive:
   * - Previous: Hash of previous block
   * - Source: Hash of Send block
   */

  receive(transferAmt, sendBlockHash) {
    const newReceiveBlock = new Block('receive', {
      previous: this.getPrevBlockHash(),
      source: sendBlockHash,
    })

    this.chain.push(newReceiveBlock);

    this.balance += transferAmt;

    return newReceiveBlock.hash;
  }

};

module.exports = nanoNode;