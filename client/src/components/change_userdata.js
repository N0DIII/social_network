const { useEffect, useState } = require('react');
const { useInput } = require('../hooks/useInput.js');
const { server } = require('../server.js');
const serverUrl = require('../server_url.js');

require('../styles/change_userdata.css')

const LoadAvatar = require('./load_avatar.js').default;
const Input = require('./input.js').default;
const DateInput = require('./date_input.js').default;
const Select = require('./select.js').default;
const Button = require('./button.js').default;

export default function ChangeUserData(props) {
    const { close, userData, setError, setConfirm } = props;

    const [avatar, setAvatar] = useState();
    const username = useInput(userData.username);
    const birthday = useInput(userData?.birthday != undefined ? userData.birthday.split('T')[0] : '');
    const [sex, setSex] = useState(userData?.sex != undefined ? userData.sex : '');
    const [maxDate, setMaxDate] = useState('');

    useEffect(() => {
        const date = new Date(new Date().getFullYear() - 6, 0, 1);
        setMaxDate(`${date.getFullYear()}-${'0' + Number(date.getMonth() + 1)}-${'0' + Number(date.getDate())}`);

        const keydown = e => {
            if(e.key == 'Escape') close();
        }

        window.addEventListener('keydown', keydown);

        return () => window.removeEventListener('keydown', keydown);
    }, [])

    async function changeData() {
        server('/user/changeUserData', { id: userData._id, avatar, username: username.value == userData.username ? false : username.value, birthday: birthday.value, sex })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else window.location.reload();
        })
    }

    async function deleteAcc(id) {
        server('/user/deleteUser', { id })
        .then(result => {
            if(!result.error) window.location.reload();
            else setError([true, result.message]);
        })
    }

    return(
        <div className='dataform_wrapper'>
            <div className='dataform'>
                <img className='dataform_close' src='/images/cross.png' onClick={close}/>

                <div className='dataform_avatar'>
                    <LoadAvatar src={`${serverUrl}/users/${userData._id}/avatar.png`} setAvatarUrl={setAvatar}/>
                </div>

                <div className='dataform_input'><Input { ...username } placeholder='Имя пользователя'/></div>
                <div className='dataform_select'>
                    <Select
                        title='Выберите пол'
                        setValue={setSex}
                        defaultValue={sex}
                        options={[{value: 'м', text: 'Мужской'}, {value: 'ж', text: 'Женский'}]}
                    />
                </div>
                <div className='dataform_input'><DateInput { ...birthday } min='1930-01-01' max={maxDate}/></div>
                <div className='dataform_button'><Button title='Сохранить' onclick={changeData}/></div>
                <div className='dataform_button'><Button title='Удалить аккаунт' onclick={() => setConfirm([true, deleteAcc, [userData._id]])}/></div>
            </div>
        </div>
    )
}