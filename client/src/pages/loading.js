import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { server } from '../server';

import { Context } from '../components/context';

export default function Loading() {
    const { setIsSign, setUserData, socket } = useContext(Context);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if(token == null) navigate('/login');
        else {
            server('/authorization', { token })
            .then(result => {
                if(result.error) navigate('/login');
                else {
                    setUserData(result);
                    socket.emit('online', { id: result._id });
                    setIsSign(true);
                }
            })
            .catch(e => navigate('/login'));
        }
    }, [])

    return(
        <div className='page'>
            <img className='loading_icon' src='images/icon.png' />

            <div className='loading_wrapper'>
                <div className='loading_block'></div>
            </div>
        </div>
    )
}