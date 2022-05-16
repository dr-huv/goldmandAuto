const { Api, JsonRpc } = require("eosjs");
const { JsSignatureProvider } = require("eosjs/dist/eosjs-jssig"); // development only
const fetch = require("node-fetch"); //node only
const { TextDecoder, TextEncoder } = require("util"); //node only
const checkMine = require("./lastMinedCheck");
const fs = require("fs");
const { hexToUint8Array } = require("eosjs/dist/eosjs-serialize");
const trx = require("./trx.json");
const privateKey = require("./priv_keys.json");
const endPointObj = require("./endpoints.json");
let index = 0;
const axios = require("axios");
const fetchPostData = require("./fetchPostData");
const fetchGetData = require("./fetchGetData.js")
var _ = require("lodash");
let switchLandTrx = require("./switchLandTrx.json");
const setSwapTrx = require("./autoSwapMR");

let landPayload = {
  json: true,
  code: "goldmandland",
  scope: "goldmandland",
  table: "lands",
  index_position: null,
  key_type: "name",
  lower_bound: "",
  upper_bound: "",
  reverse: false,
  limit: 150,
};

const playerPayload = {
	"json": true,
	"code": "goldmandgame",
	"scope": "goldmandgame",
	"table": "miners",
	"lower_bound": "viralclover1",
	"upper_bound": "viralclover1",
	"index_position": 1,
	"key_type": "",
	"limit": "100",
	"reverse": false,
	"show_payer": false
}

const switchLand = async () => {
	const httpEndpoint =endPointObj[index > endPointObj.length - 1 ? (index = 0) : index];
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
          actions: [switchLandTrx],
        },
        {
          blocksBehind: 3,
          expireSeconds: 30,
        }
      );
      console.log(transaction);
    } catch (err) {
    //   if (
    //     JSON.stringify(err).includes(
    //       "assertion failure with message: not enough balance"
    //     )
    //   ) {
    //     console.log(err);
    //     console.log(nswapTrx);
    //   } else {
        console.log(err);
        index += 1;
        switchLand();
    //   }
    }
	
}

const checkCurrentLand = async() => {
	const rawPlayerData = await fetchPostData(playerPayload)
	const land_id = rawPlayerData.data.rows[0].land
	// console.log(land_id)
	// const req_url = "https://wax.api.atomicassets.io/atomicassets/v1/assets/"+land_id
	const rawLandData = await fetchPostData({...landPayload,lower_bound:land_id,upper_bound:land_id,key_type:"",index_position:1});
	return [rawLandData.data.rows[0].cap_available,rawLandData.data.rows[0].commission]
	// console.log("odd");
}

const fetchOptimalLand = async () => {
  req_land_list = [];
  const rawLandData = await fetchPostData(landPayload);
  landData = rawLandData.data.rows;
  // console.log(landData.length)
  for (let i = 0; i < landData.length; i++) {
    if (
      landData[i].planet_id == 3 &&
      landData[i].weight == 25 &&
    //   landData[i].commission == 0 &&
	  landData[i].cap_available &&
	  !landData[i].unstake_time	
    ) {
      req_land_list.push(landData[i]);
      // console.log(
      // 	_.orderBy(landData[i], "cap_availible","desc")
      // )
    }
  }
  req_land_list = _.orderBy(req_land_list, "commission", "asc");
  return [req_land_list[0].asset_id,req_land_list[0].commission];
  // console.log();
  // console.log(req_land_list.length)
};
	
// fetchOptimalLand().then((resp) => console.log(resp));

const landSwitchCheck = async () => {
	optimalLand = await fetchOptimalLand()	
	current_land = await checkCurrentLand()
	if (!current_land[0]||optimalLand[1]<current_land[1] ) {
		switchLandTrx = {
			...switchLandTrx,
			data: {
				...switchLandTrx.data,
				land: optimalLand[0]
			}
		}
		console.log(optimalLand)
		console.log("We can do better")
		switchLand()
	} else {
		console.log("The real optimal land is the friends we make along the way")
	}
}

// landSwitchCheck()

module.exports = landSwitchCheck
// checkLandCap().then(res=>console.log(res))