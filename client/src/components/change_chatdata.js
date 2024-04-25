const { useState, useEffect } = require('react');
const { server } = require('../server');
const serverUrl = require('../server_url.js');

require('../styles/change_chatdata.css');

const LoadAvatar = require('./load_avatar').default;
const Input = require('./input').default;
const Button = require('./button').default;

export default function ChangeChatdata(props) {
    const { id, chatName, close } = props;

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
        <div className='dataform_wrapper'>
            <div className='dataform'>
                <img className='dataform_close' src='/images/cross.png' onClick={close}/>
                <div className='dataform_avatar'>
                    <LoadAvatar src={`${serverUrl}/chats/${id}/avatar.png`} setAvatarUrl={setAvatar}/>
                </div>
                <div className='dataform_input'>
                    <Input type='text' placeholder='Название' value={name} setValue={setName} error={error}/>
                </div>
                <div className='dataform_button'>
                    <Button title='Сохранить' onclick={changeData}/>
                </div>
            </div>
        </div>
    )
}