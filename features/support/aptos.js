const { Aptos, AptosConfig, Network } = require("@aptos-labs/ts-sdk");

const aptosConfig = new AptosConfig({ network: Network.LOCAL });
const aptos = new Aptos(aptosConfig);

module.exports = aptos; 