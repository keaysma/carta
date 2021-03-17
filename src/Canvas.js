import React, { useEffect, useRef, useImperativeHandle } from 'react'

const Canvas = ({ clickHandle, ref }) => {
  
    const canvasRef = useRef(null)

    const draw = ctx => {
        ctx.fillStyle = '#f00000'
        ctx.beginPath()
        ctx.arc(50, 100, 20, 0, 2*Math.PI)
        ctx.fill()
    }

    useImperativeHandle(ref, () => ({
        getContext: () => {
            canvasRef.current.getContext('2d')
        }
    }))

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        //draw(context)
    }, [])
  
    return <canvas onClick={clickHandle} ref={canvasRef}/>
}

export default Canvas