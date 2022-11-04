import React from 'react'
import logo from './logo.svg'
import './App.css'
import {web3, StuContract, E20Contract, E721Contract} from "./utils/contract"
import {useEffect, useState} from 'react';
import { Card, Button, Modal } from 'antd';
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:7545'
const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)

class MakeProposal extends React.Component{
  state = {
    account : "0x0000000000000000000000000000000000000000",
    title : "The title of the proposal",
    content : "Input your proposal",
    balance : 0,
    souvenir: 0,
    list : [
      {
      id : -1,
      name : "edfg",
      content : "ewsr",
      proposer : " ",
      approval :0,
      disapproval : 0
      }
    ],
    HisList : [
      {
        id : -1,
        name : "edfg",
        content : "ewsr",
        proposer : "",
        approval :" "
    }
    ]
  }
  
  SetAccount = (accounts:any) =>{
      this.setState({
        account : accounts[0]
      })
  }

  Balances = async(accounts:any) =>{
    const balances = await E20Contract.methods.balanceOf(accounts).call()
    const souve = await E721Contract.methods.balanceOf(accounts).call()
    this.SetBalance(balances)
    this.SetSouvenir(souve)
  }

  SetSouvenir = (souve:any) =>{
    this.setState({
      souvenir : souve
    })
  }

  SetBalance = (balances:any) =>{
    this.setState({
      balance : balances
    })
  }

