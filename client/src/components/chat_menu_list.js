const serverUrl = require('../server_url.js');

require('../styles/chat_menu_list.css');

export default function ChatMenuList(props) {
    const { items, type = '', fullscreenImage, selectImage } = props;

    const getName = item => `${item._id}.${item.filename.split('.')[item.filename.split('.').length - 1]}`;

    if(items == null) {
        return(
            <div className='chatMenu_itemlist'>
                <div className='load_wrapper'>
                    <div className='load_div'></div>
                </div>
            </div>
        )
    }
    else if(items.length == 0) {
        return(
            <div className='chatMenu_itemlist'>
                <div className='chatMenu_itemlist_noResult'>Нет результатов</div>
            </div>
        )
    }
    else {
        return(
            <div className={type == '' ? 'chatMenu_itemlist' : 'chatMenu_itemlist_files'}>
                {items.map((item, i) =>
                    <div key={i} className='chatMenu_itemlist_item'>
                        {item.type == 'image' && <img className='message_image' src={`${serverUrl}/chats/${item.chat}/${getName(item)}`} onClick={() => {selectImage[1]({ src: `/chats/${item.chat}/${getName(item)}`, type: 'image'}); fullscreenImage[1](!fullscreenImage[0])}}/>}
                        {item.type == 'video' &&
                        <div className='message_video' onClick={() => {selectImage[1]({ src: `/chats/${item.chat}/${getName(item)}`, type: 'video'}); fullscreenImage[1](!fullscreenImage[0])}}>
                            <img src='/images/play.png'/>
                            <video src={`${serverUrl}/chats/${item.chat}/${getName(item)}`}/>
                        </div>}
                        {item.type == 'file' &&
                        <a className='message_file' href={`${serverUrl}/chats/${item.chat}/${getName(item)}`}>
                            <img src='/images/file.png'/>
                            {item.filename}
                        </a>}
                    </div>
                )}
            </div>
        )
    }
}