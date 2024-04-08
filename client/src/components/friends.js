const { useState, useEffect } = require('react');
const { useNavigate } = require('react-router-dom');
const { server } = require('../server.js');

require('../styles/friends.css');

const Search = require('./search.js').default;
const Friendslist = require('./friendslist.js').default;

export default function Friends(props) {
    const { userData, setError } = props;
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [friends, setFriends] = useState(null);
    const [requests, setRequests] = useState(null);
    const [users, setUsers] = useState(null);

    const [countFriends, setCountFriends] = useState(0);
    const [countRequests, setCountRequests] = useState(0);
    const [countUsers, setCountUsers] = useState(0);
    const [page, setPage] = useState('friends');

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');
        if(localStorage.getItem('closeRightMenu') == '1') document.querySelector('.page').classList.add('closeRightMenu');
        if(localStorage.getItem('closeLeftMenu') == '1') document.querySelector('.page').classList.add('closeLeftMenu');

        server('/user/getItems', { id: userData._id, count: 0, search, type: 'friends' })
        .then(result => {
            if(!result.error) {
                if(result.items.length != 0) setCountFriends(countFriends + 1);
                setCountFriends(1);
                setFriends(result.items);
            }
            else setError([true, result.message]);
        })

        server('/user/getItems', { id: userData._id, count: 0, search, type: 'requests' })
        .then(result => {
            if(!result.error) {
                if(result.items.length != 0) setCountRequests(countRequests + 1);
                setCountRequests(1);
                setRequests(result.items);
            }
            else setError([true, result.message]);
        })

        server('/user/getItems', { id: userData._id, count: 0, search, type: 'users' })
        .then(result => {
            if(!result.error) {
                if(result.items.length != 0) setCountUsers(countUsers + 1);
                setCountUsers(1);
                setUsers(result.items);
            }
            else setError([true, result.message]);
        })
    }, [userData, search, page])


    function scroll(e) {
        const scrollTop = e.target.scrollTop;
        const clientHeight = e.target.clientHeight;
        const scrollHeight = e.target.scrollHeight;
        const dif = scrollHeight / 4;

        if(scrollTop + clientHeight >= scrollHeight - dif) {
            getItems();
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

    async function getItems() {
        if(page == 'friends')
            server('/user/getItems', { id: userData._id, count: countFriends, search, type: 'friends' })
            .then(result => {
                if(!result.error) {
                    if(result.items.length != 0) setCountFriends(countFriends + 1);
                    setFriends([...friends, ...result.items]);
                }
                else setError([true, result.message]);
            })

        if(page == 'requests')
            server('/user/getItems', { id: userData._id, count: countRequests, search, type: 'requests' })
            .then(result => {
                if(!result.error) {
                    if(result.items.length != 0) setCountRequests(countRequests + 1);
                    setRequests([...requests, ...result.items]);
                }
                else setError([true, result.message]);
            })

        if(page == 'users')
            server('/user/getItems', { id: userData._id, count: countUsers, search, type: 'users' })
            .then(result => {
                if(!result.error) {
                    if(result.items.length != 0) setCountUsers(countUsers + 1);
                    setUsers([...users, ...result.items]);
                }
                else setError([true, result.message]);
            })
    }

    return(
        <div className='page' onScroll={throttle(scroll, 250)} onResize={throttle(scroll, 250)}>
            <div className='page_title'>
                <Search setValue={setSearch}/>
            </div>

            <div className='friends_wrapper'>

                <div className='friends_navigate_wrapper'>
                    <div className='friends_navigate_item' onClick={() => setPage('friends')} style={page == 'friends' ? {borderBottom: '3px solid #8551FF'} : {}}>Друзья</div>
                    <div className='friends_navigate_item' onClick={() => setPage('requests')} style={page == 'requests' ? {borderBottom: '3px solid #8551FF'} : {}}>Приглашения</div>
                    <div className='friends_navigate_item' onClick={() => setPage('users')} style={page == 'users' ? {borderBottom: '3px solid #8551FF'} : {}}>Все пользователи</div>
                </div>

                <div className='friends_items_wrapper' style={page == 'friends' ? {left: '100%'} : page == 'requests' ? {left: '0'} : {left: '-100%'}}>
                    <Friendslist items={friends}/>
                    <Friendslist items={requests}/>
                    <Friendslist items={users}/>
                </div>
            </div>
        </div>
    )
}