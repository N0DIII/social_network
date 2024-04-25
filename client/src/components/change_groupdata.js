const { useState, useEffect } = require('react');
const { server } = require('../server');
const serverUrl = require('../server_url');

const LoadAvatar = require('./load_avatar').default;
const Input = require('./input').default;
const Button = require('./button').default;

export default function ChangeGroupData(props) {
    const { close, id, select, curName, curDescription, setError } = props;

    const [avatar, setAvatar] = useState();
    const [categories, setCategories] = useState([]);
    const [selectCategories, setSelectCategories] = useState(select);
    const [name, setName] = useState(curName);
    const [nameError, setNameError] = useState('');
    const [description, setDescription] = useState(curDescription);

    useEffect(() => {
        server('/group/getCategories').then(result => setCategories(result));
    }, [])

    function selectChange(e) {
        const options = [...e.target.selectedOptions];
        const values = options.map(option => option.value);
        setSelectCategories(values);
    }

    function editGroup() {
        server('/group/editGroup', { id, avatar, name, description, categories: selectCategories })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else if(result.nameError) setNameError(result.message);
            else window.location.reload();
        })
    }

    return(
        <div className='dataform_wrapper'>
            <div className='dataform'>
                <img className='dataform_close' src='/images/cross.png' onClick={close}/>
                <div className='dataform_avatar'>
                    <LoadAvatar src={`${serverUrl}/groups/${id}/avatar.png`} setAvatarUrl={setAvatar}/>
                </div>
                <div className='dataform_input'><Input type='text' placeholder='Название' value={name} setValue={setName} error={nameError}/></div>
                <select className='dataform_select' multiple value={selectCategories} onChange={selectChange}>
                    <option className='dataform_option dataform_option_title' disabled>Категории</option>
                    {categories.map((category, i) =>  <option key={i} className='dataform_option' value={category._id}>{category._id}</option>)}
                </select>
                <textarea className='dataform_textarea' value={description} onChange={e => setDescription(e.target.value)} maxLength={200} placeholder='Описание'></textarea>
                <div className='dataform_button'><Button title='Сохранить' onclick={editGroup}/></div>
            </div>
        </div>
    )
}