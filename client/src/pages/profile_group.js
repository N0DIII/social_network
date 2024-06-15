import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';

import { server, serverFile } from '../server';
import serverUrl from '../server_url';

import { Context } from '../components/context';
import Input from '../components/input';
import Button from '../components/button';
import Search from '../components/search';
import LoadAvatar from '../components/load_avatar';
import Select from '../components/select';
import Post from '../components/post';
import FilesInput from '../components/input_files';

export default function GroupProfile() {
    const { userData, setUserData, setError, setConfirm } = useContext(Context);
    const navigate = useNavigate();
    const params = useParams();
    const { id } = params;

    const [search, setSearch] = useState('');
    const [group, setGroup] = useState(null);
    const [showChange, setShowChange] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [members, setMembers] = useState([]);
    const [avatar, setAvatar] = useState('');
    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectCategory, setSelectCategory] = useState('');
    const [description, setDescription] = useState('');
    const [posts, setPosts] = useState(null);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [files, setFiles] = useState([]);
    const [text, setText] = useState('');

    const [count, setCount] = useState(0);
    const [maxCount, setMaxCount] = useState(1);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        server('/getGroup', { groupId: id })
        .then(result => {
            setGroup(result.group);
            setName(result.group.name);
            setSelectCategory(result.group.category);
            setDescription(result.group.description);

            if(userData._id == result.group.creator) server('/getGroupMembers', { groupId: id }).then(result => setMembers(result.members))
        })

        server('/getGroupCategories').then(result => setCategories(result.categories));
    }, [id])

    function editData() {
        serverFile('/changeGroup', { groupId: id, name, category: selectCategory, description, oldAvatar: group.avatar }, [avatar])
        .then(result => {
            if(result.error) setError([true, result.message]);
            else {
                setGroup(prevState => { return { ...prevState, name, category: selectCategory, description, avatar: result.avatar != undefined ? result.avatar : prevState.avatar } });
                setShowChange(false);
            }
        })
        .catch(e => setError([true, 'Произошла ошибка']))
    }

    function deleteGroup() {
        server('/deleteGroup', { groupId: id })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else navigate('/groups?page=subscribe');
        })
        .catch(e => setError([true, 'Произошла ошибка']))
    }

    function joinGroup() {
        server('/joinGroup', { userId: userData._id, groupId: id })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else setUserData(prevState => { return { ...prevState, groups: [...prevState.groups, id] } });
        })
        .catch(e => setError([true, 'Произошла ошибка']))
    }

    function leaveGroup() {
        server('/leaveGroup', { userId: userData._id, groupId: id })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else setUserData(prevState => { return { ...prevState, groups: prevState.groups.filter(item => item != id) } });
        })
        .catch(e => setError([true, 'Произошла ошибка']))
    }

    function changeStatus(value, userId, groupId) {
        server('/changeMemberStatus', { groupId, userId, status: value })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else setMembers(prevState => prevState.map(user => { return { ...user, admin: userId == user._id && value == 'admin' ? true : false } }));
        })
    }

    useEffect(() => {
        setCount(0);
        setMaxCount(1);
        setPosts(null);
        setFetching(true);
    }, [search, id])

    useEffect(() => {
        if(fetching) {
            server('/getPosts', { groupId: id, senderId: userData._id, type: 'group', search, count })
            .then(result => {
                if(!result.error) {
                    if(count != 0) setPosts([...posts, ...result.posts]);
                    else setPosts(result.posts);

                    setCount(prevState => prevState + 1);
                    setMaxCount(result.maxCount);
                    setFetching(false);
                }
            })
        }
    }, [fetching])

    const scroll = useCallback(e => {
        if(posts == null) return;

        if(e.target.scrollHeight - (Math.abs(e.target.scrollTop) + window.innerHeight) < 100 && posts.length < maxCount) {
            setFetching(true);
        }
    }, [maxCount, posts])

    function createPost() {
        serverFile('/createPost', { creator: id, text, type: 'group' }, files)
        .then(result => {
            if(result.error) setError([true, result.message]);
            else {
                setShowCreatePost(false);
                setPosts(prevState => [result.post, ...prevState]);
            }
        })
        .catch(e => setError([true, 'Произошла ошибка']))
    }

    return(
        <div className='page' onScroll={scroll} onResize={scroll}>
            <div className='page_title'>
                <Search setValue={setSearch} />
            </div>
            
            <div className='profile_userdata'>
                <img src={`${serverUrl}/groups/${id}/avatar/${group?.avatar}`} />

                <div className='profile_info'>
                    <div>{group?.name}</div>
                    {group?.category != undefined && group.category != '' && <div>Категория: {group.category}</div>}
                    <div>Участников: {group?.userCount}</div>
                </div>

                {group?.creator == userData._id &&
                <div className='profile_buttons'>
                    <Button title='Изменить' onClick={() => setShowChange(true)} />
                    <Button title='Участники' onClick={() => setShowMembers(true)} />
                </div>}

                {group?.creator != userData._id &&
                <div className='profile_buttons'>
                    {!userData.groups.includes(id) && <Button title='Присоединиться' onClick={joinGroup} />}
                    {userData.groups.includes(id) && <Button title='Выйти' onClick={leaveGroup} />}
                </div>}
            </div>

            {group?.description != undefined && group.description != '' &&
            <div className='group_description_wrapper'>
                <div className='group_description_title'>Описание</div>
                <div className='group_description_text'>{group.description}</div>
            </div>}

            {showMembers &&
            <div className='dataform_wrapper'>
                <div className='dataform'>
                    <img className='dataform_close' src='/images/cross.png' onClick={() => setShowMembers(false)} />

                    <div className='list_wrapper'>
                        {members == null &&
                        <div className='list_noItems'>
                            <div className='list_noItems_loading'></div>
                        </div>}

                        {members != null && members.length == 0 &&
                        <div className='list_noItems'>
                            <div className='list_noItems_text'>Нет результатов</div>
                        </div>}

                        {members != null && members.length != 0 && members.map((user, i) =>
                            <div key={i} className='list_item'>
                                <img className='list_avatar' src={`${serverUrl}/users/${user._id}/avatar/${user.avatar}`} />
                                <div className='list_name'>{user.username}</div>
                                <Select
                                    title='Статус'
                                    value={user.admin ? 'admin' : 'member'}
                                    setValue={changeStatus}
                                    params={[user._id, id]}
                                    options={[{ value: 'member', text: 'Участник' }, { value: 'admin', text: 'Админ' }]}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>}

            {group != null &&
            <div className='profile_posts'>
                <div className='profile_posts_title'>
                    Посты
                    {(group.admins.includes(userData._id) || group.creator == userData._id) && <img src='/images/plus.png' onClick={() => setShowCreatePost(true)} />}
                </div>
            </div>}

            <div className='posts_wrapper'>
                {posts == null &&
                <div className='posts_noItems'>
                    <div className='posts_noItems_loading'></div>
                </div>}

                {posts != null && posts.length == 0 &&
                <div className='posts_noItems'>
                    <div className='posts_noItems_text'>Нет результатов</div>
                </div>}

                {posts != null && posts.length != 0 && posts.map((post, i) => <Post key={i} post={post} setPosts={setPosts} />)}
            </div>

            {showCreatePost &&
            <div className='dataform_wrapper'>
                <div className='dataform'>
                    <img className='dataform_close' src='/images/cross.png' onClick={() => setShowCreatePost(false)} />

                    <FilesInput setValue={setFiles} value={[]} />

                    <textarea value={text} onChange={e => setText(e.target.value)} />

                    <Button title='Создать' onClick={createPost} />
                </div>
            </div>}

            {showChange &&
            <div className='dataform_wrapper'>
                <div className='dataform'>
                    <img className='dataform_close' src='/images/cross.png' onClick={() => setShowChange(false)} />

                    <LoadAvatar value={`${serverUrl}/groups/${id}/avatar/${group?.avatar}`} setValue={setAvatar} />

                    <Input value={name} setValue={setName} placeholder='Название группы' />

                    <Select
                        title='Выберите категорию'
                        setValue={setSelectCategory}
                        value={selectCategory}
                        options={categories.map(item => { return { value: item.name, text: item.name } })}
                    />

                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder='Описание' />

                    <Button title='Сохранить' onClick={editData} />
                    <Button title='Удалить группу' onClick={() => setConfirm([true, deleteGroup, []])} />
                </div>
            </div>}
        </div>
    )
}