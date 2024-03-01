const fs = require('fs');
const yaml = require('js-yaml');

const pathToYaml = 'move/.aptos/config.yaml'

// Function to parse the YAML file and return the account key
function getAccountKey(filePath = pathToYaml) {
    try {
        // Read the YAML file
        const fileContents = fs.readFileSync(filePath, 'utf8');
        
        // Parse the YAML file
        const data = yaml.load(fileContents);
        
        // Extract the account key
        const accountKey = data.profiles.default.account;

        // Remove leading zeros from the account key
        const cleanedAccountKey = accountKey.replace(/^0+/, '');

        const accountAddr = `0x${cleanedAccountKey}`

        return accountAddr;
    } catch (e) {
        console.error(e);
    }
}

module.exports = {getAccountKey}