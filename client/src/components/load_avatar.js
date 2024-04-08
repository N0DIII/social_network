const { useRef } = require('react');

require('../styles/load_avatar.css');

export default function LoadAvatar(props) {
    const { src, setAvatarUrl } = props;

    let defaultAvatar = 'images/defaulAvatar.png';
    let avatarImg = useRef(null);
    let cvs = useRef(null);

    if(src != undefined) defaultAvatar = src;

    async function editor(e) {
        avatarImg.current.style.opacity = '0';
        let ctx = cvs.current.getContext('2d');

        let dx = 0;
        let dy = 0;
        let width = cvs.current.width;
        let height = cvs.current.height;
        let image = new Image();

        let promise = new Promise((resolve, reject) => {
            image.onload = function(e) {
                resolve({width: image.width, height: image.height});
            }
            if(e.target.files.length != 0) image.src = URL.createObjectURL(e.target.files[0]);
        })

        let result = await promise;
        let dwidth = cvs.current.width * (result.width / result.height);
        let dheight = cvs.current.height;
        let startMove = false;
        let mouse = {x: 0, y: 0};
        let mouseStart = {x: 0, y: 0};

        cvs.current.addEventListener('mousemove', e => {
            let rect = cvs.current.getBoundingClientRect();
            mouse = {x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top)};
            
            if(startMove) {
                dx += mouse.x - mouseStart.x;
                dy += mouse.y - mouseStart.y;
                if(mouse.x != mouseStart.x) mouseStart.x = mouse.x;
                if(mouse.y != mouseStart.y) mouseStart.y = mouse.y;
            }
        })

        cvs.current.addEventListener('mousedown', e => {
            startMove = true;
            let rect = cvs.current.getBoundingClientRect();
            mouseStart = {x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top)};
        })
    
        cvs.current.addEventListener('mouseup', e => {
            startMove = false;
            setAvatarUrl(JSON.stringify(cvs.current.toDataURL('image/png')));
        })
    
        cvs.current.addEventListener('mouseleave', e => {
            startMove = false;
        })
    
        cvs.current.addEventListener('wheel', e => {
            if(e.deltaY > 0) {
                dwidth *= 1.03;
                dheight *= 1.03;
            }
            else {
                dwidth /= 1.03;
                dheight /= 1.03;
            }
        })

        function draw() {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(image, dx, dy, dwidth, dheight);
    
            requestAnimationFrame(draw);
        }
        draw();

        setAvatarUrl(JSON.stringify(cvs.current.toDataURL('image/png')));
    }

    return (
        <div className='loadAvatar_wrapper'>
            <img className='loadAvatar_change' src='/images/pen.png'/>
            <canvas ref={cvs} className='loadAvatar_canvas' width={768} height={768}></canvas>
            <img ref={avatarImg} className='loadAvatar_img' src={defaultAvatar}/>
            <input className='loadAvatar_input' type='file' name='avatar' accept='image/*' onChange={editor}/>
        </div>
    )
}