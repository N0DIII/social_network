const { Link } = require('react-router-dom');
const serverUrl = require('../server_url.js');

require('../styles/mobile_menu.css');

export default function MobileMenu(props) {
    const { id, avatar } = props;

    return(
        <div className='mobileMenu_wrapper'>
            <Link className='mobileMenu_item' to='/'>
                <img src='/images/home.png'/>
                <div>Главная</div>
            </Link>
            <Link className='mobileMenu_item' to='/groups?page=subscribe'>
                <img src='/images/groups.png'/>
                <div>Сообщества</div>
            </Link>
            <Link className='mobileMenu_item' to='/chats'>
                <img src='/images/chat.png'/>
                <div>Чаты</div>
            </Link>
            <Link className='mobileMenu_item' to='/friends?page=friends'>
                <img src='/images/friend.png'/>
                <div>Друзья</div>
            </Link>
            <Link className='mobileMenu_item' to={`/profile/${id}`}>
                <img src={`${serverUrl}/users/${id}/avatar_${avatar}.png`} className='mobileMenu_avatar'/>
                <div>Профиль</div>
            </Link>
        </div>
    )
}