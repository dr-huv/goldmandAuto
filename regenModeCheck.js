const axios = require("axios")
const endpoints = require("./endpoints.json")
// const req_url = ""
let index = 0

// console.log(endpoints[5])
const fetchRegenMode = async () => {
	req_url = endpoints[index > endpoints.length - 1 ? (index = 0) : index]+"/v1/chain/get_table_rows";
	payload = {
		json: true,
		code: "goldmandgame",
		scope: "goldmandgame",
		table: "staminadata",
		lower_bound: "viralclover1",
		upper_bound: "viralclover1",
		index_position: 1,
		key_type: "",
		limit: "100",
		reverse: false,
		show_payer: false,
	};
	try {
		const resp = await axios.post(req_url, payload)
		return resp;
	}
	catch(err) {
		console.log(err)
		index += 1
		return fetchRegenMode()
	}
}

module.exports = fetchRegenMode