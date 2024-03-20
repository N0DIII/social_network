const { useState, useEffect } = require('react');
const { useNavigate, Link } = require('react-router-dom');
const server = require('../server.js');
const serverUrl = require('../server_url.js');

require('../styles/friends.css');

const arrowImg = require('../images/arrowDown1.png');

const RightMenu = require('./right_menu.js').default;
const LeftMenu = require('./left_menu.js').default;
const Search = require('./search.js').default;

export default function Friends(props) {
    const { userData } = props;
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [friends, setFriends] = useState([]);
    const [users, setUsers] = useState([]);

    const [showFriends, setShowFriends] = useState(true);
    const [showUsers, setShowUsers] = useState(true);

    const [count, setCount] = useState(0);

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');

        setFriends([]);
        server('/user/getFriends', {id: userData._id, search})
        .then(result => {
            setFriends(result);
        })

        setUsers([]);
        setCount(0);
        getUsers();
    }, [userData, search])

    function getUsers() {
        server('/user/getUsers', {id: userData._id, count, search})
        .then(result => {
            setUsers(users => [...users, ...result]);
            if(result.length != 0) setCount(count + 1);
        })
    }

    function scroll(e) {
        const scrollTop = e.target.scrollTop;
        const clientHeight = e.target.clientHeight;
        const scrollHeight = e.target.scrollHeight;
        const dif = scrollHeight / 4;

        if(scrollTop + clientHeight >= scrollHeight - dif) {
            getUsers();
        }
    }

    function throttle(callee, timeout) {
        let timer = null;
      
        return function perform(...args) {
            if (timer) return;
        
            timer = setTimeout(() => {
                callee(...args);
                clearTimeout(timer);
                timer = null;
            }, timeout)
        }
    }

    return(
        <div className='page' onScroll={throttle(scroll, 250)} onResize={throttle(scroll, 250)}>
            {userData && <RightMenu id={userData._id} username={userData.username}/>}
            {userData && <LeftMenu id={userData._id}/>}

            <div className='friends_wrapper'>
                <Search setValue={setSearch}/>

                <div className='friends_separator' onClick={() => setShowFriends(!showFriends)}>
                    Мои друзья
                    <img src={arrowImg} style={showFriends ? {transform: 'rotate(180deg)'} : {}}/>
                </div>

                <div className='friends_block' style={showFriends ? {} : {height: 0}}>
                    {friends.map((item, i) => 
                        <Link className='friends_block_item' key={i} to={`/profile/${item._id}`}>
                            <img src={`${serverUrl}/users/${item._id}/avatar.png`}/>
                            <div className='friends_block_item_username'>{item.username}</div>
                        </Link>
                    )}

                    {friends.length == 0 && <div className='friends_block_noResult'>Нет результатов</div>}
                </div>

                <div className='friends_separator' onClick={() => setShowUsers(!showUsers)}>
                    Все пользователи
                    <img src={arrowImg} style={showUsers ? {transform: 'rotate(180deg)'} : {}}/>
                </div>

                <div className='friends_block' style={showUsers ? {} : {height: 0}}>
                    {users.map((item, i) => 
                        <Link className='friends_block_item' key={i} to={`/profile/${item._id}`}>
                            <img src={`${serverUrl}/users/${item._id}/avatar.png`}/>
                            <div className='friends_block_item_username'>{item.username}</div>
                        </Link>
                    )}

                    {users.length == 0 && <div className='friends_block_noResult'>Нет результатов</div>}
                </div>
            </div>
        </div>
    )
}