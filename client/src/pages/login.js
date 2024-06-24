import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { server } from '../server';

import { Context } from '../components/context';
import Input from '../components/input';
import Password from '../components/input_password';
import Button from '../components/button';

export default function Login() {
    const { setError } = useContext(Context);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    function sign() {
        setEmailError(''); setPasswordError('');

        server('/login', { email, password })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else if(result.field != undefined) {
                if(result.field == 0) setEmailError(result.message);
                else setPasswordError(result.message);
            }
            else {
                localStorage.setItem('token', result.token);
                navigate('/');
            }
        })
        .catch(e => setError([true, 'Произошла ошибка']))
    }

    return(
        <div className='login_wrapper'>
            <div className='login'>
                <div className='login_title'>Вход</div>

                <Input value={email} setValue={setEmail} placeholder='Электронная почта' error={emailError} />

                <Password value={password} setValue={setPassword} placeholder='Пароль' error={passwordError} />

                <Button title='Войти' onClick={sign} />

                <div className='login_switch'>
                    Ещё нет аккаунта?
                    <Link className='login_switch_link' to='/registration'>Создать</Link>
                </div>
            </div>
        </div>
    )
}