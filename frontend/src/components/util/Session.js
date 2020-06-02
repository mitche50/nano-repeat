import * as Cookies from 'js-cookie'

export const setSessionCookie = (session) => {
    if (session != null) {
        Cookies.remove("session")
        Cookies.set("session", session, { expires: 14, sameSite: 'Strict' })
    }
  };

export const getSessionCookie = () => {
  const sessionCookie = Cookies.get("session")

  if (sessionCookie === undefined) {
    return null
  } else {
    return sessionCookie
  }
};

export async function isSessionActive() {
  const sessionCookie = Cookies.get("session")
  if (sessionCookie === undefined) {
    console.log("session cookie missing")
    return false
  } else {
    const response = await fetch((process.env.REACT_APP_API_URL + '/verify?' + sessionCookie), {
            method: 'GET'
        })
    const data = await response.json()
    if(data.error) {
      alert("Your session is inactive, redirecting you to sign in page.")
      return false
    }
    return true
  }
}

export const removeSessionCookie = () => {
  if (Cookies.get("session") === undefined) {
    return false
  } else {
    Cookies.remove("session")
    return true
  }
}

export async function getCurrentUser() {
  var token = Cookies.get("session")
  if (token === undefined) {
    console.log("Token missing from cookies")
    return null
  } else {

    const response = await fetch(process.env.REACT_APP_API_URL + '/me?token=' + token, {
            method: 'GET'
        })
    const data = await response.json()
    if(data.error) {
        alert("There was an error getting your user information:  " + data.error)
        return null
    } else {
      return data
    }
  }
}

function minutes_with_leading_zeros(minutes) 
{ 
  return (minutes < 10 ? '0' : '') + minutes;
}

export function formatDate(date) {
  const months = {
    0: 'January',
    1: 'February',
    2: 'March',
    3: 'April',
    4: 'May',
    5: 'June',
    6: 'July',
    7: 'August',
    8: 'September',
    9: 'October',
    10: 'November',
    11: 'December'
  }
  console.log("date before: " + date)
  if (typeof date === "string") {
    date = date.replace(' ', 'T')
    console.log(date)
    date = new Date(Date.parse(date))
  } else {
    date = new Date(date)
  }
  
  console.log("date after conversion: " + date)
  var dateString = (months[date.getMonth()] + " " + minutes_with_leading_zeros(date.getUTCDate()) + ", " + date.getUTCFullYear() + " " + minutes_with_leading_zeros(date.getUTCHours()%12) + ":" + minutes_with_leading_zeros(date.getMinutes()) + " ")
  dateString +=  date.getUTCHours() >= 12 ? 'PM' : 'AM'

  return dateString;
}

export async function getFiatPrice(fiat, crypto_currency) {
  fiat = fiat.toUpperCase()
  crypto_currency = crypto_currency.toUpperCase()
  var price = 0
  const post_url = 'https://min-api.cryptocompare.com/data/price?fsym=' + crypto_currency + '&tsyms=' + fiat
  try {
    // Retrieve price conversion from API
    const response = await fetch(post_url, {
        method: 'GET'
    })
    const response_json = await response.json()
    price = response_json[fiat]
  }
  catch(e) {
    console.log("Exception converting fiat price to crypto price: " + e)
  }
  return price
}
  
export async function getUserSubscriptions() {
  var token = Cookies.get("session")
  if (token === undefined) {
    console.log("Token missing from cookies")
    return null
  } else {

    const response = await fetch(process.env.REACT_APP_API_URL + '/subscriptions/all?token='+token, {
            method: 'GET'
        })
    const data = await response.json()
    if(data.error) {
        alert("There was an error getting your subscriptions:  " + data.error)
        return null
    } else {
      return data
    }
  }
}


export async function getSubscriptionFromAddress(sender) {
  var token = Cookies.get("session")
  if (token === undefined) {
    console.log("Token missing from cookies")
    return null
  } else {
    const getUrl = (process.env.REACT_APP_API_URL + '/subscriptions/address?token=' + token + '&payment_address=' + sender)
    const response = await fetch(getUrl, {
            method: 'GET'
        })
    const data = await response.json()
    if(data.error) {
        alert("There was an error getting your subscriptions:  " + data.error)
        return null
    } else {
      return data
    }
  }
}


export async function getUserTransactions() {
  var token = Cookies.get("session")
  if (token === undefined) {
    console.log("Token missing from cookies")
    return null
  } else {

    const response = await fetch(process.env.REACT_APP_API_URL + '/transactions/me?token=' + token, {
            method: 'GET'
        })
    const data = await response.json()
    if(data.error) {
        return {'transactions': []}
    } else {
      return data
    }
  }
}

