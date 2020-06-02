import React from 'react'

export default function HeaderCard(props) {
    return (
        <div className="inline-block min-w-full flex-grow">
            <div className="my-5 py-5 px-10 md:w-1/2 lg:w-1/2 xl:w-1/2 mx-10 md:ml-auto md:mr-auto lg:ml-auto lg:mr-auto xl:ml-auto xl:mr-auto rounded shadow bg-white">
                <p className="text-lg md:text-2xl lg:text-2xl xl:text-2xl">{props.displayText}</p>
            </div>
        </div>
    )
}