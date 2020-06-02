import React from "react"

export default function NRFooter() {
    return (
        <div className="px-12 flex flex-grow text-center flex-col lg:flex-row-reverse text-2xs lg:text-xs text-gray-600 lg:pr-20 pb-10 z-10">
            <div className="py-2 px-4 rounded shadow bg-white">
                <p>Copyright © 2020 Andrew Mitchell |
                    <a href="/privacy" className="text-green-600 font-bold"> Privacy Policy</a> | 
                    <a href="/terms" className="text-green-600 font-bold"> Terms & Conditions</a></p>
            </div>
            
        </div>
    )
}