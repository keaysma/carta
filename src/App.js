import React, { Component, useState, useEffect, useRef, useCallback } from 'react'
import Konva from 'konva'
import firebase, { auth, provider } from './firebase.js'
import Toolbar from './Toolbar'
import ShapeToolbar from './ShapeToolbar'
import './App.scss'

const App = () => {

    const [settings, setSettings] = useState({
        shapeMenuOpen : false,
        shape: 'Circle',
        gridMode : false,
        color: '#00F'
    })
    const [shape, setShape] = useState('Circle')

    const containerRef = useRef()
    const [stage, setStage] = useState(null)
    const [currentItem, setCurrentItem] = useState('')
    const [users, setUsers] = useState([])
    const [user, setUser] = useState(null)

    const getSettings = () => settings

    const useToolbar = (state) => {
        if(state === 'shape-menu')
            setSettings({ ...settings, shapeMenuOpen: !settings.shapeMenuOpen})

        if(state === 'grid')
            setSettings({ ...settings, gridMode: !settings.gridMode})

        if(state === 'clean'){
            const itemsTable = firebase.database().ref(`canvas/test/items`)
            itemsTable.remove()
        }
    }

    const useToolbarShape = (newShape) => setShape(newShape)

    useEffect(() => {
        auth.onAuthStateChanged((userObj) => {
            if (userObj) {
                setUser(userObj)

                const usersRef = firebase.database().ref('users');
                usersRef.on('value', (snapshot) => {
                    let users = snapshot.val()
                    let newState = []

                    for (let userId in users) {
                        let user = users[userId]
                        let items = user.items
                        for (let item in items) {
                            newState.push({
                                id: item,
                                uid: userId,
                                title: items[item].title,
                                user: items[item].user
                            })
                        }
                    }

                    setUsers(newState)
                })

                setStage(new Konva.Stage({
                    container: 'canvas',
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                }))
            } 
        })

        function handleResize() {
            stage?.size({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight
            })
        }
    
        window.addEventListener('resize', handleResize)
    }, [])

    const syncCanvas = (items) => {
        var layer = new Konva.Layer()

        for (let item in items) {
            if(item){
                let shape = items[item]?.shape ?? 'Circle'

                var kItem = new Konva[shape]({
                    x: items[item].x,
                    y: items[item].y,
                    radius: 70,
                    fill: 'red',
                    stroke: 'black',
                    strokeWidth: 4
                })
                kItem.draggable('true')
                layer.add(kItem)
                kItem.on('dragend', (e) => {
                    let pos = e.target.getPosition()
                    //console.log(e)
                    console.log(`${item}: (${pos.x}, ${pos.y})`)
                    const _itemsTable = firebase.database().ref(`canvas/test/items/${item}`)
                    _itemsTable.update({
                        x: pos.x,
                        y: pos.y
                    })
                })
            }
        }

        stage.off('click')
        stage.on('click', (e) => {
            // console.log(e.evt)
            console.log(`shape: ${shape}`)
            if(e.evt.shiftKey)
                return
            const _itemsTable = firebase.database().ref(`canvas/test/items/`)
            _itemsTable.push({
                x: e.evt.layerX,
                y: e.evt.layerY,
                shape : getSettings().shape
            })
        })        

        stage.destroyChildren()
        stage.add(layer)
        stage.draw()
    }

    useEffect(() => {
        if(!stage)
            return

        const itemsRef = firebase.database().ref(`canvas/test/items`)
        itemsRef.get().then(snapshot => syncCanvas(snapshot.val()))
        itemsRef.on('value', snapshot => syncCanvas(snapshot.val()))
    },[stage])

    const logout = () => {
        auth.signOut().then(() => {
            setUser(null)
        })
    }

    const login = () => {
        auth.signInWithPopup(provider).then((result) => {
            const userRes = result.user
            setUser(userRes)
        })
    }

    return (
        <div className='app'>
            <header>
                <div className='wrapper'>
                    <h1>CARTA</h1>
                    <div className='user-profile'>
                        {user ?
                            <>
                                <img src={user.photoURL} />
                                <button onClick={logout}>Log Out</button>  
                            </>              
                        :
                            <button onClick={login}>Log In</button>              
                        }
                    </div>
                </div>
            </header>
            {user ?
                <div>
                    <div className='container' ref={containerRef}>
                        {/* <Canvas user={user} settings={settings}/> */}
                        <div id="canvas"></div>
                        <Toolbar callback={useToolbar} settings={settings}/>
                        {settings.shapeMenuOpen && <ShapeToolbar callback={useToolbarShape} settings={settings}/>}
                    </div>
                </div>
            :
                <div className='wrapper'>
                    <p>You must be logged in to see your maps.</p>
                </div>
            }
        </div>
    )
}

export default App