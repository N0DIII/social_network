import TimeAgo from 'react-timeago';
import ruStrings from 'react-timeago/lib/language-strings/ru';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

const formatter = buildFormatter(ruStrings);

const serverUrl = require('../server_url.js');

require('../styles/chat_header.css');

export default function ChatHeader(props) {
    const { chat, showMenu, setShowMenu } = props;

    function openMenu() {
        if(showMenu?.left == '100vw') setShowMenu({left: '1%'});
        else setShowMenu({left: '100vw'})
    }

    return(
        <div className='chatHeader_wrapper'>
            {chat?.type == 'personal' && <img className='chatHeader_avatar' src={`${serverUrl}/users/${chat?.avatar}/avatar.png`}/>}
            {chat?.type == 'public' && <img className='chatHeader_avatar' src={`${serverUrl}${chat?.avatar}`}/>}
            <div className='chatHeader_name'>
                {chat?.name}
                {!chat?.online &&
                <div className='chatHeader_lastOnline'>
                    был{'(а)'} в сети
                    <TimeAgo date={chat?.last_online} formatter={formatter}/>
                </div>}
                {chat?.online && <div className='chatHeader_lastOnline'>в сети</div>}
            </div>
            <img className='chatHeader_menu' src='/images/menu2.png' onClick={openMenu} style={showMenu?.left == '100vw' ? {} : {transform: 'rotate(180deg)'}}/>
        </div>
    )
}