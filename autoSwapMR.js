const axios = require("axios");
const { Api, JsonRpc } = require("eosjs");
const { JsSignatureProvider } = require("eosjs/dist/eosjs-jssig"); // development only
const fetch = require("node-fetch"); //node only
const { TextDecoder, TextEncoder } = require("util"); //node only
const fs = require("fs");
const endpoints = require("./endpoints.json");
const { hexToUint8Array } = require("eosjs/dist/eosjs-serialize");
const privateKey = require("./priv_keys.json");
const endPointObj = require("./endpoints.json");

var swapTrx = require("./swapTrx.json");
const getMRallocation = require("./getMRallocation.js")

// getMRallocation().then(resp=>console.log(resp))
let index = 0

const swapMR = async () => {
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
        actions: nswapTrx,
      },
      {
        blocksBehind: 3,
        expireSeconds: 30,
      }
    );
    console.log(transaction);
  } catch (err) {
	if (JSON.stringify(err).includes("assertion failure with message: not enough balance")) {
		console.log(err);
		console.log(nswapTrx)
	}else{
		console.log(err);
		index += 1;
		swapMR();
	}
  }
};


const setSwapTrx = async () => {
	MRallocation = await getMRallocation()
	console.log(MRallocation)
	if (parseFloat(MRallocation[0].toFixed(4))) {
		nswapTrx = [
			{
				...swapTrx,
				data: {
					...swapTrx.data,
					sell_amount: MRallocation[0].toFixed(4) + " GME",
					buy_amount: "0.0001 GMM",
				},
				// ...swapTrx[0],
				// data: {
				// 	...swapTrx[1].data,
				// 	sell_amount: MRallocation[1].toFixed(4)+" GME",
				// 	buy_amount: "0.0000 GMF",
				// },
			},
		];
	} else {
		nswapTrx=[]
	}
	if (parseFloat(MRallocation[1].toFixed(4))) {
		nswapTrx.push({
			...swapTrx,
			data: {
				...swapTrx.data,
				sell_amount: MRallocation[1].toFixed(4) + " GME",
				buy_amount: "0.0001 GMF",
			},
		});
	}
    // console.log(swapTrx)
    console.log(nswapTrx)
	if (nswapTrx.length == 0||!MRallocation[2]) {
		console.log("nothing to swap eh")
	} else {
		console.log("This looks like a swap to me")
		swapMR();
	}
}

module.exports=setSwapTrx
// setSwapTrx().then(resp=>console.log(resp))