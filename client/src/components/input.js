export default function Input(props) {
    const { value, setValue, placeholder = '', error = '', disabled = false } = props;

    if(disabled) return(
        <div className='input_wrapper'>
            <input value='' placeholder={placeholder} disabled />
        </div>
    )
    return(
        <div className='input_wrapper'>
            <input value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} />
            {error != '' && <div className='input_error'>{error}</div>}
        </div>
    )
}