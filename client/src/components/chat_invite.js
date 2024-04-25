const { useState, useEffect } = require('react');
const { server } = require('../server');
const serverUrl = require('../server_url.js');

require('../styles/chat_invite.css');

const Button = require('./button.js').default;

export default function ChatInvite(props) {
    const { id, chat, setShow, socket, style } = props;

    const [users, setUsers] = useState([]);
    const [selectUsers, setSelectUsers] = useState([]);
    const [count, setCount] = useState(0);

    useEffect(() => {
        getUsers();
    }, [])

    function getUsers() {
        server('/user/getItems', { id, count, search: '', type: 'friends' })
        .then(result => {
            if(result.items.length != 0) setCount(count + 1);
            
            if(count != 0) setUsers([...users, ...result.items]);
            else setUsers(result.items);
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

    function select(user) {
        if(selectUsers.includes(user)) setSelectUsers(selectUsers.filter(item => item._id != user._id));
        else setSelectUsers([...selectUsers, user]);
    }

    function addUsers() {
        socket.emit('addUsersInPublicChat', { users: selectUsers, chat: chat._id });
        setSelectUsers([]);
        setShow(false);
    }

    return(
        <div className='chatInvite_wrapper' onScroll={throttle(scroll, 250)} onResize={throttle(scroll, 250)} style={style ? {top: '80px'} : {top: '-100vh'}}>
            <div className='chatInvite_button_wrapper'><div className='chatInvite_button'><Button title='Добавить' onclick={addUsers}/></div></div>
            <div className='list_wrapper'>
                {users.length == 0 && <div className='list_noResult'>Нет друзей</div>}
                {users.map((user, i) =>
                    <div key={i} className='list_item' onClick={() => select(user)}>
                        <div className='list_item_avatar'>
                            <img src={`${serverUrl}/users/${user._id}/avatar.png`}/>
                        </div>
                        <div className='list_item_name'>{user.username}</div>
                        <div className='list_item_data'>
                            {selectUsers.includes(user) && <img src='/images/checkMark.png'/>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}