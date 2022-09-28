import { UpdateCommentForm } from '/UpdateCommentForm.js';
export class ModalTriggerButton {

	#modalDiv;
	#closeSpan;
	#button;
	#myModalDiv;
	#form;

	constructor(cId) {
		this.triggerModal(cId);
	}

	createModal() {
		const modal = document.getElementById('myModal');
		if (!modal) {
			this.#form = new UpdateCommentForm();
			this.#myModalDiv = document.createElement('div');
			this.#myModalDiv.setAttribute('class', 'modal');
			this.#myModalDiv.setAttribute('id', 'myModal');
			this.#modalDiv = document.createElement('div');
			this.#modalDiv.setAttribute('class', 'modal-content');
			this.#closeSpan = document.createElement('span');
			this.#closeSpan.setAttribute('class', 'close');
			this.#closeSpan.setAttribute('id', 'closeSpan');
			this.#closeSpan.innerHTML = '&#x274C';
			this.#modalDiv.append(this.#form.getForm(), this.#closeSpan);
			this.#myModalDiv.append(this.#modalDiv);
			document.body.appendChild(this.#myModalDiv);
		}
	}

	createButton() {
		this.#button = document.createElement('button');
		this.#button.textContent = 'Edit';
		this.#button.style.float = 'right';
		document.body.appendChild(this.#button);
	}

	getButton() {
		return this.#button;
	}

	triggerModal(cId) {
		this.createModal();
		this.createButton(cId);
		const modal = document.getElementById('myModal');
		const span = document.getElementById('closeSpan');
		this.#button.addEventListener('click', async () => {
			modal.style.display = 'block';
			const responce = await this.getComment(cId);
			document.getElementById('updateForm').dataset.commentId = cId;
			document.getElementById('commentTextupd').value = responce.text;
			document.getElementById('commentAuthor').value = responce.author;
		});
		this.addListener(span, modal);
		this.addListener(window, modal);
	}

	addListener(element, modal) {
		element.addEventListener('click', (e) => {
			if(element.nodeName === 'SPAN') {
				modal.style.display = 'none';
			} else {
				if (e.target === modal) {
					modal.style.display = 'none';
				}
			}
		});
	}

	async getComment(cId) {
		return await fetch(`http://localhost:8080/topic/comment/${cId}`, {
			method: 'GET'
		}).then(responce => responce.json());
	}
}
