import React, { Component, Fragment } from 'react'
import SideBar from './navigation/SideBar'
import DashboardHeader from './elements/DashboardHeader'
import DashboardCard from './elements/DashboardCard'
import { getCurrentUser, getUserSubscriptions, getFiatPrice, removeSessionCookie } from './util/Session'
import LoadingCard from './elements/LoadingCard'
import SubscriptionTable from './elements/SubscriptionTable'
import { favicon } from '../assets/favicon.png'

export default class Dashboard extends Component {

    constructor(props) {
        super(props)
        this.state = {
            email: '',
            firstName: '',
            loading: true
        }
    }      

    async componentDidMount() {
        let [user, subscriptions] = await Promise.all([
            getCurrentUser(),
            getUserSubscriptions()
        ])
        if (user == null) {
            removeSessionCookie()
            window.location.replace('/login')
        } else {
            document.body.classList.add('stripe-from-right');
            document.body.classList.remove('stripe-from-left');
            var currentSubs = 0
            var nearDueCount = 0
            var pastDueCount = 0
            var revenue = 0
            const now = Date.now()
            const days = 86400000
            // eslint-disable-next-line
            subscriptions.subscriptions.map((subscription) => {
                let expiration = Date.parse(subscription.expiration_date.replace(' ', 'T'))
                expiration < now ? pastDueCount += 1 : currentSubs += 1
                // eslint-disable-next-line
                Math.round((expiration - now) / days) <= 7 && expiration > now ? nearDueCount += 1 : ''
                // eslint-disable-next-line
                Math.round((expiration - now) / days) <= 30 ? revenue += parseFloat(subscription.cost) : ''
            })
            const price = parseFloat(await getFiatPrice("usd", "nano"))
            var revenueFiat = parseFloat(revenue) * price 
            this.setState({
                email: user.email,
                firstName: user.first_name,
                loading: false,
                subscriptions: subscriptions,
                currentSubs: currentSubs,
                nearDueCount: nearDueCount,
                pastDueCount: pastDueCount,
                revenue: revenue,
                revenueFiat: revenueFiat.toFixed(2)
            })
        }            
    }

    render = function() { 
        return (
            <div className="flex">
                <SideBar page="dashboard" />
                <div className="inline-block max-w-full flex-grow">
                    
                    {this.state.loading ? <div><LoadingCard type="header" /></div> : 
                        <DashboardHeader firstName={this.state.firstName} />
                    }
                    <div className="flex flex-row flex-wrap ml-auto mr-auto">
                        <div className="flex flex-col flex-grow inline-block ml-auto mr-auto">
                            <div className="flex flex-row flex-wrap ml-auto mr-auto">
                                {this.state.loading ? <div className="flex ml-auto mr-auto"><LoadingCard type="card" /></div> : 
                                    <DashboardCard 
                                        titleText="Current Subscriptions" 
                                        toolTipId="currentSubscription" 
                                        toolTipText="Number of subscriptions that are currently paid and active."
                                        valueText={this.state.currentSubs}
                                    />
                                }
                                {this.state.loading ? <div className="flex ml-auto mr-auto"><LoadingCard type="card" /></div> : 
                                    <DashboardCard 
                                        titleText="Near Due Subscriptions"
                                        toolTipId="nearDue"
                                        toolTipText="Number of subscriptions that are due within the next week."
                                        valueText={this.state.nearDueCount}
                                    />
                                }
                            </div>
                            <div className="flex flex-row flex-wrap ml-auto mr-auto">
                                {this.state.loading ? <div className="flex ml-auto mr-auto"><LoadingCard type="card" /></div> : 
                                    <DashboardCard 
                                        titleText="Past Due Subscriptions"
                                        toolTipId="pastDue"
                                        toolTipText="Number of subscriptions that are past due and not cancelled."
                                        valueText={this.state.pastDueCount}
                                    />
                                }
                                {this.state.loading ? <div className="flex ml-auto mr-auto"><LoadingCard type="card" /></div> : 
                                    <Fragment>
                                        <DashboardCard 
                                            titleText="Revenue Next Month"
                                            toolTipId="revenue"
                                            toolTipText="Amount of revenue to be collected in the next 30 days. This includes not cancelled past due subscriptions."
                                            valueText= {(this.state.revenue.toFixed(4) * 1).toString()}
                                            subvalueText={"$" + this.state.revenueFiat}
                                        />                                        
                                    </Fragment>
                                }
                            </div>
                        </div>
                        <div className="flex flex-col w-3/7 ml-auto mr-auto pr-20 pt-10 inline-block dash-table">
                            {this.state.loading ? <div className="flex"><LoadingCard type="table" /></div> : 
                                <SubscriptionTable subscriptions={this.state.subscriptions} />
                            }
                        </div>
                    </div>
                </div>
            </div>
        ) 
    }
}
