const { useEffect, useState } = require('react');
const { useNavigate } = require('react-router-dom');
const url = require('../server_url.js');

require('../styles/form.css');

const Input = require('./input.js').default;
const Button = require('./button.js').default;

export default function Login(props) {
    const { setUserData } = props;
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [errorUsername, setErrorUsername] = useState('');
    const [errorPassword, setErrorPassword] = useState('');

    useEffect(() => {setErrorUsername('')}, [username]);
    useEffect(() => {setErrorPassword('')}, [password]);

    async function login() {
        let body = {username, password};

        fetch(url + '/auth/login', {method: 'post', headers: {'Content-Type': 'application/json; charset=utf-8'}, body: JSON.stringify(body)})
        .then(async response => {
            let result = await response.json();

            if(!result.token) {
                if(result.field == 0) setErrorUsername(result.message);
                if(result.field == 1) setErrorPassword(result.message);
            }
            else {
                localStorage.setItem('token', result.token);

                auth().then(result => {
                    setUserData(result);
                    window.location.assign('/');
                })
            }
        })
    }

    async function auth() {
        return fetch(url + '/auth/authorization', {method: 'post', headers: {'Content-Type': 'application/json; charset=utf-8', 'authorization': localStorage.getItem('token')}})
            .then(response => response.json())
    }

    return(
        <div className='form_wrapper'>
            <div className='form'>
                <div className='form_title'>Вход</div>
                <Input type='text' placeholder='Имя пользователя' setValue={setUsername} error={errorUsername}/>
                <Input type='password' placeholder='Пароль' setValue={setPassword} error={errorPassword}/>
                <Button title='Войти' onclick={login}/>
                <div className='form_switch'>
                    Ещё нет аккаунта?
                    <a className='form_switch_link' href='/registration'>Создать</a>
                </div>
            </div>
        </div>
    )
}