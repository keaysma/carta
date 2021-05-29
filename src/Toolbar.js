import React, { useState, useEffect, useRef, } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBorderAll, faBorderNone, faHandSparkles, faSwatchbook, faShapes, faSquare, faCircle } from '@fortawesome/free-solid-svg-icons'
import './Toolbar.css'

const Toolbar = ({ callback, settings }) => {
    const getShapeIcon = shapeSetting => {
        switch(shapeSetting){
            case 'Circle':
                return faCircle
            case 'Square':
                return faSquare
            default:
                return faShapes
        }
    }

    return (
        <div id="toolbar">
            <div className="item" onClick={() => callback('color')}>
                <FontAwesomeIcon icon={faSwatchbook} className="light-icon"/>
            </div>
            <div className="item" onClick={() => callback('shape-menu')}>
                <FontAwesomeIcon icon={getShapeIcon(settings.shape)} className="light-icon"/>
            </div>
            <div className="item" onClick={() => callback('grid')}>
                <FontAwesomeIcon icon={settings.gridMode ? faBorderAll : faBorderNone} className="light-icon"/>
            </div>
            <div className="item" onClick={() => callback('clean')}>
                <FontAwesomeIcon icon={faHandSparkles} className="light-icon"/>
            </div>
        </div>
    )
}

export default Toolbar