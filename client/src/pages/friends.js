import { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { server } from '../server';
import serverUrl from '../server_url';

import { Context } from '../components/context';
import LeftMenu from './left_menu';
import RightMenu from './right_menu';
import Search from '../components/search';

export default function Friends() {
    const { userData, setError } = useContext(Context);
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState('');
    const [users, setUsers] = useState(null);

    const [count, setCount] = useState(0);
    const [maxCount, setMaxCount] = useState(1);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        setUsers(null);
        setFetching(true);
        setCount(0);
        setMaxCount(1);
    }, [search, searchParams])

    useEffect(() => {
        if(fetching) {
            server('/getUsers', { senderId: userData._id, category: searchParams.get('page'), search, count })
            .then(result => {
                if(!result.error) {
                    if(count == 0) setUsers(result.users);
                    else setUsers(prevState => [...prevState, ...result.users]);
                    setCount(prevState => prevState + 1);
                    setMaxCount(result.maxCount);
                    setFetching(false);
                }
                else setError([true, result.message]);
            })
        }
    }, [fetching])

    const scroll = useCallback(e => {
        if(e.target.scrollHeight - (Math.abs(e.target.scrollTop) + window.innerHeight) < 100 && users.length < maxCount) {
            setFetching(true);
        }
    }, [maxCount, users])

    return(
        <div className='page' onScroll={scroll} onResize={scroll}>
            <div className='page_title two_rows'>
                <Search setValue={setSearch} />

                <div className='list_navigation'>
                    <Link to={`/friends?page=friends`} className={`list_nav_item${searchParams.get('page') == 'friends' ? ' list_nav_item_select' : ''}`}>Друзья</Link>
                    <Link to={`/friends?page=requests`} className={`list_nav_item${searchParams.get('page') == 'requests' ? ' list_nav_item_select' : ''}`}>Запросы</Link>
                    <Link to={`/friends?page=users`} className={`list_nav_item${searchParams.get('page') == 'users' ? ' list_nav_item_select' : ''}`}>Все пользователи</Link>
                </div>
            </div>

            <RightMenu />
            <LeftMenu />

            <div className='list_wrapper'>
                {users == null &&
                <div className='list_noItems'>
                    <div className='list_noItems_loading'></div>
                </div>}

                {users != null && users.length == 0 &&
                <div className='list_noItems'>
                    <div className='list_noItems_text'>Нет результатов</div>
                </div>}

                {users != null && users.length != 0 && users.map((user, i) =>
                    <Link key={i} to={`/profile/${user._id}`} className='list_item'>
                        <img className='list_avatar' src={`${serverUrl}/users/${user._id}/avatar/${user.avatar}`} />
                        <div className='list_name'>{user.username}</div>
                    </Link>
                )}
            </div>
        </div>
    )
}