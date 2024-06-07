import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { serverFile } from '../server';

import { Context } from '../components/context';
import Input from '../components/input';
import Password from '../components/input_password';
import Button from '../components/button';
import LoadAvatar from '../components/load_avatar';

export default function Registration() {
    const { setError } = useContext(Context);
    const navigate = useNavigate();

    const [avatar, setAvatar] = useState('images/defaultAvatar.png');
    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [repeatPasswordError, setRepeatPasswordError] = useState('');

    function reg() {
        setUsernameError(''); setPasswordError(''); setRepeatPasswordError('');

        serverFile('/registration', { username, password, repeatPassword }, [avatar])
        .then(result => {
            if(result.error) {
                if(result.errors != undefined) result.errors.forEach(error => {
                    if(error.field == 0) setUsernameError(error.message);
                    else if(error.field == 1) setPasswordError(error.message);
                    else setRepeatPasswordError(error.message);
                })
                else setError([true, result.message]);
            }
            else {
                localStorage.setItem('token', result.token);
                navigate('/');
            }
        })
        .catch(e => setError([true, 'Произошла ошибка']))
    }

    return(
        <div className='reg_wrapper'>
            <div className='reg'>
                <div className='reg_title'>Регистрация</div>

                <div className='reg_avatar'>
                    <LoadAvatar value={avatar} setValue={setAvatar} />
                </div>

                <div className='reg_inputs'>
                    <Input value={username} setValue={setUsername} placeholder='Имя пользователя' error={usernameError} />

                    <Password value={password} setValue={setPassword} placeholder='Пароль' error={passwordError} />

                    <Password value={repeatPassword} setValue={setRepeatPassword} placeholder='Повторите пароль' error={repeatPasswordError} />

                    <Button title='Зарегистрироваться' onClick={reg} />

                    <div className='reg_switch'>
                        Уже есть аккаунт?
                        <Link className='reg_switch_link' to='/login'>Войти</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}