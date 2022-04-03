const axios = require("axios")
const { Api, JsonRpc } = require("eosjs");
const { JsSignatureProvider } = require("eosjs/dist/eosjs-jssig"); // development only
const fetch = require("node-fetch"); //node only
const { TextDecoder, TextEncoder } = require("util"); //node only
const fs = require("fs");

const { hexToUint8Array } = require("eosjs/dist/eosjs-serialize");

rawData = fs.readFileSync("./rechargeAmuTxn.json");
trx = JSON.parse(rawData);

const privateKey = require("./priv_keys.json");

const endPointObj = require("./endpoints.json");
let index = 0;

const rechargeAmulet = async () => {
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
    console.log(transaction);
  } catch (err) {
    index += 1;
    rechargeAmulet();
  }
};


const req_url = "https://api.waxsweden.org/v1/chain/get_table_rows";
const payload = {
  json: true,
  code: "goldmandgame",
  scope: "viralclover1",
  table: "inventory",
  index_position: 1,
  key_type: "i64",
  lower_bound: "",
  upper_bound: "",
  reverse: false,
  limit: 100,
};

const getAmuletDuration = async () => {
  try {
    const resp = await axios
      .post(req_url, payload)
    return resp
  } catch (err) {
    console.log(err.toJSON())
  }
}

// const testTrx = {
//   max_net_usage_words: 0,
//   max_cpu_usage_ms: 0,
//   delay_sec: 0,
//   context_free_actions: [],
//   actions: [trx],
//   transaction_extensions: [],
// };

// const rechargeAmulet = async () => {
//   try {
//     const transaction = await api.transact(testTrx, {
//       blocksBehind: 3,
//       expireSeconds: 30,
//     });
//     console.log(transaction);
//     return transaction;
//   } catch (err) {
//     console.log(err)
//   }
// }

const doRecharge = async () => {
  getAmuletDuration().then((res) => {
    if (res.data.rows[0].durability < 70) {
      trx.data.durability = 100 - res.data.rows[0].durability;
      rechargeAmulet();
    }
    else {
      console.log(100 - res.data.rows[0].durability);
    }
  })
}

module.exports = doRecharge
