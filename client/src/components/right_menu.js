const { useEffect, useState } = require('react');
const { Link } = require('react-router-dom');
const serverUrl = require('../server_url.js');

require('../styles/sidemenu.css');

export default function RightMenu(props) {
    const { id, username } = props;

    const [style, setStyle] = useState({right: '0'});

    useEffect(() => {
        if(localStorage.getItem('closeRightMenu') == '1') setStyle({right: '-100vw'});
    }, [])

    function closeMenu() {
        if(style.right == '0') {
            setStyle({right: '-100vw'});
            localStorage.setItem('closeRightMenu', '1');
            document.querySelector('.page').classList.add('closeRightMenu');
        }
        else {
            setStyle({right: '0'});
            localStorage.setItem('closeRightMenu', '0');
            document.querySelector('.page').classList.remove('closeRightMenu');
        }
    }

    function closeMobile() {
        const isMobile = /Mobile|webOS|BlackBerry|IEMobile|MeeGo|mini|Fennec|Windows Phone|Android|iP(ad|od|hone)/i.test(navigator.userAgent);
        if(isMobile) closeMenu();
    }

    function signOut() {
        localStorage.setItem('token', '');
        window.location.assign('/login');
    }

    if(id != undefined) return(
        <div className='sidemenu_wrapper rightmenu' style={style}>
            <div className='sidemenu_userdata' onClick={closeMenu}>
                <img className='sidemenu_userdata_avatar' src={`${serverUrl}/users/${id}/avatar.png`}/>
                <div className='sidemenu_userdata_username'>{username}</div>
            </div>
            <div className='sidemenu_items' onClick={closeMobile}>
                <Link className='sidemenu_item' to='/'><div className='sidemenu_item_title'>Главная</div></Link>
                <Link className='sidemenu_item' to='/groups'><div className='sidemenu_item_title'>Сообщества</div></Link>
                <Link className='sidemenu_item' to='/friends?page=friends'><div className='sidemenu_item_title'>Друзья</div></Link>
                <Link className='sidemenu_item' to={`/profile/${id}`}><div className='sidemenu_item_title'>Профиль</div></Link>
                <div className='sidemenu_item' onClick={signOut}><div className='sidemenu_item_title'>Выйти</div></div>
            </div>
        </div>
    )
}