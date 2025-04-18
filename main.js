(() => {
    const URL = 'ws://localhost:8420/ws';
    let CLIENT_ID = localStorage.getItem("username") || null;
    let ws = null;

    const $ = (selector) => document.querySelector(selector);
    const isNotEmpty = (value) => value && value.trim() !== "";

    const elements = {
        modal: $("#usernameModal"),
        usernameInput: $("#usernameInput"),
        chat: $("#chat"),
        messageInput: $("#mensaje")
    };

    const toggleModal = (show) => {
        elements.modal.style.display = show ? "flex" : "none";
        if (show) {
            elements.usernameInput.focus();
            elements.usernameInput.classList.add("pulse-warning");
        } else {
            elements.usernameInput.classList.remove("pulse-warning");
        }
    };

    const handleUsernameInput = (e) => {
        if (e.key === "Enter") setUsername();
    };

    const setUsername = () => {
        const name = elements.usernameInput.value.trim();
        if (isNotEmpty(name)) {
            CLIENT_ID = name;
            localStorage.setItem("username", CLIENT_ID);
            toggleModal(false);
            initWebSocket();
        } else {
            elements.usernameInput.classList.add("shake");
            setTimeout(() => elements.usernameInput.classList.remove("shake"), 500);
        }
    };

    const createMessageElement = ({ user, mensaje }) => {
        const isMine = user === CLIENT_ID;

        const li = document.createElement("li");
        li.classList.add("message", isMine ? "sent" : "received");

        li.innerHTML = `
            <div class="bubble">
                <div class="message-username">${user}</div>
                <div class="message-content">${mensaje}</div>
                <div class="message-time">${new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })}</div>
            </div>
        `;
        return li;
    };

    const scrollToBottom = () => {
        elements.chat.scrollTop = elements.chat.scrollHeight;
    };

    const initWebSocket = () => {
        ws = new WebSocket(`${URL}?id=${CLIENT_ID}`);

        ws.addEventListener('open', () => {
            console.log("Conectado como", CLIENT_ID);
        });

        ws.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            elements.chat.appendChild(createMessageElement(data));
            scrollToBottom();
        });
    };

    const enviarMensaje = () => {
        const mensaje = elements.messageInput.value.trim();
        if (isNotEmpty(mensaje)) {
            ws.send(mensaje);
            elements.messageInput.value = "";
        } else {
            alert("El mensaje no puede estar vacío");
        }
    };

    const setupEventListeners = () => {
        elements.usernameInput.addEventListener("keypress", handleUsernameInput);
        elements.messageInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") enviarMensaje();
        });

        $(".send-btn").addEventListener("click", enviarMensaje);
        $(".modal-content button").addEventListener("click", setUsername);
    };

    const init = () => {
        setupEventListeners();
        if (isNotEmpty(CLIENT_ID)) {
            toggleModal(false);
            initWebSocket();
        } else {
            toggleModal(true);
        }
    };

    window.addEventListener("DOMContentLoaded", init);
})();
