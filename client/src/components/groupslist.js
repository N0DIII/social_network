const { Link } = require('react-router-dom');
const serverUrl = require('../server_url');

export default function GroupsList(props) {
    const { items, scroll } = props;

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
                <div className='list_noResult'>
                    Нет результатов
                </div>
            </div>
        )
    }
    else {
        return(
            <div className='list_wrapper' onScroll={scroll} onResize={scroll}>
                {items.map((item, i) =>
                    <Link key={i} to={`/group/${item._id}`} className='list_item'>
                        <div className='list_item_avatar'>
                            <img src={`${serverUrl}/groups/${item._id}/avatar_${item.avatar}.png`}/>
                        </div>
                        <div className='list_item_name'>{item.name}</div>
                        <div className='list_item_data'>
                            <div title={item.categories}>{item.categories.map((category, i) => {if(i < 2) return <div key={i}>{category}</div>})}</div>
                            <div>Участников: {item.users}</div>
                        </div>
                    </Link>
                )}
            </div>
        )
    }
}