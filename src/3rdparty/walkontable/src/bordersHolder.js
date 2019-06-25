import {
  hasClass
} from '../../../helpers/dom/element';
import { stopImmediatePropagation } from '../../../helpers/dom/event';
import EventManager from '../../../eventManager';

class BordersHolder {
  constructor(wotInstance) {
    this.eventManager = new EventManager(wotInstance);
    this.wot = wotInstance;

    this.container = this.wot.rootDocument.createElement('div');
    this.container.className = 'htBorders';
    this.eventManager.addEventListener(this.container, 'mouseover', event => this.onMouseOver(event));

    const documentBody = this.wot.rootDocument.body;
    this.eventManager.addEventListener(documentBody, 'mousedown', () => this.onMouseDown());
    this.eventManager.addEventListener(documentBody, 'mouseup', () => this.onMouseUp());
  }

  /**
   * Mouse down listener
   *
   * @private
   */
  onMouseDown() {
    this.mouseDown = true;
  }

  /**
   * Mouse up listener
   *
   * @private
   */
  onMouseUp() {
    this.mouseDown = false;
  }

  /**
   * Mouse over listener for fragment selection functionality.
   *
   * @private
   * @param {Event} event Dom event
   */
  onMouseOver(event) {
    if (!this.mouseDown || !this.wot.getSetting('hideBorderOnMouseDownOver') || !hasClass(event.target, 'wtBorder')) {
      return;
    }
    event.preventDefault();
    stopImmediatePropagation(event);

    const _this = this;
    const documentBody = this.wot.rootDocument.body;
    const bounds = event.target.getBoundingClientRect();
    // Hide border to prevents selection jumping when fragmentSelection is enabled.
    event.target.style.display = 'none';

    function isOutside(mouseEvent) {
      if (mouseEvent.clientY < Math.floor(bounds.top)) {
        return true;
      }
      if (mouseEvent.clientY > Math.ceil(bounds.top + bounds.height)) {
        return true;
      }
      if (mouseEvent.clientX < Math.floor(bounds.left)) {
        return true;
      }
      if (mouseEvent.clientX > Math.ceil(bounds.left + bounds.width)) {
        return true;
      }
    }

    function handler(handlerEvent) {
      if (isOutside(handlerEvent)) {
        _this.eventManager.removeEventListener(documentBody, 'mousemove', handler);
        event.target.style.display = 'block';
      }
    }

    this.eventManager.addEventListener(documentBody, 'mousemove', handler);
  }

  /**
   * Cleans up all the DOM state related to a Border instance. Call this prior to deleting a Border instance.
   */
  destroy() {
    this.eventManager.destroyWithOwnEventsOnly();
    this.container.parentNode.removeChild(this.container);
  }
}

export default BordersHolder;
