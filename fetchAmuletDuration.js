const axios = require("axios")
const { Api, JsonRpc } = require("eosjs");
const { JsSignatureProvider } = require("eosjs/dist/eosjs-jssig"); // development only
const fetch = require("node-fetch"); //node only
const { TextDecoder, TextEncoder } = require("util"); //node only
const fs = require("fs");
const endpoints = require("./endpoints.json");
const { hexToUint8Array } = require("eosjs/dist/eosjs-serialize");

// rawData = fs.readFileSync("./rechargeAmuTxn.json");
// trx = JSON.parse(rawData);
var amuRechargeTxn = require("./rechargeAmuTxn.json");

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
        actions: amuRechargeTxn,
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
  let req_url =endpoints[index > endpoints.length - 1 ? (index = 0) : index] +"/v1/chain/get_table_rows";
  
  try {
    const resp = await axios.post(req_url, payload)
    return resp

  } catch (err) {
    console.log(err.toJSON())
    index += 1
    return getAmuletDuration()
  }
}

const fetchInventory = async () => {
  amuletData = [];
  resp = await getAmuletDuration();
  for (var i = 0; i < resp.data.rows.length; i++) {
    if (resp.data.rows[i].amulet_asset_id) {
      amuletData.push({
        ...amuRechargeTxn,
        data: {
          ...amuRechargeTxn.data,
          asset_id: resp.data.rows[i].amulet_asset_id,
          durability: 100 - resp.data.rows[i].durability,
        },
      });
    }
  }
  return amuletData;
};
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
  amuRechargeTxn = await fetchInventory();
  var rechargeFlag = 0
  for (i = 0; i < amuRechargeTxn.length; i++){
    if (amuRechargeTxn[i].data.durability > 50) {
      rechargeFlag=1
    }
  }
  if (rechargeFlag) {
    rechargeAmulet()
    console.log("im going in")
  }
  else {
    console.log(amuRechargeTxn[0].data.durability)
  }
  // getAmuletDuration().then((res) => {
  //   if (res.data.rows[0].durability < 70) {
      
  //     rechargeAmulet();
  //   }
  //   else {
  //     console.log(100 - res.data.rows[0].durability);
  //   }
  // })
}

module.exports = doRecharge
