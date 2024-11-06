import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { authService } from '../auth/auth.service.js'
import { utilService } from '../../services/util.service.js'

export const toyService = {
	remove,
	query,
	getToyById,
	add,
	update,
	addToyMsg,
	removeToyMsg,
}

async function query(filterBy = {}) {
	try {
		const criteria = {
			name: { $regex: filterBy.name, $options: 'i' },
		}
		if (filterBy.labels && filterBy.labels.length > 0) {
			criteria.labels = { $in: filterBy.labels }
		}
		if (filterBy.price !== 0) {
			criteria.price = { $lte: filterBy.price }
		}
		if (filterBy.inStock !== 'all') {
			criteria.inStock = (filterBy.inStock === 'available')
		}

		let sortOption = {}
		if (filterBy.selector === 'name') {
			sortOption = { name: 1 }
		} else if (filterBy.selector === 'price') {
			sortOption = { price: 1 }
		} else if (filterBy.selector === 'createdAt') {
			sortOption = { createdAt: 1 }
		}
		const collection = await dbService.getCollection('toys')
		var toys = await collection.find(criteria).sort(sortOption).toArray()
		return toys
	} catch (err) {
		loggerService.error('cannot find toys', err)
		throw err
	}
}

async function getToyById(toyId) {
	try {
		const collection = await dbService.getCollection('toys')
		const toy = await collection.findOne({ _id: ObjectId.createFromHexString(toyId) })
		toy.createdAt = toy._id.getTimestamp()
		return toy
	} catch (err) {
		loggerService.error(`while finding toy ${toyId}`, err)
		throw err
	}
}

async function remove(toyId) {
	try {
		const collection = await dbService.getCollection('toys')
		const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
		return deletedCount
	} catch (err) {
		loggerService.error(`cannot remove toy ${toyId}`, err)
		throw err
	}
}

async function add(toy) {
	try {
		const collection = await dbService.getCollection('toys')
		await collection.insertOne(toy)
		return toy
	} catch (err) {
		loggerService.error('cannot insert toy', err)
		throw err
	}
}

async function update(toy) {
	const { toyId } = toy._id
	try {
		const updatedToy = {
			name: toy.name,
			price: toy.price,
			inStock: toy.inStock,
			labels: toy.labels
		}
		const collection = await dbService.getCollection('toys')
		await collection.updateOne({ _id: ObjectId.createFromHexString(toy._id) }, { $set: updatedToy })
		return toy
	} catch (err) {
		loggerService.error(`cannot update toy ${toyId}`, err)
		throw err
	}
}

async function addToyMsg(toyId, msg) {
	try {
		msg.id = utilService.makeId()

		const collection = await dbService.getCollection('toys')
		await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $push: { msgs: msg } })
		return msg
	} catch (err) {
		loggerService.error(`cannot add toy msg ${toyId}`, err)
		throw err
	}
}

async function removeToyMsg(toyId, msgId) {
	try {
		const collection = await dbService.getCollection('toys')
		await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $pull: { msgs: { id: msgId } } })
		return msgId
	} catch (err) {
		loggerService.error(`cannot add toy msg ${toyId}`, err)
		throw err
	}
}