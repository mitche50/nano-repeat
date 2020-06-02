import { removeSessionCookie } from '../util/Session'


export default function SignOut() {
    removeSessionCookie()
    return (
        window.location.replace('/')
    )
}