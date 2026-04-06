import sqlite3
import os
from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = 'sky_diary_secret_key_2024'

DATABASE = 'sky_diary.db'

def get_db():
    """Установка соединения с базой данных"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Инициализация базы данных - создание таблицы, если её нет"""
    if not os.path.exists(DATABASE):
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE observations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                location TEXT NOT NULL,
                sky_type TEXT NOT NULL,
                observation_date TEXT NOT NULL,
                description TEXT,
                photo_url TEXT,
                observer_name TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()

# Инициализация БД при запуске
init_db()

@app.route('/')
def index():
    """Главная страница - список всех наблюдений"""
    sky_type_filter = request.args.get('type', '')
    conn = get_db()
    cursor = conn.cursor()
    
    if sky_type_filter:
        cursor.execute('''
            SELECT * FROM observations 
            WHERE sky_type = ? 
            ORDER BY observation_date DESC
        ''', (sky_type_filter,))
    else:
        cursor.execute('SELECT * FROM observations ORDER BY observation_date DESC')
    
    observations = cursor.fetchall()
    conn.close()
    
    # Словарь для отображения типов небесных явлений на русском
    sky_types_ru = {
        'sunset': 'Закат',
        'sunrise': 'Рассвет',
        'twilight': 'Сумерки',
        'aurora': 'Северное сияние',
        'rainbow': 'Радуга',
        'clouds': 'Необычные облака',
        'other': 'Другое'
    }
    
    return render_template('index.html', 
                         observations=observations, 
                         current_filter=sky_type_filter,
                         sky_types_ru=sky_types_ru)

@app.route('/add', methods=['GET', 'POST'])
def add_observation():
    """Страница добавления нового наблюдения"""
    if request.method == 'POST':
        # Получение данных из формы
        location = request.form.get('location', '').strip()
        sky_type = request.form.get('sky_type', '')
        observation_date = request.form.get('observation_date', '')
        description = request.form.get('description', '').strip()
        photo_url = request.form.get('photo_url', '').strip()
        observer_name = request.form.get('observer_name', '').strip()
        
        # Валидация данных
        errors = []
        
        if not location:
            errors.append('Место наблюдения обязательно для заполнения')
        elif len(location) < 3:
            errors.append('Название места должно содержать минимум 3 символа')
        
        if not sky_type:
            errors.append('Тип явления обязателен для выбора')
        
        if not observation_date:
            errors.append('Дата наблюдения обязательна для заполнения')
        
        if not observer_name:
            errors.append('Имя наблюдателя обязательно для заполнения')
        elif len(observer_name) < 2:
            errors.append('Имя наблюдателя должно содержать минимум 2 символа')
        
        if photo_url and not (photo_url.startswith('http://') or photo_url.startswith('https://')):
            errors.append('Ссылка на фото должна начинаться с http:// или https://')
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('add.html', form_data=request.form)
        
        # Сохранение в базу данных
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO observations (location, sky_type, observation_date, description, photo_url, observer_name)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (location, sky_type, observation_date, description, photo_url, observer_name))
            conn.commit()
            conn.close()
            flash('Наблюдение успешно добавлено!', 'success')
            return redirect(url_for('index'))
        except Exception as e:
            flash(f'Ошибка при сохранении: {str(e)}', 'error')
            return render_template('add.html', form_data=request.form)
    
    return render_template('add.html', form_data={})

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
