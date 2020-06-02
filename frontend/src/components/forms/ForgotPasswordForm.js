import React from 'react'
import Input from './Input'
// import { Link } from 'react-router-dom'
// import { setSessionCookie } from '../util/Session'

export default class ForgotPasswordForm extends React.Component{

    constructor(props) {
        super(props)
        this.state = {
            email: ''
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
        e.preventDefault()
        
        var req_body = {
            "email": this.state.email
        }

        fetch(process.env.REACT_APP_API_URL + '/forgotpassword', {
            method: 'POST',
            body: JSON.stringify(req_body)
        })
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                if(data.error) {
                    alert("There was an error resetting your password:  " + data.error)
                } else {
                    alert("Please check your email for a link to reset your password.")
                    window.location.replace('/login')
                }
            })
    }

    render() {

        return (
        <div className="">
            <form>
                <Input id="email" name="email" required="true" type="email" placeholder="Email" value={this.state.email} onChange={this.handleChange} />
                <button value="Log In" className='rounded cursor-pointer my-6 py-2 px-4 lg:px-48 bg-purple-700 font-bold text-white' onClick={this.handleSubmit}>Submit</button>
            </form>
        </div>
        )
    }

}