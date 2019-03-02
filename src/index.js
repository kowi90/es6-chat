class ChatApplication {
  constructor(socketIo, config) {
    if(!socketIo) {
        throw Error('Socket.io dependency is missing.');
    }
    this.socketio = socketIo;
    this.config = config;
    this.init();
  }

  init = () => {
      this.messageBag = [];
      this.remoteUserBag = [];
      
      this.socket = this.socketio(this.config.host);
      this.socket.on('message', this.handleIncomingMessage);
      
      this.renderTarget = document.getElementById(this.config.renderTarget);
      this.userName = document.getElementById(this.config.userName);
      this.message = document.getElementById(this.config.message);
      this.sendButton = document.getElementById(this.config.sendButton);

      this.sendButton.addEventListener('click', this.sendMessage);
      this.userName.addEventListener('keyup', this.validate);
      this.message.addEventListener('keyup', this.validate);

      this.remoteUser = null;
      this.sendButton.disabled = true;
      this.userName.value = this.config.initialUser;
  }

  handleIncomingMessage = (msg) => {
    if (!this.remoteUserBag.includes(msg.user)) {
      this.remoteUserBag.push(msg.user);
    }
    this.addMessageToBag(msg);
  }

  validate = () => {
    if (this.userName.value.length && this.message.value.length) {
      this.sendButton.disabled = false;
      return;
    }
    this.sendButton.disabled = true;
  }
  
  clearInputs = () => {
    this.userName.value = '';
    this.message.value = '';
    this.sendButton.disabled = true;
  }

  sendMessage = () => {
    const message = {
      user: this.userName.value,
      message: this.message.value,
    };
    this.socket.emit('message', message);
    this.addMessageToBag(message);
    this.clearInputs();
  }

  addMessageToBag = (message) => {
    this.messageBag.push(message);
    this.render();
  }

  renderSentMessage = (message) => {
    return `<div class="app-message app-user-text">${message.message}</div>`;
  }

  renderReceivedMessage = (message) => {
    return `<div class="app-message">${message.user}: ${message.message}</div>`;
  }

  render = () => {
    this.renderTarget.innerHTML = this.messageBag.map(message => {
      if (this.remoteUserBag.includes(message.user)) {
        return this.renderReceivedMessage(message);
      }
      return this.renderSentMessage(message);
    }).join('');
    this.renderTarget.scrollTop = this.renderTarget.scrollHeight;
  }
}

new ChatApplication(io, {
    host: 'http://185.13.90.140:8081/',
    renderTarget: 'content',
    userName: 'username-input',
    message: 'message-input',
    sendButton: 'message-button',
    initialUser: 'guest0001',
});
