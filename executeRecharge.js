const { exec } = require("child_process");

const executeRecharge = () => {
  exec("node fetchAmuletDuration.js", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

module.exports = executeRecharge
