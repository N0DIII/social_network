const { useState, useEffect, useCallback } = require('react');
const { useNavigate, useSearchParams, Link } = require('react-router-dom');
const { server } = require('../server.js');

require('../styles/groups.css');

const Search = require('./search.js').default;
const GroupsList = require('./groupslist.js').default;
const Select = require('./select.js').default;
const CreateGroup = require('./create_group.js').default;

export default function Groups(props) {
    const { userData, setError } = props;

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState('');
    const [groups, setGroups] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectCategory, setSelectCategory] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [showCreate, setShowCreate] = useState(false);

    const [count, setCount] = useState(0);
    const [maxCount, setMaxCount] = useState(1);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');

        server('/group/getCategories').then(result => setCategories(result));
    }, [userData])

    useEffect(() => {
        if(!userData) return;

        setGroups(null);
        setCount(0);
        setFetching(true);
    }, [search, selectCategory, searchParams, userData])

    useEffect(() => {
        if(fetching) {
            server('/group/getGroups', { count, search, category: selectCategory, type: searchParams.get('page'), user: userData._id })
            .then(result => {
                if(count != 0) setGroups([...groups, ...result.groups]);
                else setGroups(result.groups);

                setCount(prevState => prevState + 1);
                setMaxCount(result.maxCount);
            })

            setFetching(false);
        }
    }, [fetching])

    const scroll = useCallback(e => {
        if(e.target.scrollHeight - (Math.abs(e.target.scrollTop) + window.innerHeight) < 100 && groups.length < maxCount) {
            setFetching(true);
        }
    }, [maxCount, groups])

    function resetFilter() {
        setSelectCategory('');
        setGroups(null);
        setCount(0);
        setFetching(true);
    }

    return(
        <div className='page'>
            <div className='page_title'>
                <Search setValue={setSearch}/>
                <img className='groups_header_img' src='/images/filter.png' onClick={() => setShowFilter(!showFilter)} title='Фильтры'/>
                <img className='groups_header_img' src='/images/plus.png' onClick={() => setShowCreate(true)} title='Создать сообщество'/>

                {showFilter &&
                <div className='groups_filter_wrapper'>
                    <div className='groups_filter_header'>
                        Фильтры
                        <img className='groups_filter_reset' src='/images/reset.png' onClick={resetFilter} title='Сбросить фильтры'/>
                    </div>
                    <Select
                        options={categories.map(item => { return { value: item._id, text: item._id } })}
                        title='Категория'
                        defaultValue={selectCategory}
                        setValue={setSelectCategory}
                    />
                </div>}
            </div>

            <div className='groups_navigation_wrapper'>
                <Link className='groups_navigation_item' to='/groups?page=subscribe' style={searchParams.get('page') == 'subscribe' ? {borderBottom: '3px solid #8551FF'} : {}}>Подписки</Link>
                <Link className='groups_navigation_item' to='/groups?page=own' style={searchParams.get('page') == 'own' ? {borderBottom: '3px solid #8551FF'} : {}}>Мои сообщества</Link>
                <Link className='groups_navigation_item' to='/groups?page=all' style={searchParams.get('page') == 'all' ? {borderBottom: '3px solid #8551FF'} : {}}>Все сообщества</Link>
            </div>

            <GroupsList
                items={groups}
                scroll={scroll}
            />

            {showCreate &&
            <CreateGroup
                close={() => setShowCreate(false)}
                id={userData._id}
                setError={setError}
            />}
        </div>
    )
}