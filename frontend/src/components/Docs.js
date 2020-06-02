import React, { Fragment } from 'react'
import Navbar from './navigation/Navbar'
import CreateAccountImg from '../assets/CreateAccount.svg'
import CreateSubscriptionimg from '../assets/undraw_content_structure_79gj.svg'
import VerifySubscriptionImg from '../assets/VerifySubscription.svg'
import PaymentImg from '../assets/PaymentImage.svg'
import { Link } from 'react-router-dom'
import { getSessionCookie } from './util/Session'

export default function Docs () {
    document.body.classList.remove('stripe-from-right');
    document.body.classList.add('stripe-from-left');
    var sessionToken = getSessionCookie()
    console.log(sessionToken)
    return (
        <Fragment>
          <Navbar />
          <div className="max-w-full md:w-5/7 lg:w-5/7 xl:w-5/7 justify-center md:my-10 lg:my-10 xl:my-10 m-auto px-8 pt-12 mt-24 flex flex-col rounded shadow-lg bg-white inline-block">
            <div className="flex flex-row max-w-full pt-12 pb-6">
              <div className="max-w-full">
                <p className="text-2xl font-bold">How does it work?</p>
                <p className="text-sm text-justify text-gray-600 pt-4">Nano Repeat handles payment validation and monitoring to allow a seamless integration of Nano into your platform.  Follow the three steps below to get started, then check the <a className="text-green-500 font-bold" target="_blank" rel="noopener noreferrer" href={process.env.REACT_APP_MAIN_URL + "/docs#"}>API Documents</a> for more functionality!</p>
              </div>
            </div>
            <div className="flex flex-row max-w-full py-4">
              <div className="hidden pl-8 md:flex lg:flex xl:flex align-center flex-grow flex-col w-1/2">
                <img className="m-auto w-1/2 pt-12" src={CreateAccountImg} alt="Create Account"/>
              </div>
              <div className="max-w-full m-auto md:w-1/2 lg:w-1/2 xl:w-1/2 flex flex-col">
                <p className="text-lg bold pt-10">Step 1: Create Account</p>
    <p className="text-sm text-justify text-gray-600 pt-4">You can either create an account on the Nano Repeat site, or you can send a POST request to <span className="text-green-500 font-bold">{process.env.REACT_APP_API_URL}/signup</span><br /><br />
                The forwarding address you provide will be the end destination of the Nano collected via the payment addresses - <span className="text-purple-700 font-bold">make sure you always have control of this account</span><br/><br />
                Nano Repeat will create your user with a provided bearer token that you can use to access secure API endpoints related to your account.  <span className="text-purple-700 font-bold">Make sure you store your token! </span><br />
                Your token is used to verify your account when sending account specific requests.  If you lose it, you can find it on your account page after logging in.</p>
                <p className="text-sm font-bold pt-4">Request:</p>
    <p className="italic text-sm"><span className="font-bold inline-block text-sm">POST:&nbsp;</span>{process.env.REACT_APP_API_URL}/signup</p>
                <div className="bg-gray-400 py-2 font-mono text-sm whitespace-no-wrap overflow-x-auto">
                  {"{"}<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"first_name": "John",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"last_name": "Doe",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"email": "johndoe@gmail.com",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"password": "averysecurepassword",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"forwarding_address": "nano_111pwbptkp6rj6ki3ybmjg4ppg64o9s676frokpydkwrntrnqqfqf84w5kon"<br />
                  }
                </div>
                <p className="text-sm font-bold pt-4">Response:</p>
                <div className="bg-gray-400 py-2 font-mono text-sm whitespace-no-wrap overflow-x-auto">
                  {"{"}<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"user_id": "24b0af7b-47f9-4656-941f-d91b2f5ae8bb",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"token": "eyJ0eXAiOiJKV1QiLCjhbGciOiJIuzI1NiJ9.eyJlbWFPbCI6ImpvaG5kb2VAZ21haWwuY29tIn0.32_T1Y-SxIxAUE2S3iDRnQPRopBrZrLSTZVFwJe_fHc",<br />
                  }
                </div>
              </div>
            </div>
            <div className="flex flex-row max-w-full py-6">
             <div className="max-w-full m-auto pr-8 md:w-1/2 lg:w-1/2 xl:w-1/2 flex flex-col ">
                <p className="text-lg bold pt-10">Step 2: Create Subscriptions</p>
                <p className="text-sm text-justify text-gray-600 pt-4">A subscription is the linkage between your customer and your service.  When your user signs up, you create a subscription that shows how much it costs and how long it lasts after payment.  <br />
                You can have multiple subscriptions attached to your account, each has a unique identifier and a unique payment address.<br />
                When prompting your users for payment, simply provide the payment address and the amount of Nano required to fulfil the subscription to your user and you can poll the Nano Repeat API to see when payment is completed.<br /><br />
                <span className="font-bold text-lg text-black">Required fields:</span></p>
                <ul className="text-sm text-justify text-gray-600">
                  <li className="pl-4">-<span className="text-purple-700 font-bold">subscriber_id:</span> Unique identifier for your subscriber, created by you so you can get data on the subscriber</li>
                  <li className="pl-4">-<span className="text-purple-700 font-bold">cost:</span> The exact amount of currency that is required to fulfil the subscription</li>
                  <li className="pl-4">-<span className="text-purple-700 font-bold">currency:</span> The currency you wish to bill in.  Currently only NANO is accepted.</li>
                  <li className="pl-4">-<span className="text-purple-700 font-bold">period</span>: The length of the subscription in days</li>
                </ul>
                <p className="text-sm font-bold pt-4">Request:</p>
                <p className="italic inline-block text-sm break-words"><span className="font-bold inline-block text-sm">POST:&nbsp;</span>{process.env.REACT_APP_API_URL + '/create_subscription?token=' + (sessionToken  === null ?  "{YOUR TOKEN}" : sessionToken)}</p>
                <div className="bg-gray-400 py-2 font-mono text-sm whitespace-no-wrap overflow-x-auto">
                  {"{"}<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"subscriber_id": "CUST-1",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"cost": "30.2",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"currency": "NANO",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"period": 30<br />
                  }
                </div>
                <p className="text-sm font-bold pt-4">Response:</p>
                <div className="bg-gray-400 py-2 font-mono text-sm whitespace-no-wrap overflow-x-auto">
                  {"{"}<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"subscriber_id": "CUST-1",,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"payment_address": "nano_1hjkyzdca9jcw59htf8exdoofm13tpyytr6zgdjj7d9dz8puaxj9i95gmaqe",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"cost": "30.2",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"currency": "NANO",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"period": 30,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"expiration_date": "2020-06-16 21:34:37.555537",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"subscription_id": "46d9f912-8391-49d5-a7b9-ab2ffc4a75b6",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"created_at": "2020-05-18 01:34:37.556278"<br />
                  }
                </div>

              </div>
              <div className="hidden pl-8 md:flex lg:flex xl:flex flex-col w-1/2 align-center">
                <div className="m-auto w-1/2">
                  <img src={CreateSubscriptionimg} alt="Create Subscription" />
                </div>
              </div>
            </div>
            <div className="flex flex-row max-w-full py-6">
              <div className="hidden pl-8 md:flex lg:flex xl:flex flex-grow flex-col align-center w-1/2">
                <img className="m-auto w-1/2" src={VerifySubscriptionImg} alt="Create Account"/>
              </div>
              <div className="max-w-full m-auto md:w-1/2 lg:w-1/2 xl:w-1/2 flex flex-col">
                <p className="text-lg bold pt-10">Step 3: Verify Subscription</p>
                <p className="text-sm text-justify text-gray-600 pt-4">To see the status of any subscription, you will send a POST request to <span className="font-bold text-green-500">{process.env.REACT_APP_API_URL + "/verify"}</span><br />
                This will return a boolean value of whether the subscription is valid, as well as the date of expiration and the address that the subscriber should send their payment to</p>
                <p className="text-sm font-bold pt-4">Request:</p>
                <p className="italic text-sm break-words"><span className="font-bold">POST:&nbsp;</span>{process.env.REACT_APP_API_URL + "/verify?token=" + (sessionToken  === null ?  "{YOUR TOKEN}" : sessionToken) }</p>
                <div className="bg-gray-400 py-2 font-mono text-sm whitespace-no-wrap overflow-x-auto">
                  {"{"}<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"subscription_id": "46d9f912-8391-49d5-a7b9-ab2ffc4a75b6"<br/>
                  }
                </div>
                <p className="text-sm font-bold pt-4">Response:</p>
                <div className="bg-gray-400 py-2 font-mono text-sm whitespace-no-wrap overflow-x-auto">
                  {"{"}<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"active": <span className=" text-blue-800">true</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"expiration_date": "2020-06-16 21:26:35.229321",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"payment_address": "nano_3yrgb7w3s7mouwheet6u7eszfpsn3fh4e51puz6crccei8izomkh9fbado9a"<br />
                  }
                </div>
              </div>
            </div>
            <div className="max-w-full py-6">
              <p className="text-2xl font-bold py-6">What happens when one of my customers pays their subscription?</p>         
              <p className="text-sm text-justify text-gray-600 pt-4">Nano Repeat uses a custodial solution to validate payments and then forwards 
              to the <span className="text-purple-700 font-bold">forwarding address</span> you provided on signup. You can see this address on the 
              accounts page once you're logged in. With Nano, users are free to send as much currency to the payment address whenever they'd like, 
              so we need to take this into account.</p>
            </div>
            <div className="flex flex-row max-w-full py-4">
              <div className="hidden pl-8 md:flex lg:flex xl:flex align-center flex-grow flex-col w-1/2">
                <img className="m-auto w-1/2 pt-12" src={PaymentImg} alt="Payment Information"/>
              </div>
              <div className="max-w-full m-auto md:w-1/2 lg:w-1/2 xl:w-1/2 flex flex-col pb-24">
                <p className="text-lg bold pt-10">On Payment</p>
                <p className="text-sm text-justify text-gray-600 pt-4">Nano Repeat will compare the amount paid by the customer to the expected amount 
                from the subscription.  This can result in one of three different states:</p>
                <p className="text-sm text-justify text-gray-600 pt-4 pl-4">- <span className="text-purple-700 font-bold">Correct Payment</span>: Correct payments 
                have the full amount forwarded to your provided forwarding address.</p>
                <p className="text-sm text-justify text-gray-600 pt-4 pl-4">- <span className="text-purple-700 font-bold">Overpayment</span>: An overpayment results 
                in the full subscription amount being sent to your forwarding address, and the remainder of the overpayment being returned to the sender.</p>
                <p className="text-sm text-justify text-gray-600 pt-4 pl-4">- <span className="text-purple-700 font-bold">Underpayment</span>: Underpayments with 
                values higher than 0.01 nano are returned to the user.  The limit on returns is to prevent someone from overloading the servers with 
                transactions that are worth less than a penny.</p>
                <p className="text-lg bold pt-10">Subscription Management</p>
                <p className="text-sm text-justify text-gray-600 pt-4">When a transaction is received, the subscription can be in one of two states:</p>
                <p className="text-sm text-justify text-gray-600 pt-4 pl-4">- <span className="text-purple-700 font-bold">Current</span>: If a subscription's expiration 
                date is in the future, it is considered as "current".  When someone makes a payment towards an already current subscription, the expiration date is 
                extended by the length of the subscription period.</p>
                <p className="text-sm text-justify text-gray-600 pt-4 pl-4">- <span className="text-purple-700 font-bold">Expired</span>: When a payment is made to an 
                expired subscription, the expiration date will be set to be then length of the subscription period from the current date and time.</p>
              </div>
            </div>
            <div className="max-w-full py-6">
              <p className=" text-center text-gray-600 pt-4 pb-6">All set?  Get started by creating an account using the API or <Link className="text-green-500 font-bold" to="/signup">clicking here</Link></p>
            </div>
          </div>
        </Fragment>
    )
  }