import { useContext } from 'react';
import { Link } from 'react-router-dom';

import serverUrl from '../server_url';

import { Context } from '../components/context';

export default function RightMenu() {
    const { userData, setIsSign } = useContext(Context);

    function signOut() {
        localStorage.removeItem('token');
        setIsSign(false);
        window.location.assign('/');
    }

    return(
        <div className='sidemenu_wrapper rightmenu'>
            <div className='sidemenu_userdata'>
                <img className='sidemenu_avatar' src={`${serverUrl}/users/${userData._id}/avatar/${userData.avatar}`}/>
                <div className='sidemenu_username'>{userData.username}</div>
            </div>
            <div className='sidemenu_links'>
                <Link className='sidemenu_link' to='/'>Главная</Link>
                <Link className='sidemenu_link' to='/groups?page=subscribe'>Группы</Link>
                <Link className='sidemenu_link' to='/friends?page=friends'>Друзья</Link>
                <Link className='sidemenu_link' to={`/profile/${userData._id}`}>Профиль</Link>
                <div className='sidemenu_link' onClick={signOut}>Выйти</div>
            </div>
        </div>
    )
}