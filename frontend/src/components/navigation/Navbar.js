import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import logoUrl from '../../assets/NanoRepeat.svg'
import { getSessionCookie } from '../util/Session'

export default function Navbar() {

    return (
        <Fragment>
            <nav className="min-w-full rounded fixed top-0 font-body bg-white py-2 shadow text-center flex justify-between px-12 md:px-20 lg:px-20 xl:px-20 container overflow-hidden z-40" style={{left: "50%", transform: "translate(-50%, 0)"}}>
                <Link className="py-2" to='/'>
                    <img src={logoUrl} className="h-37" alt="logo" />
                </Link>
                <ul className="text-sm text-gray-700 list-none p-0 flex items-center">
                    <li>
                        <a href={process.env.REACT_APP_API_URL + "/docs"} target="_blank" 
                        className="inline-block text-xs md:text-sm lg:text-sm xl:text-sm py-2 px-2 md:px-3 lg:px-3 xl:px3 text-gray-900 hover:text-gray-700 no-underline">
                            API
                        </a>
                    </li>
                    <li>
                        <Link to="/docs"
                        className="inline-block text-xs md:text-sm lg:text-sm xl:text-sm py-2 px-2 md:px-3 lg:px-3 xl:px3 text-gray-900 hover:text-gray-700 no-underline">
                            Docs
                        </Link>
                    </li>
                    {getSessionCookie() !== null ? <li className="pl-2 border-l">
                        <Link to="/dashboard"
                        className="font-bold bg-purple-600 text-xs md:text-sm lg:text-sm xl:text-sm rounded hover:bg-text-gray-800 text-white ml-4 py-2 px-3">
                            Dashboard
                        </Link>
                    </li> : <Fragment>
                    <li className="pl-1 border-l">
                        <Link to="/login"
                        className="inline-block text-xs md:text-sm lg:text-sm xl:text-sm py-2 px-2 md:px-3 lg:px-3 xl:px3 text-gray-900 hover:text-gray-700 no-underline">
                            Log In
                        </Link>
                    </li>
                    <Link to ="/signup">
                        <button className="font-bold text-xs md:text-sm lg:text-sm xl:text-sm bg-purple-600 rounded hover:bg-text-gray-800 text-white ml-2 md:ml-4 lg:ml-4 xl:ml-4 py-2 px-3">
                        Sign Up
                        </button>
    </Link></Fragment> }
                </ul>
            </nav>
        </Fragment>
    )
}
