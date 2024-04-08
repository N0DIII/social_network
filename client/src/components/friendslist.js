const { Link } = require('react-router-dom');
const serverUrl = require('../server_url.js');

export default function Friendslist(props) {
    const { items, action } = props;

    return(
        <div className='friends_block'>
            {items != null && items.map((item, i) =>
                <Link className='friends_block_item' key={i} to={`/profile/${item._id}`}>
                    <div className='friends_block_item_avatar'>
                        <img src={`${serverUrl}/users/${item._id}/avatar.png`}/>
                        {item.online && <div className='friends_block_item_avatar_status'></div>}
                    </div>
                    <div className='friends_block_item_username'>{item.username}</div>
                </Link>
            )}

            {items != null && items.length == 0 && <div className='friends_block_noResult'>Нет результатов</div>}
        </div>
    )
}