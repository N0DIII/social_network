const { useState, useEffect } = require('react');
const { server } = require('../server');
const serverUrl = require('../server_url');

const Select = require('./select').default;

export default function GroupMembers(props) {
    const { id, close } = props;

    const [users, setUsers] = useState(null);

    useEffect(() => {
        server('/group/getMembers', { id }).then(result => setUsers(result));
    }, [id])

    function changeStatus(value, user, group) {
        server('/group/changeStatus', { user, group, value })
        .then(result => {
            if(!result.error) setUsers(prevState => prevState.map(item => item._id == user ? { _id: item._id, username: item.username, status: value } : item ));
        })
    }

    if(users == null) {
        return(
            <div className='dataform_wrapper'>
                <div className='dataform'>
                    <img className='dataform_close' src='/images/cross.png' onClick={close}/>
                    <div className='load_wrapper'>
                        <div className='load_div'></div>
                    </div>
                </div>
            </div>
        )
    }
    else if(users.length == 0) {
        return(
            <div className='dataform_wrapper'>
                <div className='dataform'>
                    <img className='dataform_close' src='/images/cross.png' onClick={close}/>
                    <div className='list_wrapper'>
                        <div className='list_noResult'>Нет участников</div>
                    </div>
                </div>
            </div>
        )
    }
    else {
        return(
            <div className='dataform_wrapper'>
                <div className='dataform'>
                    <img className='dataform_close' src='/images/cross.png' onClick={close}/>
                    <div className='list_wrapper'>
                        {users.map((item, i) =>
                            <div key={i} className='list_item'>
                                <div className='list_item_avatar'><img src={`${serverUrl}/users/${item._id}/avatar.png`}/></div>
                                <div className='list_item_name'>{item.username}</div>
                                <div className='list_item_data'>
                                    <div className='list_item_data_select'>
                                        <Select
                                            options={[{ value: 'member', text: 'Участник' }, { value: 'admin', text: 'Администратор' }]}
                                            title='Статус'
                                            setValue={changeStatus}
                                            defaultValue={item.status}
                                            params={[item._id, id]}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}