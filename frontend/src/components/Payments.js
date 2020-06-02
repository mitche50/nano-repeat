import React, { Component, Fragment } from 'react'
import SideBar from './navigation/SideBar'
import { isSessionActive, getUserTransactions, getSubscriptionFromAddress } from './util/Session'
import HeaderCard from './elements/HeaderCard'
import PaymentRow from './elements/PaymentRow'
import LoadingPaymentRow from './elements/LoadingPaymentRow'

export default class Payments extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            txs: {'transactions': []},
            subscriptionArray: [],
            loadingArray: [<LoadingPaymentRow />, <LoadingPaymentRow />, <LoadingPaymentRow />, <LoadingPaymentRow />, <LoadingPaymentRow />, <LoadingPaymentRow />]
        }
    }

    getData = async (list) => {
        return Promise.all(list.map(async tx => {
            return getSubscriptionFromAddress(tx.receiver)
                .then((subscription) => {
                    console.log(subscription)
                    var time_sent = Date.parse(tx.time_sent.replace(' ', 'T'))
                    var subscriptionId = subscription.subscriptions.id
                    var cost = parseFloat(subscription.subscriptions.cost)
                    var payment_amount = parseFloat(tx.amount).toFixed(4)
                    if (payment_amount === 0){
                        return <Fragment/>
                    }
                    var status = cost > payment_amount ? "underpayment" : "success"
                    return <PaymentRow 
                        amount={(payment_amount*1).toString()} 
                        subscriberId={subscription.subscriptions.subscriber_id} 
                        sent={time_sent} 
                        status={status} 
                        subscriptionId={subscriptionId.substring(0,8) + "..." + subscriptionId.substring(subscriptionId.length - 12, subscriptionId.length)}/>
                })
            
        }))
      }

    componentDidMount() {
        isSessionActive()
        .then(async (session) => {
            if (!session) {
                document.body.classList.remove('stripe-from-left')
                document.body.classList.remove('stripe-from-right')
                return (window.location.replace('/login'))
            } else {
                let txs = await getUserTransactions()
                let subscriptionArray = []
                this.getData(txs.transactions)
                    .then(subscriptionArray => {
                        console.log(subscriptionArray)
                        this.setState({
                            subscriptionArray: subscriptionArray
                        })
                    })

                this.setState({
                    txs: txs,
                    subscriptionArray: subscriptionArray,
                    loading: false
                })
                document.body.classList.remove('stripe-from-left')
                document.body.classList.add('stripe-from-right')
            }
        })
    }

    render = function() {
        return (
            <div className="flex">
                <SideBar page="payments" />
                <div className="flex-col flex-grow max-h-full min-w-6/7">
                    <div className="min-w-full">
                        <HeaderCard displayText="Recent Payments" />
                    </div>
                    <div className="shadow rounded bg-white pt-4 pb-14 px-8 m-10 pb-8 text-center overflow-y-scroll max-h-5/7 max-w-full" style={{minWidth: "780px"}}>
                        <div className="px-2 flex flex-grow flex-col " style={{width: "100%"}}>
                            <div className="shadow-lg flex flex-row justify-around mb-6" style={{fontSize:"18px", height:"40px"}}>
                                <div className="table-header">Status</div>
                                <div className="table-header">Amount</div>
                                <div className="table-header">Customer ID</div>
                                <div className="table-header">Subscription ID</div>
                                <div className="table-header">Payment Date</div>
                            </div>
                            {this.state.loading ? this.state.loadingArray : 
                                this.state.subscriptionArray.length === 0 ? 
                                <div className="px-2 flex flex-grow flex-col " style={{height: "20rem"}}>
                                    <div className="pt-8 text-lg md:text-2xl lg:text-2xl xl:text-2xl">You don't have any subscriptions yet ... Go get some users!</div>
                                </div> : 
                                this.state.subscriptionArray}
                        </div>
                    </div>
                </div>
            </div>
        ) 
    }
}