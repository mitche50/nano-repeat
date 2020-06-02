import React, { Fragment } from 'react'

export default function LoadingPaymentRow() {

    return (
        <Fragment>
            <div className="flex flex-row justify-around mt-2 mb-2">
                <div className="table-body loading h-30 rounded w-24" />
                <div className="table-body loading h-3 rounded w-24" />
                <div className="table-body loading h-3 rounded w-24" />
                <div className="table-body loading h-3 rounded w-24" />
                <div className="table-body loading h-3 rounded w-24" />
            </div>
            <div className="my-3" style={{borderBottom: "1px solid grey"}} />
        </Fragment>
    )
    
}