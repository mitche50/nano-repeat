import React from 'react'
import NanoRepeatFull from '../svg/NanoRepeatFull'
import { Link } from 'react-router-dom'

function Hero () {
    return (
        <div className="text-center ml-auto mr-auto w-5/7 pt-32 pb-24">
            <div className='flex flex-grow flex-wrap-reverse rounded shadow-lg bg-white '>
                <div className="m-auto py-20 px-10 lg:px-0 font-body">
                    <h1 className="lg:text-xl xl:text-xl">Cryptocurrency Subscriptions Made Simple</h1>
                    <h3 className="text-xs md:text-sm lg:text-sm xl:text-sm">Manage your Nano subscriptions without the hassle</h3>
                    <Link to='/signup'>
                        <button className="rounded mx-4 my-4 px-4 py-2 bg-green-500 text-white font-bold font-body">Get Started</button>
                    </Link>
                </div>
                <div className="max-w-15 lg:max-w-25 xl:max-w-25 m-auto pt-10 lg:py-20 w-1/2">
                    <NanoRepeatFull />
                </div>
            </div>
        </div>
    )
}

export default Hero