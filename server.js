const nStatic = require('node-static');
const http = require('http');
const Router = require('./Router');

const file = new nStatic.Server('./src');
const crypto = require('crypto').createHash;
const router = new Router();

let gVersion = 0;
const clients = new Set();
let topics = [];

router.add('GET', /topics(\?time=(\d+)&version=(\d+))?$/, async (request, url, response) => {
	return getTopics(request, response);
});

router.add('GET', /topic\/comment\/([a-f0-9]{32})$/, async (req, url) => {
	let comment;
	const commentId = url.exec(req.url)[1];
	topics.forEach((topic) => {
		const commentToGet = topic.comments.find(comment => comment.commentId === commentId);
		if (commentToGet) {
			comment = commentToGet;
		}
	});
	if (comment) {
		return { code: 200, body: JSON.stringify(comment) };
	} else {
		return { code: 404, body: 'Comment not found' };
	}
});

router.add('GET', /^\/topic\/([^/]+)$/, async (req, url) => {
	let message;
	const topicHeader = decodeURI(url.exec(req.url)[1]);
	if(isTopicExists(topicHeader)) {
		const topic = topics.find(topic => topic.topicHeader === topicHeader);
		message = { code: 200, body: JSON.stringify(topic) };
	} else {
		message = { code: 404, body: 'Topic not found' };
	}
	return message;
});

router.add('PUT', /^\/topic$/, async (req) => {
	let topic = '';
	try {
		topic = JSON.parse(await readData(req));
	} catch (err) {
		return { code: 400, body: 'Bad request' };
	}
	if (isTopicEmptyFields(topic)) {
		const newTopic = {
			...topic,
			comments: [],
			date: Date.now()
		};
		if (!isTopicExists(newTopic.topicHeader)) {
			topics.push(newTopic);
		} else {
			return { code: 409, body: 'Topic is already exsists' };
		}
		gVersion++;
		closeRequest();
		return { code: 201, body: 'Topic successfully added' };
	} else {
		return { code: 400, body: 'Bad request' };
	}
});


router.add('DELETE', /^\/topic\/([^/]+)$/, async (req, url) => {
	let topicHeader;
	try {
		topicHeader = decodeURI(url.exec(req.url)[1]);
	} catch (err) {
		return { code: 400, body: 'Bad request' };
	}
	if (isTopicExists(topicHeader)) {
		topics = topics.filter(topic => topic.topicHeader !== topicHeader);
		gVersion++;
		closeRequest();
		return { code: 200, body: 'Topic successfully deleted' };
	} else {
		return { code: 404, body: 'Topic not found' };
	}
});

router.add('PUT', /^\/topic\/([^/]+)\/comment$/, async (req, url) => {
	let comment;
	let topicHeader;
	try {
		comment = JSON.parse(await readData(req));
		topicHeader = decodeURI(url.exec(req.url)[1]);
	} catch (err) {
		return { code: 400, body: 'Bad request' };
	}
	if (isCommentEmptyFields(comment)) {
		const newComment = {
			commentId: uniqueCommentId(comment),
			author: comment.author,
			date: Date.now(),
			text: comment.text
		};
		const topic = topics.find(element => element.topicHeader === topicHeader);
		if (!topic) {
			return { code: 404, body: 'Topic not found' };
		}
		topic.comments.push(newComment);
		gVersion++;
		closeRequest();
		return { code: 200, body: 'Comment successfully added' };
	} else {
		return { code: 400, body: 'Bad request' };
	}
});

router.add('POST', /topic\/comment\/([a-f0-9]{32})$/, async (req, url) => {
	let comment;
	let newComment;
	let message;
	try {
		comment = JSON.parse(await readData(req));
	} catch (err) {
		return { code: 400, body: 'Bad request' };
	}
	const commentId = url.exec(req.url)[1];
	if (isCommentEmptyFields(comment)) {
		topics.forEach((topic) => {
			const commentToUpdate = topic.comments.find(comment => comment.commentId === commentId);
			if(commentToUpdate) {
				newComment = commentToUpdate;
			}
		});
		if (newComment) {
			if (comment.author === newComment.author) {
				newComment.text = comment.text;
				gVersion++;
				closeRequest();
				message = { code: 200, body: 'Comment successfully updated' };
			} else {
				message = { code: 405, body: 'Not allowed' };
			}
		} else {
			message = { code: 404, body: 'Not found' };
		}
	} else {
		message = { code: 400, body: 'Bad request' };
	}
	return message;
});

