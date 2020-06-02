import React from 'react'
import ReactTooltip from "react-tooltip";
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export default function DashboardCard(props) {
    return(
        <div className="ml-auto mr-auto">
            <div className="shadow rounded bg-white min-h-9rem pt-4 pb-14 px-8 m-10 pb-8 text-center">
                <p className="font-bold inline-block text-xs md:text-lg lg:text-lg xl:text-lg">{props.titleText}</p>
                <FontAwesomeIcon icon={faQuestionCircle} className="inline-block ml-4 text-gray-600" data-tip data-for={props.toolTipId} />
                <br />
                <p className="pt-4 inline-block text-4xl">{props.valueText}</p> {props.titleText === "Revenue Next Month" ? <p className="inline-block text-md text-gray-600">nano</p> : ""}
                {props.subvalueText ? <p className="text-xs text-gray-600 -mt-2">{props.subvalueText}</p>: ''}
            </div>
            <ReactTooltip id={props.toolTipId} place="top" effect="solid">
                {props.toolTipText}
            </ReactTooltip>
        </div>
    )
}
