const axios = require("axios");
const endpoints = require("./endpoints.json");

let index = 0

payload = {
  json: true,
  code: "goldmandgame",
  scope: "goldmandgame",
  table: "miners",
  lower_bound: "viralclover1",
  upper_bound: "viralclover1",
  limit: 1,
  reverse: false,
  show_payer: false,
  key_type: "name",
};

const checkMine = async () => {
  let req_url = endpoints[index > endpoints.length - 1 ? (index = 0) : index] +"/v1/chain/get_table_rows";
	try {
		const resp = await axios.post(req_url, payload)
		return resp
	}
	catch (err) {
    console.log(err)
    index += 1
    return checkMine()
	}
}

module.exports = checkMine