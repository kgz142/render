import axios from 'axios';

let promptInicial = "";
const buttonContext = document.getElementById("inputButtonInical");
const contexto = document.getElementById("contextControl");
const containerInicial = document.querySelector(".container-inicial");
const containerForm = document.querySelector(".container-form");

buttonContext.addEventListener("click", () => {
    promptInicial = contexto.value.trim();
    if (promptInicial === "") {
        alert("O input não pode estar vazio!");
    } else {
        containerInicial.style.display = "none";
        containerForm.style.display = "flex";
    }
});

const inputUserMessage = document.getElementById("userMessage");
const responses = document.querySelector(".response");
const inputUserButton = document.getElementById("inputButton");
const title = document.querySelector(".chat-header h1");
import { GoogleGenerativeAI } from "@google/generative-ai";

inputUserButton.addEventListener("click", () => {
    if (inputUserMessage.value.trim() !== "") {
        rodar();
    } else {
        alert("Digite uma mensagem para enviar!");
    }
});

async function rodar() {
    const API_KEY = "AIzaSyC0pg2z0Fl71agwGOWJ3wf1EJtFSObNp6M";
    const genAI = new GoogleGenerativeAI(API_KEY);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = inputUserMessage.value.trim();
        const result = await model.generateContent(promptInicial + " " + prompt);
        const response = result.response;

        const inputData = document.createElement('p');
        const mySpan = document.createElement('span');

        inputData.textContent = prompt;
        mySpan.textContent = response.candidates[0].content.parts[0].text;

        responses.appendChild(inputData);
        responses.appendChild(mySpan);
        responses.style.display = "flex";
        title.style.display = "none";

        inputUserMessage.value = "";
        inputUserMessage.focus();
        responses.scrollTop = responses.scrollHeight;

        // Enviar dados para o servidor
        await enviarConversa(prompt, response.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error("Erro ao gerar conteúdo:", error);
    }
}

async function enviarConversa(mensagem, resposta) {
    try {
        const response = await axios.post('http://localhost:3000/api/conversas', {
            usuario: 'usuario1',
            mensagem: mensagem,
            resposta: resposta
        });

        console.log('Dados enviados com sucesso para o servidor:', response.data);
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
    }
}

const recomecar = document.getElementById("recomecar");
recomecar.addEventListener("click", () => {
    location.reload();
});
