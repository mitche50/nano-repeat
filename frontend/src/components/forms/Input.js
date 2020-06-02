import React from 'react'

export default function Input(props) {
    var isRequired = false

    if (props.required === 'true') {
        isRequired = true
    }

    return (
        <div className="Input">
            <input 
                className={"rounded bg-white border border-gray-500 text-gray-900 focus:outline-none focus:shadow-outline appearance-noneborder border-gray-300 rounded-lg my-2 py-2 px-4 " + props.addClass}
                id={props.id} 
                name={props.name}
                autoComplete="false" 
                required={isRequired ? true : false } 
                type={props.type} 
                placeholder={props.placeholder} 
                value={props.value}
                onChange={props.onChange}
            />    
            {/* <label for={props.name}></label> */}
        </div>
    )
}