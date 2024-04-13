const { useState, useEffect, useCallback } = require('react');
const { useNavigate, useSearchParams, Link } = require('react-router-dom');
const { server } = require('../server.js');

require('../styles/friends.css');

const Search = require('./search.js').default;
const Friendslist = require('./friendslist.js').default;

export default function Friends(props) {
    const { userData, setError } = props;

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState('');
    const [items, setItems] = useState(null);

    const [count, setCount] = useState(0);
    const [maxCount, setMaxCount] = useState(1);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');
        if(localStorage.getItem('closeRightMenu') == '1') document.querySelector('.page').classList.add('closeRightMenu');
        if(localStorage.getItem('closeLeftMenu') == '1') document.querySelector('.page').classList.add('closeLeftMenu');

        setItems(null);
        setFetching(true);
        setCount(0);
        setMaxCount(1);
    }, [userData, search, searchParams])

    useEffect(() => {
        if(!userData) return;

        if(fetching) {
            server('/user/getItems', { id: userData._id, count, search, type: searchParams.get('page') })
            .then(result => {
                if(!result.error) {
                    if(count != 0) setItems([...items, ...result.items]);
                    else setTimeout(() => setItems(result.items), 500);

                    setCount(prevState => prevState + 1);
                    setMaxCount(result.maxCount);
                }
                else setError([true, result.message]);
            })

            setFetching(false);
        }
    }, [fetching, userData])

    const scroll = useCallback(e => {
        if(e.target.scrollHeight - (Math.abs(e.target.scrollTop) + window.innerHeight) < 100 && items.length < maxCount) {
            setFetching(true);
        }
    }, [maxCount, items])

    return(
        <div className='page' onScroll={scroll} onResize={scroll}>
            <div className='page_title'>
                <Search setValue={setSearch}/>
            </div>

            <div className='friends_wrapper'>

                <div className='friends_navigate_wrapper'>
                    <Link className='friends_navigate_item' to={`/friends?page=friends`} style={searchParams.get('page') == 'friends' ? {borderBottom: '3px solid #8551FF'} : {}}>Друзья</Link>
                    <Link className='friends_navigate_item' to={`/friends?page=requests`} style={searchParams.get('page') == 'requests' ? {borderBottom: '3px solid #8551FF'} : {}}>Приглашения</Link>
                    <Link className='friends_navigate_item' to={`/friends?page=users`} style={searchParams.get('page') == 'users' ? {borderBottom: '3px solid #8551FF'} : {}}>Все пользователи</Link>
                </div>

                <div className='friends_items_wrapper' style={searchParams.get('page') == 'friends' ? {left: '0'} : searchParams.get('page') == 'requests' ? {left: '-100%'} : {left: '-200%'}}>
                    <Friendslist items={items}/>
                    <Friendslist items={items}/>
                    <Friendslist items={items}/>
                </div>
            </div>
        </div>
    )
}