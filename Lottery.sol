// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lottery {
    address public manager;
    address payable[] public players;
    address payable public winner;  // ✅ Make winner public
    bool public isComplete;
    bool public claimed;

    constructor() {
        manager = msg.sender;
        isComplete = false;
        claimed = false;
    }

    modifier restricted() {
        require(msg.sender == manager, "Only manager can call this");
        _;
    }

    function getManager() public view returns (address) {
        return manager;
    }

    function getWinner() public view returns (address) {
        return winner;
    }

    function status() public view returns (bool) {
        return isComplete;
    }

    function enter() public payable {
        require(msg.value >= 0.001 ether, "Minimum entry fee is 0.001 ETH");
        require(!isComplete, "Lottery is already completed");
        players.push(payable(msg.sender));
    }

    function pickWinner() public restricted {
        require(players.length > 0, "No players in the lottery");
        require(!isComplete, "Lottery is already completed");

        uint index = randomNumber() % players.length;
        winner = players[index];
        isComplete = true;
    }

    function claimPrize() public {
        require(msg.sender == winner, "Only winner can claim the prize");
        require(isComplete, "Lottery not completed yet");
        require(!claimed, "Prize already claimed");

        (bool success, ) = winner.call{value: address(this).balance}("");  // ✅ Safe transfer
        require(success, "Transfer failed");

        claimed = true;
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    function resetLottery() public restricted {
        require(isComplete && claimed, "Cannot reset until prize is claimed");

        winner = payable(address(0));  
          players = new address payable[](0);  // ✅D: Correct array reset
        isComplete = false;
        claimed = false;
    }

    function randomNumber() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, players.length)));
    }
}
