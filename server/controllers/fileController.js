const Album = require('../models/Album');
const fs = require('fs');

class fileController {
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

            res.json(album);
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }

    async deleteAlbum(req, res) {
        try {
            const { albumID, userID } = req.body;

            await Album.deleteOne({_id: albumID});
            fs.rm(`./public/users/${userID}/albums/${albumID}`, {recursive: true}, e => {if(e) console.log(e)});

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
                const files = fs.readdirSync(`./public/users/${id}/albums/${albums[i]._id}`);
                if(files.length != 0) {
                    let album = {_id: albums[i]._id, name: albums[i].name, user: albums[i].user, cover: `/users/${id}/albums/${albums[i]._id}/${files[0]}`};
                    albums[i] = album;
                }
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
            if(album == null) return res.json(false);

            const files = fs.readdirSync(`./public/users/${album.user}/albums/${id}`);
            let photos = [];
            files.forEach(el => photos.push(`/users/${album.user}/albums/${id}/${el}`));

            res.json({ album, photos });
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }

    async loadPhoto(req, res) {
        try {
            const { albumID, userID, data } = req.body;

            const buff = new Buffer.from(data.split(',')[1], 'base64').toString('binary'); // data:video/mp4;base64

            const meta = data.split(',')[0];
            const type = '_' + (meta.split(':')[1]).split('/')[0] + '.' + (meta.split('/')[1]).split(';')[0];

            fs.writeFile(`./public/users/${userID}/albums/${albumID}/${Date.now()}${type}`, buff, 'binary', e => {if(e) console.log(e)});

            res.json(true);
        }
        catch(e) {
            console.log(e);
            res.json(false);
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

module.exports = new fileController();