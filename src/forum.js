import { CommentsSection } from '/CommentsSection.js';
import { NewTopicForm } from '/NewTopicForm.js';

export class Forum {

	#topic;
	#topicHeader;
	#topicAuthor;
	#topicSummary;
	#commentsSection;
	#topics = [];
	#version = 0;

	constructor() {
		const container = document.getElementById('topicContainer');
		this.subscribe();
		new NewTopicForm(container);
	}

	createTopicElement(topicHeader, topicAuthor, topicSummary) {
		this.#commentsSection = new CommentsSection(this.#topics, topicHeader);
		this.#topic = this.setElementAttrs('div', 'topic');
		this.#topicHeader = this.setElementAttrs('div', 'topicHeader', topicHeader);
		this.#topicSummary = this.setElementAttrs('div', 'topicSummary', topicSummary);
		this.#topicAuthor = this.setElementAttrs('div', 'topicAuthor', 'by' + ' ' + topicAuthor);
		const container = document.getElementById('topicContainer');
		const deleteButton = this.setElementAttrs('button', 'deleteButton', 'Delete topic');
		deleteButton.addEventListener('click', () => this.deleteTopic(topicHeader));
		this.#topic.append(this.#topicHeader, this.#topicAuthor,
			this.#topicSummary, this.#commentsSection.getElement(), deleteButton);
		container.append(this.#topic);
	}

	makeTopics() {
		this.#topics.sort((topicA, topicB) => {
			return topicB.date - topicA.date;
		});
		document.getElementById('topicContainer').textContent = '';
		this.#topics.forEach(topic => {
			this.createTopicElement(topic.topicHeader, topic.topicAuthor, topic.topicSummary);
		});
	}

	async deleteTopic(topicHeader) {
		const header = decodeURI(topicHeader);
		await fetch(`http://localhost:8080/topic/${header}`, {
			method: 'DELETE'
		});
	}

	async subscribe() {
		const response = await fetch(`http://localhost:8080/topics?time=5000&version=${this.#version}`)
			.catch(async () => {
				await this.subscribe();
			});
		if (response.status === 502) {
			await this.subscribe();
		} else if (response.status !== 200) {
			await new Promise(resolve => setTimeout(resolve, 1000));
			await this.subscribe();
		} else {
			this.#topics = [];
			const topicsObj = await response.json();
			topicsObj.topics.forEach(topic => {
				this.#topics.push(topic);
			});
			if (this.#topics) {
				this.makeTopics();
			}
			this.#version = topicsObj.version;
			await this.subscribe();
		}
	}

	setElementAttrs (elementType, styleClassname, textContent) {
		const element = document.createElement(elementType);
		element.setAttribute('class', styleClassname ? styleClassname : '');
		if (textContent) {
			element.textContent = textContent;
		}
		return element;
	}
}
new Forum();