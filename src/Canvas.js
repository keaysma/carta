import React, { useState, useEffect, useRef } from 'react'
import firebase from './firebase.js'

const Canvas = ({ user, settings }) => {
  
    const canvasRef = useRef(null)
    const [itemsTable, setItemsTable] = useState(null)
    const [canvas, setCanvas] = useState(null)
    const [context, setContext] = useState(null)
    const [bounds, setBounds] = useState(null)
    const [canvasPosition, setCanvasPosition] = useState(null)
    const [clickPosition, setClickPosition] = useState(null)

    const [event, setEvent] = useState(null)
    const [closestObject, setClosestObject] = useState(null)
    const [dragging, setDragging] = useState(false)
    const [objects, setObjects] = useState([])

    useEffect(() => {
        if(context)
            crosshairs()
    }, [clickPosition, objects])

    const moveHandle = event => {
        if(!canvasPosition)
            return
        
        var newX = (event.screenX - canvasPosition.x) * (1920/bounds.width)
        if(settings.gridMode)
            newX = parseInt(newX/10)*10
        
        var newY = (event.screenY - canvasPosition.y) * (1024/bounds.height) - (1024 - bounds.height)
        if(settings.gridMode)
            newY = parseInt(newY/10)*10

        if(dragging && closestObject){
            //let object = objects.find(_ => _.id = closestObject.id)
            
            let xShift = (newX - clickPosition.x)
            let yShift = (newY - clickPosition.y)
            //setObjects([...objects])

            const _itemsTable = firebase.database().ref(`canvas/test/items/${closestObject.id}`)
            _itemsTable.update({
                x: newX,//closestObject.x + xShift,
                y: newY//closestObject.y + yShift
            })
        }

        setClickPosition({
            'x': newX,
            'y': newY,
        })
    }

    //Append new item on backend
    const addCanvasItem = async ({x, y}) => {
        // `/canvas/<canvas_id>/items`
        const item = {x, y}
        itemsTable.push(item)

        //setObjects([...objects, {x, y}])
    }

    const clickDownHandle = event => {
        setEvent(event)
        
        //crosshairs()

        if(closestObject){
            setDragging(true)
        }else{
            setDragging(false)
        }
    }

    const clickUpHandle = event => {
        setEvent(event)

        if(!dragging)
            addCanvasItem(clickPosition)

        setDragging(false)
        
        //crosshairs()
    }

    const drawCircle = (x, y) => {
        context.fillStyle = settings.color

        context.beginPath()
        context.arc(x, y, 20, 0, 2*Math.PI)
        context.fill()
    }

    const refreshCanvas = () => {
        context.clearRect(0, 0, canvas.width, canvas.height)

        if(objects)
            objects.forEach(({x, y}) => drawCircle(x, y))
    }

    const distance = (p1, p2) => {
        let x = p1.x - p2.x
        let y = p1.y - p2.y
        return Math.sqrt((x*x) + (y*y))
    }

    const highlightNearestObject = () => {
        if(dragging)
            return
        
        setClosestObject(undefined)

        if(!objects)
            return
        
        let closest = undefined

        for(let object of objects){
            if(!closest){
                closest = object
            }else{
                

                let orig_dist = distance(clickPosition, closest)
                let new_dist = distance(clickPosition, object)
                if(new_dist < orig_dist){
                    closest = object
                }
            }
        }

        if(closest && distance(clickPosition, closest) < 20){
            setClosestObject(closest)

            context.fillStyle = '#0ff'

            context.beginPath()
            context.arc(closest.x, closest.y, 20, 0, 2*Math.PI)
            context.fill()
        }
    }

    const crosshairs = () => {
        refreshCanvas()

        if(!clickPosition)
            return

        context.setLineDash([5, 2])
        context.strokeStyle = '#ccc'

        context.beginPath()
        context.moveTo(clickPosition.x, 0)
        context.lineTo(clickPosition.x, canvas.height)
        context.stroke()

        context.beginPath()
        context.moveTo(0, clickPosition.y)
        context.lineTo(canvas.width, clickPosition.y)
        context.stroke()

        if(!dragging)
            highlightNearestObject()   
    }

    useEffect(() => {
        const _itemsTable = firebase.database().ref(`canvas/test/items`)
        _itemsTable.get().then(snapshot => {
            let items = snapshot.val()
            let newObjects = []

            for (let item in items) {
                if(item)
                    newObjects.push({
                        id: item,
                        x: items[item].x,
                        y: items[item].y
                    })
            }

            setObjects(newObjects)
        })

        _itemsTable.on('value', (snapshot) => {
            let items = snapshot.val()
            let newObjects = []

            for (let item in items) {
                if(item)
                    newObjects.push({
                        id: item,
                        x: items[item].x,
                        y: items[item].y
                    })
            }

            setObjects(newObjects)

            if(closestObject)
                setClosestObject(newObjects.find(_ => _.id = closestObject.id))
        })
        setItemsTable(_itemsTable)

        const canvas = canvasRef.current
        setCanvas(canvas)
        
        const context = canvas.getContext('2d')
        setContext(context)

        let bounds = canvasRef.current.getBoundingClientRect()
        setBounds(bounds)
        setCanvasPosition({
            'x': bounds.x,
            'y': bounds.y,
        })
    }, [])
  
    return <canvas onMouseDown={clickDownHandle} onMouseUp={clickUpHandle} onMouseMove={moveHandle} ref={canvasRef} width="1920" height="1024"/>
}

export default Canvas