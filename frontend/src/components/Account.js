import React, { Component } from 'react'
import SideBar from './navigation/SideBar'
import { isSessionActive, getSessionCookie, getCurrentUser, removeSessionCookie } from './util/Session'
import { Link } from 'react-router-dom'
import HeaderCard from './elements/HeaderCard'

export default class Account extends Component {

    constructor(props) {
        super(props)
        this.state = {
            email: '',
            firstName: '',
            lastName: '',
            forwardAddress: ''
        }
    }
    
    componentDidMount() {
        isSessionActive()
        .then((session) => {
            if (!session) {
                document.body.classList.remove('stripe-from-left')
                document.body.classList.remove('stripe-from-right')
                return (window.location.replace('/login'))
            } else {
                getCurrentUser()
                .then((user) => {
                    console.log(user)
                    if (user == null) {
                        removeSessionCookie()
                        window.location.replace('/login')
                    } else {
                        this.setState({
                            email: user.email,
                            firstName: user.first_name,
                            lastName: user.last_name,
                            forwardAddress: user.forward_address
                        })
                        document.body.classList.remove('stripe-from-left')
                        document.body.classList.add('stripe-from-right')
                    }
                })                    
            }
        })
    }

    render = function() {
        return (
            <div className="flex">
                <SideBar page="account" />
                <div className="flex-col flex-grow max-h-full min-w-6/7">
                    <div className="min-w-full">
                        <HeaderCard displayText="Account Information" />
                    </div>
                    <div className="shadow rounded bg-white pt-4 pb-14 px-8 m-10 pb-8 text-center overflow-y-scroll max-h-5/7 max-w-4/7 ml-auto mr-auto" style={{minWidth: "350px"}}>

                        <p className="font-bold pb-2">Contact Information</p>
                        <div className="flex flex-row flex-grow py-4">
                            <p className="w-1/2">First Name</p>
                            <div className="bg-gray-400 break-words text-gray-700 w-1/2 px-8 py-2 rounded">
                                {this.state.firstName}
                            </div>
                        </div>
                        <div className="flex flex-row flex-grow py-4">
                            <p className="w-1/2">Last Name</p>
                            <div className="bg-gray-400 break-words text-gray-700 w-1/2 px-8 py-2 rounded">
                                {this.state.lastName}
                            </div>
                        </div>
                        <div className="flex flex-row flex-grow py-4">
                            <p className="w-1/2">Email</p>
                            <div className="bg-gray-400 break-words text-gray-700 w-1/2 px-8 py-2 rounded">
                                {this.state.email}
                            </div>
                        </div>
                        <div className="flex flex-row flex-grow py-4">
                            <p className="w-1/2">Token</p>
                            <div className="bg-gray-400 break-words text-gray-700 w-1/2 px-8 py-2 rounded">
                                {getSessionCookie()}
                            </div>
                        </div>
                        <div className="flex flex-row flex-grow py-2">
                            <p className="w-full"><Link to={"/changepw/" + getSessionCookie()} className="text-green-500 font-bold">Change Your Password</Link></p>
                        </div>
                    </div>
                    <div className="shadow rounded bg-white pt-4 pb-14 px-8 m-10 pb-8 text-center max-h-5/7 max-w-4/7 ml-auto mr-auto" style={{minWidth: "350px"}}>
                        <p className="font-bold pb-2">Nano Information</p>
                        <div className="flex flex-row justify-between flex-grow py-4">
                            <p className="w-1/2">Forwarding Address</p>
                            <div className="bg-gray-400 break-words text-gray-700 w-1/2 px-8 py-2 rounded" style={{maxWidth: "500px"}}>
                                {this.state.forwardAddress ? <a target="_blank" href={"https://nanocrawler.cc/explorer/account/" + this.state.forwardAddress} className="break-words"> <div className="inline"> {this.state.forwardAddress.substring(0, 5)} </div> <div className="inline font-bold" style={{color: "#2eb34c"}}>{this.state.forwardAddress.substring(5, 9)}</div> <div className="inline"> {this.state.forwardAddress.substring(9, this.state.forwardAddress.length - 5)}</div><div className="inline font-bold" style={{color: "#6b46c1"}}>{this.state.forwardAddress.substring(this.state.forwardAddress.length - 5, this.state.forwardAddress.length )}</div></a> : "" }
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        )
    }
}