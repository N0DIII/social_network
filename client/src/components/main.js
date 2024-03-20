const { useEffect, useState } = require('react');
const { useNavigate } = require('react-router-dom');

const RightMenu = require('./right_menu.js').default;
const LeftMenu = require('./left_menu.js').default;

export default function Main(props) {
    const { userData } = props;
    const navigate = useNavigate();

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');


    }, [userData])

    return(
        <div className='page'>
            {userData && <RightMenu id={userData._id} username={userData.username}/>}
            {userData && <LeftMenu id={userData._id}/>}
        </div>
    )
}