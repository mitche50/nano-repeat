import React from 'react'
import Input from './Input'
import { Link } from 'react-router-dom'
import { validateNanoAddress } from '../util/Nano'

export default class SignUpForm extends React.Component{

    constructor(props) {
        super(props)
        this.state = {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            confirm_password: '',
            address: '',
            address_valid: true,
            match: true
        }

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }
    handleSubmit(e) {
        e.preventDefault()
        if (!this.isEnabled()) {
            return
        }
        var body = {
            "first_name": this.state.first_name,
            "last_name": this.state.last_name,
            "email": this.state.email,
            "password": this.state.password,
            "forwarding_address": this.state.address
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
                    alert("There was an error getting you signed up.  " + data.error)
                } else {
                    alert("You have successfully registered!  Redirecting you to the login page.")
                    window.location.replace('/login')
                }
                
            })
    }
    handleChange(e) {
        const target = e.target
        const name = target.name
        const value = target.value
        this.setState({
            [name]: value
        })
    }

    componentDidUpdate() {
        if (validateNanoAddress(this.state.address) && this.state.address.length > 0 && !this.state.address_valid) {
            this.setState({
                address_valid: true
            })
        } else if (!validateNanoAddress(this.state.address) && this.state.address.length > 0 && this.state.address_valid) {
            this.setState({
                address_valid: false
            })
        }
        if(this.state.confirm_password === this.state.password && !this.state.match) {
            this.setState({
                match: true
            })
        } else if (this.state.confirm_password !== this.state.password && this.state.match){
            this.setState({
                match: false
            })
        }
    }

    isEnabled() {
        if (this.state.match && this.state.confirm_password.length > 8 && this.state.password.length > 8 && this.state.address_valid) {
            return true
        } else if (this.state.match.length === 0 || this.state.confirm_password.length === 0) {
            return true
        }
        return false
    }

    render() {
        const successDisplayText = 'The provided passwords match'
        const errorDisplayClass = 'text-xs text-red-500 font-bold'
        const successDisplayClass = 'text-xs text-green-500 font-bold'
        const errorDisplayText = 'The provided passwords must match and be greater than 8 digits long'
        const successButtonClass = "rounded mt-6 mb-4 py-2 px-4 lg:px-48 bg-green-500 font-bold text-white"
        const errorButtonClass = "rounded mt-6 mb-4 py-2 px-4 lg:px-48 bg-green-200 cursor-default font-bold text-white"

        return (
        <div className="">
            <form onSubmit={this.handleSubmit}>
                <div className="flex flex-column justify-center flex-wrap">
                    <div className="sm:pr-4">
                        <div className="input-instruction-text pl-5 md:pl-0 lg:pl-0 xl:pl-0" style={{marginRight: "175px"}}>first name</div>
                        <Input id="first_name" required="true" name="first_name" value={this.state.first_name} type="text" onChange={this.handleChange} placeholder="First Name" />
                    </div>
                    <div>
                        <div className="input-instruction-text pl-5 md:pl-0 lg:pl-0 xl:pl-0" style={{marginRight: "178px"}}>last name</div>
                        <Input id="last_name" required="true" name="last_name" value={this.state.last_name} type="text" onChange={this.handleChange} placeholder="Last Name" />
                    </div>
                </div>
                <div className="input-instruction-text pl-5 md:pl-0 lg:pl-0 xl:pl-0" style={{marginRight: "200px"}}>email</div>
                <Input id="email" required="true" type="email" name="email" value={this.state.email} onChange={this.handleChange} placeholder="youremail@gmail.com" />
                <div className="input-instruction-text pl-5 md:pl-0 lg:pl-0 xl:pl-0" style={{marginRight: "83px"}}>address to forward nano to</div>
                <Input id="address" addClass={this.state.address_valid ? '' : "input-error"}  required="true" type="text" name="address" value={this.state.address} onChange={this.handleChange} placeholder="nano_1repeat9ban3z1kfao31aroijhasd1kfao43z9r1akngi4owiagsunpk3s5z" />
                <div id="errorAddress" className={this.state.address_valid ? "hidden" : "text-xs text-red-500 font-bold"}>Invalid Nano Address</div>
                <div className="input-instruction-text pl-5 md:pl-0 lg:pl-0 xl:pl-0" style={{marginRight: "177px"}}>password</div>
                <Input id="password" required="true" name="password" value={this.state.password} onChange={this.handleChange} type="password" placeholder="Password" />
                <div className="input-instruction-text pl-5 md:pl-0 lg:pl-0 xl:pl-0" style={{marginRight: "134px"}}>confirm password</div>
                <Input id="confirm_password" required="true" name="confirm_password" value={this.state.confirm_password} onChange={this.handleChange} type="password" placeholder="Confirm Password" />
                <p className={this.isEnabled() ? this.state.confirm_password.length === 0 || this.state.password.length === 0 ? "hidden" : successDisplayClass : errorDisplayClass}>{this.isEnabled() ? successDisplayText : errorDisplayText}</p>

                <div className="flex flex-column justify-center mx-6 pt-2">
                    <input id="privacy" type="checkbox" value="PrivacyAck" required />
                    <label for="privacy" className="pl-4 inline-block text-sm text-justify max-w-sm">
                        Creating a Nano Repeat account means you agree to the 
                        <Link to="/terms" className="text-green-500 font-bold"> Terms of Service</Link> and 
                        <Link to="/privacy" className="text-green-500 font-bold"> Privacy Policy</Link>
                    </label>
                </div>

                <button className={this.isEnabled() ? successButtonClass : errorButtonClass} >Sign Up</button>
            </form>
            <p className="text-xs pb-4">Already have an account?  <Link to="/login" className="text-green-500 font-bold">Sign In!</Link></p>
        </div>
        )
    }

}