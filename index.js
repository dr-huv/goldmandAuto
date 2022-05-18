const transact = require("./doTrx.js")
const setRandomInterval = require("./randomInterval.js")
const rechargeAmulet = require("./executeRecharge.js")
const checkMine = require("./lastMinedCheck")
// const fetchRegenMode = require("./regenModeCheck")
const swapMR = require("./autoSwapMR")
const landSwitchCheck = require("./landSwitch")

const doTasks = async () => {
	try {
		// const staminaData = await fetchRegenMode();
		// const regen = staminaData.data.rows[0].regen;
		// const extra_regen = staminaData.data.rows[0].extra_regen;
		// const last_update = staminaData.data.rows[0].last_update;
		// const max_stamina = staminaData.data.rows[0].max_stamina;
		// const extra_stamina = staminaData.data.rows[0].extra_stamina;
		// const stamina = staminaData.data.rows[0].stamina;
		// const hours_since = Math.floor(Date.now() / 1000 - last_update);
		// const current_stamina = (regen * 10 + extra_regen) * hours_since + stamina;
		// console.log(staminaData.data.rows)
		// if (!staminaData.data.rows[0].mode) {
			// console.log(staminaData.data.rows[0].stamina);
		await landSwitchCheck();
		await transact();
		await rechargeAmulet();
		await swapMR();
		// } else {
		// 	if ((max_stamina + extra_stamina) - current_stamina <= 0) {
		// 		console.log("here")
		// 		await transact();
     	// 		await rechargeAmulet();
		// 	} else {
		// 		console.log("in regen mode");
		// 		console.log(current_stamina)
			// }
		// }
	} catch (err){
		console.log(err)
	}
};
landSwitchCheck()
rechargeAmulet()
swapMR()
// checkMine()
// doTasks()

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

checkMine()
	.then((res) => {
	// console.log(res.data.rows[0]);
	time_left = - (Date.now() / 1000 - res.data.rows[0].last_mine);
	console.log(`Will mine after ${time_left} seconds hi`);
	delay(time_left * 1000)
		.then(() => {
			doTasks();
			console.log("oh no this happened");
			setRandomInterval(doTasks, 1000 * 9750, 1000 * 9760);
		})
		.catch((err) => console.log(err));
})
.catch((err) => console.log(err));
