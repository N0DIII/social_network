import { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

import { server, serverFile } from '../server';
import serverUrl from '../server_url';

import { Context } from '../components/context';
import LeftMenu from './left_menu';
import RightMenu from './right_menu';
import Input from '../components/input';
import Button from '../components/button';
import Search from '../components/search';
import LoadAvatar from '../components/load_avatar';
import Select from '../components/select';

export default function Groups() {
    const { userData, setError } = useContext(Context);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [groups, setGroups] = useState(null);

    const [showCreate, setShowCreate] = useState(false);
    const [avatar, setAvatar] = useState('');
    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectCategory, setSelectCategory] = useState('');
    const [description, setDescription] = useState('');

    const [count, setCount] = useState(0);
    const [maxCount, setMaxCount] = useState(1);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        server('/getGroupCategories').then(result => setCategories(result.categories));
    }, [])

    useEffect(() => {
        setGroups(null);
        setFetching(true);
        setCount(0);
        setMaxCount(1);
    }, [search, searchParams])

    useEffect(() => {
        if(fetching) {
            server('/getGroups', { userId: userData._id, category: searchParams.get('page'), search, count })
            .then(result => {
                if(!result.error) {
                    if(count == 0) setGroups(result.groups);
                    else setGroups(prevState => [...prevState, ...result.groups]);
                    setCount(prevState => prevState + 1);
                    setMaxCount(result.maxCount);
                    setFetching(false);
                }
                else setError([true, result.message]);
            })
        }
    }, [fetching])

    const scroll = useCallback(e => {
        if(e.target.scrollHeight - (Math.abs(e.target.scrollTop) + window.innerHeight) < 100 && groups.length < maxCount) {
            setFetching(true);
        }
    }, [maxCount, groups])

    function createGroup() {
        serverFile('/createGroup', { userId: userData._id, name, category: selectCategory, description }, [avatar])
        .then(result => {
            if(result.error) setError([true, result.message]);
            else navigate(`/group/${result.id}`);
        })
        .catch(e => setError([true, 'Произошла ошибка']))
    }

    return(
        <div className='page' onScroll={scroll} onResize={scroll}>
            <div className='page_title two_rows'>
                <Search setValue={setSearch} />

                <img src='/images/plus.png' title='Создать группу' onClick={() => setShowCreate(true)} />

                <div className='list_navigation'>
                    <Link to={`/groups?page=subscribe`} className={`list_nav_item${searchParams.get('page') == 'subscribe' ? ' list_nav_item_select' : ''}`}>Подписки</Link>
                    <Link to={`/groups?page=own`} className={`list_nav_item${searchParams.get('page') == 'own' ? ' list_nav_item_select' : ''}`}>Мои группы</Link>
                    <Link to={`/groups?page=all`} className={`list_nav_item${searchParams.get('page') == 'all' ? ' list_nav_item_select' : ''}`}>Все группы</Link>
                </div>
            </div>

            <RightMenu />
            <LeftMenu />

            <div className='list_wrapper'>
                {groups == null &&
                <div className='list_noItems'>
                    <div className='list_noItems_loading'></div>
                </div>}

                {groups != null && groups.length == 0 &&
                <div className='list_noItems'>
                    <div className='list_noItems_text'>Нет результатов</div>
                </div>}

                {groups != null && groups.length != 0 && groups.map((group, i) =>
                    <Link key={i} to={`/group/${group._id}`} className='list_item'>
                        <img className='list_avatar' src={`${serverUrl}/groups/${group._id}/avatar/${group.avatar}`} />
                        <div className='list_name'>{group.name}</div>
                        {group.category != '' && <div className='list_text'><p className='list_text_title'>Категория: </p>{group.category}</div>}
                        <div className='list_text'><p className='list_text_title'>Участников: </p>{group.userCount}</div>
                    </Link>
                )}
            </div>

            {showCreate &&
            <div className='dataform_wrapper'>
                <div className='dataform'>
                    <img className='dataform_close' src='/images/cross.png' onClick={() => setShowCreate(false)} />

                    <LoadAvatar value='/images/defaultGroup.png' setValue={setAvatar} />

                    <Input value={name} setValue={setName} placeholder='Название группы' />

                    <Select
                        title='Выберите Категорию'
                        value={selectCategory}
                        setValue={setSelectCategory}
                        options={categories.map(item => { return { value: item.name, text: item.name } })}
                    />

                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder='Описание' />

                    <Button title='Создать' onClick={createGroup} />
                </div>
            </div>}
        </div>
    )
}