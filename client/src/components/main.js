const { useEffect, useState } = require('react');
const { useNavigate } = require('react-router-dom');

export default function Main(props) {
    const { userData } = props;
    const navigate = useNavigate();

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');
        if(localStorage.getItem('closeRightMenu') == '1') document.querySelector('.page').classList.add('closeRightMenu');
        if(localStorage.getItem('closeLeftMenu') == '1') document.querySelector('.page').classList.add('closeLeftMenu');
    }, [userData])

    return(
        <div className='page page_noTitle'>
            
        </div>
    )
}