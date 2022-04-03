const transact = require("./doTrx.js")
const setRandomInterval = require("./randomInterval.js")
const rechargeAmulet = require("./fetchAmuletDuration.js")
const checkMine = require("./lastMinedCheck")

const doTasks = () => {
  transact();
  rechargeAmulet();
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


checkMine()
	.then((res) => {
		time_left = 4075 - (Date.now() / 1000 - res.data.rows[0].last_mine);
		console.log(`Will mine after ${time_left} seconds hi`)
		delay(time_left * 1000).then(() =>
			doTasks()
		)
	})

console.log("oh no this happened");
setRandomInterval(doTasks, 1000 * 4050, 1000 * 4075);
