const URL = 'http://localhost:8080/v1/tasks';

const tbody = document.querySelector('tbody');
const addForm = document.querySelector('.add-form');
const inputTask = document.querySelector('.input-task');
const inputDate = document.querySelector('.input-date');
const inputCost = document.querySelector('.input-cost');

const fetchTask = async () => {
    const response = await fetch(URL);
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
        cost: parseFloat(inputCost.value),
        dataLimit: inputDate.value,
    };

    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        });

        if (!response.ok) {
            const errorData = await response.json();

            Swal.fire({
                icon: 'error',
                title: 'Erro ao cadastrar Tarefa',
                text: errorData.message || "Ocorreu um erro ao criar a task.",
                confirmButtonColor: '#c8a2c8', // Cor personalizada do botão
            });

            return;
        }

        Swal.fire({
            icon: 'success',
            title: 'Tarefa Criada!',
            text: 'Sua Tarefa foi adicionada com sucesso.',
            confirmButtonColor: '#c8a2c8',
        });

        loadTask();

        inputTask.value = '';
        inputDate.value = '';
        inputCost.value = '';

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Erro de Conexão',
            text: 'Não foi possível conectar ao servidor. Tente novamente mais tarde.',
            confirmButtonColor: '#c8a2c8',
        });
    }
};

const deleteTask = async (id) => {
    await fetch(`${URL}/${id}`, {
        method: 'DELETE',
    });
    loadTask();
}

const updateTask = async ({ id, taskName, cost, dataLimit }) => {
    await fetch(URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, taskName, cost, dataLimit }),
    });
    loadTask();
}

const createRow = (task) => {
    const { id, taskName, cost, dataLimit } = task;

    const tr = createElement('tr');

    if (cost > 1000) {
        tr.classList.add('high-cost'); // Garante que todos os elementos acima do limite tenham a classe
    }

    const tdIdTask = createElement('td', id);
    const tdTaskName = createElement('td', taskName);
    const tdDataLimit = createElement('td', formatDate(dataLimit));
    const tdCost = createElement('td', cost);
    const tdActions = createElement('td');

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

    deleteButton.addEventListener('click', () => {
        Swal.fire({
            title: 'Tem certeza?',
            text: 'Deseja realmente excluir o projeto?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                deleteTask(id);
                Swal.fire('Excluído!', 'O projeto foi excluído com sucesso.', 'success');
            }
        });
    });

    editButton.classList.add('btn-action');
    saveButton.classList.add('btn-action');
    deleteButton.classList.add('btn-action');

    tdActions.appendChild(editButton);
    tdActions.appendChild(deleteButton);

    tr.appendChild(tdIdTask);
    tr.appendChild(tdTaskName);
    tr.appendChild(tdDataLimit);
    tr.appendChild(tdCost);
    tr.appendChild(tdActions);

    return tr;
};


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
