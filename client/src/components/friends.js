const { useState, useEffect } = require('react');
const { useNavigate, Link } = require('react-router-dom');
const { server } = require('../server.js');
const serverUrl = require('../server_url.js');

require('../styles/friends.css');

const Search = require('./search.js').default;

export default function Friends(props) {
    const { userData } = props;
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [items, setItems] = useState([]);

    const [count, setCount] = useState(0);
    const [page, setPage] = useState('friends');

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');
        if(localStorage.getItem('closeRightMenu') == '1') document.querySelector('.page').classList.add('closeRightMenu');
        if(localStorage.getItem('closeLeftMenu') == '1') document.querySelector('.page').classList.add('closeLeftMenu');

        getItems(false);
    }, [userData, search, page])

    function scroll(e) {
        const scrollTop = e.target.scrollTop;
        const clientHeight = e.target.clientHeight;
        const scrollHeight = e.target.scrollHeight;
        const dif = scrollHeight / 4;

        if(scrollTop + clientHeight >= scrollHeight - dif) {
            getItems(true);
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

    async function getItems(add) {
        if(!add) setCount(0);

        switch(page) {
            case 'friends': 
                let friends = await getFriends();
                if(add) setItems([...items, ...friends]);
                else setItems(friends);
                break;
            case 'requests': 
                let requests = await getRequests();
                if(add) setItems([...items, ...requests]);
                else setItems(requests);
                break;
            case 'users': 
                let users = await getUsers();
                if(add) setItems([...items, ...users]);
                else setItems(users);
                break;
        }
    }
    
    async function getFriends() {
        return server('/user/getFriends', {id: userData._id, count, search})
        .then(result => {
            if(result.length != 0) setCount(count + 1);
            return result;
        })
    }

    async function getRequests() {
        return server('/user/getRequests', {id: userData._id, count, search})
        .then(result => {
            if(result.length != 0) setCount(count + 1);
            return result;
        })
    }

    async function getUsers() {
        return server('/user/getUsers', {id: userData._id, count, search})
        .then(result => {
            if(result.length != 0) setCount(count + 1);
            return result;
        })
    }

    return(
        <div className='page' onScroll={throttle(scroll, 250)} onResize={throttle(scroll, 250)}>
            <div className='page_title'>
                <Search setValue={setSearch}/>
            </div>

            <div className='friends_wrapper'>

                <div className='friends_navigate_wrapper'>
                    <div className='friends_navigate_item' onClick={() => {setPage('friends'); setCount(0)}} style={page == 'friends' ? {borderBottom: '3px solid #8551FF'} : {}}>Друзья</div>
                    <div className='friends_navigate_item' onClick={() => {setPage('requests'); setCount(0)}} style={page == 'requests' ? {borderBottom: '3px solid #8551FF'} : {}}>Приглашения</div>
                    <div className='friends_navigate_item' onClick={() => {setPage('users'); setCount(0)}} style={page == 'users' ? {borderBottom: '3px solid #8551FF'} : {}}>Все пользователи</div>
                </div>

                <div className='friends_block'>
                    {items.map((item, i) => 
                        <Link className='friends_block_item' key={i} to={`/profile/${item._id}`}>
                            <div className='friends_block_item_avatar'>
                                <img src={`${serverUrl}/users/${item._id}/avatar.png`}/>
                                {item.online && <div className='friends_block_item_avatar_status'></div>}
                            </div>
                            <div className='friends_block_item_username'>{item.username}</div>
                        </Link>
                    )}

                    {items.length == 0 && <div className='friends_block_noResult'>Нет результатов</div>}
                </div>
            </div>
        </div>
    )
}