  onClickConnectWallet = async() =>{
    // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            this.SetAccount(accounts)
            
            this.Balances(accounts[0])
        } catch (error: any) {
            alert(error.message)
        }
  }

  TitleChange = (e:any) =>{
    this.setState({
      title : e.target.value
    })
  }

  ContextChange = (e:any) =>{
    this.setState({
      content : e.target.value
    })
  }

  Approve = async(item:any) =>{
    if(this.state.account === '0x0000000000000000000000000000000000000000') {
      alert('You have not connected wallet yet.')
      return
  }
    await E20Contract.methods.approve(StuContract.options.address, 99999999).send({
    from: this.state.account
  })
    const {id} = item
    await StuContract.methods.GiveAnApproval(id).send({
      from : this.state.account,
      gas : 3000000
    })
    const approval = await StuContract.methods.GetApprove(id).call()
    this.setState({
      list : this.state.list.map(item => {
        if(item.id === id){
          return{
            ...item,
            approval : approval
          }
        }
        else {
          return item
        }
      })
    })
  }

  Disapprove = async(item:any) =>{
    if(this.state.account === '0x0000000000000000000000000000000000000000') {
      alert('You have not connected wallet yet.')
      return
  }
    await E20Contract.methods.approve(StuContract.options.address, 99999999).send({
      from: this.state.account
    })
    const {id} = item
    await StuContract.methods.GiveAnDisapproval(id).send({
      from : this.state.account,
      gas : 3000000
    })
    const disapprovals = await StuContract.methods.GetDisapprove(id).call()
    this.setState({
      list : this.state.list.map(item => {
        if(item.id === id){
          return{
            ...item,
            disapproval : disapprovals
          }
        }
        else {
          return item
        }
      })
    })
  }

  Submit = async() =>{
    if(this.state.account === '0x0000000000000000000000000000000000000000') {
      alert('You have not connected wallet yet.')
      return
  }
    if(this.state.title === "The title of the proposal" || this.state.content === "Input your proposal")
    {
      alert("Please complete your proposal")
      return
    }
    if(StuContract){
      try{
        await E20Contract.methods.approve(StuContract.options.address, 99999999).send({
          from: this.state.account
      })
        const Ok = await StuContract.methods.GiveAProposal(this.state.title, this.state.content).send({
          from : this.state.account,
          gas:3000000
        })
      this.Balances(this.state.account)
      this.setState({
        title : "",
        content : ""
      })
      this.GetProposal()
      this.GetHis()
    } catch (error:any)
    {
      alert(error.message)
    }
  }
    else {
      alert('Contract not exists')
    }
}

  GetAirdrop = async() =>{
    if(this.state.account === '0x0000000000000000000000000000000000000000') {
      alert('You have not connected wallet yet.')
      return
  }

  if (E20Contract) {
      try {
          await E20Contract.methods.airdrop().send({
              from: this.state.account,
              gas : 3000000
          })
          this.Balances(this.state.account)
      } catch (error: any) {
          alert(error.message)
      }

  } else {
      alert('Contract not exists.')
  }
  }

  GetProposal = async() =>{
    if(this.state.account === '0x0000000000000000000000000000000000000000') {
      alert('You have not connected wallet yet.')
      return
  }
    var pro = await StuContract.methods.GetProposal().call();
    var ss = [];
    for(let i=0; i<pro.length; i++)
    {
      ss.push({id : pro[i][0], name : pro[i][1], content : pro[i][4], approval : pro[i][2], disapproval : pro[i][3], proposer : pro[i][5]})
    }
    this.setState({
      list : ss
    })
  }

  GetHis = async() =>{
    if(this.state.account === '0x0000000000000000000000000000000000000000') {
      alert('You have not connected wallet yet.')
      return
  }
    var pro = await StuContract.methods.GetHisProposal().call()
    var ss = [];
    for(let i=0; i<pro.length; i++)
    {
      var app = (pro[i][2] === '9999999999' && pro[i][3] === '9999999999') ? "Unknown" : ((pro[i][2]-pro[i][3] > 0) ? "Approve" : "Disapprove")
      ss.push({id : pro[i][0], name : pro[i][1], content : pro[i][4], approval : app, proposer : pro[i][5]})
    }
    this.setState({
      HisList : ss
    })
  }

  EndProposal = async() =>{
    if(this.state.account === '0x0000000000000000000000000000000000000000') {
      alert('You have not connected wallet yet.')
      return
  }
    await StuContract.methods.EndOfProposal().send({
      from : this.state.account,
      gas : 3000000
    })
    this.Balances(this.state.account)
    this.GetProposal()
    this.GetHis()
  }



  render() {
      return(
        <>
          <div className='header'>
          <p>当前用户：{this.state.account}</p>
          <p>当前用户积分：{this.state.balance}<p></p>当前用户纪念品：{this.state.souvenir}</p>
          <div>
            <button onClick={this.onClickConnectWallet}>连接</button>
          </div>
          <div>
            <button onClick={this.GetAirdrop}>领取新人积分</button>
          </div>
          </div>
          <div className='column'>
            <textarea
                cols={70}
                rows={4}
                placeholder = {this.state.title}
                className = "Title"
                onChange={this.TitleChange}
                />
            <p></p>
            <textarea
              cols={70}
              rows={8}
              placeholder = {this.state.content}
              className = "Content"
              onChange={this.ContextChange}
              />
          <p></p>
          <button className='button' onClick={this.Submit}>发起提案</button>
          </div>
          <div className='column'>
          <button className='button' onClick={this.GetHis}>获取历史提案</button>
          {
              this.state.HisList.filter(item => (item.id !== -1)).map(item => (
                <>
                <Card
                    title={item.name}
                    style={{
                        width: 300,
                    }}
                  >
                      <p>content : {item.content}</p>
                      <p>是否通过：{item.approval}</p>
                      <p>proposer: {item.proposer}</p>
                </Card>
                <br></br>
                </>
              ))
            }
          </div>
          <div className='column'>
              <button className="button" onClick={this.GetProposal}  >GetAllProposal</button>
              <button className="button" onClick={this.EndProposal}>EndProposal</button>
            {
              this.state.list.filter(item => (item.id !== -1)).map(item => (
                <Card
                    title={item.name}
                    style={{
                        width: 300,
                    }}
                  >
                  <div key={item.id} className="comment">
                      <p className="comment">title : {item.name}</p>
                      <p>content : {item.content}</p>
                      <p>proposer : {item.proposer}</p>
                      <button className='button' onClick={() =>this.Approve(item)}>approve: {item.approval}</button>
                      <span></span>
                      <button className='button' onClick={() =>this.Disapprove(item)}>disapprove: {item.disapproval}</button>
                  </div>
                </Card>
              ))
            }
          </div>
        </>
      )

  }
}

function App() {
  return (
    <>
    <MakeProposal></MakeProposal>
    </>
  );
}

export default App;
