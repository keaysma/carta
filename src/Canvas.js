import React, { useState, useEffect, useRef } from 'react'

const Canvas = ({ }) => {
  
    const canvasRef = useRef(null)
    const [canvas, setCanvas] = useState(null)
    const [context, setContext] = useState(null)
    const [bounds, setBounds] = useState(null)
    const [canvasPosition, setCanvasPosition] = useState(null)
    const [clickPosition, setClickPosition] = useState(null)

    const [paintColor, setPaintColor] = useState('#f00000')

    /*
    {
        x,
        y
    }
    */
    const [objects, setObjects] = useState([])

    useEffect(() => {
        if(context)
            crosshairs()
    }, [clickPosition])

    const getPosition = event => {
        setClickPosition({
            'x': event.screenX,
            'y': event.screenY,
        })
    }

    const refreshCanvas = () => {
        context.clearRect(0, 0, canvas.width, canvas.height)

        objects.forEach(({x, y}) => drawObject(x, y))
    }

    const drawObject = (x, y) => {
        context.fillStyle = paintColor

        context.beginPath()
        context.arc(x, y, 20, 0, 2*Math.PI)
        context.fill()
    }

    const draw = () => {
        let xPos = clickPosition.x - canvasPosition.x
        let yPos = clickPosition.y - canvasPosition.y - 100
        
        drawObject(xPos, yPos)

        setObjects([...objects, {'x': xPos, 'y': yPos}])
    }

    const distance = (p1, p2) => {
        let x = p1.x - p2.x
        let y = p1.y - p2.y
        return Math.sqrt((x*x) + (y*y))
    }

    const highlightNearestObject = () => {
        let closestPosition = undefined

        const pos = {
            'x': clickPosition.x - canvasPosition.x,
            'y': clickPosition.y - canvasPosition.y - 100
        }

        for(let object of objects){
            if(!closestPosition){
                closestPosition = object
            }else{
                

                let orig_dist = distance(pos, closestPosition)
                let new_dist = distance(pos, object)
                if(new_dist < orig_dist){
                    closestPosition = object
                }
            }
        }

        if(closestPosition && distance(pos, closestPosition) < 50){
            context.fillStyle = '#0ff'

            context.beginPath()
            context.arc(closestPosition.x, closestPosition.y, 20, 0, 2*Math.PI)
            context.fill()
        }
    }

    const crosshairs = () => {
        refreshCanvas()

        context.setLineDash([5, 2])
        context.strokeStyle = '#ccc'

        let xPos = clickPosition.x - canvasPosition.x
        let yPos = clickPosition.y - canvasPosition.y - 100

        context.beginPath()
        context.moveTo(xPos, 0)
        context.lineTo(xPos, canvas.height)
        context.stroke()

        context.beginPath()
        context.moveTo(0, yPos)
        context.lineTo(canvas.width, yPos)
        context.stroke()

        highlightNearestObject()
        
    }

    useEffect(() => {
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
  
    return <canvas onClick={draw} onMouseMove={e => getPosition(e)} ref={canvasRef} width="1024" height="768"/>
}

export default Canvas