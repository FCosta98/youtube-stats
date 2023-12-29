import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login'
import Callback from './components/Callback';
import Dashboard from './components/Dashboard';
import Drag from './components/Drag';

export default function App() {
    const [googleAccessToken, setGoogleAccessToken] = useState(localStorage.getItem('googleAccessToken'));
    const [isAuth, setIsAuth] = useState(false)

    useEffect(() => {
        if (googleAccessToken) {
            console.log("GOOGLE TOKEN:", googleAccessToken)
            setGoogleAccessToken(googleAccessToken)
            setIsAuth(true);
        }
    }, [googleAccessToken]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<NewRoute isAuth={isAuth} token={googleAccessToken} />} />
                <Route path="/callback" element={<Callback />} />
                <Route path="/drag" element={<Drag />} />
            </Routes>
        </Router>
    );
}

function NewRoute({ isAuth, token }) {
    if (isAuth) {
        return <Dashboard token={token}/>
    }
    else {
        return <Login />
    }
}