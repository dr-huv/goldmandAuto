const axios = require("axios");

url = "https://wax.dapplica.io/v1/chain/get_table_rows"
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
	try {
		const resp = await axios.post(url, payload)
		return resp
	}
	catch (err) {
		console.log(err)
	}
}

module.exports = checkMine