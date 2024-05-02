const { useState, useEffect } = require('react');
const { server } = require('../server');
const { useInput } = require('../hooks/useInput.js');
const serverUrl = require('../server_url.js');

require('../styles/change_chatdata.css');

const LoadAvatar = require('./load_avatar').default;
const Input = require('./input').default;
const Button = require('./button').default;

export default function ChangeChatdata(props) {
    const { id, chatName, close, setError } = props;

    const [avatar, setAvatar] = useState('');
    const name = useInput('');

    useEffect(() => {
        name.onChange({ target: { value: chatName } });

        const keydown = e => {
            if(e.key == 'Escape') close();
        }

        window.addEventListener('keydown', keydown);

        return () => window.removeEventListener('keydown', keydown);
    }, [chatName])

    function changeData() {
        server('/chat/editChat', { chat: id, name: name.value, avatar })
        .then(result => {
            if(result.error) setError([true, result.message]);
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
                    <Input { ...name } placeholder='Название'/>
                </div>
                <div className='dataform_button'>
                    <Button title='Сохранить' onclick={changeData}/>
                </div>
            </div>
        </div>
    )
}