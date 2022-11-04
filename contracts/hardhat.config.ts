import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'HTTP://127.0.0.1:7545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0x1e7b498268cad86a567808d33ff459e3815668fe8a556b59dc139a90cba88cf0',
        '0x41c88f9ec4f7244ef316403cd1c97915d475699cce4e85ea189728a2dd6888b7',
        '0xebbb57126a3ea47d7f4d526f1e5194b40f60cc6409b1b1e988735c867aae5b50',
        '0xd10264e2d3e557245861f1e4cb9358a2301af67b9364307d55cfd1155fa44100',
        '0x75eb7d492bbe83f8c256afac15715fa75857af7015af37d2aab519d6880dc564'
      ]
    },
  },
};

export default config;
