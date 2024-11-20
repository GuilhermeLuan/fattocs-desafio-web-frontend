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

const handleTask = async (task, method) => {
    try {
        const response = await fetch(URL, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        });

        if (!response.ok) {
            const errorData = await response.json();
            handleTaskError(errorData.message); // Trata erros específicos
            return;
        }

        const successMessage = method === 'POST' 
            ? "Tarefa cadastrada com sucesso!" 
            : "Tarefa atualizada com sucesso!";
        showAlert(successMessage, "success");
        loadTask(); // Atualiza a lista de tasks

        // Limpa os inputs apenas para o POST
        if (method === 'POST') {
            inputTask.value = '';
            inputDate.value = '';
            inputCost.value = '';
            inputTask.focus();
        }
    } catch (error) {
        console.error(error);
        showAlert("Erro inesperado.", "error");
    }
};

// Trata mensagens de erro com base na resposta do back-end
const handleTaskError = (message) => {
    if (message.includes("Task cost negative")) {
        showAlert("O custo da tarefa não pode ser negativo!", "error");
    } else if (message.includes("Task name already exists")) {
        showAlert("Nome da tarefa já existe! Use outro nome.", "error");
    } else if (message.includes("The field 'taskName' is required")) {
        showAlert("Por favor insira o nome da tarefa.", "error");
    } else if (message.includes("The field 'cost' is required")) {
        showAlert("Por favor insira o custo da tarefa.", "error");
    } else if (message.includes("The field 'dataLimit' is required")) {
        showAlert("Por favor insira a data da tarefa.", "error");
    } else if (message.includes("The cost cannot be greater than 999999999999999.")){
        showAlert("O custo não pode ser maior do que 999999999999999", "error")
    }
    else {
        showAlert("Ocorreu um erro ao processar a tarefa!", "error");
    }
};

const showAlert = (message, type) => {
    const alertBox = document.createElement('div');
    alertBox.innerText = message;
    alertBox.className = `alert ${type}`; // Adiciona uma classe baseada no tipo (success ou error)

    document.body.appendChild(alertBox);

    // Remove o alerta após 3 segundos
    setTimeout(() => {
        alertBox.remove();
    }, 3000);
}

const formatDate = (dateUTC) => {
    const options = { day: 'numeric', year: 'numeric', month: 'long', timeZone: 'UTC' };
    const date = new Date(dateUTC).toLocaleDateString('pt-br', options);
    return date;
};

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

    await handleTask(task, 'POST');
};

const deleteTask = async (id) => {
    await fetch(`${URL}/${id}`, {
        method: 'DELETE',
    });
    loadTask();
}


const updateTask = async (task) => {
    await handleTask(task, 'PUT');
};

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

        editInputTaskName.focus();
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
