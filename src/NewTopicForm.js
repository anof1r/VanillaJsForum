import { REGEX, setElementAttrs } from '/Constants.js';
export class NewTopicForm {

	#topicHeader;
	#topicSummary;
	#topicAuthor;

	constructor(container) {
		this.createFormElement(container);
	}

	createFormElement(container) {
		const wrapperDiv = document.createElement('div');
		const sendTopicForm = document.createElement('form');
		sendTopicForm.setAttribute('method', 'PUT');
		sendTopicForm.onsubmit = (e) => {
			e.preventDefault();
			this.postTopic();
			this.#topicSummary.value = '';
			this.#topicHeader.value = '';
			this.#topicAuthor.value = '';
		};
		const titleWrapper = document.createElement('div');
		const summaryWrapper = document.createElement('div');
		this.#topicSummary = setElementAttrs('input', 'topicSummary', 'tS',
			'Enter topic summary', true, REGEX);
		this.#topicHeader = setElementAttrs('input', 'topicHeader', 'tH',
			'Enter topic title', true, REGEX);
		this.#topicAuthor = setElementAttrs('input', 'topicAuthor', 'topicAuthor',
			'Enter your name', true, REGEX);
		const button = document.createElement('input');
		button.value = 'Create topic';
		button.setAttribute('type', 'submit');
		titleWrapper.append(this.#topicHeader);
		summaryWrapper.append(this.#topicSummary);
		sendTopicForm.appendChild(titleWrapper);
		sendTopicForm.appendChild(summaryWrapper);
		sendTopicForm.appendChild(this.#topicAuthor);
		sendTopicForm.appendChild(button);
		wrapperDiv.append(sendTopicForm);
		this.insertAfter(container, wrapperDiv);
	}

	insertAfter(referenceNode, newNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}

	postTopic() {
		fetch('http://localhost:8080/topic', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				topicHeader: this.#topicHeader.value,
				topicSummary: this.#topicSummary.value,
				topicAuthor: this.#topicAuthor.value
			})
		}).then((response) => {
			if (!response.ok) {
				alert('This topic is already exsists!');
			}
		});
	}
}