class Router {

	constructor() {
		this.routes = [];
	}

	add(method, url, handler) {
		const request = {
			method: method,
			url: url,
			handler: handler
		};
		this.routes.push(request);
	}

	getResponse(request, response) {
		let message;
		let isMethod = false;
		let isUrl = false;
		for (const { method, url, handler } of this.routes) {
			if (method === request.method) {
				isMethod = true;
				if (url.exec(request.url)) {
					isUrl = true;
					return handler(request, url, response);
				}
			}
		}
		if (isMethod && !isUrl) {
			message = { code: 404, body: 'Bad request' };
		} else if (!isMethod) {
			message = { code: 405, body: 'Method not allowed' };
		}
		return message;
	}

}
module.exports = Router;