router.add('DELETE', /topic\/comment\/([a-f0-9]{32})$/, async (req, url) => {
	const commentId = url.exec(req.url)[1];
	if (isCommentExists(commentId)) {
		topics.forEach((topic) => {
			const comments = topic.comments.filter(comment => comment.commentId !== commentId);
			topic.comments = comments;
		});
		gVersion++;
		closeRequest();
		return { code: 200, body: 'Comment successfully deleted' };
	} else {
		return { code: 404, body: 'Comment not found' };
	}
});

function getTopics(request, response) {
	let message;
	const paramUrl = require('url').parse(request.url, true);
	const urlVersion = Number(paramUrl.query.version);
	const timeWait = Number(paramUrl.query.time);
	if (request.url === '/topics') {
		message = new Promise((resolve) => {
			resolve({ code: 200, body: JSON.stringify({ topics: [...topics], version: gVersion }) });
		});
	} else if (urlVersion !== undefined && timeWait !== undefined && Object.keys(paramUrl.query).length === 2
			&& paramUrl.pathname === '/topics' && timeWait >= 0) {
		const version = urlVersion;
		if (version === gVersion) {
			const client = {
				response,
				version: gVersion
			};
			clients.add(client);
			message = new Promise((resolve) => {
				setTimeout(() => {
					clients.delete(client);
					resolve({ code: 304 });
				}, timeWait);
			});
		} else {
			message = new Promise((resolve) => {
				resolve({ code: 200, body: JSON.stringify({ topics: [...topics], version: gVersion }) });
			});
		}
	} else {
		return ({ code: 400 });
	}
	return message;
}

function isTopicEmptyFields(topic) {
	if (topic?.topicHeader && topic.topicAuthor && topic.topicSummary) {
		if (topic.topicHeader.trim().length !== 0 &&
		topic.topicAuthor.trim().length !== 0 &&
		topic.topicSummary.trim().length !== 0) {
			return topic;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

function isCommentEmptyFields(comment) {
	if (comment?.author && comment.text) {
		if (comment.author.trim().length !== 0 && comment.text.trim().length !== 0) {
			return true;
		}
	}
	return false;
}

function closeRequest() {
	const data = { code: 200, body: JSON.stringify({ topics: [...topics], version: gVersion }) };
	clients.forEach(client => {
		client.response.writeHead(data.code);
		client.response.end(data.body);
		clients.delete(client);
	});
}

function isTopicExists(topicHeader) {
	return topics.find(item => item.topicHeader === topicHeader) !== undefined;
}

function isCommentExists(commentId) {
	let commentToDelete;
	topics.forEach((topic) => {
		const comment = topic.comments.find(comment => comment.commentId === commentId);
		if (comment) {
			commentToDelete = comment;
		}
	});
	if (commentToDelete) {
		return true;
	} else {
		return false;
	}
}

function readData(stream) {
	let data = '';
	return new Promise((resolve, reject) => {
		stream.on('error', reject);
		stream.on('data', chunk => data += chunk.toString());
		stream.on('end', () => resolve(data));
	});
}

function uniqueCommentId(comment) {
	const strToHash = comment.author + Date.now() + comment.text;
	return crypto('md5').update(strToHash).digest('hex');
}

const server = http.createServer(async (req, res) => {
	const resolved = router.getResponse(req, res);
	if (resolved?.then) {
		resolved.then(object => {
			res.writeHead(object.code);
			res.end(object.body);
		});
	} else {
		file.serve(req, res);
	}
});
console.log('Current server running at: http://localhost:8080/');
server.listen(8080);
