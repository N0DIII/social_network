const { useState, useEffect } = require('react');
const { server } = require('../server');
const serverUrl = require('../server_url.js');

require('../styles/change_chatdata.css');

const LoadAvatar = require('./load_avatar').default;
const Input = require('./input').default;
const Button = require('./button').default;

export default function ChangeChatdata(props) {
    const { id, chatName } = props;

    const [avatar, setAvatar] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setName(chatName);
    }, [chatName])

    function changeData() {
        server('/chat/editChat', { chat: id, name, avatar })
        .then(result => {
            if(result.error) setError(result.message);
            else window.location.reload();
        })
    }

    return(
        <div className='changeChatdata_form'>
            <div className='changeChatdata_avatar_wrapper'>
                <div className='changeChatdata_avatar'>
                    <LoadAvatar src={`${serverUrl}/chats/${id}/avatar.png`} setAvatarUrl={setAvatar}/>
                </div>
            </div>
            <div className='changeChatdata_input'>
                <Input type='text' placeholder='Название' value={name} setValue={setName} error={error}/>
            </div>
            <div className='changeChatdata_button'>
                <Button title='Сохранить' onclick={changeData}/>
            </div>
        </div>
    )
}