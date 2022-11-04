import Addresses from './contract-address.json'
import StudentSocietyDAO from './StudentSocietyDAO.sol/StudentSocietyDAO.json'
import Stu20 from './StudentSocietyDAO.sol/MyERC20.json'
import Stu721 from './StudentSocietyDAO.sol/MyERC721.json'

const Web3 = require('web3');

// @ts-ignore
// 创建web3实例
// 可以阅读获取更多信息https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3
const provider = new Web3.providers.HttpProvider(
    "http://127.0.0.1:7545"
  );
let web3 = new Web3(provider)

// 修改地址为部署的合约地址
const StuAddress = Addresses.StudentSocietyDAO
const StuErc20Add = Addresses.ERC20
const StuErc721Add = Addresses.ERC721
const StuABI = StudentSocietyDAO.abi
const Stu20ABI = Stu20.abi
const Stu721ABI = Stu721.abi
// 获取合约实例
const StuContract = new web3.eth.Contract(StuABI, StuAddress);
const E20Contract = new web3.eth.Contract(Stu20ABI, StuErc20Add);
const E721Contract = new web3.eth.Contract(Stu721ABI, StuErc721Add);


// 导出web3实例和其它部署的合约
export {web3, StuContract, E20Contract, E721Contract}