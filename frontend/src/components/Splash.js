import React from 'react'
import Navbar from './navigation/Navbar'
import Hero from './elements/Hero'
import NRFooter from './navigation/NRFooter'
import { getSessionCookie } from './util/Session'

export default function Splash () {
    var sessionCookie = getSessionCookie()
    if (sessionCookie !== null) {
        window.location.replace('/dashboard')
    } else {
        document.body.classList.remove('stripe-from-right');
        document.body.classList.add('stripe-from-left');
        return (
            <div className="flex flex-col flex-grow">
                <Navbar />
                <Hero />
                <NRFooter />
            </div>
        )
    }  
}
