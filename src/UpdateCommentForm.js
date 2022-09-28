import { REGEX, setElementAttrs } from '/Constants.js';
export class UpdateCommentForm {

	#formDiv;
	#commentText;
	#commentAuthor;

	constructor() {
		this.createForm();
	}

	createForm() {
		this.#formDiv = document.createElement('div');
		const updateForm = document.createElement('form');
		updateForm.setAttribute('id', 'updateForm');
		updateForm.setAttribute('method', 'POST');
		updateForm.onsubmit = (e) => {
			e.preventDefault();
			this.updateComment(e);
			this.#commentText.value = '';
			const modal = document.getElementById('myModal');
			modal.style.display = 'none';
		};
		this.#commentAuthor = setElementAttrs('input', 'author', 'commentAuthor',
			'Enter comment author', true, REGEX);
		this.#commentText = setElementAttrs('input', 'text', 'commentTextupd',
			'Update comment text', true, REGEX);
		const button = document.createElement('input');
		button.setAttribute('type', 'submit');
		button.setAttribute('id', 'subBtn');
		button.value = 'Modify comment';
		updateForm.appendChild(this.#commentAuthor);
		updateForm.appendChild(this.#commentText);
		updateForm.appendChild(button);
		this.#formDiv.append(updateForm);
	}

	getForm() {
		return this.#formDiv;
	}

	async updateComment(e) {
		const author = this.#commentAuthor.value;
		await fetch(`http://localhost:8080/topic/comment/${e.target.dataset.commentId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				author: author,
				text: this.#commentText.value
			})
		}).then((response) => {
			if (response.status === 405) {
				alert('You are not the Author of this comment');
			}
		});
	}
}