const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

describe("crowdfunding", () => {
  let owner, organizer1, organizer2, donor;

  before(async () => {
    [organizer1, organizer2, donor] = await ethers.getSigners();
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    crowdFunding = await CrowdFunding.deploy();
  });

  describe("Should create a new organizer.", () => {
    it("Should create an organiser.", async () => {
      const tx = await crowdFunding.createOrganizer(
        "Anoop Raju",
        "BDB202 Meenachil Hostel",
        "anoop2019@iiitkottayam.ac.in",
        "https://web-static.wrike.com/cdn-cgi/image/width=880,format=auto,q=80/blog/content/uploads/2022/06/iStock-1322301439.jpg?av=c54f6504d1bbea32efb28835736b9900"
      );
      await tx.wait();

      const organiserData = await crowdFunding.getOrganizer(organizer1.address);

      expect(organiserData.organizerAddress).to.be.eq(
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      );
      expect(organiserData.name).to.be.eq("Anoop Raju");
      expect(organiserData.contactAddress).to.be.eq("BDB202 Meenachil Hostel");
      expect(organiserData.emailId).to.be.eq("anoop2019@iiitkottayam.ac.in");
      expect(organiserData.imageHash).to.be.eq(
        "https://web-static.wrike.com/cdn-cgi/image/width=880,format=auto,q=80/blog/content/uploads/2022/06/iStock-1322301439.jpg?av=c54f6504d1bbea32efb28835736b9900"
      );
      expect(organiserData.isValid).to.be.eq(true);
    });

    it("Should return the number of organizers (1).", async () => {
      const numberOfOrganizers = await crowdFunding.numberOfOrganizers();
      expect(numberOfOrganizers).to.be.eq(1);
    });

    it("Should emit a create organizer event.", async () => {
      await expect(
        crowdFunding
          .connect(organizer2)
          .createOrganizer(
            "Anoop Raju",
            "BDB202 Meenachil Hostel",
            "anoop2019@iiitkottayam.ac.in",
            "https://web-static.wrike.com/cdn-cgi/image/width=880,format=auto,q=80/blog/content/uploads/2022/06/iStock-1322301439.jpg?av=c54f6504d1bbea32efb28835736b9900"
          )
      )
        .to.emit(crowdFunding, "OrganizerCreated")
        .withArgs(organizer2.address);
    });

    it("Should return the number of organizers (2).", async () => {
      const numberOfOrganizers = await crowdFunding.numberOfOrganizers();
      expect(numberOfOrganizers).to.be.eq(2);
    });

    it("Should get organizer data", async () => {
      const organizerData = await crowdFunding.organizers(organizer1.address);
      expect(organizerData.name).to.be.eq("Anoop Raju");
      expect(organizerData.contactAddress).to.be.eq("BDB202 Meenachil Hostel");
      expect(organizerData.emailId).to.be.eq("anoop2019@iiitkottayam.ac.in");
      expect(organizerData.imageHash).to.be.eq(
        "https://web-static.wrike.com/cdn-cgi/image/width=880,format=auto,q=80/blog/content/uploads/2022/06/iStock-1322301439.jpg?av=c54f6504d1bbea32efb28835736b9900"
      );
      expect(organizerData.organizerAddress).to.be.eq(organizer1.address);
      expect(organizerData.isValid).to.be.eq(true);
    });

    it("Should get revert if the address is already in use.", async () => {
      await expect(
        crowdFunding
          .connect(organizer2)
          .createOrganizer(
            "Anoop Raju",
            "BDB202 Meenachil Hostel",
            "anoop2019@iiitkottayam.ac.in",
            "https://web-static.wrike.com/cdn-cgi/image/width=880,format=auto,q=80/blog/content/uploads/2022/06/iStock-1322301439.jpg?av=c54f6504d1bbea32efb28835736b9900"
          )
      ).to.be.revertedWith("An organizer exist in this address.");
    });
  });

  describe("Campaign creation.", () => {
    it("Should create a new campaign.", async () => {
      const tx = await crowdFunding.createCampaign(
        "Rum Party",
        "Campaign to get a bottle of old monk.",
        ["https://img.thewhiskyexchange.com/900/rum_old5.jpg"],
        1674702422,
        ethers.utils.parseEther("0.1")
      );
      await tx.wait();

      const campaignData = await crowdFunding.campaigns(0);

      expect(campaignData.title).to.be.eq("Rum Party");
      expect(campaignData.description).to.be.eq(
        "Campaign to get a bottle of old monk."
      );
      expect(campaignData.deadline).to.be.eq(1674702422);
      expect(campaignData.target).to.be.eq("100000000000000000");
      expect(campaignData.amountCollected).to.be.eq(0);
      expect(campaignData.organizer).to.be.eq(
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      );
      expect(campaignData.isComplete).to.be.eq(false);
    });

    it("Should return currently created campaigns.", async () => {
      const campaign = await crowdFunding.campaigns(0);

      expect(campaign.title).to.be.eq("Rum Party");
      expect(campaign.description).to.be.eq(
        "Campaign to get a bottle of old monk."
      );
      expect(campaign.deadline).to.be.eq("1674702422");
      expect(ethers.utils.formatEther(campaign.target)).to.be.eq("0.1");
      expect(campaign.amountCollected).to.be.eq("0");
      expect(campaign.organizer).to.be.eq(organizer1.address);
      expect(campaign.isComplete).to.be.eq(false);
    });

    it("Should emit a CampaignCreated event.", async () => {
      await expect(
        crowdFunding.createCampaign(
          "Rum Party 2",
          "Campaign to get a bottle of old monk.",
          ["https://img.thewhiskyexchange.com/900/rum_old5.jpg"],
          1674702422,
          ethers.utils.parseEther("0.1")
        )
      )
        .to.emit(crowdFunding, "CampaignCreated")
        .withArgs(1);
    });

    it("Should revert if the deadline is before present time.", async () => {
      await expect(
        crowdFunding.createCampaign(
          "Rum Party 2",
          "Campaign to get a bottle of old monk.",
          ["https://img.thewhiskyexchange.com/900/rum_old5.jpg"],
          1674545009,
          ethers.utils.parseEther("0.1")
        )
      ).to.be.revertedWith("The deadline should be a date in the future!");
    });

    it("Should return the number of campaigns.", async () => {
      const numberOfCampaigns = await crowdFunding.numberOfCampaigns();
      expect(numberOfCampaigns).to.be.eq(2);
    });
  });

  describe("Should return campaigns data.", () => {
    it("Should return all campaigns.", async () => {
      const allcampaigns = await crowdFunding.getAllCampaigns();

      expect(allcampaigns[0].title).to.be.eq("Rum Party");
      expect(allcampaigns[0].description).to.be.eq(
        "Campaign to get a bottle of old monk."
      );
      expect(allcampaigns[0].imageHashs[0]).to.be.eq(
        "https://img.thewhiskyexchange.com/900/rum_old5.jpg"
      );
      expect(allcampaigns[0].deadline).to.be.eq("1674702422");
      expect(ethers.utils.formatEther(allcampaigns[0].target)).to.be.eq("0.1");
      expect(allcampaigns[0].amountCollected).to.be.eq("0");
      expect(allcampaigns[0].donations.length).to.be.eq(0);
      expect(allcampaigns[0].donors.length).to.be.eq(0);
      expect(allcampaigns[0].organizer).to.be.eq(organizer1.address);
      expect(allcampaigns[0].isComplete).to.be.eq(false);

      expect(allcampaigns[1].title).to.be.eq("Rum Party 2");
      expect(allcampaigns[1].description).to.be.eq(
        "Campaign to get a bottle of old monk."
      );
      expect(allcampaigns[1].imageHashs[0]).to.be.eq(
        "https://img.thewhiskyexchange.com/900/rum_old5.jpg"
      );
      expect(allcampaigns[1].deadline).to.be.eq("1674702422");
      expect(ethers.utils.formatEther(allcampaigns[0].target)).to.be.eq("0.1");
      expect(allcampaigns[1].amountCollected).to.be.eq("0");
      expect(allcampaigns[1].donations.length).to.be.eq(0);
      expect(allcampaigns[1].donors.length).to.be.eq(0);
      expect(allcampaigns[1].organizer).to.be.eq(organizer1.address);
      expect(allcampaigns[1].isComplete).to.be.eq(false);
    });

    it("Should return all ongoing campaigns.", async () => {
      const allOnGoingCampaigns = await crowdFunding.getAllOnGoingCampaigns();

      expect(allOnGoingCampaigns.length).to.be.eq(2);
      expect(allOnGoingCampaigns[0].title).to.be.eq("Rum Party");
      expect(allOnGoingCampaigns[0].description).to.be.eq(
        "Campaign to get a bottle of old monk."
      );
      expect(allOnGoingCampaigns[0].imageHashs[0]).to.be.eq(
        "https://img.thewhiskyexchange.com/900/rum_old5.jpg"
      );
      expect(allOnGoingCampaigns[0].deadline).to.be.eq("1674702422");
      expect(ethers.utils.formatEther(allOnGoingCampaigns[0].target)).to.be.eq(
        "0.1"
      );
      expect(allOnGoingCampaigns[0].amountCollected).to.be.eq("0");
      expect(allOnGoingCampaigns[0].donations.length).to.be.eq(0);
      expect(allOnGoingCampaigns[0].donors.length).to.be.eq(0);
      expect(allOnGoingCampaigns[0].organizer).to.be.eq(organizer1.address);
      expect(allOnGoingCampaigns[0].isComplete).to.be.eq(false);

      expect(allOnGoingCampaigns[1].title).to.be.eq("Rum Party 2");
      expect(allOnGoingCampaigns[1].description).to.be.eq(
        "Campaign to get a bottle of old monk."
      );
      expect(allOnGoingCampaigns[1].imageHashs[0]).to.be.eq(
        "https://img.thewhiskyexchange.com/900/rum_old5.jpg"
      );
      expect(allOnGoingCampaigns[1].deadline).to.be.eq("1674702422");
      expect(ethers.utils.formatEther(allOnGoingCampaigns[0].target)).to.be.eq(
        "0.1"
      );
      expect(allOnGoingCampaigns[1].amountCollected).to.be.eq("0");
      expect(allOnGoingCampaigns[1].donations.length).to.be.eq(0);
      expect(allOnGoingCampaigns[1].donors.length).to.be.eq(0);
      expect(allOnGoingCampaigns[1].organizer).to.be.eq(organizer1.address);
      expect(allOnGoingCampaigns[1].isComplete).to.be.eq(false);
    });

    it("Should return all closed campaigns.", async () => {
      const allClosedCampaigns = await crowdFunding.getAllClosedCampaigns();

      expect(allClosedCampaigns.length).to.be.eq(0);
    });
  });

  describe("Donations & donors", () => {
    it("Should return the donors & donations recived for campaign Old Monk (Before Donation).", async () => {
      const [donors, donations] = await crowdFunding.getDonors(0);

      expect(donors.length).to.be.eq(0);
      expect(donations.length).to.be.eq(0);
    });

    it("Should donate 0.05 ether for campaign 'old monk'.", async () => {
      const donation = await crowdFunding.donateToCampaign(0, {
        value: ethers.utils.parseUnits("0.05", "ether"),
      });
      await donation.wait();

      const [donors, donations] = await crowdFunding.getDonors(0);

      expect(donors[0]).to.be.eq(organizer1.address);
      expect(ethers.utils.formatEther(donations[0])).to.be.eq("0.05");
    });

    it("Should return the donors & donations recived for campaign Old Monk (After Donation).", async () => {
      const [donors, donations] = await crowdFunding.getDonors(0);
      expect(donors.length).to.be.eq(1);
      expect(donations.length).to.be.eq(1);
    });

    it("Should return the current contract balance (should be equal to 0.05 ether).", async () => {
      const balance = await crowdFunding.getContractBalance();
      expect(ethers.utils.formatEther(balance)).to.be.eq("0.05");
    });

    it("Should return all closed campaigns.", async () => {
      const getAllClosedCampaigns = await crowdFunding.getAllClosedCampaigns();

      expect(getAllClosedCampaigns.length).to.be.eq(0);
    });
  });

  describe("Campaign Complete", () => {
    it("Should return the contract balance", async () => {
      const contractBalance = await crowdFunding.getContractBalance();
      expect(ethers.utils.formatEther(contractBalance)).to.be.eq("0.05");
    });

    it("Should donate 1 ether for campaign 'old monk'.", async () => {
      const balance = await ethers.provider.getBalance(organizer1.address);

      const donation = await crowdFunding.connect(donor).donateToCampaign(0, {
        value: ethers.utils.parseUnits("1", "ether"),
      });
      await donation.wait();

      const afterBalance = await ethers.provider.getBalance(organizer1.address);
      expect(afterBalance).to.be.greaterThan(balance);
    });

    it("Should return the contract balance", async () => {
      const contractBalance = await crowdFunding.getContractBalance();
      expect(ethers.utils.formatEther(contractBalance)).to.be.eq("0.0");
    });

    it("Should return all closed campaigns.", async () => {
      const allClosedCampaigns = await crowdFunding.getAllClosedCampaigns();

      expect(allClosedCampaigns.length).to.be.eq(1);
      expect(allClosedCampaigns[0].title).to.be.eq("Rum Party");
      expect(allClosedCampaigns[0].description).to.be.eq(
        "Campaign to get a bottle of old monk."
      );
      expect(allClosedCampaigns[0].imageHashs[0]).to.be.eq(
        "https://img.thewhiskyexchange.com/900/rum_old5.jpg"
      );
      expect(allClosedCampaigns[0].deadline).to.be.eq("1674702422");
      expect(ethers.utils.formatEther(allClosedCampaigns[0].target)).to.be.eq(
        "0.1"
      );
      expect(allClosedCampaigns[0].amountCollected).to.be.eq(
        "1050000000000000000"
      );
      expect(allClosedCampaigns[0].donations.length).to.be.eq(2);
      expect(allClosedCampaigns[0].donors.length).to.be.eq(2);
      expect(allClosedCampaigns[0].organizer).to.be.eq(organizer1.address);
      expect(allClosedCampaigns[0].isComplete).to.be.eq(true);
    });
  });
});
