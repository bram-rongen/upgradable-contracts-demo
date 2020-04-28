const Web3 = require("web3");
const {
  ZWeb3,
  ProxyAdminProject,
  Contracts,
} = require("@openzeppelin/upgrades");

const web3 = new Web3("http://localhost:7545");

async function main() {
  // Set up web3 object, connected to the local development network, initialize the Upgrades library
  ZWeb3.initialize(web3.currentProvider);

  // Take the first account ganache returns as the from account.
  const [from] = await ZWeb3.eth.getAccounts();

  // Create an OpenZeppelin Admin project
  const project = new ProxyAdminProject("MyDemoProject", null, null, {
    from,
    gas: 1e6,
    gasPrice: 1e9,
  });

  // Deploy an instance of Box
  console.log("Creating the first upgradeable instance of Box...");
  const boxContract = Contracts.getFromLocal("Box");
  let firstBoxProxy = await project.createProxy(boxContract, {
    initArgs: [42],
  });

  console.log(project);
  console.log("Creating the second upgradeable instance of Box...");
  let secondBoxProxy = await project.createProxy(boxContract, {
    initArgs: [42],
  });

  await printProxy("First", firstBoxProxy);
  await printProxy("Second", secondBoxProxy);

  console.log(
    "You'll notice the same implementation address but differen proxy addresses.",
    "\n",
    "Both point to the same implementation.",
    "\n"
  );

  console.log(
    "\n",
    "The admin contract is created at",
    project.proxyAdmin.address
  );

  console.log("Upgrade the first to Box2...");
  const boxContract2 = Contracts.getFromLocal("Box2");

  firstBoxProxy = await project.upgradeProxy(
    firstBoxProxy.options.address,
    boxContract2
  );

  await printProxy("First", firstBoxProxy);
  await printProxy("Second", secondBoxProxy);

  console.log(
    "You'll notice this time the implementation addresses are different.",
    "\n",
    "And the value retrieved from the first version is doubled because of the new contract.",
    "\n"
  );

  secondBoxProxy = await project.upgradeProxy(
    secondBoxProxy.options.address,
    boxContract2
  );

  await printProxy("First", firstBoxProxy);
  await printProxy("Second", secondBoxProxy);
}

// We're abusing the fact that the implementation address is always stored in the same storage address.
// You could also call the admin-contracts
async function getImplementationAddress(proxyAddress) {
  return web3.eth.getStorageAt(
    proxyAddress,
    `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`
  );
}

async function printProxy(name, proxy) {
  console.log(name, "proxy address:", proxy.options.address);
  console.log(
    name,
    "implementation address:",
    await getImplementationAddress(proxy.options.address)
  );
  console.log(
    name,
    "vault value is",
    (await proxy.methods.retrieve().call()).toString()
  );
}

main();
