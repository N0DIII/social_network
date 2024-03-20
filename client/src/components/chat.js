const { useState, useEffect } = require('react');
const { useNavigate, useParams } = require('react-router-dom');

require('../styles/chat.css');

const RightMenu = require('./right_menu.js').default;
const LeftMenu = require('./left_menu.js').default;

export default function Chat(props) {
    const { userData, socket } = props;
    const navigate = useNavigate();
    const params = useParams();
    const { id } = params;

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');

        console.log(id);
    }, [userData])

    return (
        <div className='page'>
            {userData && <RightMenu id={userData._id} username={userData.username}/>}
            {userData && <LeftMenu id={userData._id}/>}
        </div>
    )
}