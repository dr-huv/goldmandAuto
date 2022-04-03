const axios = require("axios");

const marketData = async () => {
	const response = await axios
		.get("https://wax.alcor.exchange/api/markets");
	return response;
}

marketData()
	.then((res) => {
		res.map(x => console.log(x))
		console.log(res)
	})
