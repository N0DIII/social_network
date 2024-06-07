export default function Input(props) {
    const { value, setValue, placeholder = '', error = '' } = props;

    return(
        <div className='input_wrapper'>
            <input value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} />
            {error != '' && <div className='input_error'>{error}</div>}
        </div>
    )
}