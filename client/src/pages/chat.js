import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import TimeAgo from 'react-timeago';
import ruStrings from 'react-timeago/lib/language-strings/ru';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

import { server, serverFile } from '../server';
import serverUrl from '../server_url';

import { Context } from '../components/context';
import FilesInput from '../components/input_files';
import Message from '../components/message';
import LoadAvatar from '../components/load_avatar';
import Input from '../components/input';
import Button from '../components/button';

const formatter = buildFormatter(ruStrings);

export default function Chat() {
    const { userData, setError, socket, setFFiles, setSFFile, setFParams, setConfirm } = useContext(Context);
    const { id } = useParams();
    const navigate = useNavigate();

    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [newFiles, setNewFiles] = useState([]);
    const [files, setFiles] = useState([]);
    const [showFiles, setShowFiles] = useState(false);
    const [deletedFiles, setDeletedFiles] = useState([]);
    const [isEdit, setIsEdit] = useState([false]);
    const [showMenu, setShowMenu] = useState(false);
    const [menuSelect, setMenuSelect] = useState('media');
    const [allFiles, setAllFiles] = useState([]);
    const [allApps, setAllApps] = useState([]);
    const [chatAvatar, setChatAvatar] = useState('');
    const [chatName, setChatName] = useState('');
    const [users, setUsers] = useState(null);

    const [count, setCount] = useState(0);
    const [maxCount, setMaxCount] = useState(1);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        setNewMessage('');
        setCount(0);
        setMaxCount(1);
        setFetching(true);
        setMenuSelect('media');

        socket.emit('joinChat', { chatId: id });

        socket.emit('getChat', { senderId: userData._id, chatId: id });
        socket.on('getChat', chat => {
            if(chat == null || !chat.users.includes(userData._id)) navigate('/');

            setChat(chat);
            if(chat.type == 'public') {
                setChatName(chat.name);

                server('/getUsers', { senderId: userData._id, category: 'friends', all: true })
                .then(result => {
                    if(!result.error) setUsers(result.users);
                    else setError([true, result.message]);
                })
            }

            socket.off('getChat');
        })

        socket.on('getMessage', message => {
            setMessages(prevState => [message, ...prevState]);
            getChatFiles();
        })

        socket.on('changeMessage', message => {
            setMessages(prevState => prevState.map(item => {
                if(item._id == message._id) return message;
                else return item;
            }))
            getChatFiles();
        })

        socket.on('deleteMessage', id => {
            setMessages(prevState => prevState.filter(item => item._id != id));
            getChatFiles();
        })

        getChatFiles();

        return () => {
            socket.off('getMessage');
            socket.off('changeMessage');
            socket.off('deleteMessage');
        }
    }, [id])

    useEffect(() => {
        if(chat == null || chat.type == 'public') return;

        socket.on('userOnline', id => { 
            if(chat.user._id == id) setChat(prevState => { return { ...prevState, user: { ...prevState.user, online: true } } });
        })

        socket.on('userOffline', id => { 
            if(chat.user._id == id) setChat(prevState => { return { ...prevState, user: { ...prevState.user, online: false, last_online: new Date() } } });
        })

        return () => {
            socket.off('userOnline');
            socket.off('userOffline');
        }
    }, [chat])

    useEffect(() => {
        if(fetching) {
            server('/getMessages', { chatId: id, count })
            .then(result => {
                if(count != 0) setMessages([...messages, ...result.messages]);
                else setMessages(result.messages);

                setCount(prevState => prevState + 1);
                setMaxCount(result.maxCount);
                setFetching(false);
            })
        }
    }, [fetching])

    const scroll = useCallback(e => {
        if(e.target.scrollHeight - (Math.abs(e.target.scrollTop) + window.innerHeight) < 100 && messages.length < maxCount) {
            setFetching(true);
        }
    }, [maxCount, messages])

    function getChatFiles() {
        server('/getChatFiles', { chatId: id })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else {
                setAllApps(result.apps);
                setAllFiles(result.files);
            }
        })
    }

    function sendMessage() {
        if(newMessage.trim() == '' && newFiles.length == 0) return;

        if(!isEdit[0]) {
            serverFile('/createMessage', { senderId: userData._id, chatId: id, text: newMessage }, newFiles)
            .then(result => {
                if(result.error) setError([true, result.message]);
                else {
                    socket.emit('sendMessage', { messageId: result.id, chatId: id });
                    setNewMessage('');
                    setShowFiles(false);
                    setNewFiles([]);
                }
            })
        }
        else {
            serverFile('/changeMessage', { messageId: isEdit[1], chatId: id, text: newMessage, deletedFiles }, newFiles)
            .then(result => {
                if(result.error) setError([true, result.message]);
                else {
                    socket.emit('changeMessage', { messageId: result.id, chatId: id });
                    cancelChange();
                }
            })
        }
    }

    function cancelChange() {
        setNewMessage('');
        setShowFiles(false);
        setNewFiles([]);
        setDeletedFiles([]);
        setIsEdit([false]);
    }

    function changeFiles() {
        setShowFiles(!showFiles);
        setNewFiles([]);
    }

    function changeMessage(files, text, messageId) {
        setIsEdit([true, messageId]);
        setNewMessage(text);

        if(files.length != 0) {
            setFiles(files);
            setShowFiles(true);
        }
    }

    function deleteMessage(message) {
        socket.emit('deleteMessage', { message });
    }

    function signOut() {
        socket.emit('signOutChat', { senderId: userData._id, chatId: id });
        navigate('/');
    }

    function changeChat() {
        serverFile('/changeChat', { chatId: id, name: chatName, oldAvatar: chat.avatar }, [chatAvatar])
        .then(result => {
            if(result.error) setError([true, result.message]);
            else {
                setChat(prevState => { return { ...prevState, name: chatName, avatar: result.avatar != undefined ? result.avatar : prevState.avatar } });
                socket.emit('getChats', { senderId: userData._id });
            }
        })
    }

    function inviteUser(userId) {
        if(chat.users.includes(userId)) return;

        socket.emit('inviteUser', { userId, chatId: id });

        setChat(prevState => { return { ...prevState, users: [...prevState.users, userId] } });
    }

    function selectFile(file) {
        setFFiles(allFiles);
        setFParams({ show: true, link: `${serverUrl}/chats/${id}/` });
        setSFFile(file);
    }

    if(chat != null) return(
        <div className='page messages_wrapper' onScroll={scroll} onResize={scroll}>
            <div className='page_title'>
                <div className='chat_header'>
                    {chat.type == 'personal' && <img src={`${serverUrl}/users/${chat.user._id}/avatar/${chat.user.avatar}`} />}
                    {chat.type == 'public' && <img src={`${serverUrl}/chats/${chat._id}/avatar/${chat.avatar}`} />}

                    {chat.type == 'personal' &&
                    <div className='chat_name_wrapper'>
                        <div className='chat_name'>{chat.user.username}</div>
                        {chat.user.online && <div className='chat_status'>В сети</div>}
                        {!chat.user.online && <div className='chat_status'>был{'(а)'} в сети <TimeAgo date={chat.user.last_online} formatter={formatter} /></div>}
                    </div>}
                    {chat.type == 'public' &&
                    <div className='chat_name_wrapper'>
                        <div className='chat_name'>{chat.name}</div>
                    </div>}

                    <div className='chat_buttons'>
                        <img src='/images/menu.png' title='Меню' onClick={() => setShowMenu(true)} />
                    </div>
                </div>
            </div>

            {messages.length != 0 && messages.map((message, i) => 
            <Message
                key={i}
                message={message}
                chatId={id}
                changeMessage={changeMessage}
                deleteMessage={deleteMessage}
                showDate={i == messages.length - 1 || (i != messages.length - 1 && messages[i].created.split('T')[0] != messages[i + 1].created.split('T')[0]) ? true : false}
                showName={chat.type != 'public' || message.user == userData._id ? false : i != messages.length - 1 && messages[i].username != messages[i + 1].username ? true : i == messages.length - 1 ? true : false}
            />)}

            <div className='newMessage_wrapper'>
                <img src='/images/clip.png' title='Прикрепить файл' onClick={changeFiles} />
                <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder='Новое сообщение' />
                {isEdit[0] && <img src='/images/cross.png' title='Отменить изменение' onClick={cancelChange} />}
                <img src='/images/send.png' title={!isEdit[0] ? 'Отправить сообщение' : 'Изменить сообщение'} onClick={sendMessage} />

                {showFiles &&
                <div className='newMessage_files'>
                    <FilesInput setValue={setNewFiles} value={files} setDeletedValue={setDeletedFiles} />
                </div>}
            </div>

            {showMenu &&
            <div className='dataform_wrapper'>
                <div className='dataform' style={{ width: '62%', padding: '50px 20px' }}>
                    <img className='dataform_close' src='/images/cross.png' onClick={() => setShowMenu(false)} />

                    <div className='chat_menu_header'>
                        <div className='chat_menu_navigation'>
                            <div style={menuSelect == 'media' ? { borderBottom: '2px solid #8551FF' } : {}} onClick={() => setMenuSelect('media')}>Медиа</div>
                            <div style={menuSelect == 'files' ? { borderBottom: '2px solid #8551FF' } : {}} onClick={() => setMenuSelect('files')}>Файлы</div>
                            {chat.type == 'public' && chat.creator == userData._id &&
                            <div style={menuSelect == 'invite' ? { borderBottom: '2px solid #8551FF' } : {}} onClick={() => setMenuSelect('invite')}>Пригласить</div>}
                            {chat.type == 'public' && chat.creator == userData._id &&
                            <div style={menuSelect == 'chat' ? { borderBottom: '2px solid #8551FF' } : {}} onClick={() => setMenuSelect('chat')}>Чат</div>}
                        </div>

                        <img src='/images/signOut.png' title='Выйти из чата' onClick={() => setConfirm([true, signOut, []])} />
                    </div>

                    <div className='chat_menu_main'>
                        {menuSelect == 'media' && allFiles.length != 0 && 
                        <div className='chat_menu_files'>
                            {allFiles.map((file, i) =>
                                <div key={i} className='chat_menu_file'>
                                    {file.mimetype == 'image' && <img src={`${serverUrl}/chats/${id}/${file.src}`} onClick={() => selectFile(file)} />}
                                    {file.mimetype == 'video' &&
                                    <div className='chat_menu_file_video' onClick={() => selectFile(file)}>
                                        <video src={`${serverUrl}/chats/${id}/${file.src}`} />
                                        <img src='/images/play.png' />
                                    </div>}
                                </div>
                            )}
                        </div>}

                        {menuSelect == 'media' && allFiles.length == 0 && <div className='chat_menu_noResult'>Нет результатов</div>}

                        {menuSelect == 'files' && allApps.length != 0 && allApps.map((file, i) =>
                            <div key={i} className='chat_menu_app'>
                                <img src='/images/file.png' />
                                <a href={`${serverUrl}/chats/${id}/${file.src}`}>{file.originalname}</a>
                            </div>
                        )}

                        {menuSelect == 'files' && allApps.length == 0 && <div className='chat_menu_noResult'>Нет результатов</div>}

                        {menuSelect == 'invite' && chat != null &&
                        <div className='list_wrapper'>
                            {users == null &&
                            <div className='list_noItems'>
                                <div className='list_noItems_loading'></div>
                            </div>}
            
                            {users != null && users.length == 0 &&
                            <div className='list_noItems'>
                                <div className='list_noItems_text'>Нет результатов</div>
                            </div>}
            
                            {users != null && users.length != 0 && users.map((user, i) => {
                                const member = chat.users.includes(user._id) ? true : false;
                                
                                return(
                                    <div key={i} className='list_item' title={member ? '' : 'Добавить в чат'} onClick={() => inviteUser(user._id)}>
                                        <img className='list_avatar' src={`${serverUrl}/users/${user._id}/avatar/${user.avatar}`} />
                                        <div className='list_name'>{user.username}</div>
                                        <div className='list_buttons'>
                                            <img className='' src={member ? '/images/checkMark.png' : '/images/userPlus.png'} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>}

                        {menuSelect == 'chat' &&
                        <div className='chat_menu_change'>
                            <LoadAvatar value={`${serverUrl}/chats/${id}/avatar/${chat.avatar}`} setValue={setChatAvatar} />
                            <Input value={chatName} setValue={setChatName} placeholder='Название чата' />
                            <Button title='Сохранить' onClick={changeChat} />
                        </div>}
                    </div>
                </div>
            </div>}
        </div>
    )
}