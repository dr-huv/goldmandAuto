const axios = require("axios")
const endpoints = require("./endpoints.json")
let index = 0

const fetchPostData = async (payload) => {
  let req_url = endpoints[index > endpoints.length - 1 ? (index = 0) : index] + "/v1/chain/get_table_rows";
  try {
    const resp = await axios.post(req_url, payload);
    return resp;
  } catch (err) {
    index += 1;
    return fetchPostData(payload);
  }
};

module.exports = fetchPostData