import React, { Fragment } from 'react'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
//import { Link } from 'react-router-dom'
import GoogleLogin from 'react-google-login'
import { setSessionCookie } from '../util/Session'
import Popup from "reactjs-popup";
import Input from '../forms/Input'
import { validateNanoAddress } from '../util/Nano'


export default class GoogleButton extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            color: props.color,
            displayText: props.displayText,
            url: props.url,
            googleToken: '',
            forwardAddress: '',
            address_valid: true,
            open: false
        }
    }

    handleChange = (e) => {
        const target = e.target
        const name = target.name
        const value = target.value
        this.setState({
            [name]: value
        })
    }

    isEnabled = () => {
        console.log("is enabled? " + this.state.address_valid)
        if (this.state.address_valid) {
            return true
        }
        return false
    }
    
    componentDidUpdate() {
        if (validateNanoAddress(this.state.forwardAddress) && this.state.forwardAddress.length > 0 && !this.state.address_valid) {
            console.log("address " + this.state.forwardAddress + " is valid")
            this.setState({
                address_valid: true
            })
        } else if (!validateNanoAddress(this.state.forwardAddress) && this.state.forwardAddress.length > 0 && this.state.address_valid) {
            console.log("address " + this.state.forwardAddress + " is invalid")
            this.setState({
                address_valid: false
            })
        }
    }

    handleOpen = () => {
        if (!this.state.open) {
            this.setState({open:true})
        }
    }

    handleSubmit = (e) => {
        e.preventDefault()
        console.log("Submitting: " + this.isEnabled())
        if (!this.isEnabled()) {
            return
        }
        this.setState({
            open: false
        })
    }

    responseGoogle = gr => {
        
        if(this.state.displayText === "Sign Up"){
            var body = {
                "first_name": gr.profileObj.givenName,
                "last_name": gr.profileObj.familyName,
                "email": gr.profileObj.email,
                "password": "",
                "forwarding_address": this.state.forwardAddress
            }
            fetch(process.env.REACT_APP_API_URL + '/signup', {
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
                    if(data.error) {
                        alert("There was an error signing up: " + data.error)
                    } else {
                        alert("You have successfully registered!  Redirecting you to the login page.")
                        setSessionCookie(data.access_token)
                        window.location.replace('/login')
                    }
                })
        } else if(this.state.displayText === "Log In"){
            fetch(process.env.REACT_APP_API_URL + '/token/googleswap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: gr.tokenId
            })
                .then((response) => {
                    console.log(response)
                    if(response.status >= 200 && response.status < 400) {
                        return response.json()
                    }
                    return null
                })
                .then((data) => {
                    if(data !== null) {
                        setSessionCookie(data.access_token)
                        window.location.replace('/dashboard')
                    } else {
                        alert("Invalid login information.")
                    }
                })
        }
    }

    render () {
        const buttonClass = this.state.color + " text-white max-w-xs lg:max-w-full mt-5 px-4 lg:px-32 py-2 font-bold rounded"
        const buttonText = this.state.displayText + " with Google"
        const successButtonClass = "rounded mt-6 mb-4 py-2 px-4 lg:px-48 bg-green-500 font-bold text-white"
        const errorButtonClass = "rounded mt-6 mb-4 py-2 px-4 lg:px-48 bg-green-200 cursor-default font-bold text-white"

        return (
            
                <GoogleLogin
                    clientId="1013810627339-mj3ub9c3e6f3oant2e408qf5gngmce82.apps.googleusercontent.com"
                    render={renderProps => (
                        <Fragment>
                            <Popup
                                open={this.state.open}
                                closeOnDocumentClick={false}
                                onClose={renderProps.onClick}>
                                Please enter an address to send your Nano:
                                <form onSubmit={this.handleSubmit}>
                                    <Input id="forwardAddress" addClass={this.state.address_valid ? '' : "input-error"}  required="true" type="text" name="forwardAddress" value={this.state.forwardAddress} onChange={this.handleChange} placeholder="nano_1repeat9ban3z1kfao31aroijhasd1kfao43z9r1akngi4owiagsunpk3s5z" />
                                    <div id="errorAddress" className={this.state.address_valid ? "hidden" : "text-xs text-red-500 font-bold"}>Invalid Nano Address</div>
                                    <button className={this.state.address_valid ? successButtonClass : errorButtonClass} >Sign Up</button>
                                </form>
                                
                            </Popup>
                            <button onClick={this.state.displayText === "Log In" ? renderProps.onClick : this.handleOpen} disabled={renderProps.disabled} className={buttonClass}>
                                <FontAwesomeIcon icon={faGoogle} /> <span className="pr-4" /> {buttonText}
                            </button>
                        </Fragment>
                    )}
                    onSuccess={this.responseGoogle}
                    cookiePolicy={'single_host_origin'}
                />
        )
    }
}