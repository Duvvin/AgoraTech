const multer = require('multer')
const path = require('path')
const crypto = require('crypto')

module.exports = {
    storage: multer.diskStorage({

        destination: (req, file, cb) => {
            cb(null, 'public/uploads')
        },

        filename: (req, file, cb) => {
            const hash = crypto.randomBytes(16).toString('hex')
            const ext = path.extname(file.originalname)

            cb(null, hash + ext)
        }

    }),

    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ]

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Tipo de arquivo não permitido'))
        }
    }
}