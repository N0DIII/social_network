const { useState, useEffect, useCallback } = require('react');
const { useNavigate, useParams } = require('react-router-dom');
const { server } = require('../server.js');
const serverUrl = require('../server_url.js');

require('../styles/group.css');

const Button = require('./button.js').default;
const ChangeGroupData = require('./change_groupdata.js').default;
const Search = require('./search').default;
const AddPost = require('./add_post').default;
const PostList = require('./postlist').default;
const GroupMembers = require('./group_members').default;

export default function Group(props) {
    const { userData, setError, setConfirm } = props;
    const navigate = useNavigate();
    const params = useParams();
    const { id } = params;

    const [group, setGroup] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [showMembers, setShowMembers] = useState(false);

    const [search, setSearch] = useState('');
    const [showAddPost, setShowAddPost] = useState(false);
    const [posts, setPosts] = useState(null);
    const [edit, setEdit] = useState(false);
    const [editedPost, setEditedPost] = useState({});

    const [count, setCount] = useState(0);
    const [maxCount, setMaxCount] = useState(1);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');
        if(localStorage.getItem('closeRightMenu') == '1') document.querySelector('.page').classList.add('closeRightMenu');
        if(localStorage.getItem('closeLeftMenu') == '1') document.querySelector('.page').classList.add('closeLeftMenu');

        server('/group/getGroup', { id, userID: userData._id }).then(result => setGroup(result));
    }, [userData, id])

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');

        setCount(0);
        setMaxCount(1);
        setPosts(null);
        setFetching(true);
    }, [userData, search])

    useEffect(() => {
        if(fetching) {
            server('/post/getPosts', { user: userData._id, count, search, filter: ['group', id] })
            .then(result => {
                if(result.error) {
                    setError([true, result.message]);
                    return;
                }
                
                if(count != 0) setPosts([...posts, ...result.posts]);
                else setPosts(result.posts);

                setCount(prevState => prevState + 1);
                setMaxCount(result.maxCount);
            })

            setFetching(false);
        }
    }, [fetching])

    const scroll = useCallback(e => {
        if(e.target.scrollHeight - (Math.abs(e.target.scrollTop) + window.innerHeight) < 100 && posts.length < maxCount) {
            setFetching(true);
        }
    }, [maxCount, posts])

    function joinGroup() {
        server('/group/joinGroup', { groupID: id, userID: userData._id })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else server('/group/getGroup', { id, userID: userData._id }).then(result => setGroup(result));
        })
    }

    function leaveGroup() {
        server('/group/leaveGroup', { groupID: id, userID: userData._id })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else server('/group/getGroup', { id, userID: userData._id }).then(result => setGroup(result));
        })
    }

    function deleteGroup() {
        server('/group/deleteGroup', { groupID: id })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else navigate('/groups');
        })
    }

    if(group == null) {
        return(
            <div className='page page_noTitle'>
                <div className='load_wrapper'>
                    <div className='load_div'></div>
                </div>
            </div>
        )
    }
    else if(!group) {
        return(
            <div className='page page_noTitle'>
                <div className='page_error'>Сообщество не найдено</div>
            </div>
        )
    }
    else {
        return(
            <div className='page' onScroll={scroll} onResize={scroll}>
                <div className='page_title'>
                    <Search setValue={setSearch}/>
                </div>

                <div className='group_info_wrapper'>
                    <img className='group_avatar' src={`${serverUrl}/groups/${group._id}/avatar.png`}/>
                    <div className='group_info'>
                        <div className='group_name'>{group.name}</div>
                        {group.categories.length != 0 && <div className='group_categories'>Категории: {group.categories.map((item, i) => <div key={i} className='group_category'>{item}</div>)}</div>}
                        <div className='group_count'>Участников: {group.users}</div>
                    </div>
                    <div className='group_buttons'>
                        {!group.member && group.creator != userData._id && <Button title='Присоединится' onclick={joinGroup}/>}
                        {group.member && group.creator != userData._id && <Button title='Выйти' onclick={() => setConfirm([true, leaveGroup, []])}/>}
                        {group.creator == userData._id && <Button title='Удалить' onclick={() => setConfirm([true, deleteGroup, []])}/>}
                        {group.admins.includes(userData._id) && <Button title='Изменить' onclick={() => setIsEdit(true)}/>}
                        {group.admins.includes(userData._id) && <Button title='Участники' onclick={() => setShowMembers(true)}/>}
                    </div>
                </div>

                {group.description != '' &&
                <div className='group_description_wrapper'>
                    <div className='group_description_title'>Описание</div>
                    <div className='group_description'>{group.description}</div>
                </div>}

                {isEdit &&
                <ChangeGroupData
                    close={() => setIsEdit(false)}
                    id={group._id}
                    select={group.categories}
                    curName={group.name}
                    curDescription={group.description}
                    setError={setError}
                />}

                {showAddPost &&
                <AddPost
                    close={() => {setShowAddPost(false); setEdit(false)}}
                    user={id}
                    setError={setError}
                    edit={edit}
                    post={editedPost}
                    type='group'
                />}

                <div className='group_posts_title'>
                    Посты
                    {group.admins.includes(userData._id) && <img className='group_addPost' src='/images/plus.png' title='Написать пост' onClick={() => setShowAddPost(true)}/>}
                </div>

                <PostList
                    posts={posts}
                    setPosts={setPosts}
                    userID={userData._id}
                    setConfirm={setConfirm}
                    setError={setError}
                    setEdit={setEdit}
                    setShowAddPost={setShowAddPost}
                    setEditedPost={setEditedPost}
                />

                {showMembers &&
                <GroupMembers
                    close={() => setShowMembers(false)}
                    id={id}
                />}
            </div>
        )
    }
}