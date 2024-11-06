import { toyService } from './toy.service.js'
import { loggerService } from '../../services/logger.service.js'
import { authService } from '../auth/auth.service.js'

export async function getToys(req, res) {
    try {
        const filterBy = {
            name: req.query.name || '',
            price: +req.query.price || 0,
            labels: req.query.labels || [],
            inStock: req.query.inStock || 'all',
            selector: req.query.selector || '',
        }
        const toys = await toyService.query(filterBy)
        res.send(toys)
    } catch (err) {
        loggerService.error('Cannot get toys', err)
        res.status(400).send('Cannot get toys')
    }
}

export async function getToyById(req, res) {
    try {
        const toyId = req.params.id
        const toy = await toyService.getToyById(toyId)
        res.send(toy)
    } catch (err) {
        loggerService.error('Cannot get toy', err)
        res.status(500).send('Cannot get toy')
    }
}

export async function addToy(req, res) {
    try {
        const toy = {
            name: req.body.name,
            price: +req.body.price,
            labels: req.body.labels,
            inStock: req.body.inStock,
            imgUrl: req.body.imgUrl,
            msgs: req.body.msgs,
            createdAt: Date.now()
        }
        toy.owner = loggedinUser
        const addedToy = await toyService.add(toy)
        res.send(addedToy)
    } catch (err) {
        loggerService.error('Failed to add toy', err)
        res.status(500).send({ err: 'Failed to add toy' })
    }
}

export async function updateToy(req, res) {
    try {
        //optional: const toy = req.body
        const toy = {
            _id: req.body._id,
            name: req.body.name,
            price: +req.body.price,
            inStock: req.body.inStock,
            labels: req.body.labels,
            imgUrl: req.body.imgUrl,
            createdAt: req.body.createdAt,
            msgs: req.body.msgs
        }
        const updatedToy = await toyService.update(toy)
        res.send(updatedToy)
    } catch (err) {
        loggerService.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function removeToy(req, res) {
    try {
        const toyId = req.params.id
        const deletedCount = await toyService.remove(toyId)
        res.send(`${deletedCount} toys removed`)
    } catch (err) {
        loggerService.error('Failed to remove toy', err)
        res.status(500).send({ err: 'Failed to remove toy' })
    }
}

export async function addToyMsg(req, res) {
    const { loggedinUser } = req
    try {
        const toyId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: loggedinUser,
            createdAt: Date.now(),
        }
        console.log('msg', msg)
        const savedMsg = await toyService.addToyMsg(toyId, msg)
        res.send(savedMsg)
    } catch (err) {
        logger.error('Failed to add msg', err)
        res.status(500).send({ err: 'Failed to add msg' })
    }
}

export async function removeToyMsg(req, res) {
    // const { loggedinUser } = req
    try {
        const toyId = req.params.id
        const { msgId } = req.params

        const removedId = await toyService.removeToyMsg(toyId, msgId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove toy msg', err)
        res.status(500).send({ err: 'Failed to remove toy msg' })
    }
}