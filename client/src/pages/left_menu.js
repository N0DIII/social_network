import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import serverUrl from '../server_url';

import { Context } from '../components/context';
import Input from '../components/input';
import Button from '../components/button';

export default function LeftMenu() {
    const { userData, socket, setError } = useContext(Context);
    const navigate = useNavigate();

    const [chats, setChats] = useState(null);
    const [showButton, setShowButton] = useState(false);
    const [name, setName] = useState('');

    useEffect(() => {
        socket.emit('getChats', { senderId: userData._id });
        socket.on('getChats', chats => setChats(chats));

        return () => {
            socket.off('getChats');
        }
    }, [])

    useEffect(() => {
        if(chats == null || chats.length == 0) return;

        socket.on('userOnline', id => {
            setChats(prevState => prevState.map(chat => { 
                if(chat.type == 'personal' && chat.user._id == id) return { ...chat, user: { ...chat.user, online: true } };
                else return chat;
            }))
        })

        socket.on('userOffline', id => {
            setChats(prevState => prevState.map(chat => { 
                if(chat.type == 'personal' && chat.user._id == id) return { ...chat, user: { ...chat.user, online: false } };
                else return chat;
            }))
        })

        return () => {
            socket.off('userOnline');
            socket.off('userOffline');
        }
    }, [chats])

    function createChat() {
        socket.emit('createChat', { type: 'public', senderId: userData._id, name });
        socket.on('createChat', result => {
            if(result.error) setError([true, result.message]);
            else {
                setShowButton(false);
                navigate(`/chat/${result.id}`);
            }

            socket.off('createChat');
        })
    }

    return(
        <div className='sidemenu_wrapper leftmenu'>
            {chats == null &&
            <div className='leftmenu_noItems'>
                <div className='leftmenu_noItems_loading'></div>
            </div>}

            {chats != null && chats.length == 0 &&
            <div className='leftmenu_noItems'>
                <div className='leftmenu_noItems_text'>Еще нет чатов</div>
            </div>}

            {chats != null && chats.length != 0 && chats.map((chat, i) => 
                <Link key={i} to={`/chat/${chat._id}`} className='leftmenu_chat'>
                    {chat.type == 'personal' && <img src={`${serverUrl}/users/${chat.user._id}/avatar/${chat.user.avatar}`} />}
                    {chat.type == 'public' && <img src={`${serverUrl}/chats/${chat._id}/avatar/${chat.avatar}`} />}

                    {chat.type == 'personal' && chat.user.online && <div className='leftmenu_chat_status'></div>}

                    {chat.type == 'personal' && <div>{chat.user.username}</div>}
                    {chat.type == 'public' && <div>{chat.name}</div>}
                </Link>
            )}

            <div className='leftmenu_create'>
                <Button title='Создать чат' onClick={() => setShowButton(true)} />
            </div>

            {showButton &&
            <div className='dataform_wrapper'>
                <div className='dataform'>
                    <img className='dataform_close' src='/images/cross.png' onClick={() => setShowButton(false)} />

                    <Input value={name} setValue={setName} placeholder='Название чата' />

                    <Button title='Создать' onClick={createChat} />
                </div>
            </div>}
        </div>
    )
}