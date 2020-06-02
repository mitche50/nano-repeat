import React from 'react'
import logoUrl from '../../assets/NanoRepeat.svg'
import { faChartLine, faMoneyBillWave, faTasks, faUserCircle, faSignOutAlt, faBook } from '@fortawesome/free-solid-svg-icons'
import SideBarButton from '../elements/SideBarButton'

export default function SideBar(props) {
    return (
        <div className="min-h-full min-w-100 lg:min-w-200 text-center">
            <div className="fixed overflow-y-scroll bg-white w-1/7 shadow-lg max-h-full min-h-full min-w-100 lg:min-w-200 w-1/7 flex flex-col justify-between">
                <div>
                    <img src={logoUrl} className="w-3/7 pt-6 pb-8 mr-auto ml-auto" alt="Nano Repeat" />
                    <span className="pt-6"/>
                    <SideBarButton icon={faChartLine} text="Dashboard" active={props.page === 'dashboard' ? true : false} url='/dashboard' />
                    <SideBarButton icon={faMoneyBillWave} text="Payments" active={props.page === 'payments' ? true : false} url='/payments' />
                    <SideBarButton icon={faTasks} text="Subscriptions" active={props.page === 'subscriptions' ? true : false} url='/subscriptions' />
                    <SideBarButton icon={faBook} text="Documentation" active={props.page=== 'docs' ? true: false} url='/docs' />
                </div>
                <div className="pb-6">
                    <SideBarButton icon={faUserCircle} text="Account" active={props.page === 'account' ? true : false} url='/account' />
                    <SideBarButton icon={faSignOutAlt} text="Sign Out" active={false} url='/signout' />
                </div>
            </div>
        </div>
    )
}