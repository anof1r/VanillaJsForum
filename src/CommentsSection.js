import { REGEX, setElementAttrs } from '/Constants.js';
import { ModalTriggerButton } from '/ModalTriggerButton.js';
export class CommentsSection {

	#section;
	#commentUl;
	#li;
	#commentForm;
	#commentAuthor;
	#commentText;

	constructor(topics, topicHeader) {
		this.makeComments(topics, topicHeader);
	}

	createCommentsElement() {
		this.#section = document.createElement('div');
		this.#section.setAttribute('class', 'comments');
	}

	getElement() {
		return this.#section;
	}

	makeComments(topics, topicHeader) {
		const wrapperDiv = document.createElement('div');
		this.#commentForm = document.createElement('form');
		this.#commentForm.onsubmit = (e) => {
			e.preventDefault();
			this.postComment(topicHeader);
		};
		this.#commentAuthor = setElementAttrs('input', 'commentAuthor', 'usernameField',
			'Enter your name', true, REGEX);
		this.#commentText = setElementAttrs('input', 'text', 'commentText',
			'Comment text here', true, REGEX);
		const sendButton = document.createElement('input');
		sendButton.setAttribute('type', 'submit');
		sendButton.value = 'Send comment';
		this.#commentForm.appendChild(this.#commentAuthor);
		this.#commentForm.appendChild(this.#commentText);
		this.#commentForm.appendChild(sendButton);
		wrapperDiv.append(this.#commentForm);
		this.createCommentsElement();
		this.#commentUl = document.createElement('ul');
		this.#commentUl.setAttribute('class', 'comments');

		const topic = topics.find(topic => topic.topicHeader === topicHeader);
		if (topic.comments.length !== 0) {
			topic.comments.forEach(comment => {
				const deleteButton = document.createElement('button');
				deleteButton.addEventListener('click', () => this.#deleteComment(comment.commentId));
				deleteButton.style.float = 'right';
				deleteButton.textContent = 'X';

				const modalBtn = new ModalTriggerButton(comment.commentId);

				this.#li = document.createElement('li');
				this.#li.setAttribute('id', `${comment.commentId}`);
				this.#li.textContent = comment.author + ':' + ' ' + comment.text;

				this.#li.append(deleteButton);
				this.#li.append(modalBtn.getButton());
				this.#commentUl.appendChild(this.#li);
			});
			this.#section.append(this.#commentUl);
		}
		this.#section.append(wrapperDiv);
	}

	postComment(topicHeader) {
		const header = decodeURI(topicHeader);
		fetch(`http://localhost:8080/topic/${header}/comment`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				author: this.#commentAuthor.value,
				text: this.#commentText.value
			})
		}).catch((response) => {
			if (!response.ok) {
				alert('Something went wrong!');
			}
		});
	}

	async #deleteComment(commentId) {
		await fetch(`http://localhost:8080/topic/comment/${commentId}`, {
			method: 'DELETE'
		});
	}
}