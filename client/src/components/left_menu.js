const { useState, useEffect } = require('react');
const { Link } = require('react-router-dom');
const server = require('../server');
const serverUrl = require('../server_url.js');

require('../styles/sidemenu.css');

const menuImg = require('../images/menu.png');

export default function LeftMenu(props) {
    const { id } = props;

    const [style, setStyle] = useState({left: '0'});
    const [chats, setChats] = useState([]);

    useEffect(() => {
        server('/chat/getChats', { id })
        .then(result => {
            setChats(result);
        })
    }, [])

    function closeMenu() {
        if(style.left == '0') setStyle({left: '-22.9vw'});
        else setStyle({left: '0'});
    }

    return(
        <div className='sidemenu_wrapper leftmenu' style={style}>
            <img className='sidemenu_image' src={menuImg} onClick={closeMenu}/>
            <div className='sidemenu_items'>
                {chats.map((chat, i) => 
                    <Link className='sidemenu_item' key={i} to={`/chat/${chat._id}`}>
                        <img className='sidemenu_item_avatar' src={`${serverUrl}/users/${chat.avatar}/avatar.png`}/>
                        <div className='sidemenu_item_name'>{chat.name}</div>
                    </Link>
                )}
            </div>
        </div>
    )
}