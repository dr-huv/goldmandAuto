const axios = require("axios");
const endpoints = require("./endpoints.json");
const fetchPostData = require("./fetchPostData.js")
const fetchGetData = require("./fetchGetData.js")
let index = 0;
let amuletCount = 0

const swapPayload = {
  json: true,
  code: "goldmandswap",
  scope: "goldmandswap",
  table: "pools",
  index_position: 2,
  key_type: "name",
  lower_bound: "",
  upper_bound: "",
  reverse: false,
  limit: 100,
};

const inventoryPayload = {
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

const supplyCentrePayload = {
  json: true,
  code: "goldmandgame",
  scope: "goldmandgame",
  table: "miners",
  index_position: 1,
  key_type: "i64",
  lower_bound: "viralclover1",
  upper_bound: "viralclover1",
  reverse: false,
  limit: 100,
};

const ratioDeterminer = async () => {
  inventory = await fetchPostData(inventoryPayload);
  invenDict = {};
  asset_list = [];
  for (let i = 0; i < inventory.data.rows.length; i++) {
    tool_asset_id = inventory.data.rows[i].tool_asset_id;
    amulet_asset_id = inventory.data.rows[i].amulet_asset_id;
    invenDict[tool_asset_id] = amulet_asset_id;
    if (tool_asset_id != 0) {
      asset_list.push(Number(tool_asset_id));
    }
    if (amulet_asset_id != 0) {
      asset_list.push(Number(amulet_asset_id));
    }
    // console.log(tool_asset_id,amulet_asset_id)
  }
  // console.log(invenDict,asset_list)
  asset_data_url ="https://wax.api.atomicassets.io/atomicassets/v1/assets?page=1&limit=100&collection_name=goldmandgame&owner=goldmandgame&ids=" +asset_list.join();
  // console.log(asset_data_url)
  raw_asset_data = await fetchGetData(asset_data_url);
  assetStats = {};
  // console.log(asset_data.data.data.length)
  for (let i = 0; i < raw_asset_data.data.data.length; i++) {
    if (raw_asset_data.data.data[i].schema.schema_name == "amulets") {
      amuletCount+=1
      for (let k in invenDict) {
        if (invenDict[k] == raw_asset_data.data.data[i].asset_id) {
          if (
            raw_asset_data.data.data[i].mutable_data.bonus == "consumption" ||
            raw_asset_data.data.data[i].mutable_data.bonus2 == "consumption"
          ) {
            invenDict[k] = [
              raw_asset_data.data.data[i].template.immutable_data.rarity,
              1,
            ];
          } else {
            invenDict[k] = [
              raw_asset_data.data.data[i].template.immutable_data.rarity,
              0,
            ];
          }
        }
      }
      // console.log(asset_data.data.data[i].template.immutable_data.rarity);
    //   console.log(invenDict);
    } else if (
      raw_asset_data.data.data[i].schema.schema_name == "terra.tools"
    ) {
      // console.log(asset_data.data.data[i].template.immutable_data.rarity);
      consumption =
        raw_asset_data.data.data[i].template.immutable_data.consumption;
      gmf = raw_asset_data.data.data[i].template.immutable_data.gmf;
      gmm = raw_asset_data.data.data[i].template.immutable_data.gmm;
      delay = Number(raw_asset_data.data.data[i].template.immutable_data.delay);
      rarity = raw_asset_data.data.data[i].template.immutable_data.rarity;
      assetStats[raw_asset_data.data.data[i].asset_id] = [
        consumption,
        gmm,
        gmf,
        delay,
        rarity,
      ];
    }
  }

  weights_dict = {
    Artefact: 32,
    Legendary: 16,
    Epic: 8,
    Rare: 4,
    Common: 2,
  };

  for (let k in invenDict) {
    if (invenDict[k] != 0) {
      if (invenDict[k][1]) {
        invenDict[k][1] = weights_dict[invenDict[k][0]];
      }
      invenDict[k][0] = weights_dict[invenDict[k][0]];
    }
  }
  // const consumption_bonus_dict = {
  // 	Artefact: 1,
  // 	Legendary: 0.5,
  // 	Epic: 0.25,
  // 	Rare: 0.125,
  // 	Common: 0.0625,
  // };
//   console.log(invenDict);
  for (let k in assetStats) {
    if (invenDict[k] != 0) {
      assetStats[k][4] =
        1 +
        invenDict[k][0] / weights_dict[assetStats[k][4]] +
        invenDict[k][0] / 32;
    } else {
      assetStats[k][4] = 1;
    }
  }

//   console.log(assetStats);
  ratio_dict = {
    gmm: 0,
    gmf: 0,
  };

  MR_consumption_dict = {};
  for (let k in assetStats) {
    //computing the value
    MR_consumption_dict[k] = [
      (assetStats[k][0] / assetStats[k][3]) *
        assetStats[k][4] *
        assetStats[k][1],
      (assetStats[k][0] / assetStats[k][3]) *
        assetStats[k][4] *
        assetStats[k][2],
    ];
  }

  for (let k in MR_consumption_dict) {
    ratio_dict["gmm"] += MR_consumption_dict[k][0];
    ratio_dict["gmf"] += MR_consumption_dict[k][1];
  }

  gmm_percent = ratio_dict["gmm"] / (ratio_dict["gmm"] + ratio_dict["gmf"]);
  gmf_percent = ratio_dict["gmf"] / (ratio_dict["gmm"] + ratio_dict["gmf"]);

  return [gmm_percent, gmf_percent];
  // console.log(assetStats, invenDict)
};

// fetchPostData(swapPayload).then(res=>console.log(res.data.rows))
// fetchGetData("https://wax.api.atomicassets.io/atomicassets/v1/assets/1099732769896").then(res=>console.log(res.data))

// ratioDeterminer().then(resp => console.log(resp))

const getTokenPrice = async () => {
  let token_value_dict = {};
  raw_token_data = await fetchPostData(swapPayload);
  s_data = raw_token_data.data.rows; //shorthand data
  // console.log(s_data)
  for (let i = 0; i < s_data.length; i++) {
    token_value_dict[s_data[i].token1] = s_data[i].supply2 / s_data[i].supply1;
  }
	return token_value_dict;
};

//getTokenPrice();

const getSupplyBalance = async () => {
  let raw_supply_balance = await fetchPostData(supplyCentrePayload);
  let supplybalanceDict = {};
  supply_centre = raw_supply_balance.data.rows[0];
  //console.log(supply_centre)
  supplybalanceDict["GME"] = supply_centre.energy / 10000;
  supplybalanceDict["GMM"] = supply_centre.minerals / 10000;
  supplybalanceDict["GMF"] = supply_centre.food / 10000;
  return supplybalanceDict;
};

const getMRallocation = async () => {
	req_MR = {}
	
	supplyBalance = await getSupplyBalance()
	tokenPrice = await getTokenPrice()
  MRratio = await ratioDeterminer()
  supplyBalance["GME"]-=amuletCount*5
  if (supplyBalance["GME"] < 0) {
    supplyBalance["GME"]=0
  }
	gme_wax = supplyBalance['GME'] * tokenPrice['GME']
	gmf_wax = supplyBalance["GMF"] * tokenPrice["GMF"];
	gmm_wax = supplyBalance["GMM"] * tokenPrice["GMM"];
	current_MR_ratio = supplyBalance["GMM"] / supplyBalance["GMF"];
	optimal_MR_ratio = MRratio[0] / MRratio[1]
	reqSupplyBalance = {...supplyBalance};
	// console.log(gme_wax)
	// console.log(gmf_wax)
	// console.log(gmm_wax)
	//console.log(current_MR_ratio)
	//console.log(optimal_MR_ratio)
	extra_GMF = 0
	extra_GMM = 0
	if (current_MR_ratio > optimal_MR_ratio) {
    extra_GMF = supplyBalance["GMM"] / optimal_MR_ratio - supplyBalance["GMF"];
    if (extra_GMF > 0) {
      reqSupplyBalance["GMF"] += extra_GMF;
    } else {
      extra_GMF=0
    }
		// console.log(MRratio[1])
	}
	else {
    extra_GMM = optimal_MR_ratio * supplyBalance["GMF"] - supplyBalance["GMM"];
    if (extra_GMM > 0) {
      reqSupplyBalance["GMM"] += extra_GMM;
    } else {
      extra_GMM = 0;
    }
		
		// console.log(MRratio[0] * optimal_MR_ratio);
  }
//  console.log(reqSupplyBalance)
//	console.log(extra_GMF,extra_GMM)
	GME_used = (extra_GMF * tokenPrice["GMF"] + extra_GMM * tokenPrice["GMM"]) / tokenPrice["GME"]
  if (reqSupplyBalance["GME"] - GME_used < 0) {
    reqSupplyBalance["GME"]=0
  } else {
    reqSupplyBalance["GME"]-=GME_used
  }
	//console.log(supplyBalance)
	//console.log(reqSupplyBalance)
	GMM_alloc = optimal_MR_ratio*tokenPrice["GMM"]/(optimal_MR_ratio*tokenPrice["GMM"]+tokenPrice["GMF"])*reqSupplyBalance["GME"]
	// GMM_alloc = optimal_MR_ratio * reqSupplyBalance["GME"] * tokenPrice["GMM"];
	GMF_alloc = tokenPrice["GMF"]/(optimal_MR_ratio*tokenPrice["GMM"]+tokenPrice["GMF"])*reqSupplyBalance["GME"]
	// console.log(GME_used)
	// GME_remaining = supplyBalance["GME"] - GME_used
	// GME_remaining*tokenPrice["GME"]
	if (extra_GMF) {
    GMF_alloc += GME_used
    if (GMF_alloc > supplyBalance["GME"]) {
      GMF_alloc=supplyBalance["GME"]
    }
	} else {
    GMM_alloc += GME_used
    if (GMF_alloc > supplyBalance["GME"]) {
      GMM_alloc = supplyBalance["GME"];
    }
  }
  console.log(supplyBalance["GME"])
	return [GMM_alloc, GMF_alloc, supplyBalance["GME"]];
}

// getMRallocation().then(resp => console.log(resp))
module.exports = getMRallocation