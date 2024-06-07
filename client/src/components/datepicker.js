export default function Datepicker(props) {
    const { value, setValue } = props;

    const date = new Date(new Date().getFullYear() - 6, 0, 1);
    const maxDate = `${date.getFullYear()}-${'0' + Number(date.getMonth() + 1)}-${'0' + Number(date.getDate())}`;

    return(
        <div className='datepicker_wrapper'>
            <input type='date' value={value} onChange={e => setValue(e.target.value)} min='1930-01-01' max={maxDate} />
        </div>
    )
}