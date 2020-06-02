import React from 'react'
import NanoRepeatFullWhite from './svg/NanoRepeatFullWhite'
import WindowClose from './elements/WindowClose'
import GoogleButton from './elements/GoogleButton'
import OrSeparator from './elements/OrSeparator'
import SignUpForm from './forms/SignUpForm'
import { isSessionActive } from './util/Session'

export default function SignUp () {
    
    isSessionActive()
        .then((session) => {
            if (session) {
                return (window.location.replace('/dashboard'))
            } else {
                document.body.classList.remove('stripe-from-left')
            }
        })

    return (
        <div className=" flex flex-row flex-grow min-h-full text-center">
            <div className=" flex-2 bg-purple-700 hidden max-w-3/7 w-full lg:inline-block">
            <div className="m-auto py-20 max-w-4/7">
                        <NanoRepeatFullWhite />
                    </div>
                {/* <img src={fullLogo} className="m-auto py-20 max-w-5/7" alt="Nano Repeat"/> */}
                <p className="text-white ml-auto mr-auto pb-10">Subscriptions made simple</p>
            </div>
            <div className="flex-4 min-h-full inline-block">
                <WindowClose color="text-green-500" />
                <h1 className="text-2xl pt-20 pb-10">Sign Up</h1>
                <GoogleButton displayText="Sign Up" url="/signup" color="bg-green-500"/>
                <OrSeparator />
                <SignUpForm />
            </div>
        </div>
    )
}
