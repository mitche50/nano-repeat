import React from 'react'
import Input from './Input'
import { Link } from 'react-router-dom'
import { setSessionCookie } from '../util/Session'

export default class LoginForm extends React.Component{

    constructor(props) {
        super(props)
        this.state = {
            token: '',
            login_email: '',
            login_password: ''
        }

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(e) {
        const target = e.target
        const name = target.name
        const value = target.value
        this.setState({
            [name]: value
        })
    }
    
    handleSubmit(e) {
        var req_body = {
            "email": this.state.login_email,
            "password": this.state.login_password
        }

        e.preventDefault()
        fetch(process.env.REACT_APP_API_URL + '/token', {
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
                    setSessionCookie(data.access_token)
                    window.location.replace('/dashboard')
                }
                
            })
        
    }

    render() {
        return (
        <div className="">
            <form onSubmit={this.handleSubmit}>
                <Input id="email" name="login_email" required="true" type="text" placeholder="Email" value={this.state.username} onChange={this.handleChange} />
                <Input id="password" name="login_password" required="true" type="password" placeholder="Password" value={this.state.password} onChange={this.handleChange} />
                <p><Link to="/forgotpassword" className="text-xs text-green-500 font-bold">Forgot your password?</Link></p>
                <input type="submit" value="Log In" className="rounded cursor-pointer my-6 py-2 px-4 lg:px-48 bg-purple-700 font-bold text-white" />
            </form>
            <p className="text-xs pb-10">Not registered yet?  <Link to="/signup" className="text-green-500 font-bold">Sign Up!</Link></p>
        </div>
        )
    }

}