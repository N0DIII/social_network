const { Link } = require('react-router-dom');
const serverUrl = require('../server_url.js');

require('../styles/sidemenu.css');

export default function RightMenu(props) {
    const { id, username } = props;

    function signOut() {
        localStorage.setItem('token', '');
        window.location.assign('/login');
    }

    if(id != undefined) return(
        <div className='sidemenu_wrapper rightmenu'>
            <div className='sidemenu_userdata'>
                <img className='sidemenu_userdata_avatar' src={`${serverUrl}/users/${id}/avatar.png`}/>
                <div className='sidemenu_userdata_username'>{username}</div>
            </div>
            <div className='sidemenu_items'>
                <Link className='sidemenu_item' to='/'><div className='sidemenu_item_title'>Главная</div></Link>
                <Link className='sidemenu_item' to='/groups?page=subscribe'><div className='sidemenu_item_title'>Сообщества</div></Link>
                <Link className='sidemenu_item' to='/friends?page=friends'><div className='sidemenu_item_title'>Друзья</div></Link>
                <Link className='sidemenu_item' to={`/profile/${id}`}><div className='sidemenu_item_title'>Профиль</div></Link>
                <div className='sidemenu_item' onClick={signOut}><div className='sidemenu_item_title'>Выйти</div></div>
            </div>
        </div>
    )
}