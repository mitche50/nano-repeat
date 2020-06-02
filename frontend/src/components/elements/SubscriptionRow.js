import React, { Fragment } from 'react'
import { formatDate } from '../util/Session'

export default function SubscriptionRow(props) {
    const currentButton = <Fragment><div className="table-body"><div className="nr-button-success">Current</div></div></Fragment>
    const pastDueButton = <Fragment><div className="table-body"><div className="nr-button-error">Past Due</div></div></Fragment>
    const nearDueButton = <Fragment><div className="table-body"><div className="nr-button-warning">Near Due</div></div></Fragment>

    return (
        <Fragment>
            <div className="flex flex-row justify-around mt-2 mb-2">
                {props.status === "current" ? currentButton : props.status === "past" ? pastDueButton : nearDueButton}
                <div className="table-body break-words">{(props.amount*1).toString()}</div>
                <div className="table-body break-words">{props.subscriberId}</div>
                <div className="table-body break-words">{props.subscriptionId}</div>
                <div className="table-body break-words">{props.expiration}</div>
            </div>
            <div className="my-3" style={{borderBottom: "1px solid grey"}} />
        </Fragment>
    )
    
}