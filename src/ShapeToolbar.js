import React, { useState, useEffect, useRef, } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquare, faCircle, faGripLines } from '@fortawesome/free-solid-svg-icons'
import './ShapeToolbar.css'

const ShapeToolbar = ({ callback, settings }) => {
    return (
        <div id="shape-toolbar">
            <div className="item" onClick={() => callback('Square')}>
                <FontAwesomeIcon icon={faSquare} className="light-icon"/>
            </div>
            <div className="item" onClick={() => callback('Circle')}>
                <FontAwesomeIcon icon={faCircle} className="light-icon"/>
            </div>
            <div className="item" onClick={() => callback('line')}>
                <FontAwesomeIcon icon={faGripLines} className="light-icon"/>
            </div>
        </div>
    )
}

export default ShapeToolbar