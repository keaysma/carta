import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTh, faHandSparkles } from '@fortawesome/free-solid-svg-icons'
import './Toolbar.css'

const Toolbar = ({ }) => {
    return (
        <div id="toolbar">
            <div className="item">
                <FontAwesomeIcon icon={faTh} className="light-icon"/>
            </div>
            <div className="item">
                <FontAwesomeIcon icon={faHandSparkles} className="light-icon"/>
            </div>
        </div>
    )
}

export default Toolbar