const main = async () => {
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying the contract with the address ${deployer.address}`);
  console.log(
    `Account Balance: ${await ethers.provider.getBalance(deployer.address)}`
  );

  const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
  const crowdFunding = await CrowdFunding.deploy();

  console.log("CrowdFunding Address: ", crowdFunding.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
