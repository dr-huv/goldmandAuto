const axios = require("axios")
const endpoints = require("./endpoints.json")
let index = 0

const fetchGetData = async (req_url) => {
  req_url =req_url ||endpoints[index > endpoints.length - 1 ? (index = 0) : index] +"/v1/chain/get_table_rows";
  try {
    const resp = await axios.get(req_url);
    return resp;
  } catch (err) {
    index += 1;
    return fetchGetData(req_url);
  }
};

module.exports = fetchGetData