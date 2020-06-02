import React, { Component } from 'react'
import NanoRepeatFullWhite from './svg/NanoRepeatFullWhite'
import { getSessionCookie } from './util/Session'
import { Link } from 'react-router-dom'

export default class EmailConfirm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            token: '',
            headerText: 'Thanks for Confirming!',
            errorText: '',
            errorClass: 'hidden'
        }
    }

    componentDidMount() {
        const { match: { params } } = this.props;
        this.setState({token: params.token})
    }

    render() {
        var sessionCookie = getSessionCookie()
        if (sessionCookie !== null) {
            return (window.location.replace('/dashboard'))
        } else {
            document.body.classList.remove('stripe-from-left')
        }

        var body = {
            'token': this.state.token
        }

        fetch(process.env.REACT_APP_API_URL + "/confirm", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                console.log(data)
                if(data.error) {
                    this.setState({
                        headerText: 'There was an error confirming your email.',
                        errorClass: 'text-lg visible',
                        errorText: data.error
                    })
                    setTimeout(() => { window.location.replace('/signup') }, 5000)
                } else {
                    this.setState({
                        headerText: 'Thanks for Confirming!',
                        errorClass: 'hidden'
                    })
                    setTimeout(() => { window.location.replace('/login') }, 5000)
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
                    <h1 className="text-2xl pt-20 pb-10">{this.state.headerText}</h1>
                    <p className={this.state.errorClass}>{this.state.errorText}</p>
                    <Link to="/login" className="text-green-500 text-lg pt-20 font-bold">Click here to log in!</Link>
                </div>
                
            </div>
        )
    }
}
