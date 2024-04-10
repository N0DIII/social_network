const { useState, useEffect } = require('react');
const { Link, useNavigate } = require('react-router-dom');
const { server } = require('../server.js');
const serverUrl = require('../server_url.js');

require('../styles/sidemenu.css');

const Button = require('./button.js').default;
const Input = require('./input.js').default;

export default function LeftMenu(props) {
    const { id, socket, setError } = props;
    const navigate = useNavigate();

    const [style, setStyle] = useState({left: '0'});
    const [chats, setChats] = useState([]);
    const [showButton, setShowButton] = useState(false);
    const [startCreate, setStartCreate] = useState(false);
    const [newChatName, setNewChatName] = useState('');

    useEffect(() => {
        if(localStorage.getItem('closeLeftMenu') == '1') setStyle({left: '-100vw'});
        server('/chat/getChats', { id }).then(result => setChats(result));

        socket.on('update', () => {
            server('/chat/getChats', { id }).then(result => setChats(result));
        })

        socket.on('createdChat', id => {
            server('/chat/getChats', { id }).then(result => setChats(result));
            socket.emit('joinChat', id);
        })

        return () => {
            socket.off('update');
            socket.off('createdChat');
        }
    }, [])

    function closeMenu() {
        if(style.left == '0') {
            setStyle({left: '-100vw'});
            localStorage.setItem('closeLeftMenu', '1');
            document.querySelector('.page').classList.add('closeLeftMenu');
        }
        else {
            setStyle({left: '0'});
            localStorage.setItem('closeLeftMenu', '0');
            document.querySelector('.page').classList.remove('closeLeftMenu');
        }
    }

    function closeMobile() {
        const isMobile = /Mobile|webOS|BlackBerry|IEMobile|MeeGo|mini|Fennec|Windows Phone|Android|iP(ad|od|hone)/i.test(navigator.userAgent);
        if(isMobile) closeMenu();
    }

    function createPublicChat() {
        socket.emit('createPublicChat', { user: id, name: newChatName });
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
        <div className='sidemenu_wrapper leftmenu' style={style} onMouseEnter={() => setShowButton(true)} onMouseLeave={() => {setShowButton(false); setStartCreate(false)}}>
            <img className='sidemenu_image' src='/images/menu.png' onClick={closeMenu}/>
            <div className='sidemenu_items'>
                {chats.map((chat, i) => 
                    <Link className='sidemenu_item' key={i} to={`/chat/${chat._id}`} onClick={closeMobile}>
                        <div className='sidemenu_item_avatar'>
                            <img src={serverUrl + chat.avatar}/>
                            {chat.online && <div className='sidemenu_item_avatar_status'></div>}
                        </div>
                        <div className='sidemenu_item_name'>{chat.name}</div>
                        {chat.notify && <div className='sidemenu_item_notify'></div>}
                    </Link>
                )}
            </div>
            <div className='sidemenu_newChat_wrapper' style={showButton ? {opacity: '1'} : {opacity: '0'}}>
                <div className='sidemenu_newChat_input'>
                    <Input type='text' placeholder='Название' value={newChatName} setValue={setNewChatName}/>
                    <img src='/images/checkMark.png' onClick={createPublicChat}/>
                </div>
                {!startCreate && <div className='sidemenu_newChat_button'><Button title='Создать групповой чат' onclick={() => setStartCreate(true)}/></div>}
            </div>
        </div>
    )
}