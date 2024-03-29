import axios from "axios"
import React, { useEffect } from 'react';

export default function Callback() {

    useEffect(() => {
        const handleCallback = async () => {
            const code  = new URLSearchParams(window.location.search).get('code');
            console.log("CODE :", code);
            axios.post("http://127.0.0.1:8000/v1/auth/google/auth", {code: code})
            .then(res => {
                console.log("RESPONSE DATA :", res.data.token)
                localStorage.setItem('googleAccessToken', res.data.token);
                window.location.href = '/login';
            })
            .catch((err) => {
                console.log("ERROR 123:", err);
                window.location.href = '/login';
            })
        };
        handleCallback();
    }, []);

    return (
        <div>
            <h1 className="callback-container">Redirecting...</h1>
        </div>
    );
}