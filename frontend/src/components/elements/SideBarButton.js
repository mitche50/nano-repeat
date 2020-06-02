import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class SideBarButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
            active: props.active,
            text: props.text,
            icon: props.icon,
            url: props.url
        }
    }

    render() {
        var iconClass = "ml-auto mr-auto w-30 min-h-30 " + (this.state.active ? "text-purple-700" : "text-gray-600 group-hover:text-gray-800");
        var textClass = "text-xs lg:text-md " + (this.state.active ? "text-black" : "text-gray-600 group-hover:text-gray-800");
        var divClass = "group pt-3 flex text-left my-2 inline flex-col flex-grow text-center"
        return (
            <Link to={this.state.url} className={divClass}>
                <FontAwesomeIcon icon={this.state.icon} className={iconClass}/>
                <p className={textClass}>
                    {this.state.text}
                </p>
            </Link>
        )
    }
}