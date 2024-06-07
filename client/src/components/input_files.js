import { useState, useEffect } from 'react';

export default function FilesInput(props) {
    const { setValue, value, setDeletedValue } = props;

    const [preview, setPreview] = useState(value);

    function onChange(e) {
        if(e.target.files[0]) {
            let reader = new FileReader();

            reader.onloadend = el => {
                setPreview(prevState => [...prevState, { src: el.target.result, mimetype: e.target.files[0].type.split('/')[0], name: e.target.files[0].name }]);
                e.target.value = '';
            }

            reader.readAsDataURL(e.target.files[0]);
            setValue(prevState => [...prevState, e.target.files[0]]);
        }
    }

    function deleteFile(file) {
        setPreview(prevState => prevState.filter(item => item.src != file.src));
        setValue(prevState => prevState.filter(item => item.name != file.name));

        if(setDeletedValue == undefined) return;

        for(let i = 0; i < value.length; i++) {
            if(value[i].src == file.src) setDeletedValue(prevState => [...prevState, file]);
        }
    }

    return(
        <div className='filesInput_wrapper'>
            <div className='filesInput_scroll'>
                {preview.map((file, i) =>
                    <div key={i} className='filesInput'>
                        {file.mimetype == 'image' && <img className='filesInput_file' src={file.src} />}
                        {file.mimetype == 'video' && <video className='filesInput_file' src={file.src} controls />}
                        {file.mimetype == 'application' && <a className='filesInput_a' href={file.src}><img src='/images/file.png' />{file.name}</a>}
                        <img className='filesInput_delete' src='/images/delete.png' title='Удалить' onClick={() => deleteFile(file)} />
                    </div>
                )}

                <div className='filesInput_add'>
                    <img src='/images/plus.png' />
                    <input type='file' onChange={onChange} accept='image/*, video/*, application/*' />
                </div>
            </div>
        </div>
    )
}