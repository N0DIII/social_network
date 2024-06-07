import { createContext, useState } from 'react';
import { io } from 'socket.io-client';
import serverUrl from '../server_url';

const Context = createContext(false);
const socket = io.connect(serverUrl);

const Provider = ({ children }) => {
    const [isSign, setIsSign] = useState(false);
    const [userData, setUserData] = useState(false);
    const [error, setError] = useState([false, '']);
    const [success, setSuccess] = useState([false, '']);
    const [confirm, setConfirm] = useState([false]);
    const [fFiles, setFFiles] = useState([]);
    const [sFFile, setSFFile] = useState(null);
    const [fParams, setFParams] = useState({ show: false, link: '' });

    return(
        <Context.Provider value={{ userData, setUserData, error, setError, success, setSuccess, confirm, setConfirm, socket, isSign, setIsSign,
        fFiles, setFFiles, sFFile, setSFFile, fParams, setFParams }}>
            {children}
        </Context.Provider>
    )
}

export { Context, Provider };