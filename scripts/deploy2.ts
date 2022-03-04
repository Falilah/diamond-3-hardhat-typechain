/* global ethers */
/* eslint prefer-const: "off" */

import { ContractReceipt, Transaction } from "ethers";
import { TransactionDescription, TransactionTypes } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { DiamondCutFacet } from "../typechain-types";
import { getSelectors, FacetCutAction } from "./libraries/diamond";

let diamond: any = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export async function deployDiamond() {
  const accounts = await ethers.getSigners();
  const contractOwner = accounts[0];

  // deploy facets
  console.log("");
  console.log("Deploying facets");

  const cut = [];

  const Facet = await ethers.getContractFactory("Test3Facet");
  const facet = await Facet.deploy();
  await facet.deployed();

  cut.push({
    facetAddress: facet.address,
    action: FacetCutAction.Add,
    functionSelectors: getSelectors(facet),
  });

  // upgrade diamond with facets
  console.log("");
  console.log("Diamond Cut:", cut);
  const diamondCut = (await ethers.getContractAt(
    "IDiamondCut",
    diamond
  )) as DiamondCutFacet;

  // call to classwork function
  let functionCall = facet.interface.encodeFunctionData("classWork");
  let tx = await diamondCut.diamondCut(cut, diamond, functionCall);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deployDiamond = deployDiamond;
