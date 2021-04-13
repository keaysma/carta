import React, { Component, useState, useEffect, useRef, useCallback } from 'react'
import Konva from 'konva'
import firebase, { auth, provider } from './firebase.js'
import Canvas from './Canvas'
import Toolbar from './Toolbar'
import './App.scss'

const App = () => {

    const [settings, setSettings] = useState({
        gridMode : false,
        color: '#00F'
    })
    const containerRef = useRef()
    const [stage, setStage] = useState(null)
    const [currentItem, setCurrentItem] = useState('')
    const [users, setUsers] = useState([])
    const [user, setUser] = useState(null)

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
    }, [])

    useEffect(() => {
        if(!stage)
            return

        const itemsRef = firebase.database().ref(`canvas/test/items`)
        itemsRef.get().then(snapshot => syncCanvas(snapshot.val()))
        itemsRef.on('value', snapshot => syncCanvas(snapshot.val()))
    },[stage])

    const syncCanvas = (items) => {
        let newObjects = []

        var layer = new Konva.Layer()

        for (let item in items) {
            if(item){
                newObjects.push({
                    id: item,
                    x: items[item].x,
                    y: items[item].y
                })

                var circle = new Konva.Circle({
                    x: items[item].x,
                    y: items[item].y,
                    radius: 70,
                    fill: 'red',
                    stroke: 'black',
                    strokeWidth: 4
                })
                circle.draggable('true')
                layer.add(circle)
                circle.on('dragend', (e) => {
                    console.log('.')
                    let pos = circle.getPosition()
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
            console.log(e.evt)
            if(e.evt.shiftKey)
                return
            const _itemsTable = firebase.database().ref(`canvas/test/items/`)
            _itemsTable.push({
                x: e.evt.layerX,
                y: e.evt.layerY
            })
        })        

        stage.destroyChildren()
        stage.add(layer)
        stage.draw()
    }

    useEffect(() => {
        function handleResize() {
            //console.log('resized to: ', window.innerWidth, 'x', window.innerHeight)
            stage?.size({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight
            })
        }
    
        window.addEventListener('resize', handleResize)
    })

    const removeItem = (itemId) => {
        const itemRef = firebase.database().ref(`/users/${user.uid}/items/${itemId}`);
        itemRef.remove();
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const itemsRef = firebase.database().ref(`/users/${this.state.user.uid}/items`);
        const item = {
            title: currentItem,
            user: user.displayName || user.email
        }
        
        itemsRef.push(item);
        
        setCurrentItem('')
    }

    const draw = ctx => {
        if(!ctx)
            return
        ctx.fillStyle = '#0000f0'
        ctx.beginPath()
        ctx.arc(50, 50, 20, 0, 2*Math.PI)
        ctx.fill()
    }

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

    const useToolbar = (state) => {
        if(state === 'grid')
            setSettings({ ...settings, gridMode: !settings.gridMode})

        if(state === 'clean'){
            const itemsTable = firebase.database().ref(`canvas/test/items`)
            itemsTable.remove()
        }
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