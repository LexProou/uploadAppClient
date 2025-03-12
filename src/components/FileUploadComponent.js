import { uploadFile } from './fileUploader.js';

class FileUploadComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    // Метод для инициализации компонента
    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    // Рендеринг HTML и стилей
    render() {
        this.shadowRoot.innerHTML = `
        <style>
        /* Стили компонента */
        .upload-container {
            background: rgba(165, 165, 165, 1);
            width: 342px;
            height: 594px;
            border-radius: 16px;
            padding-top: 14px;
            padding-left: 14px;
        }

        .input-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: linear-gradient(180deg, rgba(95, 92, 240, 1) 0%, rgba(221, 220, 252, 1) 50%, rgba(255, 255, 255, 1) 100%);
            width: 302px;
            height: 557px;
            border-radius: 22px;
            padding: 12px 13px;
            gap: 10px;
        }

        .input-groups input {
            width: 277px;
            height: 35px;
            border-radius: 10px;
            margin-left: 4px;
            border-width: 1px;
        }

        .input-group {
            background-color: rgba(204, 204, 206, 0.28);
            width: 277px;
            height: 257px;
            border-radius: 30px;
            margin-left: 6px;
            margin-top: 1rem;
            gap: 10px;
            border-width: 1px;
        }

        h1, h2 {
            color: white;
            text-align: center;
            font-family: Inter;
        }

        h1 {
            margin-bottom: 20px;
            font-weight: 600;
            font-size: 20px;
        }

        h2 {
            margin-bottom: 10px;
            font-weight: 300;
            font-size: 14px;
        }

        p {
            color: rgba(95, 92, 240, 1);
            margin-top: 10px;
            text-align: center;
        }

        button {
            width: 277px;
            height: 56px;
            border-radius: 30px;
            margin-left: 6px;
            margin-top: 1rem;
            gap: 10px;
            font-family: Inter;
            font-weight: 500;
            font-size: 20px;
        }

        button:disabled {
            background-color: rgba(187, 185, 210, 1);
            color: rgba(255, 255, 255, 1);
        }

        button:hover:enabled {
            background-color: rgba(95, 92, 240, 1);
        }

        #file-error {
            width: 342px;
            height: 100px;
            display: none; /* Скрыть по умолчанию */
            background-color: rgba(240, 92, 92, 1);
            color: white;
            padding: 10px;
            border-radius: 5px;
            margin-top: 50px;
            font-weight: bold;
        }

        #status-message {
            width: 342px;
            display: none; /* Скрыть по умолчанию */
            background-color: rgba(95, 92, 240, 1);
            color: white;
            padding: 10px;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: bold;
        }

        #loading-spinner {
            display: none;
            margin-top: 10px;
        }

        #loading-spinner::before {
            font-weight: bold;
            color: blue;
        }

        .image {
            display: flex;
            justify-content: center;
            align-items: center;
            padding-top: 2rem;
        }

        .progress-container {
            width: 100%;
            margin-top: 10px;
        }

        .progress-bar {
            width: 0%;
            height: 20px;
            background-color: rgba(95, 92, 240, 1);
            border-radius: 10px;
            text-align: center;
            color: white;
            font-weight: bold;
        }

        .file-info {
            margin-top: 10px;
            font-size: 14px;
            color: black;
            display: flex;
            align-items: center;
        }

        .remove-file {
            margin-left: 10px;
            cursor: pointer;
            color: red;
            font-weight: bold;
        }
        </style>
        <div class="upload-container">
            <div class="input-container">
                <h1>Загрузочное окно</h1>
                <h2>Перед загрузкой дайте имя файлу</h2>
                <form id="upload-form">
                    <div class="input-groups">
                        <input type="text" id="name" placeholder="Название файла" />
                    </div>
                    <div class="input-group" id="drop-area">
                        <div id="image" class="image">
                            <img src="/docs.svg" width="180" height="125" />
                        </div>
                        <p>Перенесите ваш файл в область ниже</p>
                    </div>
                    <div class="file-info" id="file-info"></div>
                    <div class="progress-container">
                        <div class="progress-bar" id="progress-bar">0%</div>
                    </div>
                    <button type="submit" id="upload-btn" disabled>Загрузить</button>
                </form>
                <div id="loading-spinner" class="loading-spinner"></div>
                <p id="status-message"></p>
                <div id="file-error" class="error-message"></div>
            </div>
        </div>
        `;
    }

    // Метод для добавления обработчиков событий
    addEventListeners() {
        const form = this.shadowRoot.querySelector('#upload-form');
        const nameInput = this.shadowRoot.querySelector('#name');
        const uploadButton = this.shadowRoot.querySelector('#upload-btn');
        const fileError = this.shadowRoot.querySelector('#file-error');
        const statusMessage = this.shadowRoot.querySelector('#status-message');
        const loadingSpinner = this.shadowRoot.querySelector('#loading-spinner');
        const dropArea = this.shadowRoot.querySelector('#drop-area');
        const fileInfo = this.shadowRoot.querySelector('#file-info');
        const progressBar = this.shadowRoot.querySelector('#progress-bar');

        let selectedFile = null;

        // Функция для переключения состояния кнопки загрузки
        const toggleUploadButton = () => {
            if (nameInput.value && selectedFile && !fileError.textContent) {
                uploadButton.disabled = false;
            } else {
                uploadButton.disabled = true;
            }
        };

        // Валидация файла
        const validateFile = (file) => {
            fileError.style.display = 'none';
            statusMessage.textContent = '';

            if (file) {
                const allowedTypes = ['text/plain', 'application/json', 'text/csv'];
                if (!allowedTypes.includes(file.type)) {
                    fileError.textContent = 'Ошибка 101: Неверный формат файла.';
                    fileError.style.display = 'block';
                    toggleUploadButton();
                    return false;
                }

                if (file.size > 1024) {
                    fileError.textContent = 'Error: 400 Bad Request "Uploaded file exceeds the 1 KB size limit"';
                    fileError.style.display = 'block';
                    toggleUploadButton();
                    return false;
                }
            }
            return true;
        };

        // Обработчики событий для перетаскивания
        dropArea.addEventListener('dragover', (event) => {
            event.preventDefault();
            dropArea.style.borderColor = 'blue';
        });

        dropArea.addEventListener('dragleave', () => {
            dropArea.style.borderColor = '';
        });

        dropArea.addEventListener('drop', (event) => {
            event.preventDefault();
            dropArea.style.borderColor = '';

            const files = event.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (validateFile(file)) {
                    selectedFile = file;
                    fileInfo.innerHTML = `${file.name} <span class="remove-file">x</span>`;
                    toggleUploadButton();

                    // Обработчик события для удаления файла
                    const removeFileButton = this.shadowRoot.querySelector('.remove-file');
                    removeFileButton.addEventListener('click', () => {
                        selectedFile = null;
                        fileInfo.textContent = '';
                        toggleUploadButton();
                    });
                }
            }
        });

        // Обработчик отправки формы
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = nameInput.value;

            uploadButton.disabled = true;
            loadingSpinner.style.display = 'block';

            // Загрузка
            let progress = 0;
            const interval = setInterval(() => {
                if (progress < 100) {
                    progress += 10;
                    progressBar.style.width = `${progress}%`;
                    progressBar.textContent = `${progress}%`;
                } else {
                    clearInterval(interval);
                    loadingSpinner.style.display = 'none';

                    uploadFile(name, selectedFile)
                        .then(response => {
                            const timestamp = new Date().toLocaleTimeString();
                            const reader = new FileReader();
                            reader.onload = () => {
                                const fileContent = reader.result;
                                statusMessage.innerHTML = `
                                Файл успешно загружен:<br>name: ${name}
                                <br>filename: ${selectedFile.name}
                                <br>timestamp: ${timestamp}
                                <br>message: ${fileContent}
                                `;
                                statusMessage.style.display = 'block';
                            };
                            reader.readAsText(selectedFile);
                        })
                        .catch(error => {
                            statusMessage.textContent = error.message;
                            statusMessage.style.color = 'red';
                            statusMessage.style.display = 'block';
                        })
                        .finally(() => {
                            uploadButton.disabled = true;
                        });
                }
            }, 200);
        });
    }
}

customElements.define('file-upload-component', FileUploadComponent);

