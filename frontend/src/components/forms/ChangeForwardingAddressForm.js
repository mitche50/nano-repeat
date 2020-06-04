import React from 'react'
import Input from './Input'
import { getSessionCookie } from '../util/Session'
import { validateNanoAddress } from '../util/Nano'


export default class ChangeForwardingAddressForm extends React.Component{

    constructor(props) {
        super(props)
        this.state = {
            token: '',
            new_address: '',
            address_valid: false,
        }

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }

    componentDidUpdate() {
        if (validateNanoAddress(this.state.new_address) && this.state.new_address.length > 0 && !this.state.address_valid) {
            this.setState({
                address_valid: true
            })
        } else if (!validateNanoAddress(this.state.new_address) && this.state.new_address.length > 0 && this.state.address_valid) {
            this.setState({
                address_valid: false
            })
        }
    }

    componentDidMount() {
        this.setState({
            token: getSessionCookie()
        })
        console.log("Setting token")
    }

    handleSubmit(e) {
        e.preventDefault()
        if (!this.state.address_valid){
            return
        }
        var req_body = {
            "token": this.state.token,
            "new_address": this.state.new_address
        }
        console.log(req_body)
        console.log(process.env.REACT_APP_API_URL + '/change_address')
        
        fetch(process.env.REACT_APP_API_URL + '/change_address', {
            method: 'POST',
            body: JSON.stringify(req_body)
        })
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                if(data.error) {
                    alert("There was an error changing your address:  " + data.error)
                } else {
                    alert("You have successfull changed your forwarding address!")
                    window.location.replace('/account')
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

    isEnabled() {
        return this.state.address_valid
    }

    render() {

        const errorDisplayText = 'The provided address is not a valid Nano address'
        const errorSubmitClass = 'rounded cursor-default my-6 py-2 px-4 lg:px-48 bg-purple-300 font-bold text-white'
        const errorDisplayClass = 'text-xs text-red-500 font-bold'
        const successDisplayClass = 'text-xs text-green-500 font-bold'
        const successSubmitClass = 'rounded cursor-pointer my-6 py-2 px-4 lg:px-48 bg-purple-700 font-bold text-white'
        const successDisplayText = 'The provided address is correct'

        return (
        <div className="">
            <form>
                <Input id="new_address" name="new_address" required="true" type="text" placeholder="nano_1oisajoisaj1fknoi4wtoirsjg1ksandfosainoisag1kdsnfroe1eygntf7" value={this.state.new_address} onChange={this.handleChange} />
                <p className={this.isEnabled() ? successDisplayClass : errorDisplayClass}>{this.isEnabled() ? successDisplayText : errorDisplayText}</p>
                <button value="Log In" className={this.isEnabled() ? successSubmitClass : errorSubmitClass} onClick={this.handleSubmit}>Change Forwarding Address</button>
            </form>
        </div>
        )
    }

}