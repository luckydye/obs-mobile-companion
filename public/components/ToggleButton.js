export default class ToggleButton extends HTMLElement {

	static get observedAttributes() {
		return ['value'];
	}

	static template() {
		return `
			<style>
				:host {
					width: 18px;
					height: 18px;
					display: flex;
					justify-content: center;
					align-items: center;
					cursor: pointer;
				}
			</style>
			<slot class="value"></slot>
		`;
	}

	get checked() {
		return this.hasAttribute("checked") || false;
	}

	set checked(val) {
		if (Boolean(val)) {
			this.setAttribute("checked", "");
		} else {
			this.removeAttribute("checked");
		}
	}

	get value() {
		return this.getAttribute("value") || "";
	}

	set value(val) {
		this.setAttribute("value", val);
	}

	constructor() {
		super();

		const template = this.renderTemplate();

        if (template) {
            this.attachShadow({ mode: "open" });

            if (template.type == "html") {
                this.render();
            } else {
                this.shadowRoot.innerHTML = template;
            }
        }

		this.addEventListener("click", e => {
			this.checked = !this.checked;
			this.dispatchEvent(new CustomEvent('change', { value: this.checked }));
		});
	}

	render() {
        render(this.renderTemplate(), this.root);
    }

	renderTemplate() {
        return this.constructor.template(this.props, this);
    }

	attributeChangedCallback() {
		this.update();
	}

	update() {
		this.shadowRoot.querySelector(".value").innerText = this.value;
	}

}

customElements.define("toggle-button", ToggleButton);