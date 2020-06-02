import React from 'react'

export default function LoadingCard(props) {
    const cardClass = "shadow rounded bg-white h-9rem inline-block pt-4 pb-14 px-8 m-10 pb-8 text-center"
    const headerClass = "flex-row h-1/7 my-5 py-5 px-10 md:w-1/2 lg:w-1/2 xl:w-1/2 mx-10 md:ml-auto md:mr-auto lg:ml-auto lg:mr-auto xl:ml-auto xl:mr-auto rounded shadow bg-white"
    const tableClass = "shadow rounded bg-white text-center h-400 w-full px-10 py-4"
    return (
        <div className={props.type === "header" ? headerClass : props.type === "card" ? cardClass : tableClass}>
            <div className="w-32 md:w-64 lg:w-64 xl:w-64 rounded h-2 loading"></div>
            <div className="w-24 md:w-48 lg:w-48 xl:w-48 rounded h-1 loading mt-4"></div>
            {props.type !== "header" ? <div> <div className="w-32 md:w-56 lg:w-56 xl:w-56 rounded h-1 loading mt-4" /> <div className="w-24 md:w-48 lg:w-48 xl:w-48 rounded h-1 loading mt-4" /> <div className="w-32 md:w-56 lg:w-56 xl:w-56 rounded h-1 loading mt-4" /></div> : ""}
        </div>
    )
}