import React, { Fragment } from 'react'
import { formatDate } from '../util/Session'

export default function PaymentRow(props) {
    const successButton = <Fragment><div className="table-body"><div className="nr-button-success">Success</div></div></Fragment>
    const underpaymentButton = <Fragment><div className="table-body"><div className="nr-button-error">Underpayment</div></div></Fragment>

    return (
        <Fragment>
            <div className="flex flex-row justify-around mt-2 mb-2">
                {props.status === "success" ? successButton : underpaymentButton}
                <div className="table-body break-words">{(props.amount*1).toString()}</div>
                <div className="table-body break-words">{props.subscriberId}</div>
                <div className="table-body break-words">{props.subscriptionId}</div>
                <div className="table-body break-words">{formatDate(props.sent)}</div>
            </div>
            <div className="my-3" style={{borderBottom: "1px solid grey"}} />
        </Fragment>
    )
    
}