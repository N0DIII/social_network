const Album = require('../models/Album');
const Photo = require('../models/Photo');
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

            const src = `./public/users/${id}/albums/${album._id}`;
            fs.mkdir(src, e => {if(e) {
                console.log(e);
                return res.json(false);
            }})

            album.save();

            res.json({ _id: album._id, name: album.name, user: album.user, cover: null});
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }

    async deleteAlbum(req, res) {
        try {
            const { album, user } = req.body;

            await Album.deleteOne({_id: album});
            fs.rm(`./public/users/${user}/albums/${album}`, {recursive: true}, e => {if(e) console.log(e)});

            res.json(true);
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }

    async changeAlbumName(req, res) {
        try {
            const { id, name } = req.body;

            await Album.updateOne({_id: id}, {$set: {name}});
            
            res.json(true);
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }

    async getAlbums(req, res) {
        try {
            const { id } = req.body;

            let albums = await Album.find({user: id});
            
            for(let i = 0; i < albums.length; i++) {
                const cover = await Photo.findOne({album: albums[i]._id, type: 'image'});
                
                let album = {_id: albums[i]._id, name: albums[i].name, user: albums[i].user, cover: cover};
                albums[i] = album;
            }

            res.json(albums);
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }

    async getAlbum(req, res) {
        try {
            const { id } = req.body;

            const album = await Album.findOne({_id: id});

            res.json(album);
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }

    async getPhotos(req, res) {
        try {
            const { id } = req.body;

            // const album = await Album.findOne({_id: id});

            // const files = fs.readdirSync(`./public/users/${album.user}/albums/${id}`);
            // let photos = [];
            // files.forEach(el => photos.push(`/users/${album.user}/albums/${id}/${el}`));

            const photos = await Photo.find({album: id}, {album: 0});

            res.json(photos);
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }

    async loadPhoto(req, res) {
        try {
            const { album, user, type } = JSON.parse(req.body.json);
            const file = req.file;
    
            if(!file) return res.json({error: true, message: 'Неверный тип файла'});
    
            const photo = await new Photo({album, type, name: file.originalname});
            await photo.save();
    
            fs.rename(file.path, `./public/users/${user}/albums/${album}/${photo._id}.${getType(file.originalname)}`, e => {if(e) console.log(e)});
    
            res.json(photo);
        }
        catch(e) {
            console.log(e);
            res.json({error: true});
        }
    }

    async deletePhoto(req, res) {
        try {
            const { src } = req.body;

            fs.unlink('./public' + src, e => {if(e) console.log(e)});
            
            res.json(true);
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }
}

const getType = (str) => str.split('.')[str.split('.').length - 1];

module.exports = new albumController();