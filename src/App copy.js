import React, { Component } from 'react'
import firebase, { auth, provider } from './firebase.js'
import './App.css'

class App extends Component {
    constructor() {
        super();
        this.state = {
            currentItem: '',
            items: [],
            user: null
        }

        this.listenToItemsCollection = this.listenToItemsCollection.bind(this)

        this.removeItem = this.removeItem.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

        this.login = this.login.bind(this)
        this.logout = this.logout.bind(this)
    }

    listenToItemsCollection(){
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

            this.setState({
                items: newState
            })
        })
    }

    componentDidMount() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.setState({ user })
                this.listenToItemsCollection()
            } 
        })
    }

    removeItem(itemId) {
        const itemRef = firebase.database().ref(`/users/${this.state.user.uid}/items/${itemId}`);
        itemRef.remove();
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const itemsRef = firebase.database().ref(`/users/${this.state.user.uid}/items`);
        const item = {
            title: this.state.currentItem,
            user: this.state.user.displayName || this.state.user.email
        }
        
        itemsRef.push(item);
        
        this.setState({
            currentItem: '',
            username: ''
        })
    }

    logout() {
        auth.signOut().then(() => {
            this.setState({
                user: null,
                items: []
            })
        })
    }

    login() {
        auth.signInWithPopup(provider).then((result) => {
            const user = result.user
            this.setState({ user })
        })
    }

    render() {
        return (
            <div className='app'>
                <header>
                    <div className='wrapper'>
                        <h1>CARTA</h1>
                        <div className='user-profile'>
                            {this.state.user ?
                                <>
                                    <img src={this.state.user.photoURL} />
                                    <button onClick={this.logout}>Log Out</button>  
                                </>              
                            :
                                <button onClick={this.login}>Log In</button>              
                            }
                        </div>
                    </div>
                </header>
                {this.state.user ?
                    <div>
                        <div className='container'>
                            <section className='add-item'>
                                <form onSubmit={this.handleSubmit}>
                                    <input type="text" name="username" placeholder="What's your name?" value={this.state.user.displayName || this.state.user.email} disabled />
                                    <input type="text" name="currentItem" placeholder="What are you bringing?" onChange={this.handleChange} value={this.state.currentItem} />
                                    <button>Add Item</button>
                                </form>
                            </section>
                            <section className='display-item'>
                                <div className="wrapper">
                                    <ul>
                                        {this.state.items.map((item) => {
                                            return (
                                                <li key={item.id}>
                                                <h3>{item.title}</h3>
                                                <p>brought by: {item.user}
                                                    {item.user === this.state.user.displayName || item.user === this.state.user.email ?
                                                        <button onClick={() => this.removeItem(item.id)}>Remove Item</button> : null
                                                    }
                                                </p>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </section>
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
}
export default App;