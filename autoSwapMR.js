const axios = require("axios")
const endpoints = require("./endpoints.json")

let index = 0

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

const fetchGetData =  async(req_url) => {
	req_url = req_url || endpoints[index > endpoints.length - 1 ? (index = 0) : index] + "/v1/chain/get_table_rows";
	try {
		const resp = await axios.get(req_url)
		return resp
	} catch (err) {
		index += 1;
		return fetchGetData(req_url)
	}
}

const fetchPostData = async(payload) => {
	let req_url = endpoints[index > endpoints.length - 1 ? (index = 0) : index] + "/v1/chain/get_table_rows";
	try {
		const resp = await axios.post(req_url, payload)
		return resp;
	} catch(err) {
		index += 1;
		return fetchPostData(payload)
	}
}

const ratioDeterminer = async () => {
	inventory = await fetchPostData(inventoryPayload)
	invenDict = {}
	asset_list=[]
	for (let i = 0; i < inventory.data.rows.length; i++){
		tool_asset_id = inventory.data.rows[i].tool_asset_id
		amulet_asset_id = inventory.data.rows[i].amulet_asset_id
		invenDict[tool_asset_id] = amulet_asset_id
		if (tool_asset_id != 0) {
			asset_list.push(Number(tool_asset_id))
		}
		if (amulet_asset_id != 0) {
			asset_list.push(Number(amulet_asset_id))
		}
		// console.log(tool_asset_id,amulet_asset_id)
	}
	// console.log(invenDict,asset_list)
	asset_data_url  = "https://wax.api.atomicassets.io/atomicassets/v1/assets?page=1&limit=100&collection_name=goldmandgame&owner=goldmandgame&ids="+asset_list.join()
	// console.log(asset_data_url)
	raw_asset_data = await fetchGetData(asset_data_url)
	assetStats = {}
	// console.log(asset_data.data.data.length)
	for (let i = 0; i < raw_asset_data.data.data.length; i++){
		if (raw_asset_data.data.data[i].schema.schema_name == "amulets") {
			for (let k in invenDict) {
				if (invenDict[k] == raw_asset_data.data.data[i].asset_id) {
					invenDict[k]=raw_asset_data.data.data[i].template.immutable_data.rarity
				}
			}
			// console.log(asset_data.data.data[i].template.immutable_data.rarity);
			// console.log(invenDict)
		}
		else if (raw_asset_data.data.data[i].schema.schema_name == "terra.tools") {
    	  	// console.log(asset_data.data.data[i].template.immutable_data.rarity);
			consumption = raw_asset_data.data.data[i].template.immutable_data.consumption;
			gmf = raw_asset_data.data.data[i].template.immutable_data.gmf;
			gmm = raw_asset_data.data.data[i].template.immutable_data.gmm;
			delay = Number(raw_asset_data.data.data[i].template.immutable_data.delay);
			rarity = raw_asset_data.data.data[i].template.immutable_data.rarity;
			assetStats[raw_asset_data.data.data[i].asset_id]=[consumption,gmm,gmf,delay,rarity]
		}
	}

	weights_dict = {
		"Artefact":32,
		"Legendary": 16,
		"Epic": 8,
		"Rare": 4,
		"Common":2
	}

	for (let k in invenDict) {
		if (invenDict[k] != 0) {
			invenDict[k] = weights_dict[invenDict[k]]
		}
	}

	for (let k in assetStats) {
		assetStats[k][4] = weights_dict[assetStats[k][4]]
	}

	console.log(invenDict,assetStats)
	// console.log(assetStats, invenDict)
}

// fetchPostData(swapPayload).then(res=>console.log(res.data.rows))
// fetchGetData("https://wax.api.atomicassets.io/atomicassets/v1/assets/1099732769896").then(res=>console.log(res.data))

ratioDeterminer().then(resp=>console.log(resp))