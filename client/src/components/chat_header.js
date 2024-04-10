import TimeAgo from 'react-timeago';
import ruStrings from 'react-timeago/lib/language-strings/ru';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

const formatter = buildFormatter(ruStrings);

const { useState } = require('react');
const serverUrl = require('../server_url.js');

require('../styles/chat_header.css');

const Button = require('./button.js').default;
const ChangeChatdata = require('./change_chatdata.js').default;

export default function ChatHeader(props) {
    const { chat, id, showMenu, setShowMenu, invite } = props;

    const [showChange, setShowChange] = useState(false);

    function openMenu() {
        if(showMenu?.left == '100vw') setShowMenu({left: '0'});
        else setShowMenu({left: '100vw'})
    }

    if(chat == null) {
        return(
            <div className='chatHeader_wrapper'>
                <div className='load_wrapper'>
                    <div className='load_div'></div>
                </div>
            </div>
        )
    }
    else {
        return(
            <div className='chatHeader_wrapper'>
                <img className='chatHeader_avatar' src={serverUrl + chat.avatar}/>
                <div className='chatHeader_info'>
                    <div className='chatHeader_name'>{chat.name}</div>
                    {!chat.online && chat.type != 'public' &&
                    <div className='chatHeader_lastOnline'>
                        был{'(а)'} в сети
                        <TimeAgo date={chat.last_online} formatter={formatter}/>
                    </div>}
                    {chat.online && <div className='chatHeader_lastOnline'>в сети</div>}
                </div>
                
                <div className='chatHeader_buttons'>
                    {chat.type == 'public' && chat.creator == id &&
                    <img src='/images/pen.png' onClick={() => setShowChange(!showChange)}/>}
                    {chat.type == 'public' && chat.creator == id &&
                    <img src='/images/userPlus.png' onClick={() => invite[1](!invite[0])}/>}
                    <img className='chatHeader_menu' src='/images/menu2.png' onClick={openMenu} style={showMenu.left == '100vw' ? {} : {transform: 'rotate(180deg)'}}/>
                </div>

                {showChange &&
                <ChangeChatdata
                    id={chat._id}
                    chatName={chat.name}
                />}
            </div>
        )
    }
}