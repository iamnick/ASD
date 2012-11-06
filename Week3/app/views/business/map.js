function (doc){
	if (doc._id !== '_design/app' && doc.type === 'Business'){
		emit(doc._id, {
			"method": doc.method,
			"type": doc.type,
			"dest": doc.dest,
			"date": doc.date,
			"people": doc.people,
			"notes:": doc.notes
		});
	}
};