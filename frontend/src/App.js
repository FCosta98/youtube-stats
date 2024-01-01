import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login'
import Callback from './pages/Callback';
import Dashboard from './pages/Dashboard';
import Homepage from './pages/Homepage';
import Analytics from './pages/Analytics';

export default function App() {
    const [googleAccessToken, setGoogleAccessToken] = useState(localStorage.getItem('googleAccessToken'));
    const [isAuth, setIsAuth] = useState(false)

    //login useeffect
    // useEffect(() => {
    //     if (googleAccessToken) {
    //         console.log("GOOGLE TOKEN:", googleAccessToken)
    //         setGoogleAccessToken(googleAccessToken)
    //         setIsAuth(true);
    //     }
    // }, [googleAccessToken]);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<NewRoute isAuth={isAuth} token={googleAccessToken} />} />
                <Route path="/callback" element={<Callback />} />
                <Route path="/" element={<Homepage />} />
                <Route path="/analytics" element={<Analytics />} />
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