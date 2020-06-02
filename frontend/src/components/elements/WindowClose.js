import React from 'react'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'

function WindowClose(props) {
    return (
        <div className="absolute top-0 right-0 pt-5 pr-10 lg:pt-5 lg:pr-20">
            <Link to='/'>
                <FontAwesomeIcon icon={faChevronLeft} className={props.color} />
            </Link>
        </div>
    )
}

export default WindowClose