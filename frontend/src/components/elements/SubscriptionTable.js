import React from 'react'
import { formatDate } from '../util/Session'

export default function SubsriptionTable(props) {
    return (
        <div className="shadow rounded bg-white text-center h-400 overflow-y-scroll">
            <p className="pt-4 pb-4 font-bold inline-block text-xs md:text-lg lg:text-lg xl:text-lg">Subscription List</p>
            <table className="px-2" style={{width: "100%"}}>
                <thead>
                    <tr style={{fontSize:"14px"}}>
                        <th>Customer ID</th>
                        <th>Payment Address</th>
                        <th>Amount</th>
                        <th>Expiration Date</th>
                    </tr>
                </thead>
                <tbody>
                    {props.subscriptions.subscriptions.length === 0 ? <tr><td className="py-8" colspan="4">You don't have any subscriptions yet!</td></tr> :
                    props.subscriptions.subscriptions.map((subscription) => {
                        const d = new Date(Date.parse(subscription.expiration_date))
                        var expiration = formatDate(d)
                        return (
                            <tr key={subscription.id} style={{fontSize:"12px", height:"50px", borderBottom: "1px solid grey"}} >
                                <td>{subscription.subscriber_id}</td>
                                <td><a target="_blank" href={"https://nanocrawler.cc/explorer/account/" + subscription.payment_address}>{subscription.payment_address.substring(0,8)}...{subscription.payment_address.substring(subscription.payment_address.length - 5,subscription.payment_address.length)}</a></td>
                                <td>{subscription.cost}</td>
                                <td>{expiration}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}