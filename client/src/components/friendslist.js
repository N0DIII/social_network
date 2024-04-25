const { Link } = require('react-router-dom');
const serverUrl = require('../server_url.js');

export default function Friendslist(props) {
    const { items } = props;

    if(items == null) {
        return(
            <div className='list_wrapper'>
                <div className='load_wrapper'>
                    <div className='load_div'></div>
                </div>
            </div>
        )
    }
    else if(items.length == 0) {
        return(
            <div className='list_wrapper'>
                <div className='list_noResult'>Нет результатов</div>
            </div>
        )
    }
    else {
        return(
            <div className='list_wrapper'>
                {items != null && items.map((item, i) =>
                    <Link className='list_item' key={i} to={`/profile/${item._id}`}>
                        <div className='list_item_avatar'>
                            <img src={`${serverUrl}/users/${item._id}/avatar.png`}/>
                            {item.online && <div className='list_item_avatar_status'></div>}
                        </div>
                        <div className='list_item_name'>{item.username}</div>
                    </Link>
                )}
            </div>
        )
    }
}