import React, { Component, useState, useEffect, useRef, useCallback } from 'react'
import firebase, { auth, provider } from './firebase.js'
import Canvas from './Canvas'
import './App.css'

const App = () => {

    const [currentItem, setCurrentItem] = useState('')
    const [items, setItems] = useState([])
    const [user, setUser] = useState(null)

    const listenToItemsCollection = () => {
        const itemsRef = firebase.database().ref('users');
        itemsRef.on('value', (snapshot) => {
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

            setItems(newState)
        })
    }

    useEffect(() => {
        auth.onAuthStateChanged((userObj) => {
            if (userObj) {
                setUser(userObj)
                listenToItemsCollection()
            } 
        })
    }, [])

    const removeItem = (itemId) => {
        const itemRef = firebase.database().ref(`/users/${this.state.user.uid}/items/${itemId}`);
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
            setItems(items)
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
                    <div className='container'>
                        <Canvas/>
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