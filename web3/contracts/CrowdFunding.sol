// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CrowdFunding {
    uint public numberOfCampaigns = 0;
    uint numberofOnGoingCampaigns = 0;
    uint numberofClosedCampaigns = 0;
    uint public numberOfOrganizers = 0;

    struct Campaign {
        string title;
        string description;
        string[] imageHashs;
        uint startDate;
        uint deadline;
        uint target;
        uint amountCollected;
        uint[] donations;
        address[] donors;
        address organizer;
        bool isComplete;
    }

    struct Organizer {
        address organizerAddress;
        string name;
        string contactAddress;
        string emailId;
        string imageHash;
        bool isValid;
    }

    event OrganizerCreated(address organizerAddress);
    event CampaignCreated(uint campaignId);
    event CampaignComplete(uint campaignId);
    event UpdateCampaign(uint campaignId, string property);

    mapping(uint => Campaign) public campaigns;
    mapping(address => Organizer) public organizers;

    modifier onlyOrganizer() {
        require(
            organizers[msg.sender].isValid,
            "Only registered organiser is allowed to create campaign!"
        );
        _;
    }

    modifier validOrganizer(uint _id) {
        require(
            campaigns[_id].organizer == msg.sender,
            "Only organizer of particular campaign can access!"
        );
        _;
    }

    modifier onlyOnGoingCampaign(uint _id) {
        require(campaigns[_id].isComplete == false, "Campaign has closed!");
        _;
    }

    function createOrganizer(
        string memory _name,
        string memory _contactAddress,
        string memory _emailId,
        string memory _imageHash
    ) public {
        require(
            organizers[msg.sender].isValid == false,
            "An organizer exist in this address."
        );
        Organizer storage organiser = organizers[msg.sender];

        organiser.organizerAddress = msg.sender;
        organiser.name = _name;
        organiser.contactAddress = _contactAddress;
        organiser.emailId = _emailId;
        organiser.imageHash = _imageHash;
        organiser.isValid = true;

        numberOfOrganizers++;

        emit OrganizerCreated(msg.sender);
    }

    function createCampaign(
        string memory _title,
        string memory _description,
        string[] memory _imageHashs,
        uint _deadline,
        uint _target
    ) public onlyOrganizer {
        require(
            _deadline > block.timestamp,
            "The deadline should be a date in the future!"
        );

        Campaign storage campaign = campaigns[numberOfCampaigns];

        campaign.title = _title;
        campaign.description = _description;
        campaign.startDate = block.timestamp;
        campaign.imageHashs = _imageHashs;
        campaign.deadline = _deadline;
        campaign.target = _target;
        campaign.organizer = msg.sender;
        campaign.isComplete = false;

        emit CampaignCreated(numberOfCampaigns);

        numberOfCampaigns++;
        numberofOnGoingCampaigns++;
    }

    function donateToCampaign(
        uint _id
    ) public payable onlyOnGoingCampaign(_id) {
        uint amount = msg.value;

        Campaign storage campaign = campaigns[_id];

        campaign.donors.push(msg.sender);
        campaign.donations.push(amount);

        (bool sent, ) = payable(address(this)).call{value: amount}("");

        if (!sent) {
            campaign.amountCollected = campaign.amountCollected + amount;
        }

        if (campaign.amountCollected >= campaign.target) {
            campaignComplete(_id);
        }
    }

    function getDonors(
        uint _id
    ) public view returns (address[] memory, uint[] memory) {
        return (campaigns[_id].donors, campaigns[_id].donations);
    }

    function getOrganizer(
        address organizerAddress
    ) public view returns (Organizer memory) {
        return organizers[organizerAddress];
    }

    function getAllOnGoingCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allOnGoingCampaigns = new Campaign[](
            numberofOnGoingCampaigns
        );

        for (uint i = 0; i < numberOfCampaigns; i++) {
            if (campaigns[i].isComplete == false) {
                Campaign memory item = campaigns[i];
                allOnGoingCampaigns[i] = item;
            }
        }

        return allOnGoingCampaigns;
    }

    function getAllCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for (uint i = 0; i < numberOfCampaigns; i++) {
            Campaign memory item = campaigns[i];
            allCampaigns[i] = item;
        }

        return allCampaigns;
    }

    function getAllClosedCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allClosedCampaigns = new Campaign[](
            numberofClosedCampaigns
        );

        for (uint i = 0; i < numberOfCampaigns; i++) {
            if (campaigns[i].isComplete == true) {
                Campaign memory item = campaigns[i];
                allClosedCampaigns[i] = item;
            }
        }

        return allClosedCampaigns;
    }

    function campaignComplete(uint _id) private {
        Campaign storage campaign = campaigns[_id];
        campaign.isComplete = true;

        (bool sent, ) = payable(campaign.organizer).call{
            value: campaign.amountCollected
        }("");

        if (sent) {
            numberofClosedCampaigns += 1;
            numberofOnGoingCampaigns--;
        }

        emit CampaignComplete(_id);
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }
}
