const { useState, useEffect } = require('react');
const { Link } = require('react-router-dom');
const { server } = require('../server.js');
const serverUrl = require('../server_url.js');

require('../styles/sidemenu.css');

export default function LeftMenu(props) {
    const { id, socket } = props;

    const [style, setStyle] = useState({left: '0'});
    const [chats, setChats] = useState([]);

    useEffect(() => {
        getChats();

        if(localStorage.getItem('closeLeftMenu') == '1') setStyle({left: '-22.9vw'});

        socket.on('update', getChats);
        socket.on('createdChat', id => {
            getChats();
            socket.emit('joinChat', id);
        })
    }, [])

    async function getChats() {
        server('/chat/getChats', { id })
        .then(result => setChats(result))
    }

    function closeMenu() {
        if(style.left == '0') {
            setStyle({left: '-22.9vw'});
            localStorage.setItem('closeLeftMenu', '1');
            document.querySelector('.page').classList.add('closeLeftMenu');
        }
        else {
            setStyle({left: '0'});
            localStorage.setItem('closeLeftMenu', '0');
            document.querySelector('.page').classList.remove('closeLeftMenu');
        }
    }

    if(id != undefined) return(
        <div className='sidemenu_wrapper leftmenu' style={style}>
            <img className='sidemenu_image' src='/images/menu.png' onClick={closeMenu}/>
            <div className='sidemenu_items'>
                {chats.map((chat, i) => 
                    <Link className='sidemenu_item' key={i} to={`/chat/${chat._id}`}>
                        <div className='sidemenu_item_avatar'>
                            <img src={`${serverUrl}/users/${chat.avatar}/avatar.png`}/>
                            {chat.online && <div className='sidemenu_item_avatar_status'></div>}
                        </div>
                        <div className='sidemenu_item_name'>{chat.name}</div>
                        {chat.notify && <div className='sidemenu_item_notify'></div>}
                    </Link>
                )}
            </div>
        </div>
    )
}