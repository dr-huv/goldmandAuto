const { Api, JsonRpc } = require("eosjs");
const { JsSignatureProvider } = require("eosjs/dist/eosjs-jssig"); // development only
const fetch = require("node-fetch"); //node only
const { TextDecoder, TextEncoder } = require("util"); //node only
const checkMine = require("./lastMinedCheck")
const fs = require("fs");

const { hexToUint8Array } = require("eosjs/dist/eosjs-serialize");
const trx = require("./trx.json");
const privateKey = require("./priv_keys.json");

const  endPointObj  = require("./endpoints.json");
let index = 0;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const doTrx = async () => {
  const httpEndpoint =
    endPointObj[index > endPointObj.length - 1 ? (index = 0) : index];
  const signatureProvider = new JsSignatureProvider(privateKey);

  const rpc = new JsonRpc(httpEndpoint, { fetch });
  const api = new Api({
    rpc,
    signatureProvider,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder(),
  });
  
  try {
    const transaction = await api.transact(
      {
        actions: [trx],
      },
      {
        blocksBehind: 3,
        expireSeconds: 30,
      }
    );
    traces = transaction["processed"]["action_traces"][0]["inline_traces"];
    if (traces.length == 3) {
       console.log(traces[2]["act"]["data"]["reward"]);
       console.log(traces[2]["act"]["data"]["reward_gmd"]);
    }
    if (traces.length == 2) {
      console.log(traces[1]["act"]["data"]["reward"]);
      console.log(traces[1]["act"]["data"]["reward_gmd"]);
    }
   
    checkMine().then((res) => {
      if ((Date.now() / 1000 - res.data.rows[0].last_mine) > 5850) {
        index += 1;
        console.log("changing endpoint")
        doTrx()
      }
    }
    );
  } catch (err) {
    if (JSON.stringify(err).includes("ERROR_SET_INVENTORY_NOT_POSSIBLE")) {
      console.log("yea this one's on me")
      checkMine().then((res) => {
        time_left = 5850 - (Date.now() / 1000 - res.data.rows[0].last_mine);
        console.log(`Will mine after ${time_left} seconds hi`);
        delay(time_left * 1000).then(() => {
          console.log("oh no this happened");
          doTrx()
        });
      });
    } else {
      index+=1
      doTrx()
    }
    }
  }

module.exports = doTrx