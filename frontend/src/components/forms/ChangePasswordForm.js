import React from 'react'
import Input from './Input'
// import { Link } from 'react-router-dom'
import { removeSessionCookie } from '../util/Session'

export default class ChangePasswordForm extends React.Component{

    constructor(props) {
        super(props)
        this.state = {
            token: '',
            new_password: '',
            confirm_password: '',
            match: false
        }

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }
    handleSubmit(e) {
        console.log("token: " + this.props.token)
        var req_body = {
            "token": this.props.token,
            "new_password": this.state.new_password
        }

        e.preventDefault()
        fetch(process.env.REACT_APP_API_URL + '/changepassword', {
            method: 'POST',
            body: JSON.stringify(req_body)
        })
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                if(data.error) {
                    alert("There was an error logging in:  " + data.error)
                } else {
                    alert("You have successfull changed your password!")
                    removeSessionCookie()
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
        if(this.state.confirm_password === this.state.new_password && this.state.new_password.length > 0 && !this.state.match) {
            this.setState({
                match: true
            })
        } else if (this.state.confirm_password !== this.state.new_password && this.state.match){
            this.setState({
                match: false
            })
        }
    }

    isEnabled() {
        if (this.state.match && this.state.confirm_password.length > 8 && this.state.new_password.length > 8) {
            return true
        }
        return false
    }

    render() {

        const errorDisplayText = 'The provided passwords must match and be greater than 8 digits long'
        const errorSubmitClass = 'rounded cursor-default my-6 py-2 px-4 lg:px-48 bg-purple-300 font-bold text-white'
        const errorDisplayClass = 'text-xs text-red-500 font-bold'
        const successDisplayClass = 'text-xs text-green-500 font-bold'
        const successSubmitClass = 'rounded cursor-pointer my-6 py-2 px-4 lg:px-48 bg-purple-700 font-bold text-white'
        const successDisplayText = 'The provided passwords match'

        return (
        <div className="">
            <form>
                <Input id="new_password" name="new_password" required="true" type="password" placeholder="New Password" value={this.state.new_password} onChange={this.handleChange} />
                <Input id="confirm_password" name="confirm_password" required="true" type="password" placeholder="Confirm Password" value={this.state.confirm_password} onChange={this.handleChange} />
                <p className={this.isEnabled() ? successDisplayClass : errorDisplayClass}>{this.isEnabled() ? successDisplayText : errorDisplayText}</p>
                <button value="Log In" className={this.isEnabled() ? successSubmitClass : errorSubmitClass} onClick={this.handleSubmit}>Change Password</button>
            </form>
        </div>
        )
    }

}