const { useState, useEffect } = require('react');
const { Link, useNavigate } = require('react-router-dom');
const { useInput } = require('../hooks/useInput.js');
const { server } = require('../server.js');
const serverUrl = require('../server_url.js');

require('../styles/sidemenu.css');

const Button = require('./button.js').default;
const Input = require('./input.js').default;

export default function LeftMenu(props) {
    const { id, socket, setError } = props;
    const navigate = useNavigate();

    const [chats, setChats] = useState([]);
    const [showButton, setShowButton] = useState(false);
    const [startCreate, setStartCreate] = useState(false);
    const newChatName = useInput('');

    useEffect(() => {
        server('/chat/getChats', { id }).then(result => setChats([...result.filter(chat => chat.notify != 0), ...result.filter(chat => chat.notify == 0)]));

        const keydown = e => {
            if(e.key == 'Escape') {
                setStartCreate(false); 
                setShowButton(false);
            }
        }

        window.addEventListener('keydown', keydown);

        return () => window.removeEventListener('keydown', keydown);
    }, [])

    useEffect(() => {
        function chatOnline(id, bool) {
            let chat = chats.find(item => item._id == id && item.type == 'personal');
            if(chat == undefined) return;
            let index = chats.indexOf(chat);
            chat.online = bool;
            setChats([...chats.slice(0, index), chat, ...chats.slice(index + 1, chats.length)]);
        }

        socket.on('userOnline', id => chatOnline(id, true));
        socket.on('userOffline', id => chatOnline(id, false));

        socket.on('newMessage', notify => {
            const updChats = chats.map(chat => {
                if(chat._id == notify.chat) {
                    let updChat = chat;
                    updChat.notify = notify.count;
                    return updChat;
                }
                else return chat;
            })
            setChats([...updChats.filter(chat => chat.notify != 0), ...updChats.filter(chat => chat.notify == 0)]);
        })

        socket.on('createdChat', chat => {
            server('/chat/getChat', { chatID: chat, userID: id }).then(result => setChats([...chats, result]));
            socket.emit('joinChat', chat);
        })

        return () => {
            socket.off('userOnline');
            socket.off('userOffline');
            socket.off('newMessage');
            socket.off('createdChat');
        }
    }, [chats])

    function createPublicChat() {
        socket.emit('createPublicChat', { user: id, name: newChatName.value });
        socket.on('createPublicChat', result => {
            if(result.error) setError([true, result.message]);
            else {
                setShowButton(false);
                setStartCreate(false);
                navigate(`/chat/${result.id}`);
            }
        })
    }

    if(id != undefined) return(
        <div className='sidemenu_wrapper leftmenu' onMouseEnter={() => setShowButton(true)} onMouseLeave={() => setShowButton(false)}>
            <div className='sidemenu_items'>
                {chats.map((chat, i) => 
                    <Link className='sidemenu_item' key={i} to={`/chat/${chat._id}`}>
                        <div className='sidemenu_item_avatar'>
                            <img src={serverUrl + chat.avatar}/>
                            {chat.online && <div className='sidemenu_item_avatar_status'></div>}
                        </div>
                        <div className='sidemenu_item_name'>{chat.name}</div>
                        {chat.notify != undefined && chat.notify != 0 && <div className='sidemenu_item_notify'>{chat.notify}</div>}
                    </Link>
                )}
            </div>
            <div className='sidemenu_newChat_wrapper' style={showButton ? {opacity: '1'} : {opacity: '0'}}>
                <div className='sidemenu_newChat_button'><Button title='Создать групповой чат' onclick={() => setStartCreate(true)}/></div>
                {startCreate &&
                <div className='dataform_wrapper'>
                    <div className='dataform'>
                        <img className='dataform_close' src='/images/cross.png' onClick={() => {setStartCreate(false); setShowButton(false)}}/>
                        <div className='dataform_input'><Input { ...newChatName } placeholder='Название'/></div>
                        <div className='dataform_button'><Button title='Создать' onclick={createPublicChat}/></div>
                    </div>
                </div>}
            </div>
        </div>
    )
}