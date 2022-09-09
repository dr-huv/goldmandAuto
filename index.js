const transact = require("./doTrx.js")
const setRandomInterval = require("./randomInterval.js")
const rechargeAmulet = require("./executeRecharge.js")
const checkMine = require("./lastMinedCheck")
// const fetchRegenMode = require("./regenModeCheck")
const swapMR = require("./autoSwapMR")
const landSwitchCheck = require("./landSwitch")

const doTasks = async () => {
	try {
		await landSwitchCheck();
		await transact();
		await rechargeAmulet();
		await swapMR();
		// } else {
		// 	if ((max_stamina + extra_stamina) - current_stamina <= 0) {
		// 		console.log("here")
		// 		await transact();
     	//
	} catch (err){
		console.log(err)
	}
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const doActions = async () => {
	while (1) {
		await landSwitchCheck()
		await delay(1000 * 10)
		rechargeAmulet()
		await delay(1000 * 10);
		await swapMR()
		const rawMineData = await checkMine();
		time_left = -(Date.now() / 1000 - rawMineData.data.rows[0].last_mine);
		expected_time = new Date(Date.now() + time_left*1000).toLocaleTimeString("en-US");
		// console.log(expected_time)
		console.log(`Will mine after ${Math.floor(time_left / 3600)}hr ${Math.floor((time_left%3600)/60)}min ${Math.floor((time_left%3600)%60)}sec at ${expected_time}`);
		await delay(1000 * time_left);
		await transact()
	}
}

doActions()

// checkMine()
// 	.then((res) => {
// 	// console.log(res.data.rows[0]);
// 	time_left = - (Date.now() / 1000 - res.data.rows[0].last_mine);
// 	console.log(`Will mine after ${time_left} seconds hi`);
// 	delay(time_left * 1000)
// 		.then(() => {
// 			doTasks();
// 			console.log("oh no this happened");
// 			setRandomInterval(doTasks, 1000 * 9750, 1000 * 9760);
// 		})
// 		.catch((err) => console.log(err));
// })
// .catch((err) => console.log(err));