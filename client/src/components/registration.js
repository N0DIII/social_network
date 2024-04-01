const { useEffect, useState } = require('react');
const { useNavigate } = require('react-router-dom');
const url = require('../server_url.js');
const { server } = require('../server.js');

require('../styles/form.css');

const Input = require('./input.js').default;
const Button = require('./button.js').default;

export default function Registration(props) {
    const { setUserData } = props;
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    const [errorUsername, setErrorUsername] = useState('');
    const [errorPassword, setErrorPassword] = useState('');
    const [errorRepeatPassword, setErrorRepeatPassword] = useState('');

    useEffect(() => {setErrorUsername('')}, [username]);
    useEffect(() => {setErrorPassword('')}, [password]);
    useEffect(() => {setErrorRepeatPassword('')}, [repeatPassword]);

    // useEffect(() => {
    //     botReg();
    // }, [])

    async function registration() {
        let body = {username, password, repeatPassword};

        fetch(url + '/auth/registration', {method: 'post', headers: {'Content-Type': 'application/json; charset=utf-8'}, body: JSON.stringify(body)})
        .then(async response => {
            let result = await response.json();

            if(!result.token) {
                if(result.field == 0) setErrorUsername(result.message);
                if(result.field == 1) setErrorPassword(result.message);
                if(result.field == 2) setErrorRepeatPassword(result.message);
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

    // async function botReg() {
    //     for(let i = 0; i < 30; i++) {
    //         await server('/auth/registration', {username: `User${i}`, password: '123456', repeatPassword: '123456'})
    //         .then(result => {
    //             console.log(result)
    //         })
    //     }
    // }

    return(
        <div className='form_wrapper'>
            <div className='form'>
                <div className='form_title'>Регистрация</div>
                <Input type='text' placeholder='Имя пользователя' setValue={setUsername} error={errorUsername}/>
                <Input type='password' placeholder='Пароль' setValue={setPassword} error={errorPassword}/>
                <Input type='password' placeholder='Повторите пароль' setValue={setRepeatPassword} error={errorRepeatPassword}/>
                <Button title='Зарегистрироваться' onclick={registration}/>
                <div className='form_switch'>
                    Уже есть аккаунт?
                    <a className='form_switch_link' href='/login'>Войти</a>
                </div>
            </div>
        </div>
    )
}