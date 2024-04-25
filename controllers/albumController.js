const Album = require('../models/Album');
const File = require('../models/File');
const fs = require('fs');
const multer  = require('multer');

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype.split('/')[0] == 'image' || file.mimetype.split('/')[0] == 'video') cb(null, true)
    else cb(null, false)
}

class albumController {
    uploadFile = multer({storage: storageConfig, fileFilter: fileFilter})

    async addAlbum(req, res) {
        try {
            const { id, name } = req.body;

            const album = new Album({name: name == '' ? 'Без названия' : name, user: id});

            fs.mkdir(`./public/users/${id}/albums/${album._id}`, e => {
                if(e) {
                    console.log(e);
                    res.json({ error: true, message: 'Произошла ошибка при создании альбома' });
                }
                else {
                    album.save();
                    res.json({ error: false, album: { _id: album._id, name: album.name, user: album.user, cover: null } });
                }
            })
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при создании альбома' });
        }
    }

    async deleteAlbum(req, res) {
        try {
            const { album, user } = req.body;

            fs.rm(`./public/users/${user}/albums/${album}`, {recursive: true}, async e => {
                if(e) {
                    console.log(e);
                    res.json({ error: true, message: 'Произошла ошибка при удалении альбома' });
                } else {
                    await Album.deleteOne({_id: album});
                    res.json({ error: false });
                }
            })
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при удалении альбома' });
        }
    }

    async changeAlbumName(req, res) {
        try {
            const { id, name } = req.body;

            let newName = name.trim() == '' ? 'Без названия' : name;
            await Album.updateOne({_id: id}, {$set: {name: newName}});
            
            res.json({ error: false, title: newName });
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при изменении названия' });
        }
    }

    async getAlbums(req, res) {
        try {
            const { id } = req.body;

            let albums = await Album.find({user: id});
            
            for(let i = 0; i < albums.length; i++) {
                const cover = await File.findOne({album: albums[i]._id, type: 'image'});
                
                let album = {_id: albums[i]._id, name: albums[i].name, user: albums[i].user, cover: cover == null ? null : `/users/${id}/albums/${cover.album}/${cover._id}.${getType(cover.name)}`};
                albums[i] = album;
            }

            res.json({ error: false, albums });
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при получении альбомов' });
        }
    }

    async getAlbum(req, res) {
        try {
            const { id } = req.body;

            const album = await Album.findOne({_id: id});

            res.json({ error: false, album });
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при получении альбома' });
        }
    }

    async getPhotos(req, res) {
        try {
            const { id } = req.body;

            let photos = await File.find({album: id}, {album: 0});

            for(let i = 0; i < photos.length; i++) {
                photos[i] = { _id: photos[i]._id, type: photos[i].type, src: `/users/${photos[i].user}/albums/${id}/${photos[i]._id}.${getType(photos[i].name)}` };
            }

            res.json({ error: false, photos });
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при получении фото' });
        }
    }

    async loadPhoto(req, res) {
        try {
            const { album, user } = JSON.parse(req.body.json);
            const file = req.file;
    
            if(!file) return res.json({error: true, message: 'Неверный тип файла'});

            let type = file.mimetype.split('/')[0] == 'image' ? 'image' : 'video';
    
            const photo = await new File({album, type, user, name: file.originalname});
    
            fs.rename(file.path, `./public/users/${user}/albums/${album}/${photo._id}.${getType(file.originalname)}`, async e => {
                if(e) {
                    console.log(e);
                    res.json({ error: true, message: 'Ошибка при загрузке файлов' });
                }
                else {
                    await photo.save();
                    res.json({ error: false, photo: { _id: photo._id, type: photo.type, src: `/users/${user}/albums/${album}/${photo._id}.${getType(photo.name)}` } });
                }
            })
        }
        catch(e) {
            console.log(e);
            res.json({error: true, message: 'Ошибка при загрузке файла'});
        }
    }

    async deletePhoto(req, res) {
        try {
            const { src, id } = req.body;

            await File.deleteOne({_id: id});
            fs.unlink('./public' + src, e => {
                if(e) {
                    console.log(e);
                    res.json({ error: true, message: 'Произошла ошибка при удалении фото' });
                }
                else {
                    res.json({ error: false });
                }
            })
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при удалении фото' });
        }
    }
}

const getType = (str) => str.split('.')[str.split('.').length - 1];

module.exports = new albumController();