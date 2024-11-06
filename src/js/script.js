const tbody = document.querySelector('tbody');
const addForm = document.querySelector('.add-form');
const inputTask = document.querySelector('.input-task');

const fetchTask = async () => {
    const response = await fetch('http://localhost:8080/v1/tasks');
    const tasks = await response.json();
    return tasks;
}

const formatDate = (dateUTC) => {
    const options = { day: 'numeric', year: 'numeric', month: 'long' };
    const date = new Date(dateUTC).toLocaleDateString('pt-br', options);
    return date;
}

const createElement = (tag, innerText = '', innerHTML = '') => {
    const element = document.createElement(tag);
    if (innerText) element.innerText = innerText;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
}

const addTask = async (event) => {
    event.preventDefault();

    const task = {
        taskName: inputTask.value,
        cost: 120,
        dataLimit: "2024-11-10"
    }

    await fetch('http://localhost:8080/v1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
    });

    loadTask();
    inputTask.value = '';
}

const deleteTask = async (id) => {
    await fetch(`http://localhost:8080/v1/tasks/${id}`, {
        method: 'DELETE',
    });
    loadTask();
}

const updateTask = async ({ id, taskName, cost, dataLimit }) => {
    await fetch(`http://localhost:8080/v1/tasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, taskName, cost, dataLimit }),
    });
    loadTask();
}

const createRow = (task) => {
    const { id, taskName, cost, dataLimit } = task;

    const tr = createElement('tr');
    
    // Cria colunas (células)
    const tdTaskName = createElement('td', taskName);
    const tdDataLimit = createElement('td', formatDate(dataLimit));
    const tdCost = createElement('td', cost);
    const tdActions = createElement('td');

    // Botões de ação
    const editButton = createElement('button', '', '<span class="material-symbols-outlined">edit</span>');
    const deleteButton = createElement('button', '', '<span class="material-symbols-outlined">delete</span>');

    const editForm = createElement('form');

    const editInputTaskName = createElement('input');
    editInputTaskName.value = taskName;

    const editInputCost = createElement('input');
    editInputCost.type = 'number';
    editInputCost.value = cost;

    const editInputDataLimit = createElement('input');
    editInputDataLimit.type = 'date';
    editInputDataLimit.value = new Date(dataLimit).toISOString().split('T')[0];

    const saveButton = createElement('button', '', '<span class="material-symbols-outlined">save</span>');
    editForm.appendChild(saveButton);

    editForm.addEventListener('submit', (event) => {
        event.preventDefault();
        updateTask({
            id,
            taskName: editInputTaskName.value,
            cost: parseFloat(editInputCost.value),
            dataLimit: editInputDataLimit.value,
        });
    });

    editButton.addEventListener('click', () => {
        tdTaskName.innerHTML = '';
        tdDataLimit.innerHTML = '';
        tdCost.innerHTML = '';

        tdTaskName.appendChild(editInputTaskName);
        tdDataLimit.appendChild(editInputDataLimit);
        tdCost.appendChild(editInputCost);

        tdActions.innerHTML = '';
        tdActions.appendChild(editForm);
    });

    deleteButton.addEventListener('click', () => { deleteTask(id) });

    editButton.classList.add('btn-action');
    saveButton.classList.add('btn-action');
    deleteButton.classList.add('btn-action');

    tdActions.appendChild(editButton);
    tdActions.appendChild(deleteButton);

    tr.appendChild(tdTaskName);
    tr.appendChild(tdDataLimit);
    tr.appendChild(tdCost);
    tr.appendChild(tdActions);

    return tr;
}


const loadTask = async () => {
    const tasks = await fetchTask();
    tbody.innerHTML = '';
    tasks.forEach((task) => {
        const tr = createRow(task);
        tbody.appendChild(tr);
    });
}

addForm.addEventListener('submit', addTask);

loadTask();
