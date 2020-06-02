import React, { Component } from 'react'
import SideBar from './navigation/SideBar'
import { isSessionActive, getUserSubscriptions, formatDate } from './util/Session'
import HeaderCard from './elements/HeaderCard'
import LoadingPaymentRow from './elements/LoadingPaymentRow'
import SubscriptionRow from './elements/SubscriptionRow'

export default class Subscriptions extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            subscriptionArray: [],
            loadingArray: [<LoadingPaymentRow />, <LoadingPaymentRow />, <LoadingPaymentRow />, <LoadingPaymentRow />, <LoadingPaymentRow />, <LoadingPaymentRow />]
        }
    }

    componentDidMount() {
        isSessionActive()
        .then(async (session) => {
            if (!session) {
                document.body.classList.remove('stripe-from-left')
                document.body.classList.remove('stripe-from-right')
                return (window.location.replace('/login'))
            } else {
                const now = Date.now()
                const days = 86400000

                let subscriptions = await getUserSubscriptions()
                let subscriptionArray = subscriptions.subscriptions.map((subscription) => {
                    const exd = Date.parse(subscription.expiration_date.replace(' ', 'T'))
                    var expiration = formatDate(exd)
                    var status
                    exd < now ? status="past" : Math.round((expiration - now) / days) <= 7 ? status="near" : status="current"
                    var amount = parseFloat(subscription.cost).toFixed(4)
                    var subscriberId = subscription.subscriber_id
                    var subscriptionId = subscription.id
                    subscriptionId = subscriptionId.substring(0,8) + "..." + subscriptionId.substring(subscriptionId.length - 12, subscriptionId.length)
                    return <SubscriptionRow 
                        status={status}
                        amount={amount}
                        subscriberId={subscriberId}
                        subscriptionId={subscriptionId}
                        expiration={expiration}
                    />
                })
                this.setState({
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
                <SideBar page="subscriptions" />
                <div className="flex-col flex-grow min-w-6/7">
                    <div className="min-w-full">
                        <HeaderCard displayText="Subscriptions" />
                    </div>
                    <div className="shadow rounded bg-white pt-4 pb-14 px-8 m-10 pb-8 text-center overflow-y-scroll max-h-5/7 max-w-full" style={{minWidth: "780px"}}>
                        <div className="px-2 flex flex-grow flex-col " style={{width: "100%"}}>
                            <div className="shadow-lg flex flex-row justify-around mb-6" style={{fontSize:"18px", height:"40px"}}>
                                <div className="table-header">Status</div>
                                <div className="table-header">Amount</div>
                                <div className="table-header">Customer ID</div>
                                <div className="table-header">Subscription ID</div>
                                <div className="table-header">Expiration Date</div>
                            </div>
                            {this.state.loading ? 
                                this.state.loadingArray : this.state.subscriptionArray.length === 0 ? 
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