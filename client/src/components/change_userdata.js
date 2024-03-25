const { useEffect, useState } = require('react');
const { useNavigate, useParams } = require('react-router-dom');
const server = require('../server.js');
const serverUrl = require('../server_url.js');

require('../styles/change_userdata.css')

const LoadAvatar = require('./load_avatar.js').default;
const Input = require('./input.js').default;
const Select = require('./select.js').default;
const Button = require('./button.js').default;
const Error = require('./error.js').default;

export default function ChangeUserData(props) {
    const { userData } = props;
    const navigate = useNavigate();
    const params = useParams();
    const { id } = params;

    const [avatar, setAvatar] = useState();
    const [username, setUsername] = useState();
    const [birthday, setBirthday] = useState();
    const [sex, setSex] = useState();

    const [errorUsername, setErrorUsername] = useState();
    const [error, setError] = useState(false);

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');
        if(localStorage.getItem('closeRightMenu') == '1') document.querySelector('.page').classList.add('closeRightMenu');
        if(localStorage.getItem('closeLeftMenu') == '1') document.querySelector('.page').classList.add('closeLeftMenu');

        if(userData._id != id) return navigate('/');

        setUsername(userData.username);
        setSex(userData.sex != undefined ? userData.sex : 'male');
        setBirthday(userData.birthday != undefined ? userData.birthday.split('T')[0] : '');
    }, [userData])

    async function changeData() {
        server('/user/changeUserData', {id: userData._id, avatar, username: username == userData.username ? false : username, birthday, sex})
        .then(result => {
            if(result.field == 0) setErrorUsername(result.message);
            else if(result) window.location.reload();
            else setError(true);
        })
    }

    return(
        <div className='page page_noTitle'>
            <Error params={[error, setError]}/>

            <div className='changeUserData_wrapper'>
                <div className='changeUserData_avatar'>
                    <LoadAvatar src={`${serverUrl}/users/${id}/avatar.png`} setAvatarUrl={setAvatar}/>
                </div>

                <div className='changeUserData_inputs'>
                    <Input type='text' placeholder='Имя пользователя' value={username} setValue={setUsername} error={errorUsername}/>
                    <Select title='Выберите пол' selected={setSex} defaultValue={sex} options={[{value: 'male', text: 'Мужской'}, {value: 'female', text: 'Женский'}]}/>
                    <Input type='date' placeholder='Дата рождения' value={birthday} setValue={setBirthday} min='1930-01-01' max='2018-01-01'/>
                    <Button title='Сохранить' onclick={changeData}/>
                </div>
            </div>
        </div>
    )
}