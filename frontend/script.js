const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('jwt_token');


document.getElementById('show-register').onclick = () => {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
};

document.getElementById('show-login').onclick = () => {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
};

const showAuthPage = () => {
    document.getElementById('auth-container').style.display = 'block';
    document.getElementById('notes-container').style.display = 'none';
};

const showNotesPage = () => {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('notes-container').style.display = 'block';
    fetchNotes();
};

const register = async () => {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    const data = await response.json();
    if (data.token) {
        localStorage.setItem('jwt_token', data.token);  // Сохраняем токен
        token = data.token;
        showNotesPage();
    } else {
        alert(data.message || 'Registration failed');
    }
};

const login = async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.token) {
        localStorage.setItem('jwt_token', data.token);  // Сохраняем токен
        token = data.token;
        showNotesPage();
    } else {
        alert(data.message || 'Login failed');
    }
};

const logout = () => {
    localStorage.removeItem('jwt_token');
    token = null;
    showAuthPage();
};

let allNotes = [];  // Массив для хранения всех заметок

// Функция для поиска заметок
const searchNotes = () => {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();  // Получаем текст поиска
    const filteredNotes = allNotes.filter(note => {
        return note.title.toLowerCase().includes(searchQuery) || note.content.toLowerCase().includes(searchQuery);
    });
    displayNotes(filteredNotes);  // Отображаем только отфильтрованные заметки
};

const fetchNotes = async () => {
    const token = localStorage.getItem('jwt_token');
    const response = await fetch(`${API_URL}/notes`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    });

    const notes = await response.json();
    allNotes = notes;  // Сохраняем все заметки
    displayNotes(notes);  // Отображаем все заметки
};
const createNote = async (e) => {
    e.preventDefault();  // Предотвращаем перезагрузку страницы
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;

    console.log('Title:', title, 'Content:', content);  // Логируем данные перед отправкой

    if (!title || !content) {
        alert('Please fill in both the title and content');
        return;
    }

    const token = localStorage.getItem('jwt_token');
    console.log('Token being sent:', token);  // Логируем токен

    const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Токен добавляется в заголовки
        },
        body: JSON.stringify({ title, content })
    });

    console.log('Response status:', response.status);  // Логируем статус ответа
    const data = await response.json();
    console.log('Response data:', data);  // Логируем тело ответа

    if (response.ok) {
        fetchNotes();  // Обновляем список заметок после создания новой
        document.getElementById('note-form').reset();  // Очищаем форму
    } else {
        alert(data.message || 'Failed to create the note');
    }
};


// Пример добавления обработчика события для отправки формы
document.getElementById('note-form').addEventListener('submit', createNote);

const displayNotes = (notes) => {
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';  // Очищаем список заметок перед добавлением новых

    notes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.classList.add('note');
        noteItem.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <button onclick="editNote('${note._id}')">Edit</button>
            <button onclick="deleteNote('${note._id}')">Delete</button>
        `;
        notesList.appendChild(noteItem);  // Добавляем заметку в список
    });
};




const editNote = async (noteId) => {
    const noteTitle = prompt('Enter new title for the note:');
    const noteContent = prompt('Enter new content for the note:');
    
    if (noteTitle && noteContent) {
        const response = await fetch(`${API_URL}/notes/${noteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title: noteTitle, content: noteContent })
        });

        const updatedNote = await response.json();
        fetchNotes();  // Обновляем список заметок
    }
};

const deleteNote = async (noteId) => {
    const token = localStorage.getItem('jwt_token');  // Получаем токен из localStorage

    if (!token) {
        alert('No token found. Please log in again.');
        return;
    }

    const response = await fetch(`${API_URL}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 
            'Authorization': `Bearer ${token}`  // Добавляем токен в заголовок
        }
    });

    if (response.ok) {
        fetchNotes();  // Обновляем список заметок
    } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete the note');
    }
};

// Проверка токена при загрузке страницы
if (token) {
    showNotesPage();
} else {
    showAuthPage();
}
